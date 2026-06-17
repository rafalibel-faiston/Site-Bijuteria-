"use client"

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ShoppingBag, ArrowLeft, Truck, Shield, RefreshCw, Star, Check } from 'lucide-react'
import { ProductGallery } from '@/components/products/product-gallery'
import { ProductCard } from '@/components/products/product-card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'
import { useCartStore } from '@/components/cart/cart-store'
import type { Produto } from '@prisma/client'

interface Props {
  produto: Produto
  related: Produto[]
}

export function ProductDetailClient({ produto, related }: Props) {
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)
  const { addItem } = useCartStore()

  const images = JSON.parse(produto.imagens) as string[]
  const discount = produto.precoOriginal
    ? Math.round((1 - produto.preco / produto.precoOriginal) * 100)
    : 0

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addItem({
        id: produto.id,
        nome: produto.nome,
        preco: produto.preco,
        imagem: images[0],
        slug: produto.slug,
      })
    }
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div className="min-h-screen bg-dark-950 pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-dark-400 mb-8">
          <Link href="/" className="hover:text-gold-400 transition-colors">Início</Link>
          <span>/</span>
          <Link href="/produtos" className="hover:text-gold-400 transition-colors">Produtos</Link>
          <span>/</span>
          <Link href={`/produtos?categoria=${produto.categoria}`} className="hover:text-gold-400 transition-colors">
            {produto.categoria}
          </Link>
          <span>/</span>
          <span className="text-white truncate">{produto.nome}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
          {/* Gallery */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <ProductGallery images={images} productName={produto.nome} />
          </motion.div>

          {/* Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-col gap-6"
          >
            {/* Category & Name */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="outline">{produto.categoria}</Badge>
                {discount > 0 && (
                  <Badge className="bg-red-500 text-white border-0">-{discount}% OFF</Badge>
                )}
                {produto.estoque <= 5 && produto.estoque > 0 && (
                  <Badge variant="warning">Últimas {produto.estoque} unidades</Badge>
                )}
                {produto.estoque === 0 && (
                  <Badge variant="danger">Esgotado</Badge>
                )}
              </div>
              <h1 className="font-heading text-3xl lg:text-4xl font-bold text-white mb-4">
                {produto.nome}
              </h1>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < 4 ? 'fill-gold-400 text-gold-400' : 'text-dark-600'}`} />
                  ))}
                </div>
                <span className="text-dark-400 text-sm">(4.8) • {produto.vendas} vendas</span>
              </div>
            </div>

            {/* Price */}
            <div className="flex items-end gap-4">
              <span className="font-heading text-4xl font-bold text-gold-400">
                {formatCurrency(produto.preco)}
              </span>
              {produto.precoOriginal && (
                <span className="text-dark-500 text-xl line-through mb-1">
                  {formatCurrency(produto.precoOriginal)}
                </span>
              )}
            </div>

            {/* Description */}
            {produto.descricao && (
              <p className="text-dark-300 leading-relaxed">{produto.descricao}</p>
            )}

            {/* Product details */}
            <div className="bg-dark-800 rounded-xl p-5 space-y-3 border border-dark-700">
              {produto.material && (
                <div className="flex justify-between text-sm">
                  <span className="text-dark-400">Material</span>
                  <span className="text-white font-medium">{produto.material}</span>
                </div>
              )}
              {produto.peso && (
                <div className="flex justify-between text-sm">
                  <span className="text-dark-400">Peso</span>
                  <span className="text-white font-medium">{produto.peso}g</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-dark-400">Categoria</span>
                <span className="text-white font-medium">{produto.categoria}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-dark-400">Disponibilidade</span>
                <span className={`font-medium ${produto.estoque > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {produto.estoque > 0 ? `${produto.estoque} em estoque` : 'Esgotado'}
                </span>
              </div>
            </div>

            {/* Quantity */}
            {produto.estoque > 0 && (
              <div className="flex items-center gap-4">
                <label className="text-dark-300 text-sm">Quantidade:</label>
                <div className="flex items-center gap-3 bg-dark-800 rounded-xl border border-dark-700 p-1">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 h-8 flex items-center justify-center text-white hover:text-gold-400 transition-colors"
                  >
                    -
                  </button>
                  <span className="text-white w-8 text-center font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(produto.estoque, quantity + 1))}
                    className="w-8 h-8 flex items-center justify-center text-white hover:text-gold-400 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* Add to cart */}
            <div className="flex gap-3">
              <Button
                variant="luxury"
                size="lg"
                className="flex-1"
                onClick={handleAddToCart}
                disabled={produto.estoque === 0}
              >
                {added ? (
                  <>
                    <Check className="w-5 h-5 mr-2" />
                    Adicionado!
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-5 h-5 mr-2" />
                    {produto.estoque === 0 ? 'Esgotado' : 'Adicionar ao Carrinho'}
                  </>
                )}
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/carrinho">Carrinho</Link>
              </Button>
            </div>

            {/* Guarantees */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-dark-700">
              <div className="text-center">
                <Truck className="w-5 h-5 text-gold-500 mx-auto mb-2" />
                <p className="text-dark-400 text-xs">Frete para todo Brasil</p>
              </div>
              <div className="text-center">
                <Shield className="w-5 h-5 text-gold-500 mx-auto mb-2" />
                <p className="text-dark-400 text-xs">Compra Segura</p>
              </div>
              <div className="text-center">
                <RefreshCw className="w-5 h-5 text-gold-500 mx-auto mb-2" />
                <p className="text-dark-400 text-xs">30 dias para troca</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <div>
            <h2 className="font-heading text-3xl font-bold text-white mb-8">
              Você também pode gostar
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {related.map((p) => (
                <ProductCard key={p.id} {...p} />
              ))}
            </div>
          </div>
        )}

        {/* Back link */}
        <div className="mt-12">
          <Link
            href="/produtos"
            className="flex items-center gap-2 text-dark-400 hover:text-gold-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para produtos
          </Link>
        </div>
      </div>
    </div>
  )
}
