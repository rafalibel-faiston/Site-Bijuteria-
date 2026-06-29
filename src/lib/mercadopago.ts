// Integração com o Mercado Pago via API REST (Checkout Pro hospedado).
// Sem SDK — usa fetch direto, então não adiciona dependência ao projeto.
//
// Env vars (configurar no Railway):
//   MP_ACCESS_TOKEN     — Access Token da aplicação (Produção). Segredo do servidor.
//   MP_WEBHOOK_SECRET   — "Assinatura secreta" do webhook (painel MP > Webhooks).
//   NEXT_PUBLIC_APP_URL — URL pública (ex.: https://site-bijuteria-production.up.railway.app)

const MP_API = 'https://api.mercadopago.com'

function token(): string {
  return process.env.MP_ACCESS_TOKEN || ''
}

export function mpConfigurado(): boolean {
  return !!process.env.MP_ACCESS_TOKEN
}

function baseUrl(): string {
  return (process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || '').replace(/\/$/, '')
}

interface ItemPreferencia {
  titulo: string
  quantidade: number
  precoUnit: number
}

// Cria uma preferência de checkout e devolve a URL hospedada do Mercado Pago.
// Retorna null se o MP não estiver configurado (o fluxo cai no modo manual).
export async function criarPreferencia(opts: {
  pedidoId: string
  acessoToken: string
  itens: ItemPreferencia[]
  frete: number
  email?: string | null
}): Promise<{ checkoutUrl: string; preferenceId: string } | null> {
  const base = baseUrl()
  if (!mpConfigurado() || !base) return null

  const items = opts.itens.map((i) => ({
    title: i.titulo,
    quantity: i.quantidade,
    unit_price: Math.round(i.precoUnit * 100) / 100,
    currency_id: 'BRL',
  }))
  if (opts.frete > 0) {
    items.push({ title: 'Frete', quantity: 1, unit_price: Math.round(opts.frete * 100) / 100, currency_id: 'BRL' })
  }

  const confirmacao = `${base}/pedidos/${opts.pedidoId}?t=${opts.acessoToken}`
  const body = {
    items,
    external_reference: opts.pedidoId, // liga o pagamento ao nosso pedido
    payer: opts.email ? { email: opts.email } : undefined,
    back_urls: {
      success: confirmacao,
      pending: confirmacao,
      failure: `${base}/checkout`,
    },
    auto_return: 'approved',
    notification_url: `${base}/api/webhooks/mercadopago`,
  }

  try {
    const res = await fetch(`${MP_API}/checkout/preferences`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token()}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (!res.ok) {
      console.error('Mercado Pago: falha ao criar preferência', res.status)
      return null
    }
    const data = await res.json()
    return { checkoutUrl: data.init_point, preferenceId: data.id }
  } catch {
    console.error('Mercado Pago: erro de rede ao criar preferência')
    return null
  }
}

// Consulta um pagamento e devolve o status + a referência do nosso pedido.
export async function buscarPagamento(
  paymentId: string,
): Promise<{ status: string; externalReference: string | null } | null> {
  if (!mpConfigurado()) return null
  try {
    const res = await fetch(`${MP_API}/v1/payments/${paymentId}`, {
      headers: { Authorization: `Bearer ${token()}` },
    })
    if (!res.ok) return null
    const data = await res.json()
    return { status: data.status, externalReference: data.external_reference ?? null }
  } catch {
    return null
  }
}

// Mapeia o status do pagamento do MP para o status do nosso pedido.
export const MP_STATUS_MAP: Record<string, string> = {
  approved: 'CONFIRMADO',
  authorized: 'CONFIRMADO',
  pending: 'PENDENTE',
  in_process: 'PENDENTE',
  in_mediation: 'PENDENTE',
  rejected: 'CANCELADO',
  cancelled: 'CANCELADO',
  refunded: 'CANCELADO',
  charged_back: 'CANCELADO',
}
