"use client"

import { useCartStore } from './cart-store'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ShoppingBag, Minus, Plus, Trash2 } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'

export function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, total, totalItems } = useCartStore()

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 z-50 h-full w-full max-w-md bg-cream-50 warm-shadow flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-cream-300">
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-6 h-6 text-terracotta-500" />
                <h2 className="text-xl font-heading font-semibold text-forest-900">
                  Seu Carrinho
                </h2>
                {totalItems() > 0 && (
                  <span className="bg-terracotta-500 text-cream-50 text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                    {totalItems()}
                  </span>
                )}
              </div>
              <button
                onClick={closeCart}
                className="p-2 rounded-lg hover:bg-cream-200 transition-colors text-forest-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <ShoppingBag className="w-16 h-16 text-cream-400 mb-4" />
                  <p className="text-forest-700 text-lg">Seu carrinho está vazio</p>
                  <p className="text-forest-400 text-sm mt-2">Adicione produtos para continuar</p>
                  <Button
                    onClick={closeCart}
                    variant="luxury"
                    className="mt-6"
                    asChild
                  >
                    <Link href="/produtos">Ver Produtos</Link>
                  </Button>
                </div>
              ) : (
                <AnimatePresence>
                  {items.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="flex gap-4 bg-white rounded-xl p-4 soft-shadow"
                    >
                      <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                        <Image
                          src={item.imagem}
                          alt={item.nome}
                          fill
                          className="object-cover"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="text-forest-900 font-medium text-sm truncate">{item.nome}</h3>
                        <p className="text-terracotta-500 font-bold mt-1">{formatCurrency(item.preco)}</p>

                        <div className="flex items-center gap-3 mt-3">
                          <div className="flex items-center gap-2 bg-cream-200 rounded-lg p-1">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantidade - 1)}
                              className="p-1 hover:text-terracotta-500 transition-colors text-forest-900"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-forest-900 text-sm w-6 text-center">{item.quantidade}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantidade + 1)}
                              className="p-1 hover:text-terracotta-500 transition-colors text-forest-900"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-red-400 hover:text-red-300 transition-colors ml-auto"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="p-6 border-t border-cream-300 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-forest-700">Subtotal</span>
                  <span className="text-forest-900 font-bold text-xl">{formatCurrency(total())}</span>
                </div>
                <p className="text-forest-400 text-xs">Frete calculado no checkout</p>

                <Button
                  variant="luxury"
                  size="lg"
                  className="w-full"
                  asChild
                  onClick={closeCart}
                >
                  <Link href="/carrinho">
                    Finalizar Compra
                  </Link>
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-forest-700"
                  onClick={closeCart}
                >
                  Continuar Comprando
                </Button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
