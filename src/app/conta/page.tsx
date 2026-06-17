import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/db'
import { Package, ChevronRight, ShoppingBag } from 'lucide-react'
import { formatCurrency, formatDate, statusLabels, statusColors } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ContaHeader } from './conta-header'

export const dynamic = 'force-dynamic'

export default async function ContaPage() {
  const session = await auth()
  if (!session) redirect('/entrar')

  const user = session.user as { id?: string; name?: string | null; email?: string | null }

  // Pega pedidos vinculados a conta OU feitos como convidado com o mesmo email.
  const pedidos = await prisma.pedido.findMany({
    where: {
      OR: [
        ...(user.id ? [{ userId: user.id }] : []),
        ...(user.email ? [{ clienteEmail: user.email }] : []),
      ],
    },
    include: {
      itens: { include: { produto: { select: { nome: true } } } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="min-h-screen bg-cream-100 pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-heading text-3xl font-bold text-forest-900">
              Olá, {user.name?.split(' ')[0] || 'cliente'}!
            </h1>
            <p className="text-forest-500 mt-1">{user.email}</p>
          </div>
          <ContaHeader />
        </div>

        <h2 className="text-forest-900 font-semibold text-xl mb-4 flex items-center gap-2">
          <Package className="w-5 h-5 text-sage-600" />
          Meus Pedidos
        </h2>

        {pedidos.length === 0 ? (
          <div className="bg-cream-50 rounded-2xl border border-cream-300 p-10 text-center">
            <ShoppingBag className="w-12 h-12 text-forest-300 mx-auto mb-4" />
            <p className="text-forest-600 mb-6">Você ainda não fez nenhum pedido.</p>
            <Button variant="luxury" asChild>
              <Link href="/produtos">Ver produtos</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {pedidos.map((pedido) => (
              <Link
                key={pedido.id}
                href={`/pedidos/${pedido.id}`}
                className="block bg-cream-50 rounded-2xl border border-cream-300 p-5 hover:border-sage-400 transition-colors"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-mono font-bold text-terracotta-500">{pedido.numeroPedido}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[pedido.status]}`}>
                        {statusLabels[pedido.status]}
                      </span>
                    </div>
                    <p className="text-forest-500 text-sm mt-1">
                      {formatDate(pedido.createdAt)} • {pedido.itens.length} {pedido.itens.length === 1 ? 'item' : 'itens'}
                    </p>
                    <p className="text-forest-400 text-xs mt-1 truncate">
                      {pedido.itens.map((i) => i.produto.nome).join(', ')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="font-semibold text-forest-900">{formatCurrency(pedido.total)}</span>
                    <ChevronRight className="w-4 h-4 text-forest-400" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
