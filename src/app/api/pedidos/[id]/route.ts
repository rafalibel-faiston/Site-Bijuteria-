import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAdmin, getSessionUser } from '@/lib/api-auth'
import { validarTokenPedido } from '@/lib/pedido-token'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const pedido = await prisma.pedido.findUnique({
    where: { id: params.id },
    include: { itens: { include: { produto: true } } },
  })
  if (!pedido) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Autorização: admin, dono (logado) ou portador do token de acesso do pedido.
  const token = new URL(req.url).searchParams.get('t')
  const { id: userId, role } = await getSessionUser()
  const autorizado =
    role === 'ADMIN' ||
    (userId && pedido.userId === userId) ||
    validarTokenPedido(pedido.id, token)

  // Não revela existência/PII de pedidos de terceiros.
  if (!autorizado) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json(pedido)
}

// Atualização de pedido: somente ADMIN e apenas campos permitidos (status/rastreio).
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const gate = await requireAdmin()
  if (!gate.ok) return gate.response

  const body = await req.json()
  const STATUS_VALIDOS = ['PENDENTE', 'CONFIRMADO', 'PREPARANDO', 'ENVIADO', 'ENTREGUE', 'CANCELADO']

  const data: { status?: string; codigoRastreio?: string } = {}
  if (typeof body.status === 'string' && STATUS_VALIDOS.includes(body.status)) {
    data.status = body.status
  }
  if (typeof body.codigoRastreio === 'string') {
    data.codigoRastreio = body.codigoRastreio
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: 'Nenhum campo válido para atualizar' }, { status: 400 })
  }

  const pedido = await prisma.pedido.update({ where: { id: params.id }, data })
  return NextResponse.json(pedido)
}
