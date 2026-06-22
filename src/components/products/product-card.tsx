"use client"

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ShoppingBag, Heart } from 'lucide-react'
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
  const [imgLoaded, setImgLoaded] = useState(false)
  const { addItem } = useCartStore()

  const imageList = JSON.parse(imagens) as string[]
  const primaryImage = imageList[0] || '/placeholder.jpg'
  const hoverImage = imageList[1] || primaryImage

  const discount = precoOriginal ? Math.round((1 - preco / precoOriginal) * 100) : 0
  const isLowStock = estoque <= 5 && estoque > 0
  const isOutOfStock = estoque === 0

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    addItem({ id, nome, preco, imagem: primaryImage, slug })
  }

  return (
    <Link href={`/produtos/${slug}`} className="group block">
      {/* Imagem — proporção portrait 3:4 */}
      <div className="relative overflow-hidden rounded-xl bg-cream-100 aspect-[3/4]">
        {/* Placeholder shimmer antes de carregar */}
        {!imgLoaded && (
          <div className="absolute inset-0 bg-cream-200 animate-pulse" />
        )}

        <Image
          src={primaryImage}
          alt={nome}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className={`object-cover transition-all duration-700 group-hover:scale-105 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setImgLoaded(true)}
        />
        <Image
          src={hoverImage}
          alt={nome}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover transition-all duration-700 opacity-0 scale-105 group-hover:opacity-100 group-hover:scale-100 absolute inset-0"
        />

        {/* Overlay escuro no hover para os botões */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {discount > 0 && (
            <Badge className="bg-terracotta-500 text-cream-50 border-0 text-xs font-bold px-2">
              -{discount}%
            </Badge>
          )}
          {isLowStock && (
            <Badge variant="warning" className="text-xs px-2">Últimas</Badge>
          )}
          {isOutOfStock && (
            <Badge variant="danger" className="text-xs px-2">Esgotado</Badge>
          )}
        </div>

        {/* Wishlist */}
        <button
          onClick={(e) => { e.preventDefault(); setIsWishlisted(!isWishlisted) }}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
        >
          <Heart className={`w-3.5 h-3.5 transition-colors ${isWishlisted ? 'fill-terracotta-500 text-terracotta-500' : 'text-forest-600'}`} />
        </button>

        {/* Botão adicionar — desliza da base */}
        <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className="w-full flex items-center justify-center gap-2 bg-forest-900 hover:bg-terracotta-500 text-cream-50 text-xs font-semibold py-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            {isOutOfStock ? 'Esgotado' : 'Adicionar ao carrinho'}
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="pt-3 pb-1">
        <p className="text-forest-400 text-[10px] tracking-wider uppercase mb-1">{categoria}</p>
        <h3 className="text-forest-900 text-sm font-medium leading-snug mb-2 line-clamp-2 group-hover:text-terracotta-500 transition-colors">
          {nome}
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-forest-900 font-semibold text-sm">{formatCurrency(preco)}</span>
          {precoOriginal && (
            <span className="text-forest-400 text-xs line-through">{formatCurrency(precoOriginal)}</span>
          )}
        </div>
      </div>
    </Link>
  )
}
