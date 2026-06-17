"use client"

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ShoppingBag, Minus, Plus, Trash2, Truck, ArrowRight, ArrowLeft } from 'lucide-react'
import { useCartStore } from '@/components/cart/cart-store'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'

interface FreteOption {
  servico: string
  codigo: string
  preco: number
  prazo: number
}

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, total } = useCartStore()
  const [cep, setCep] = useState('')
  const [freteOptions, setFreteOptions] = useState<FreteOption[]>([])
  const [selectedFrete, setSelectedFrete] = useState<FreteOption | null>(null)
  const [loadingFrete, setLoadingFrete] = useState(false)
  const [freteError, setFreteError] = useState('')

  const calcFrete = async () => {
    if (cep.replace(/\D/g, '').length < 8) {
      setFreteError('CEP inválido')
      return
    }

    setLoadingFrete(true)
    setFreteError('')

    try {
      const pesoTotal = items.reduce((acc, item) => acc + (item.quantidade * 100), 0) // assume 100g each
      const response = await fetch('/api/correios/frete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cep, peso: Math.max(pesoTotal / 1000, 0.1) }),
      })
      const data = await response.json()
      setFreteOptions(data.opcoes || [])
      if (data.opcoes?.length > 0) {
        setSelectedFrete(data.opcoes[0])
      }
    } catch {
      setFreteError('Erro ao calcular frete. Tente novamente.')
      // Mock fallback
      const mock = [
        { servico: 'PAC', codigo: '41106', preco: 18.50, prazo: 7 },
        { servico: 'SEDEX', codigo: '40010', preco: 29.90, prazo: 2 },
      ]
      setFreteOptions(mock)
      setSelectedFrete(mock[0])
    } finally {
      setLoadingFrete(false)
    }
  }

  const subtotal = total()
  const freteValue = selectedFrete?.preco || 0
  const totalFinal = subtotal + freteValue

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-dark-950 pt-24 pb-20 flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag className="w-20 h-20 text-dark-600 mx-auto mb-6" />
          <h1 className="font-heading text-3xl font-bold text-white mb-4">Carrinho Vazio</h1>
          <p className="text-dark-400 mb-8">Adicione produtos ao seu carrinho para continuar</p>
          <Button variant="luxury" size="lg" asChild>
            <Link href="/produtos">Ver Produtos</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-950 pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-heading text-4xl font-bold text-white mb-8">
          Meu <span className="text-gradient-gold">Carrinho</span>
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-dark-800 rounded-2xl border border-dark-700 p-5 flex gap-4"
              >
                <div className="relative w-24 h-24 rounded-xl overflow-hidden flex-shrink-0">
                  <Image src={item.imagem} alt={item.nome} fill className="object-cover" />
                </div>

                <div className="flex-1 min-w-0">
                  <Link href={`/produtos/${item.slug}`} className="text-white font-medium hover:text-gold-400 transition-colors line-clamp-2">
                    {item.nome}
                  </Link>
                  <p className="text-gold-500 font-bold mt-1">{formatCurrency(item.preco)}</p>

                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2 bg-dark-700 rounded-lg p-1">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantidade - 1)}
                        className="w-8 h-8 flex items-center justify-center text-white hover:text-gold-400 transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-white w-8 text-center text-sm font-medium">{item.quantidade}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantidade + 1)}
                        className="w-8 h-8 flex items-center justify-center text-white hover:text-gold-400 transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-white font-bold">{formatCurrency(item.preco * item.quantidade)}</span>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-red-400 hover:text-red-300 transition-colors p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}

            <div className="flex justify-between">
              <Link href="/produtos" className="flex items-center gap-2 text-dark-400 hover:text-gold-400 transition-colors text-sm">
                <ArrowLeft className="w-4 h-4" />
                Continuar comprando
              </Link>
              <button
                onClick={clearCart}
                className="text-red-400 hover:text-red-300 text-sm transition-colors"
              >
                Limpar carrinho
              </button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="space-y-4">
            {/* Shipping Calculator */}
            <div className="bg-dark-800 rounded-2xl border border-dark-700 p-6">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <Truck className="w-5 h-5 text-gold-500" />
                Calcular Frete
              </h3>

              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={cep}
                  onChange={(e) => setCep(e.target.value.replace(/\D/g, '').replace(/(\d{5})(\d{3})/, '$1-$2').slice(0, 9))}
                  placeholder="00000-000"
                  className="flex-1 bg-dark-700 border border-dark-600 rounded-xl px-3 py-2.5 text-sm text-white placeholder-dark-500 focus:outline-none focus:border-gold-500"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={calcFrete}
                  disabled={loadingFrete}
                >
                  {loadingFrete ? '...' : 'Calc.'}
                </Button>
              </div>

              {freteError && <p className="text-red-400 text-xs mb-3">{freteError}</p>}

              {freteOptions.length > 0 && (
                <div className="space-y-2">
                  {freteOptions.map((option) => (
                    <label
                      key={option.codigo}
                      className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                        selectedFrete?.codigo === option.codigo
                          ? 'border-gold-500 bg-gold-500/10'
                          : 'border-dark-600 hover:border-dark-500'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="frete"
                          checked={selectedFrete?.codigo === option.codigo}
                          onChange={() => setSelectedFrete(option)}
                          className="accent-gold-500"
                        />
                        <div>
                          <p className="text-white text-sm font-medium">{option.servico}</p>
                          <p className="text-dark-400 text-xs">{option.prazo} dias úteis</p>
                        </div>
                      </div>
                      <span className="text-gold-400 font-semibold text-sm">{formatCurrency(option.preco)}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Summary */}
            <div className="bg-dark-800 rounded-2xl border border-dark-700 p-6">
              <h3 className="text-white font-semibold mb-4">Resumo do Pedido</h3>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-dark-400">Subtotal ({items.length} itens)</span>
                  <span className="text-white">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-dark-400">Frete</span>
                  <span className="text-white">
                    {freteValue > 0 ? formatCurrency(freteValue) : 'Calcule acima'}
                  </span>
                </div>
                {subtotal >= 200 && (
                  <div className="text-green-400 text-xs">
                    Parabéns! Você ganhou frete grátis.
                  </div>
                )}
                <div className="border-t border-dark-700 pt-3 flex justify-between">
                  <span className="text-white font-semibold">Total</span>
                  <span className="text-gold-400 font-bold text-xl">{formatCurrency(subtotal >= 200 ? subtotal : totalFinal)}</span>
                </div>
              </div>

              <Button variant="luxury" size="lg" className="w-full" asChild>
                <Link href="/checkout">
                  Finalizar Compra
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>

              <p className="text-dark-500 text-xs text-center mt-4">
                Pagamento seguro via PIX, Cartão ou Boleto
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
