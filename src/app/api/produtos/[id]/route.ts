import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAdmin } from '@/lib/api-auth'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const produto = await prisma.produto.findUnique({
    where: { id: params.id },
  })
  if (!produto) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(produto)
}

// Campos editáveis de produto (whitelist — evita atualizar colunas indevidas).
const CAMPOS_PRODUTO = [
  'nome', 'slug', 'descricao', 'preco', 'precoOriginal', 'imagens',
  'categoria', 'material', 'peso', 'estoque', 'estoqueMinimo', 'ativo',
] as const

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const gate = await requireAdmin()
  if (!gate.ok) return gate.response

  const body = await req.json()
  const data: Record<string, unknown> = {}
  for (const campo of CAMPOS_PRODUTO) {
    if (body[campo] !== undefined) data[campo] = body[campo]
  }

  const produto = await prisma.produto.update({ where: { id: params.id }, data })
  return NextResponse.json(produto)
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const gate = await requireAdmin()
  if (!gate.ok) return gate.response

  await prisma.produto.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
