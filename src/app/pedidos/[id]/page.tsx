import { prisma } from '@/lib/db'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, Package, Truck, MapPin, ArrowRight } from 'lucide-react'
import { formatCurrency, formatDateTime, statusLabels } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface Props {
  params: { id: string }
}

export default async function OrderPage({ params }: Props) {
  const pedido = await prisma.pedido.findUnique({
    where: { id: params.id },
    include: {
      itens: {
        include: { produto: true },
      },
    },
  })

  if (!pedido) notFound()

  const endereco = JSON.parse(pedido.enderecoEntrega)

  const statusSteps = ['PENDENTE', 'CONFIRMADO', 'PREPARANDO', 'ENVIADO', 'ENTREGUE']
  const currentStep = statusSteps.indexOf(pedido.status)

  return (
    <div className="min-h-screen bg-dark-950 pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Header */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-400" />
          </div>
          <h1 className="font-heading text-4xl font-bold text-white mb-3">
            Pedido <span className="text-gradient-gold">Confirmado!</span>
          </h1>
          <p className="text-dark-300 text-lg">
            Obrigada por comprar na Bella Bijuteria, {pedido.clienteNome.split(' ')[0]}!
          </p>
          <p className="text-dark-400 mt-2">
            Número do pedido: <span className="text-gold-400 font-mono font-bold">{pedido.numeroPedido}</span>
          </p>
          <p className="text-dark-500 text-sm mt-1">
            Confirmação enviada para {pedido.clienteEmail}
          </p>
        </div>

        {/* Status Timeline */}
        <div className="bg-dark-800 rounded-2xl border border-dark-700 p-6 mb-6">
          <h2 className="text-white font-semibold mb-6 flex items-center gap-2">
            <Package className="w-5 h-5 text-gold-500" />
            Status do Pedido
          </h2>

          <div className="relative">
            <div className="absolute top-5 left-5 right-5 h-0.5 bg-dark-700" />
            <div
              className="absolute top-5 left-5 h-0.5 bg-gold-500 transition-all duration-1000"
              style={{ width: `${(currentStep / (statusSteps.length - 1)) * 100}%` }}
            />

            <div className="relative flex justify-between">
              {statusSteps.map((status, i) => (
                <div key={status} className="flex flex-col items-center gap-2">
                  <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center z-10 ${
                    i <= currentStep
                      ? 'bg-gold-500 border-gold-500 text-dark-900'
                      : 'bg-dark-800 border-dark-600 text-dark-500'
                  }`}>
                    {i <= currentStep ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <span className="text-xs font-bold">{i + 1}</span>
                    )}
                  </div>
                  <span className={`text-xs text-center max-w-16 ${i <= currentStep ? 'text-white' : 'text-dark-500'}`}>
                    {statusLabels[status]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {pedido.codigoRastreio && (
            <div className="mt-6 p-4 bg-dark-700 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Truck className="w-5 h-5 text-gold-500" />
                <div>
                  <p className="text-white text-sm font-medium">Código de Rastreio</p>
                  <p className="text-gold-400 font-mono font-bold">{pedido.codigoRastreio}</p>
                </div>
              </div>
              <a
                href={`https://www.correios.com.br/rastreamento/#/search?P_TIPO=001&P_LINGUA=001&P_QUANTIDADE=1&P_OBJETO=${pedido.codigoRastreio}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gold-400 text-sm hover:text-gold-300 flex items-center gap-1"
              >
                Rastrear <ArrowRight className="w-3 h-3" />
              </a>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Order Items */}
          <div className="bg-dark-800 rounded-2xl border border-dark-700 p-6">
            <h2 className="text-white font-semibold mb-4">Itens do Pedido</h2>
            <div className="space-y-3">
              {pedido.itens.map((item) => (
                <div key={item.id} className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="text-white text-sm">{item.produto.nome}</p>
                    <p className="text-dark-400 text-xs">Qty: {item.quantidade} × {formatCurrency(item.precoUnit)}</p>
                  </div>
                  <span className="text-gold-400 text-sm font-medium">
                    {formatCurrency(item.quantidade * item.precoUnit)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-dark-700 mt-4 pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-dark-400">Subtotal</span>
                <span className="text-white">{formatCurrency(pedido.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-dark-400">Frete ({pedido.servicoCorreios})</span>
                <span className="text-white">{formatCurrency(pedido.frete)}</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span className="text-white">Total</span>
                <span className="text-gold-400">{formatCurrency(pedido.total)}</span>
              </div>
            </div>
          </div>

          {/* Delivery Address */}
          <div className="bg-dark-800 rounded-2xl border border-dark-700 p-6">
            <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-gold-500" />
              Endereço de Entrega
            </h2>
            <div className="text-dark-300 text-sm space-y-1">
              <p className="text-white font-medium">{pedido.clienteNome}</p>
              <p>{endereco.logradouro}, {endereco.numero || ''}</p>
              {endereco.complemento && <p>{endereco.complemento}</p>}
              <p>{endereco.bairro}</p>
              <p>{endereco.cidade} - {endereco.estado}</p>
              <p>CEP: {pedido.cep}</p>
            </div>

            <div className="mt-4 pt-4 border-t border-dark-700">
              <p className="text-dark-400 text-xs">Pedido realizado em</p>
              <p className="text-white text-sm">{formatDateTime(pedido.createdAt)}</p>
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
