import { prisma } from '@/lib/db'

// Cálculo de frete. Integração principal: Melhor Envio (preços reais de
// PAC/SEDEX/Jadlog sem precisar de contrato com os Correios). Se a integração
// não estiver configurada ou falhar, cai numa estimativa por peso.
//
// O endpoint legado dos Correios (CalcPrecoPrazo.aspx) foi removido — estava
// descontinuado e só gerava timeout antes de cair na estimativa.
//
// Env vars (Railway):
//   MELHOR_ENVIO_TOKEN       — token Bearer (painel Melhor Envio > Tokens/Integração)
//   MELHOR_ENVIO_SANDBOX     — "true" para usar o ambiente de testes
//   MELHOR_ENVIO_FROM_EMAIL  — e-mail de contato (exigido no User-Agent da API)

export interface ServicoFrete {
  servico: string
  codigo: string
  preco: string
  prazo: string
  estimado?: boolean
}

// ---------- Estimativa de fallback (peso × preço) ----------
interface ServicoConfig {
  codigo: string
  nome: string
  base: number
  porKg: number
  prazo: string
}

const SERVICOS_ESTIMATIVA: ServicoConfig[] = [
  { codigo: '1', nome: 'PAC', base: 15, porKg: 8, prazo: '8' },
  { codigo: '2', nome: 'SEDEX', base: 25, porKg: 15, prazo: '3' },
]

function estimativa(pesoKg: number): ServicoFrete[] {
  return SERVICOS_ESTIMATIVA.map((s) => ({
    servico: s.nome,
    codigo: s.codigo,
    preco: (s.base + pesoKg * s.porKg).toFixed(2),
    prazo: s.prazo,
    estimado: true,
  }))
}

// ---------- Melhor Envio ----------
function melhorEnvioConfigurado(): boolean {
  return !!process.env.MELHOR_ENVIO_TOKEN
}

function melhorEnvioBase(): string {
  return process.env.MELHOR_ENVIO_SANDBOX === 'true'
    ? 'https://sandbox.melhorenvio.com.br'
    : 'https://www.melhorenvio.com.br'
}

interface MEServico {
  id: number
  name: string
  price?: string | number
  custom_price?: string | number
  delivery_time?: number
  company?: { name?: string }
  error?: string
}

async function calcularMelhorEnvio(
  cepOrigem: string,
  cepDestino: string,
  pesoKg: number,
): Promise<ServicoFrete[] | null> {
  const token = process.env.MELHOR_ENVIO_TOKEN
  if (!token) return null
  const email = process.env.MELHOR_ENVIO_FROM_EMAIL || 'contato@charmefinal.com.br'

  try {
    const res = await fetch(`${melhorEnvioBase()}/api/v2/me/shipment/calculate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'User-Agent': `Charme Final Acessorios (${email})`,
      },
      body: JSON.stringify({
        from: { postal_code: cepOrigem },
        to: { postal_code: cepDestino },
        package: { weight: Number(pesoKg.toFixed(3)), width: 11, height: 5, length: 16 },
      }),
      signal: AbortSignal.timeout(6000),
    })
    if (!res.ok) return null

    const data = (await res.json()) as MEServico[]
    if (!Array.isArray(data)) return null

    const servicos = data
      .filter((s) => !s.error && s.price != null)
      .map<ServicoFrete>((s) => ({
        servico: s.company?.name ? `${s.company.name} ${s.name}` : s.name,
        codigo: String(s.id),
        preco: Number(s.custom_price ?? s.price).toFixed(2),
        prazo: String(s.delivery_time ?? ''),
      }))

    return servicos.length > 0 ? servicos : null
  } catch {
    return null
  }
}

// Devolve as opções de frete. Sempre retorna ao menos a estimativa.
export async function calcularServicos(
  cepOrigem: string,
  cepDestino: string,
  pesoGramas: number,
): Promise<ServicoFrete[]> {
  const pesoKg = Math.max(0.1, pesoGramas / 1000)

  if (melhorEnvioConfigurado()) {
    const me = await calcularMelhorEnvio(
      cepOrigem.replace(/\D/g, ''),
      cepDestino.replace(/\D/g, ''),
      pesoKg,
    )
    if (me) return me
  }

  return estimativa(pesoKg)
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
