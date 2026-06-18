import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { calcularServicos, getCepOrigem } from '@/lib/frete'

export const dynamic = 'force-dynamic'

// GET — cálculo simples por peso (usado na calculadora do admin).
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const cepOrigemParam = searchParams.get('cepOrigem')?.replace(/\D/g, '')
  const cepDestino = searchParams.get('cepDestino')?.replace(/\D/g, '')
  const peso = searchParams.get('peso') || '100'

  if (!cepDestino || cepDestino.length !== 8) {
    return NextResponse.json({ error: 'CEP de destino inválido' }, { status: 400 })
  }

  const cepOrigem = cepOrigemParam || (await getCepOrigem())
  const servicos = await calcularServicos(cepOrigem, cepDestino, parseFloat(peso) || 100)
  return NextResponse.json({ servicos })
}

// POST — cálculo a partir dos itens do carrinho (peso real somado do banco).
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const cepDestino = String(body.cepDestino || '').replace(/\D/g, '')

    if (cepDestino.length !== 8) {
      return NextResponse.json({ error: 'CEP de destino inválido' }, { status: 400 })
    }

    type ItemEntrada = { produtoId: string; quantidade: number }
    const itens: ItemEntrada[] = Array.isArray(body.itens) ? body.itens : []

    // Soma o peso de cada produto × quantidade (fallback 100g por item).
    let pesoTotal = 0
    if (itens.length > 0) {
      try {
        const produtos = await prisma.produto.findMany({
          where: { id: { in: itens.map(i => i.produtoId) } },
          select: { id: true, peso: true },
        })
        const pesoPorId = new Map(produtos.map(p => [p.id, p.peso ?? 100]))
        for (const item of itens) {
          const peso = pesoPorId.get(item.produtoId) ?? 100
          pesoTotal += peso * (item.quantidade || 1)
        }
      } catch {
        pesoTotal = itens.reduce((acc, i) => acc + 100 * (i.quantidade || 1), 0)
      }
    }
    if (pesoTotal <= 0) pesoTotal = 100

    const cepOrigem = await getCepOrigem()
    const servicos = await calcularServicos(cepOrigem, cepDestino, pesoTotal)
    return NextResponse.json({ servicos, pesoTotal })
  } catch (error) {
    console.error('Erro ao calcular frete:', error)
    return NextResponse.json({ error: 'Erro ao calcular o frete' }, { status: 500 })
  }
}
