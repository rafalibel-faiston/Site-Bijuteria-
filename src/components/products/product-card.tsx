"use client"

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ShoppingBag, Eye, Heart } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { useCartStore } from '@/components/cart/cart-store'
import { Badge } from '@/components/ui/badge'

interface ProductCardProps {
  id: string
  nome: string
  slug: string
  preco: number
  precoOriginal?: number | null
  imagens: string
  categoria: string
  estoque: number
}

export function ProductCard({ id, nome, slug, preco, precoOriginal, imagens, categoria, estoque }: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false)
  const { addItem } = useCartStore()

  const imageList = JSON.parse(imagens) as string[]
  const primaryImage = imageList[0] || '/placeholder.jpg'
  const hoverImage = imageList[1] || primaryImage

  const discount = precoOriginal ? Math.round((1 - preco / precoOriginal) * 100) : 0
  const isLowStock = estoque <= 5 && estoque > 0
  const isOutOfStock = estoque === 0

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    addItem({
      id,
      nome,
      preco,
      imagem: primaryImage,
      slug,
    })
  }

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="group relative"
    >
      <Link href={`/produtos/${slug}`}>
        <div className="relative overflow-hidden rounded-2xl bg-dark-800 border border-dark-700 group-hover:border-gold-500/50 transition-all duration-300">
          {/* Image Container */}
          <div className="relative aspect-square overflow-hidden">
            <Image
              src={primaryImage}
              alt={nome}
              fill
              className="object-cover transition-all duration-500 group-hover:opacity-0 group-hover:scale-110"
            />
            <Image
              src={hoverImage}
              alt={nome}
              fill
              className="object-cover transition-all duration-500 opacity-0 scale-110 group-hover:opacity-100 group-hover:scale-100"
            />

            {/* Shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />

            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-2">
              {discount > 0 && (
                <Badge className="bg-red-500 text-white border-0 text-xs font-bold">
                  -{discount}%
                </Badge>
              )}
              {isLowStock && (
                <Badge variant="warning" className="text-xs">
                  Últimas unidades
                </Badge>
              )}
              {isOutOfStock && (
                <Badge variant="danger" className="text-xs">
                  Esgotado
                </Badge>
              )}
            </div>

            {/* Wishlist */}
            <button
              onClick={(e) => {
                e.preventDefault()
                setIsWishlisted(!isWishlisted)
              }}
              className="absolute top-3 right-3 w-9 h-9 rounded-full bg-dark-900/70 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-dark-700"
            >
              <Heart className={`w-4 h-4 transition-colors ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-white'}`} />
            </button>

            {/* Quick actions */}
            <div className="absolute bottom-3 left-3 right-3 flex gap-2 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className="flex-1 flex items-center justify-center gap-2 bg-gold-500 hover:bg-gold-600 text-dark-900 font-semibold text-sm py-2.5 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingBag className="w-4 h-4" />
                {isOutOfStock ? 'Esgotado' : 'Adicionar'}
              </button>
              <Link
                href={`/produtos/${slug}`}
                className="w-10 h-10 flex items-center justify-center bg-dark-700/90 hover:bg-dark-600 rounded-xl transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <Eye className="w-4 h-4 text-white" />
              </Link>
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            <p className="text-dark-400 text-xs mb-1">{categoria}</p>
            <h3 className="text-white font-medium text-sm leading-snug mb-3 line-clamp-2 group-hover:text-gold-400 transition-colors">
              {nome}
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-gold-500 font-bold">{formatCurrency(preco)}</span>
              {precoOriginal && (
                <span className="text-dark-500 text-xs line-through">{formatCurrency(precoOriginal)}</span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
