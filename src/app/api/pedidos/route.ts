import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
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

  type ItemEntrada = { produtoId: string; quantidade: number; precoUnit: number }
  const itens: ItemEntrada[] = Array.isArray(body.itens) ? body.itens : []

  if (itens.length === 0) {
    return NextResponse.json({ error: 'Pedido sem itens' }, { status: 400 })
  }

  // O endereco pode chegar como objeto (loja) ou ja como string JSON.
  const enderecoEntrega =
    typeof body.enderecoEntrega === 'string'
      ? body.enderecoEntrega
      : JSON.stringify(body.enderecoEntrega ?? {})

  // Pagamento simulado (modo teste): o pedido ja entra como CONFIRMADO/pago.
  const status = body.pagamentoSimulado ? 'CONFIRMADO' : 'PENDENTE'

  // Vincula o pedido ao cliente logado (se houver sessao).
  const session = await auth()
  const userId = (session?.user as { id?: string } | undefined)?.id || null

  try {
    const pedido = await prisma.$transaction(async (tx) => {
      const count = await tx.pedido.count()
      const numeroPedido = `#${String(count + 1).padStart(5, '0')}`

      const novoPedido = await tx.pedido.create({
        data: {
          numeroPedido,
          status,
          userId,
          clienteNome: body.clienteNome,
          clienteEmail: body.clienteEmail,
          clienteTelefone: body.clienteTelefone,
          enderecoEntrega,
          cep: body.cep,
          frete: body.frete || 0,
          servicoCorreios: body.servicoCorreios,
          subtotal: body.subtotal,
          total: body.total,
          formaPagamento: body.formaPagamento,
          observacoes: body.observacoes,
          itens: {
            create: itens.map((item) => ({
              produtoId: item.produtoId,
              quantidade: item.quantidade,
              precoUnit: item.precoUnit,
            })),
          },
        },
        include: { itens: true },
      })

      // Baixa de estoque + contagem de vendas (sem deixar o estoque negativo).
      for (const item of itens) {
        const produto = await tx.produto.findUnique({ where: { id: item.produtoId } })
        if (!produto) continue
        const novoEstoque = Math.max(0, produto.estoque - item.quantidade)
        await tx.produto.update({
          where: { id: item.produtoId },
          data: {
            vendas: { increment: item.quantidade },
            estoque: novoEstoque,
          },
        })
      }

      return novoPedido
    })

    return NextResponse.json(pedido, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar pedido:', error)
    return NextResponse.json({ error: 'Erro ao criar pedido' }, { status: 500 })
  }
}
