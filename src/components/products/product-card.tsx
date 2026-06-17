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

// Tamanhos responsivos da imagem: 1 col no mobile, 2 no tablet, 3 no desktop.
// Casa com o grid de /produtos (grid-cols-1 sm:grid-cols-2 xl:grid-cols-3).
const IMAGE_SIZES = '(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw'

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
      className="product-card group relative h-full"
    >
      <Link href={`/produtos/${slug}`} className="block h-full">
        <article className="product-card__surface flex h-full flex-col overflow-hidden rounded-2xl bg-cream-50 border border-cream-300 group-hover:border-terracotta-500/50 soft-shadow transition-all duration-300">
          {/* Mídia */}
          <div className="product-card__media relative aspect-square overflow-hidden">
            <Image
              src={primaryImage}
              alt={nome}
              fill
              sizes={IMAGE_SIZES}
              className={`object-cover transition-all duration-500 group-hover:opacity-0 group-hover:scale-110 ${isOutOfStock ? 'grayscale' : ''}`}
            />
            <Image
              src={hoverImage}
              alt=""
              aria-hidden
              fill
              sizes={IMAGE_SIZES}
              className={`object-cover transition-all duration-500 opacity-0 scale-110 group-hover:opacity-100 group-hover:scale-100 ${isOutOfStock ? 'grayscale' : ''}`}
            />

            {/* Scrim para legibilidade dos botões sobre a imagem */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-forest-900/30 to-transparent opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300" />

            {/* Brilho ao passar o mouse */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />

            {/* Selos */}
            <div className="product-card__badges absolute top-3 left-3 flex flex-col gap-2">
              {discount > 0 && (
                <Badge className="bg-terracotta-600 text-cream-50 border-0 text-xs font-bold tracking-wide">
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

            {/* Favoritar — sempre visível no mobile, revela no hover do desktop */}
            <button
              type="button"
              aria-label={isWishlisted ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
              aria-pressed={isWishlisted}
              onClick={(e) => {
                e.preventDefault()
                setIsWishlisted(!isWishlisted)
              }}
              className="absolute top-3 right-3 w-9 h-9 rounded-full bg-cream-50/90 backdrop-blur-sm flex items-center justify-center shadow-sm transition-all hover:bg-cream-100 opacity-100 lg:opacity-0 lg:group-hover:opacity-100"
            >
              <Heart className={`w-4 h-4 transition-colors ${isWishlisted ? 'fill-terracotta-500 text-terracotta-500' : 'text-forest-700'}`} />
            </button>

            {/* Ações rápidas — sempre visíveis no mobile, deslizam no hover do desktop */}
            <div className="product-card__actions absolute bottom-3 left-3 right-3 flex gap-2 transition-all duration-300 translate-y-0 opacity-100 lg:translate-y-4 lg:opacity-0 lg:group-hover:translate-y-0 lg:group-hover:opacity-100">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className="flex-1 flex items-center justify-center gap-2 bg-terracotta-500 hover:bg-terracotta-600 text-cream-50 font-semibold text-sm py-2.5 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingBag className="w-4 h-4" />
                {isOutOfStock ? 'Esgotado' : 'Adicionar'}
              </button>
              <Link
                href={`/produtos/${slug}`}
                aria-label={`Ver detalhes de ${nome}`}
                className="w-11 h-11 flex-shrink-0 flex items-center justify-center bg-forest-700/90 hover:bg-forest-600 rounded-xl transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <Eye className="w-4 h-4 text-cream-50" />
              </Link>
            </div>
          </div>

          {/* Conteúdo */}
          <div className="product-card__body flex flex-1 flex-col p-5">
            <p className="product-card__eyebrow text-sage-600 text-[0.7rem] font-semibold uppercase tracking-[0.12em] mb-1.5">
              {categoria}
            </p>
            <h3 className="product-card__title font-heading text-forest-900 text-base leading-snug mb-4 line-clamp-2 group-hover:text-terracotta-500 transition-colors">
              {nome}
            </h3>
            <div className="product-card__price mt-auto flex items-end gap-2">
              <span className="font-heading text-lg font-semibold text-forest-900">
                {formatCurrency(preco)}
              </span>
              {precoOriginal && (
                <span className="text-forest-400 text-sm line-through mb-0.5">
                  {formatCurrency(precoOriginal)}
                </span>
              )}
            </div>
          </div>
        </article>
      </Link>
    </motion.div>
  )
}
