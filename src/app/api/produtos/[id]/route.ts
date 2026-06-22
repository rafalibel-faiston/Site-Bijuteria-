import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAdmin } from '@/lib/require-admin'

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const produto = await prisma.produto.findUnique({
    where: { id: params.id },
  })
  if (!produto) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(produto)
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const { error } = await requireAdmin()
  if (error) return error

  const body = await req.json()
  const allowed = ['nome', 'slug', 'descricao', 'preco', 'precoOriginal', 'imagens',
    'categoria', 'material', 'peso', 'estoque', 'estoqueMinimo', 'ativo']
  const data = Object.fromEntries(Object.entries(body).filter(([k]) => allowed.includes(k)))

  const produto = await prisma.produto.update({ where: { id: params.id }, data })
  return NextResponse.json(produto)
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const { error } = await requireAdmin()
  if (error) return error

  await prisma.produto.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
