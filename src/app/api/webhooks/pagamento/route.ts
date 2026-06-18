import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

// Webhook de confirmação de pagamento (gateway-agnóstico).
//
// É a ÚNICA via, além do admin, que pode marcar um pedido como pago. O status
// nunca vem do navegador do cliente. A autenticidade é garantida por uma
// assinatura HMAC-SHA256 do corpo cru, usando PAGAMENTO_WEBHOOK_SECRET
// (o segredo compartilhado com o gateway).
//
// Ao integrar um gateway real (MercadoPago/Pagar.me/Stripe):
//  - envie o `pedido.id` como external_reference ao criar a cobrança;
//  - configure este endpoint como URL de webhook;
//  - ajuste o nome do header de assinatura e o parsing do payload abaixo.
//
// Payload esperado (JSON): { "pedidoId": "...", "status": "paid", "ref": "..." }

const MAPA_STATUS: Record<string, string> = {
  paid: 'CONFIRMADO',
  approved: 'CONFIRMADO',
  confirmed: 'CONFIRMADO',
  confirmado: 'CONFIRMADO',
  pending: 'PENDENTE',
  pendente: 'PENDENTE',
  failed: 'CANCELADO',
  refused: 'CANCELADO',
  cancelled: 'CANCELADO',
  canceled: 'CANCELADO',
  cancelado: 'CANCELADO',
  refunded: 'CANCELADO',
}

function assinaturaValida(corpoCru: string, assinatura: string | null): boolean {
  const secret = process.env.PAGAMENTO_WEBHOOK_SECRET
  if (!secret || !assinatura) return false
  const esperado = crypto.createHmac('sha256', secret).update(corpoCru).digest('hex')
  const a = Buffer.from(assinatura)
  const b = Buffer.from(esperado)
  // timingSafeEqual exige buffers do mesmo tamanho.
  if (a.length !== b.length) return false
  return crypto.timingSafeEqual(a, b)
}

export async function POST(req: NextRequest) {
  // Precisa do corpo CRU (string) para conferir o HMAC — não usar req.json() antes.
  const corpoCru = await req.text()
  const assinatura =
    req.headers.get('x-signature') || req.headers.get('x-webhook-signature')

  if (!assinaturaValida(corpoCru, assinatura)) {
    return NextResponse.json({ error: 'Assinatura inválida' }, { status: 401 })
  }

  let evento: { pedidoId?: string; status?: string; ref?: string }
  try {
    evento = JSON.parse(corpoCru)
  } catch {
    return NextResponse.json({ error: 'Payload inválido' }, { status: 400 })
  }

  const novoStatus = MAPA_STATUS[String(evento.status || '').toLowerCase()]
  if (!evento.pedidoId || !novoStatus) {
    return NextResponse.json({ error: 'Evento incompleto' }, { status: 400 })
  }

  const pedido = await prisma.pedido.findUnique({ where: { id: evento.pedidoId } })
  if (!pedido) {
    return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 })
  }

  // Idempotente: se já está no status alvo, não reprocessa.
  if (pedido.status === novoStatus) {
    return NextResponse.json({ ok: true, jaProcessado: true })
  }

  await prisma.pedido.update({
    where: { id: pedido.id },
    data: { status: novoStatus, pagamentoRef: evento.ref ?? pedido.pagamentoRef },
  })

  return NextResponse.json({ ok: true })
}
