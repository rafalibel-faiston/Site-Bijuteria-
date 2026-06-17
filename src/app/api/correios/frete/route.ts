import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const SERVICOS = [
  { codigo: '41106', nome: 'PAC' },
  { codigo: '40010', nome: 'SEDEX' },
  { codigo: '40215', nome: 'SEDEX 10' },
]

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const cepOrigem = searchParams.get('cepOrigem')?.replace(/\D/g, '') || '01001000'
  const cepDestino = searchParams.get('cepDestino')?.replace(/\D/g, '')
  const peso = searchParams.get('peso') || '100'

  if (!cepDestino || cepDestino.length !== 8) {
    return NextResponse.json({ error: 'CEP de destino inválido' }, { status: 400 })
  }

  const resultados = []

  for (const servico of SERVICOS) {
    try {
      const params = new URLSearchParams({
        nCdEmpresa: '',
        sDsSenha: '',
        sCepOrigem: cepOrigem,
        sCepDestino: cepDestino,
        nVlPeso: (parseFloat(peso) / 1000).toFixed(3),
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

      if (erroMatch && erroMatch[1] && erroMatch[1].trim()) {
        continue
      }

      if (precoMatch && prazoMatch) {
        resultados.push({
          servico: servico.nome,
          codigo: servico.codigo,
          preco: precoMatch[1].replace(',', '.'),
          prazo: prazoMatch[1],
        })
      }
    } catch {
      // Se falhar para esse serviço, continue
      continue
    }
  }

  // Fallback com preços estimados se API falhar
  if (resultados.length === 0) {
    const pesoKg = parseFloat(peso) / 1000
    resultados.push(
      { servico: 'PAC', codigo: '41106', preco: (15 + pesoKg * 8).toFixed(2), prazo: '8' },
      { servico: 'SEDEX', codigo: '40010', preco: (25 + pesoKg * 15).toFixed(2), prazo: '3' },
    )
  }

  return NextResponse.json({ servicos: resultados })
}
