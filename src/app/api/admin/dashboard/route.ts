import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAdmin } from '@/lib/require-admin'

export const dynamic = 'force-dynamic'

export async function GET() {
  const { error } = await requireAdmin()
  if (error) return error
  const agora = new Date()
  const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1)

  const [pedidos, produtos] = await Promise.all([
    prisma.pedido.findMany({ include: { itens: { include: { produto: { select: { nome: true } } } } } }),
    prisma.produto.findMany({ orderBy: { vendas: 'desc' }, take: 5 }),
  ])

  const pedidosValidos = pedidos.filter(p => p.status !== 'CANCELADO')
  const totalVendas = pedidosValidos.reduce((acc, p) => acc + p.total, 0)
  const totalPedidos = pedidos.length
  const pedidosPendentes = pedidos.filter(p => p.status === 'PENDENTE').length
  const receitaMes = pedidosValidos
    .filter(p => new Date(p.createdAt) >= inicioMes)
    .reduce((acc, p) => acc + p.total, 0)

  const mesAnteriorInicio = new Date(agora.getFullYear(), agora.getMonth() - 1, 1)
  const mesAnteriorFim = new Date(agora.getFullYear(), agora.getMonth(), 0)
  const receitaMesAnterior = pedidosValidos
    .filter(p => {
      const d = new Date(p.createdAt)
      return d >= mesAnteriorInicio && d <= mesAnteriorFim
    })
    .reduce((acc, p) => acc + p.total, 0)

  const produtosEstoqueBaixo = await prisma.produto.count({
    where: { estoque: { lte: prisma.produto.fields.estoqueMinimo } },
  }).catch(() => 0)

  const totalProdutos = await prisma.produto.count().catch(() => 0)

  const pedidosRecentes = pedidos.slice(0, 5).map(p => ({
    id: p.id,
    numeroPedido: p.numeroPedido,
    clienteNome: p.clienteNome,
    total: p.total,
    status: p.status,
    createdAt: p.createdAt,
  }))

  const produtosMaisVendidos = produtos.map(p => ({
    id: p.id,
    nome: p.nome,
    vendas: p.vendas,
    estoque: p.estoque,
  }))

  return NextResponse.json({
    totalVendas,
    totalPedidos,
    pedidosPendentes,
    produtosEstoqueBaixo,
    totalProdutos,
    receitaMes,
    receitaMesAnterior,
    pedidosRecentes,
    produtosMaisVendidos,
  })
}
