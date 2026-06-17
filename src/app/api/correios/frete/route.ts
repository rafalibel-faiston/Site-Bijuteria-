import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

const SERVICOS = [
  { codigo: '41106', nome: 'PAC' },
  { codigo: '40010', nome: 'SEDEX' },
  { codigo: '40215', nome: 'SEDEX 10' },
]

interface ServicoFrete {
  servico: string
  codigo: string
  preco: string
  prazo: string
}

// Consulta os Correios para cada serviço e devolve os disponíveis.
async function calcularServicos(cepOrigem: string, cepDestino: string, pesoGramas: number): Promise<ServicoFrete[]> {
  const resultados: ServicoFrete[] = []
  const pesoKg = Math.max(0.1, pesoGramas / 1000)

  for (const servico of SERVICOS) {
    try {
      const params = new URLSearchParams({
        nCdEmpresa: '',
        sDsSenha: '',
        sCepOrigem: cepOrigem,
        sCepDestino: cepDestino,
        nVlPeso: pesoKg.toFixed(3),
        nCdFormato: '1',
        nVlComprimento: '16',
        nVlAltura: '5',
        nVlLargura: '11',
        nVlDiametro: '0',
        nCdServico: servico.codigo,
        nVlValorDeclarado: '0',
        sCdMaoPropria: 'N',
        sCdAvisoRecebimento: 'N',
        StrRetorno: 'xml',
        nIndicaCalculo: '3',
      })

      const res = await fetch(
        `http://ws.correios.com.br/calculador/CalcPrecoPrazo.aspx?${params}`,
        { signal: AbortSignal.timeout(8000) }
      )

      if (!res.ok) throw new Error('Correios API error')

      const xml = await res.text()
      const precoMatch = xml.match(/<Valor>([\d,]+)<\/Valor>/)
      const prazoMatch = xml.match(/<PrazoEntrega>(\d+)<\/PrazoEntrega>/)
      const erroMatch = xml.match(/<MsgErro>(.*?)<\/MsgErro>/)

      if (erroMatch && erroMatch[1] && erroMatch[1].trim()) continue

      if (precoMatch && prazoMatch && parseFloat(precoMatch[1].replace(',', '.')) > 0) {
        resultados.push({
          servico: servico.nome,
          codigo: servico.codigo,
          preco: precoMatch[1].replace(',', '.'),
          prazo: prazoMatch[1],
        })
      }
    } catch {
      continue
    }
  }

  // Fallback com preços estimados caso a API dos Correios falhe.
  if (resultados.length === 0) {
    resultados.push(
      { servico: 'PAC', codigo: '41106', preco: (15 + pesoKg * 8).toFixed(2), prazo: '8' },
      { servico: 'SEDEX', codigo: '40010', preco: (25 + pesoKg * 15).toFixed(2), prazo: '3' },
    )
  }

  return resultados
}

// Busca o CEP de origem configurado na loja (ou usa um padrão).
async function getCepOrigem(): Promise<string> {
  try {
    const config = await prisma.configuracaoLoja.findFirst()
    return (config?.cepOrigem || '01001000').replace(/\D/g, '')
  } catch {
    return '01001000'
  }
}

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
    const produtos = await prisma.produto.findMany({
      where: { id: { in: itens.map(i => i.produtoId) } },
      select: { id: true, peso: true },
    })
    const pesoPorId = new Map(produtos.map(p => [p.id, p.peso ?? 100]))
    for (const item of itens) {
      const peso = pesoPorId.get(item.produtoId) ?? 100
      pesoTotal += peso * (item.quantidade || 1)
    }
  }
  if (pesoTotal <= 0) pesoTotal = 100

  const cepOrigem = await getCepOrigem()
  const servicos = await calcularServicos(cepOrigem, cepDestino, pesoTotal)
  return NextResponse.json({ servicos, pesoTotal })
}
