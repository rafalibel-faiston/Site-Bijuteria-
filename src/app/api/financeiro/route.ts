import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAdmin } from '@/lib/require-admin'

export const dynamic = 'force-dynamic'

export async function GET() {
  const { error } = await requireAdmin()
  if (error) return error
  const agora = new Date()
  const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1)

  const pedidos = await prisma.pedido.findMany({
    where: { status: { not: 'CANCELADO' } },
  })

  const despesas = await prisma.despesa.findMany({
    orderBy: { data: 'desc' },
  })

  const receitaTotal = pedidos.reduce((acc, p) => acc + p.subtotal, 0)
  const receitaMes = pedidos
    .filter(p => new Date(p.createdAt) >= inicioMes)
    .reduce((acc, p) => acc + p.subtotal, 0)

  const despesasTotal = despesas.reduce((acc, d) => acc + d.valor, 0)
  const despesasMes = despesas
    .filter(d => new Date(d.data) >= inicioMes)
    .reduce((acc, d) => acc + d.valor, 0)

  // Group by month (last 6 months)
  const pedidosPorMes = []
  for (let i = 5; i >= 0; i--) {
    const data = new Date(agora.getFullYear(), agora.getMonth() - i, 1)
    const fimData = new Date(agora.getFullYear(), agora.getMonth() - i + 1, 0)
    const pedidosMes = pedidos.filter(p => {
      const d = new Date(p.createdAt)
      return d >= data && d <= fimData
    })
    pedidosPorMes.push({
      mes: data.toLocaleDateString('pt-BR', { month: 'short' }),
      receita: pedidosMes.reduce((acc, p) => acc + p.subtotal, 0),
      quantidade: pedidosMes.length,
    })
  }

  return NextResponse.json({
    receitaTotal,
    receitaMes,
    despesasTotal,
    despesasMes,
    lucroTotal: receitaTotal - despesasTotal,
    lucroMes: receitaMes - despesasMes,
    pedidosPorMes,
    despesas,
  })
}

export async function POST(req: NextRequest) {
  const { error } = await requireAdmin()
  if (error) return error

  const body = await req.json()
  const despesa = await prisma.despesa.create({
    data: {
      descricao: body.descricao,
      valor: body.valor,
      categoria: body.categoria,
    },
  })
  return NextResponse.json(despesa, { status: 201 })
}

export async function DELETE(req: NextRequest) {
  const { error } = await requireAdmin()
  if (error) return error

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })
  await prisma.despesa.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
