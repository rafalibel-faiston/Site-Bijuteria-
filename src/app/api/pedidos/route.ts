import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { requireAdmin } from '@/lib/api-auth'
import { calcularServicos, getCepOrigem } from '@/lib/frete'
import { gerarTokenPedido } from '@/lib/pedido-token'

export const dynamic = 'force-dynamic'

// Erro de regra de negócio (estoque/produto) — vira 409 em vez de 500.
class PedidoError extends Error {}

// Listagem de todos os pedidos: somente ADMIN (expõe PII de todos os clientes).
export async function GET(req: NextRequest) {
  const gate = await requireAdmin()
  if (!gate.ok) return gate.response

  const { searchParams } = new URL(req.url)
  const statusParam = searchParams.get('status')

  const where: Record<string, unknown> = {}
  if (statusParam) {
    const statuses = statusParam.split(',')
    where.status = { in: statuses }
  }

  const pedidos = await prisma.pedido.findMany({
    where,
    include: {
      itens: {
        include: { produto: { select: { nome: true } } },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ pedidos })
}

export async function POST(req: NextRequest) {
  const body = await req.json()

  type ItemEntrada = { produtoId: string; quantidade: number }
  const itensEntrada: ItemEntrada[] = Array.isArray(body.itens) ? body.itens : []

  if (itensEntrada.length === 0) {
    return NextResponse.json({ error: 'Pedido sem itens' }, { status: 400 })
  }
  if (!body.clienteNome || !body.clienteEmail) {
    return NextResponse.json({ error: 'Dados do cliente obrigatórios' }, { status: 400 })
  }

  // O endereco pode chegar como objeto (loja) ou ja como string JSON.
  const enderecoEntrega =
    typeof body.enderecoEntrega === 'string'
      ? body.enderecoEntrega
      : JSON.stringify(body.enderecoEntrega ?? {})

  // Vincula o pedido ao cliente logado (se houver sessao).
  const session = await auth()
  const userId = (session?.user as { id?: string } | undefined)?.id || null

  // Idempotencia: a mesma chave (duplo-clique/retry) devolve o pedido ja criado
  // em vez de criar e cobrar de novo.
  const idempotencyKey =
    typeof body.idempotencyKey === 'string' && body.idempotencyKey ? body.idempotencyKey : null
  if (idempotencyKey) {
    const existente = await prisma.pedido.findUnique({
      where: { idempotencyKey },
      include: { itens: true },
    })
    if (existente) {
      return NextResponse.json({ ...existente, acessoToken: gerarTokenPedido(existente.id) })
    }
  }

  try {
    const pedido = await prisma.$transaction(async (tx) => {
      // 1. Carrega os produtos do BANCO — preços e pesos vêm daqui, nunca do cliente.
      const ids = [...new Set(itensEntrada.map(i => String(i.produtoId)))]
      const produtos = await tx.produto.findMany({ where: { id: { in: ids }, ativo: true } })
      const byId = new Map(produtos.map(p => [p.id, p]))

      let subtotal = 0
      let pesoGramas = 0
      const itensValidados = itensEntrada.map((i) => {
        const p = byId.get(String(i.produtoId))
        if (!p) throw new PedidoError('Produto indisponível no pedido')
        const qtd = Math.max(1, Math.floor(Number(i.quantidade) || 0))
        subtotal += p.preco * qtd
        pesoGramas += (p.peso ?? 100) * qtd
        return { produtoId: p.id, quantidade: qtd, precoUnit: p.preco } // precoUnit do banco
      })

      // 2. Frete recalculado no servidor (ignora body.frete do cliente).
      let frete = 0
      let servicoCorreios: string | null = null
      const cepDestino = String(body.cep || '').replace(/\D/g, '')
      if (cepDestino.length === 8) {
        const cepOrigem = await getCepOrigem()
        const opcoes = await calcularServicos(cepOrigem, cepDestino, pesoGramas || 100)
        // Usa o serviço escolhido pelo cliente (PAC/SEDEX), mas com o PREÇO do servidor.
        const escolhido = opcoes.find(o => o.servico === body.servicoCorreios) || opcoes[0]
        if (escolhido) {
          frete = parseFloat(escolhido.preco) || 0
          servicoCorreios = escolhido.servico
        }
      }

      const total = Math.round((subtotal + frete) * 100) / 100

      // 3. Baixa de estoque ATÔMICA e condicional (à prova de corrida/oversell).
      for (const item of itensValidados) {
        const r = await tx.produto.updateMany({
          where: { id: item.produtoId, estoque: { gte: item.quantidade } },
          data: {
            estoque: { decrement: item.quantidade },
            vendas: { increment: item.quantidade },
          },
        })
        if (r.count === 0) throw new PedidoError('Estoque insuficiente para um dos itens')
      }

      // 4. Cria o pedido. Status SEMPRE inicia PENDENTE — o pagamento nunca é
      //    confirmado pelo cliente (só admin ou webhook assinado do gateway).
      const count = await tx.pedido.count()
      const numeroPedido = `#${String(count + 1).padStart(5, '0')}`

      const novoPedido = await tx.pedido.create({
        data: {
          numeroPedido,
          status: 'PENDENTE',
          userId,
          clienteNome: body.clienteNome,
          clienteEmail: body.clienteEmail,
          clienteTelefone: body.clienteTelefone,
          enderecoEntrega,
          cep: body.cep,
          frete,
          servicoCorreios,
          subtotal,
          total,
          formaPagamento: body.formaPagamento,
          observacoes: body.observacoes,
          idempotencyKey,
          itens: { create: itensValidados },
        },
        include: { itens: true },
      })

      return novoPedido
    })

    // Token de acesso para o cliente (guest) abrir a confirmação do próprio pedido.
    return NextResponse.json(
      { ...pedido, acessoToken: gerarTokenPedido(pedido.id) },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof PedidoError) {
      return NextResponse.json({ error: error.message }, { status: 409 })
    }
    // Corrida de idempotencia: dois envios simultaneos com a mesma chave.
    if ((error as { code?: string }).code === 'P2002' && idempotencyKey) {
      const existente = await prisma.pedido.findUnique({
        where: { idempotencyKey },
        include: { itens: true },
      })
      if (existente) {
        return NextResponse.json({ ...existente, acessoToken: gerarTokenPedido(existente.id) })
      }
    }
    console.error('Erro ao criar pedido')
    return NextResponse.json({ error: 'Erro ao criar pedido' }, { status: 500 })
  }
}
