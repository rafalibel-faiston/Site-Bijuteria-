import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

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

  const count = await prisma.pedido.count()
  const numeroPedido = `#${String(count + 1).padStart(5, '0')}`

  const pedido = await prisma.pedido.create({
    data: {
      numeroPedido,
      clienteNome: body.clienteNome,
      clienteEmail: body.clienteEmail,
      clienteTelefone: body.clienteTelefone,
      enderecoEntrega: JSON.stringify(body.enderecoEntrega),
      cep: body.cep,
      frete: body.frete || 0,
      servicoCorreios: body.servicoCorreios,
      subtotal: body.subtotal,
      total: body.total,
      formaPagamento: body.formaPagamento,
      observacoes: body.observacoes,
      itens: {
        create: body.itens.map((item: { produtoId: string; quantidade: number; precoUnit: number }) => ({
          produtoId: item.produtoId,
          quantidade: item.quantidade,
          precoUnit: item.precoUnit,
        })),
      },
    },
    include: { itens: true },
  })

  // Update sold count and stock
  for (const item of body.itens) {
    await prisma.produto.update({
      where: { id: item.produtoId },
      data: {
        vendas: { increment: item.quantidade },
        estoque: { decrement: item.quantidade },
      },
    })
  }

  return NextResponse.json(pedido, { status: 201 })
}
