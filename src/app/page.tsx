"use client"

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { motion, useInView } from 'framer-motion'
import { ArrowRight, Sparkles, Shield, Truck, RefreshCw, Star, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ProductCard } from '@/components/products/product-card'

interface Product {
  id: string
  nome: string
  slug: string
  preco: number
  precoOriginal: number | null
  imagens: string
  categoria: string
  estoque: number
  vendas: number
}

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([])

  const featuredRef = useRef(null)
  const isInView = useInView(featuredRef, { once: true })

  useEffect(() => {
    fetch('/api/produtos?limit=6&sort=vendas')
      .then(r => r.json())
      .then(data => setProducts(data.produtos || []))
      .catch(() => {})
  }, [])

  const categories = [
    { name: 'Anéis', emoji: '💍', color: 'from-terracotta-500 to-mustard-400', href: '/produtos?categoria=Anéis' },
    { name: 'Colares', emoji: '📿', color: 'from-sage-600 to-sage-400', href: '/produtos?categoria=Colares' },
    { name: 'Brincos', emoji: '✨', color: 'from-terracotta-600 to-terracotta-400', href: '/produtos?categoria=Brincos' },
    { name: 'Pulseiras', emoji: '🌟', color: 'from-forest-600 to-sage-500', href: '/produtos?categoria=Pulseiras' },
    { name: 'Tornozeleiras', emoji: '⭐', color: 'from-mustard-500 to-mustard-400', href: '/produtos?categoria=Tornozeleiras' },
    { name: 'Conjuntos', emoji: '👑', color: 'from-terracotta-500 to-sage-600', href: '/produtos?categoria=Conjuntos' },
  ]

  const features = [
    { icon: Shield, title: 'Compra Segura', desc: 'Pagamentos protegidos e criptografados' },
    { icon: Truck, title: 'Entrega Rápida', desc: 'Enviamos para todo o Brasil via Correios' },
    { icon: RefreshCw, title: 'Troca Garantida', desc: '30 dias para troca ou devolução' },
    { icon: Star, title: 'Qualidade Premium', desc: 'Peças selecionadas com rigoroso controle' },
  ]

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-cream-50 via-cream-100 to-sage-50" />

        {/* Decorative circles */}
        <div className="absolute top-12 right-[-2rem] w-48 h-48 rounded-full border border-sage-200/50 opacity-70" />
        <div className="absolute top-16 right-4 w-32 h-32 rounded-full border border-terracotta-200/40 opacity-60" />
        <div className="absolute bottom-16 left-[-2rem] w-56 h-56 rounded-full border border-sage-200/50 opacity-60" />
        <div className="absolute bottom-20 left-4 w-36 h-36 rounded-full border border-mustard-200/40 opacity-60" />

        {/* Glow orbs */}
        <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-sage-400/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-terracotta-400/10 rounded-full blur-3xl pointer-events-none" />

        {/* Content */}
        <div className="relative z-10 text-center px-6 max-w-5xl mx-auto pt-20 pb-10">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-terracotta-50 border border-terracotta-200 rounded-full px-4 py-2 mb-7"
          >
            <Sparkles className="w-3.5 h-3.5 text-terracotta-500" />
            <span className="text-terracotta-600 text-xs font-semibold tracking-widest uppercase">
              Nova Coleção 2025
            </span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="font-heading text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-forest-900 mb-5 leading-[1.1]"
          >
            Beleza que{' '}
            <span className="text-gradient-brand">brilha</span>
            <br />
            em você
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="text-forest-500 text-base sm:text-lg md:text-xl max-w-md sm:max-w-2xl mx-auto mb-8 leading-relaxed"
          >
            Joias e bijuterias exclusivas para cada momento especial da sua vida.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.45 }}
            className="flex flex-col sm:flex-row gap-3 justify-center mb-10"
          >
            <Button variant="luxury" size="xl" asChild className="w-full sm:w-auto">
              <Link href="/produtos">
                Ver Coleção
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <Button variant="outline" size="xl" asChild className="w-full sm:w-auto">
              <Link href="/produtos?categoria=Conjuntos">
                Conjuntos
              </Link>
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6 }}
            className="flex justify-center gap-8 sm:gap-12 border-t border-cream-300/80 pt-8"
          >
            {[
              { value: '500+', label: 'Produtos' },
              { value: '10k+', label: 'Clientes' },
              { value: '4.9★', label: 'Avaliação' },
            ].map(({ value, label }) => (
              <div key={label} className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-terracotta-500 font-heading">{value}</div>
                <div className="text-forest-500 text-xs sm:text-sm mt-0.5">{label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-14 sm:py-20 px-4 bg-cream-100">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8 sm:mb-12"
          >
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-forest-900 mb-3">
              Nossas <span className="text-gradient-brand">Categorias</span>
            </h2>
            <p className="text-forest-500 text-sm sm:text-base">Explore nossa vasta seleção de bijuterias</p>
          </motion.div>

          <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {categories.map(({ name, emoji, color, href }, i) => (
              <motion.div
                key={name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
              >
                <Link
                  href={href}
                  className="flex flex-col items-center gap-2 sm:gap-3 p-3 sm:p-6 rounded-2xl bg-cream-50 border border-cream-300 hover:border-sage-400 hover:bg-white soft-shadow transition-all group"
                >
                  <div className={`w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br ${color} flex items-center justify-center text-xl sm:text-2xl group-hover:scale-110 transition-transform`}>
                    {emoji}
                  </div>
                  <span className="text-forest-900 text-xs sm:text-sm font-medium text-center leading-tight">{name}</span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-14 sm:py-20 px-4 bg-cream-100" ref={featuredRef}>
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 sm:mb-12">
            <div>
              <motion.h2
                initial={{ opacity: 0, x: -20 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                className="font-heading text-3xl sm:text-4xl font-bold text-forest-900 mb-1"
              >
                Mais <span className="text-gradient-brand">Vendidos</span>
              </motion.h2>
              <p className="text-forest-500 text-sm sm:text-base">Os favoritos das nossas clientes</p>
            </div>
            <Button variant="outline" asChild className="self-start sm:self-auto shrink-0">
              <Link href="/produtos" className="flex items-center gap-1.5">
                Ver todos
                <ChevronRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
            {products.length > 0 ? (
              products.map((product, i) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: i * 0.1 }}
                >
                  <ProductCard {...product} />
                </motion.div>
              ))
            ) : (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-2xl bg-cream-50 border border-cream-300 overflow-hidden">
                  <div className="aspect-square bg-cream-200 animate-pulse" />
                  <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
                    <div className="h-3 bg-cream-200 rounded animate-pulse w-1/3" />
                    <div className="h-4 bg-cream-200 rounded animate-pulse" />
                    <div className="h-4 bg-cream-200 rounded animate-pulse w-1/2" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Banner */}
      <section className="py-14 sm:py-20 px-4 bg-gradient-to-r from-cream-100 via-cream-50 to-cream-100">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-forest-800 to-forest-950 border border-sage-700 p-6 sm:p-12 text-center warm-shadow"
          >
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-terracotta-500/15 rounded-full blur-3xl" />
              <div className="absolute bottom-0 right-0 w-48 h-48 bg-sage-500/10 rounded-full blur-3xl" />
            </div>
            <div className="relative z-10">
              <Sparkles className="w-9 h-9 sm:w-12 sm:h-12 text-mustard-400 mx-auto mb-4 sm:mb-6" />
              <h2 className="font-heading text-2xl sm:text-4xl md:text-5xl font-bold text-cream-50 mb-3 sm:mb-4 leading-tight">
                Frete Grátis acima de{' '}
                <span className="text-gradient-sage">R$ 200</span>
              </h2>
              <p className="text-cream-300 text-sm sm:text-lg mb-6 sm:mb-8 max-w-xl mx-auto">
                Compre mais e economize no frete. Válido para todo o Brasil via PAC ou SEDEX.
              </p>
              <Button variant="luxury" size="xl" asChild className="w-full sm:w-auto">
                <Link href="/produtos">
                  Aproveitar Oferta
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-14 sm:py-20 px-4 bg-cream-100">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
            {features.map(({ icon: Icon, title, desc }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center p-4 sm:p-6"
              >
                <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-2xl bg-sage-100 border border-sage-200 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <Icon className="w-5 h-5 sm:w-7 sm:h-7 text-sage-600" />
                </div>
                <h3 className="text-forest-900 font-semibold text-sm sm:text-base mb-1 sm:mb-2">{title}</h3>
                <p className="text-forest-500 text-xs sm:text-sm leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
