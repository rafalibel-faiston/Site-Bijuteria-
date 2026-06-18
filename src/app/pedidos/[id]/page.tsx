import { prisma } from '@/lib/db'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, Package, Truck, MapPin, ArrowRight } from 'lucide-react'
import { formatCurrency, formatDateTime, statusLabels } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { getSessionUser } from '@/lib/api-auth'
import { validarTokenPedido } from '@/lib/pedido-token'

interface Props {
  params: { id: string }
  searchParams: { t?: string }
}

export default async function OrderPage({ params, searchParams }: Props) {
  const pedido = await prisma.pedido.findUnique({
    where: { id: params.id },
    include: {
      itens: {
        include: { produto: true },
      },
    },
  })

  if (!pedido) notFound()

  // Autorização: admin, dono (logado) ou portador do token de acesso (?t=).
  // Sem isso, a página exporia PII (nome, e-mail, endereço) de qualquer pedido.
  const { id: userId, role } = await getSessionUser()
  const autorizado =
    role === 'ADMIN' ||
    (userId && pedido.userId === userId) ||
    validarTokenPedido(pedido.id, searchParams?.t)

  if (!autorizado) notFound()

  const endereco = JSON.parse(pedido.enderecoEntrega)

  const statusSteps = ['PENDENTE', 'CONFIRMADO', 'PREPARANDO', 'ENVIADO', 'ENTREGUE']
  const currentStep = statusSteps.indexOf(pedido.status)

  return (
    <div className="min-h-screen bg-cream-100 pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Header */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 rounded-full bg-sage-500/20 border border-sage-500/30 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-sage-600" />
          </div>
          <h1 className="font-heading text-4xl font-bold text-forest-900 mb-3">
            Pedido <span className="text-gradient-brand">Confirmado!</span>
          </h1>
          <p className="text-forest-600 text-lg">
            Obrigada por comprar na Charme Final Acessórios, {pedido.clienteNome.split(' ')[0]}!
          </p>
          <p className="text-forest-500 mt-2">
            Número do pedido: <span className="text-terracotta-500 font-mono font-bold">{pedido.numeroPedido}</span>
          </p>
          <p className="text-forest-400 text-sm mt-1">
            Confirmação enviada para {pedido.clienteEmail}
          </p>
        </div>

        {/* Status Timeline */}
        <div className="bg-cream-50 rounded-2xl border border-cream-300 p-6 mb-6">
          <h2 className="text-forest-900 font-semibold mb-6 flex items-center gap-2">
            <Package className="w-5 h-5 text-sage-600" />
            Status do Pedido
          </h2>

          <div className="relative">
            <div className="absolute top-5 left-5 right-5 h-0.5 bg-cream-300" />
            <div
              className="absolute top-5 left-5 h-0.5 bg-terracotta-500 transition-all duration-1000"
              style={{ width: `${(currentStep / (statusSteps.length - 1)) * 100}%` }}
            />

            <div className="relative flex justify-between">
              {statusSteps.map((status, i) => (
                <div key={status} className="flex flex-col items-center gap-2">
                  <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center z-10 ${
                    i <= currentStep
                      ? 'bg-terracotta-500 border-terracotta-500 text-cream-50'
                      : 'bg-cream-50 border-cream-300 text-forest-400'
                  }`}>
                    {i <= currentStep ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <span className="text-xs font-bold">{i + 1}</span>
                    )}
                  </div>
                  <span className={`text-xs text-center max-w-16 ${i <= currentStep ? 'text-forest-900' : 'text-forest-400'}`}>
                    {statusLabels[status]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {pedido.codigoRastreio && (
            <div className="mt-6 p-4 bg-cream-100 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Truck className="w-5 h-5 text-sage-600" />
                <div>
                  <p className="text-forest-900 text-sm font-medium">Código de Rastreio</p>
                  <p className="text-terracotta-500 font-mono font-bold">{pedido.codigoRastreio}</p>
                </div>
              </div>
              <a
                href={`https://www.correios.com.br/rastreamento/#/search?P_TIPO=001&P_LINGUA=001&P_QUANTIDADE=1&P_OBJETO=${pedido.codigoRastreio}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-terracotta-500 text-sm hover:text-terracotta-600 flex items-center gap-1"
              >
                Rastrear <ArrowRight className="w-3 h-3" />
              </a>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Order Items */}
          <div className="bg-cream-50 rounded-2xl border border-cream-300 p-6">
            <h2 className="text-forest-900 font-semibold mb-4">Itens do Pedido</h2>
            <div className="space-y-3">
              {pedido.itens.map((item) => (
                <div key={item.id} className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="text-forest-900 text-sm">{item.produto.nome}</p>
                    <p className="text-forest-500 text-xs">Qty: {item.quantidade} × {formatCurrency(item.precoUnit)}</p>
                  </div>
                  <span className="text-terracotta-500 text-sm font-medium">
                    {formatCurrency(item.quantidade * item.precoUnit)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-cream-300 mt-4 pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-forest-500">Subtotal</span>
                <span className="text-forest-900">{formatCurrency(pedido.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-forest-500">Frete{pedido.servicoCorreios ? ` (${pedido.servicoCorreios})` : ''}</span>
                <span className="text-forest-900">{pedido.frete > 0 ? formatCurrency(pedido.frete) : 'Grátis'}</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span className="text-forest-900">Total</span>
                <span className="text-terracotta-500">{formatCurrency(pedido.total)}</span>
              </div>
            </div>
          </div>

          {/* Delivery Address */}
          <div className="bg-cream-50 rounded-2xl border border-cream-300 p-6">
            <h2 className="text-forest-900 font-semibold mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-sage-600" />
              Endereço de Entrega
            </h2>
            <div className="text-forest-600 text-sm space-y-1">
              <p className="text-forest-900 font-medium">{pedido.clienteNome}</p>
              <p>{endereco.logradouro}, {endereco.numero || ''}</p>
              {endereco.complemento && <p>{endereco.complemento}</p>}
              <p>{endereco.bairro}</p>
              <p>{endereco.cidade} - {endereco.estado}</p>
              <p>CEP: {pedido.cep}</p>
            </div>

            <div className="mt-4 pt-4 border-t border-cream-300">
              <p className="text-forest-500 text-xs">Pedido realizado em</p>
              <p className="text-forest-900 text-sm">{formatDateTime(pedido.createdAt)}</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="luxury" size="lg" asChild>
            <Link href="/produtos">
              Continuar Comprando
            </Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="/">
              Voltar ao Início
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
