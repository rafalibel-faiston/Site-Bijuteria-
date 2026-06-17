import { prisma } from '@/lib/db'
import { notFound } from 'next/navigation'
import { ProductDetailClient } from './product-detail-client'

interface Props {
  params: { slug: string }
}

// Renderiza sob demanda (o banco pode não estar disponível em build time)
export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: Props) {
  try {
    const produto = await prisma.produto.findUnique({ where: { slug: params.slug } })
    if (!produto) return { title: 'Produto não encontrado' }
    return {
      title: `${produto.nome} | Charme Final Acessórios`,
      description: produto.descricao,
    }
  } catch {
    return { title: 'Charme Final Acessórios' }
  }
}

export default async function ProductPage({ params }: Props) {
  const produto = await prisma.produto.findUnique({
    where: { slug: params.slug, ativo: true },
  })

  if (!produto) notFound()

  const related = await prisma.produto.findMany({
    where: {
      categoria: produto.categoria,
      slug: { not: produto.slug },
      ativo: true,
    },
    take: 4,
  })

  return <ProductDetailClient produto={produto} related={related} />
}
