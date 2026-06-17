import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

interface ServicoConfig {
  codigo: string
  nome: string
  // Estimativa usada quando a API dos Correios não responde.
  base: number
  porKg: number
  prazo: string
}

const SERVICOS: ServicoConfig[] = [
  { codigo: '41106', nome: 'PAC', base: 15, porKg: 8, prazo: '8' },
  { codigo: '40010', nome: 'SEDEX', base: 25, porKg: 15, prazo: '3' },
]

interface ServicoFrete {
  servico: string
  codigo: string
  preco: string
  prazo: string
  estimado?: boolean
}

// Consulta um serviço nos Correios; se falhar, devolve uma estimativa.
async function calcularServico(
  servico: ServicoConfig,
  cepOrigem: string,
  cepDestino: string,
  pesoKg: number,
): Promise<ServicoFrete> {
  const estimativa: ServicoFrete = {
    servico: servico.nome,
    codigo: servico.codigo,
    preco: (servico.base + pesoKg * servico.porKg).toFixed(2),
    prazo: servico.prazo,
    estimado: true,
  }

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
      `https://ws.correios.com.br/calculador/CalcPrecoPrazo.aspx?${params}`,
      { signal: AbortSignal.timeout(5000) }
    )

    if (!res.ok) return estimativa

    const xml = await res.text()
    const precoMatch = xml.match(/<Valor>([\d,]+)<\/Valor>/)
    const prazoMatch = xml.match(/<PrazoEntrega>(\d+)<\/PrazoEntrega>/)
    const erroMatch = xml.match(/<MsgErro>(.*?)<\/MsgErro>/)

    if (erroMatch && erroMatch[1] && erroMatch[1].trim()) return estimativa

    const valor = precoMatch ? parseFloat(precoMatch[1].replace(',', '.')) : 0
    if (valor > 0 && prazoMatch) {
      return {
        servico: servico.nome,
        codigo: servico.codigo,
        preco: valor.toFixed(2),
        prazo: prazoMatch[1],
      }
    }
    return estimativa
  } catch {
    return estimativa
  }
}

// Consulta todos os serviços em paralelo. Sempre devolve ao menos as estimativas.
async function calcularServicos(cepOrigem: string, cepDestino: string, pesoGramas: number): Promise<ServicoFrete[]> {
  const pesoKg = Math.max(0.1, pesoGramas / 1000)
  return Promise.all(SERVICOS.map(s => calcularServico(s, cepOrigem, cepDestino, pesoKg)))
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
