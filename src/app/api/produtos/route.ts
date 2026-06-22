import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAdmin } from '@/lib/require-admin'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const categoria = searchParams.get('categoria')
  const busca = searchParams.get('busca')
  const limit = parseInt(searchParams.get('limit') || '100')
  const apenasAtivos = searchParams.get('ativo') !== 'false'

  const where: Record<string, unknown> = {}
  if (apenasAtivos) where.ativo = true
  if (categoria && categoria !== 'Todos') where.categoria = categoria
  if (busca) where.nome = { contains: busca, mode: 'insensitive' }

  const produtos = await prisma.produto.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: limit,
  })

  return NextResponse.json({ produtos })
}

export async function POST(req: NextRequest) {
  const { error } = await requireAdmin()
  if (error) return error

  const body = await req.json()

  const produto = await prisma.produto.create({
    data: {
      nome: body.nome,
      slug: body.slug,
      descricao: body.descricao,
      preco: body.preco,
      precoOriginal: body.precoOriginal,
      imagens: body.imagens || '[]',
      categoria: body.categoria,
      material: body.material,
      peso: body.peso,
      estoque: body.estoque || 0,
      estoqueMinimo: body.estoqueMinimo || 5,
      ativo: body.ativo !== false,
    },
  })

  return NextResponse.json(produto, { status: 201 })
}
