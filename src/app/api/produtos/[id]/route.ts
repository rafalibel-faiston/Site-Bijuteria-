import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const produto = await prisma.produto.findUnique({
    where: { id: params.id },
  })
  if (!produto) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(produto)
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json()
  const produto = await prisma.produto.update({
    where: { id: params.id },
    data: body,
  })
  return NextResponse.json(produto)
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  await prisma.produto.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
