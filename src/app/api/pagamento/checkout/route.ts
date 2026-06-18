import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { validarTokenPedido } from '@/lib/pedido-token'
import { criarPreferencia, mpConfigurado } from '@/lib/mercadopago'

export const dynamic = 'force-dynamic'

// Gera o link de checkout do Mercado Pago para um pedido já criado.
// Autorizado pelo token de acesso do pedido (mesmo modelo do IDOR).
// Se o gateway não estiver configurado, devolve checkoutUrl: null → o cliente
// segue para a confirmação (pagamento manual / PIX).
export async function POST(req: NextRequest) {
  const { pedidoId, token } = await req.json().catch(() => ({}))

  if (!pedidoId || !validarTokenPedido(pedidoId, token)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
  }

  if (!mpConfigurado()) {
    return NextResponse.json({ checkoutUrl: null })
  }

  const pedido = await prisma.pedido.findUnique({
    where: { id: pedidoId },
    include: { itens: { include: { produto: { select: { nome: true } } } } },
  })
  if (!pedido) {
    return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 })
  }

  const pref = await criarPreferencia({
    pedidoId: pedido.id,
    acessoToken: token,
    itens: pedido.itens.map((it) => ({
      titulo: it.produto.nome,
      quantidade: it.quantidade,
      precoUnit: it.precoUnit,
    })),
    frete: pedido.frete,
    email: pedido.clienteEmail,
  })

  return NextResponse.json({ checkoutUrl: pref?.checkoutUrl ?? null })
}
