import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { prisma } from '@/lib/db'
import { buscarPagamento, MP_STATUS_MAP } from '@/lib/mercadopago'

export const dynamic = 'force-dynamic'

// Webhook do Mercado Pago. ÚNICA via (além do admin) que confirma pagamento —
// o status nunca vem do navegador do cliente.
//
// Validação de assinatura (padrão MP): header `x-signature` = "ts=...,v1=<hmac>".
// O HMAC-SHA256 é calculado sobre o manifest
//   id:<data.id>;request-id:<x-request-id>;ts:<ts>;
// com a "assinatura secreta" do webhook (MP_WEBHOOK_SECRET).
function assinaturaValida(req: NextRequest, dataId: string | null): boolean {
  const secret = process.env.MP_WEBHOOK_SECRET
  const xSignature = req.headers.get('x-signature')
  const xRequestId = req.headers.get('x-request-id')
  if (!secret || !xSignature || !dataId) return false

  const partes = Object.fromEntries(
    xSignature.split(',').map((p) => {
      const [k, v] = p.split('=')
      return [k?.trim(), v?.trim()]
    }),
  )
  const ts = partes['ts']
  const v1 = partes['v1']
  if (!ts || !v1) return false

  // ids alfanuméricos devem entrar em minúsculas no manifest (regra do MP).
  const manifest = `id:${dataId.toLowerCase()};request-id:${xRequestId};ts:${ts};`
  const esperado = crypto.createHmac('sha256', secret).update(manifest).digest('hex')

  const a = Buffer.from(esperado)
  const b = Buffer.from(v1)
  if (a.length !== b.length) return false
  return crypto.timingSafeEqual(a, b)
}

export async function POST(req: NextRequest) {
  const url = new URL(req.url)
  const dataId = url.searchParams.get('data.id') || url.searchParams.get('id')
  const tipo = url.searchParams.get('type') || url.searchParams.get('topic')

  if (!assinaturaValida(req, dataId)) {
    return NextResponse.json({ error: 'Assinatura inválida' }, { status: 401 })
  }

  // Só tratamos eventos de pagamento; os demais são reconhecidos e ignorados.
  if (tipo && tipo !== 'payment') {
    return NextResponse.json({ ok: true, ignorado: tipo })
  }
  if (!dataId) {
    return NextResponse.json({ error: 'data.id ausente' }, { status: 400 })
  }

  const pagamento = await buscarPagamento(dataId)
  if (!pagamento || !pagamento.externalReference) {
    // 200 para o MP não reenfileirar indefinidamente um pagamento que não mapeia.
    return NextResponse.json({ ok: true, semReferencia: true })
  }

  const novoStatus = MP_STATUS_MAP[pagamento.status]
  if (!novoStatus) {
    return NextResponse.json({ ok: true, statusIgnorado: pagamento.status })
  }

  const pedido = await prisma.pedido.findUnique({ where: { id: pagamento.externalReference } })
  if (!pedido) {
    return NextResponse.json({ ok: true, pedidoInexistente: true })
  }

  // Idempotente: só atualiza se mudou de status.
  if (pedido.status !== novoStatus) {
    await prisma.pedido.update({
      where: { id: pedido.id },
      data: { status: novoStatus, pagamentoRef: dataId },
    })
  }

  return NextResponse.json({ ok: true })
}
