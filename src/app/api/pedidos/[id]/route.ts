import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const pedido = await prisma.pedido.findUnique({
    where: { id: params.id },
    include: { itens: { include: { produto: true } } },
  })
  if (!pedido) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(pedido)
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json()
  const pedido = await prisma.pedido.update({
    where: { id: params.id },
    data: body,
  })
  return NextResponse.json(pedido)
}
