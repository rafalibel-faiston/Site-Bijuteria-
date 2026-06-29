import { prisma } from '@/lib/db'

// Cálculo de frete (Correios, com estimativa de fallback).
// Extraído da rota /api/correios/frete para ser reusado também no fechamento
// do pedido — o frete é recalculado no servidor, nunca confiado ao cliente.

interface ServicoConfig {
  codigo: string
  nome: string
  // Estimativa usada quando a API dos Correios não responde.
  base: number
  porKg: number
  prazo: string
}

export interface ServicoFrete {
  servico: string
  codigo: string
  preco: string
  prazo: string
  estimado?: boolean
}

const SERVICOS: ServicoConfig[] = [
  { codigo: '41106', nome: 'PAC', base: 15, porKg: 8, prazo: '8' },
  { codigo: '40010', nome: 'SEDEX', base: 25, porKg: 15, prazo: '3' },
]

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
export async function calcularServicos(
  cepOrigem: string,
  cepDestino: string,
  pesoGramas: number,
): Promise<ServicoFrete[]> {
  const pesoKg = Math.max(0.1, pesoGramas / 1000)
  return Promise.all(SERVICOS.map(s => calcularServico(s, cepOrigem, cepDestino, pesoKg)))
}

// Busca o CEP de origem configurado na loja (ou usa um padrão).
export async function getCepOrigem(): Promise<string> {
  try {
    const config = await prisma.configuracaoLoja.findFirst()
    return (config?.cepOrigem || '01001000').replace(/\D/g, '')
  } catch {
    return '01001000'
  }
}
