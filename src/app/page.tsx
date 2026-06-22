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

const marqueeItems = [
  '💍 Anéis', '📿 Colares', '✨ Brincos', '🌟 Pulseiras',
  '⭐ Tornozeleiras', '👑 Conjuntos', '💎 Nova Coleção', '🎁 Presentes',
]

const floatingEmojis = [
  { emoji: '💍', top: '18%', left: '6%',  size: 'text-4xl', delay: 0,   duration: 4   },
  { emoji: '✨', top: '20%', right: '5%', size: 'text-3xl', delay: 1,   duration: 5   },
  { emoji: '📿', top: '55%', left: '4%',  size: 'text-3xl', delay: 0.5, duration: 3.5 },
  { emoji: '👑', top: '52%', right: '4%', size: 'text-4xl', delay: 2,   duration: 4.5 },
  { emoji: '🌟', top: '75%', left: '10%', size: 'text-2xl', delay: 1.5, duration: 6   },
  { emoji: '⭐', top: '70%', right: '9%', size: 'text-2xl', delay: 0.8, duration: 5.5 },
]

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([])
  const featuredRef = useRef(null)
  const isInView = useInView(featuredRef, { once: true })

  useEffect(() => {
    fetch('/api/produtos?limit=8&sort=vendas')
      .then(r => r.json())
      .then(data => setProducts(data.produtos || []))
      .catch(() => {})
  }, [])

  const categories = [
    { name: 'Anéis',       emoji: '💍', color: 'from-terracotta-700 via-terracotta-500 to-mustard-400', href: '/produtos?categoria=Anéis' },
    { name: 'Colares',     emoji: '📿', color: 'from-forest-800 via-sage-600 to-sage-400',              href: '/produtos?categoria=Colares' },
    { name: 'Brincos',     emoji: '✨', color: 'from-terracotta-800 via-terracotta-600 to-terracotta-400', href: '/produtos?categoria=Brincos' },
    { name: 'Pulseiras',   emoji: '🌟', color: 'from-forest-900 via-forest-700 to-sage-500',            href: '/produtos?categoria=Pulseiras' },
    { name: 'Tornozeleiras', emoji: '⭐', color: 'from-mustard-600 via-mustard-500 to-cream-600',        href: '/produtos?categoria=Tornozeleiras' },
    { name: 'Conjuntos',   emoji: '👑', color: 'from-terracotta-700 via-forest-700 to-sage-600',        href: '/produtos?categoria=Conjuntos' },
  ]

  const features = [
    { icon: Shield,    title: 'Compra Segura',    desc: 'Pagamentos protegidos' },
    { icon: Truck,     title: 'Entrega Rápida',   desc: 'Para todo o Brasil' },
    { icon: RefreshCw, title: 'Troca Garantida',  desc: '30 dias garantidos' },
    { icon: Star,      title: 'Qualidade Premium', desc: 'Controle rigoroso' },
  ]

  return (
    <div className="overflow-hidden">

      {/* ═══════════════════════ HERO ═══════════════════════ */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center bg-forest-950 overflow-hidden px-6 pt-24 pb-16">

        {/* Orbs de fundo */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[480px] h-[480px] bg-terracotta-600/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-sage-600/10 rounded-full blur-3xl" />
          <div className="absolute top-1/4 right-0 w-56 h-56 bg-mustard-500/8 rounded-full blur-3xl" />
        </div>

        {/* Emojis flutuantes */}
        {floatingEmojis.map((item, i) => (
          <motion.span
            key={i}
            className={`absolute ${item.size} select-none opacity-40 pointer-events-none`}
            style={{ top: item.top, left: (item as any).left, right: (item as any).right }}
            animate={{ y: [0, -14, 0], rotate: [0, 6, -6, 0] }}
            transition={{ duration: item.duration, repeat: Infinity, ease: 'easeInOut', delay: item.delay }}
          >
            {item.emoji}
          </motion.span>
        ))}

        {/* Conteúdo central */}
        <div className="relative z-10 text-center max-w-2xl mx-auto">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-sage-400 text-xs tracking-[0.3em] uppercase mb-6 font-medium"
          >
            Bijuterias &amp; Acessórios
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="font-heading text-5xl sm:text-7xl lg:text-8xl font-bold text-cream-50 mb-5 leading-[1.05]"
          >
            Brilhe do{' '}
            <span className="text-gradient-brand">seu</span>
            <br />
            jeito
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="text-cream-300 text-base sm:text-lg mb-10 max-w-sm mx-auto leading-relaxed"
          >
            Bijuterias exclusivas para cada momento especial.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.45 }}
            className="flex flex-col sm:flex-row gap-3 justify-center"
          >
            <Button variant="luxury" size="xl" asChild className="w-full sm:w-auto">
              <Link href="/produtos">
                Ver Coleção <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <Link
              href="/produtos?categoria=Conjuntos"
              className="inline-flex items-center justify-center px-8 py-4 rounded-xl border border-sage-700 text-cream-200 text-base font-medium hover:bg-sage-900/30 hover:border-sage-500 transition-all w-full sm:w-auto"
            >
              Ver Conjuntos
            </Link>
          </motion.div>
        </div>

        {/* Linha de brilho na base */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-sage-700 to-transparent" />
      </section>

      {/* ═══════════════════════ MARQUEE ═══════════════════════ */}
      <div className="bg-terracotta-500 py-3 overflow-hidden border-y border-terracotta-600">
        <div className="flex animate-marquee">
          {[...marqueeItems, ...marqueeItems].map((item, i) => (
            <span
              key={i}
              className="flex items-center shrink-0 text-cream-50 text-sm font-semibold tracking-wide px-6"
            >
              {item}
              <span className="ml-6 text-terracotta-300 text-xs">◆</span>
            </span>
          ))}
        </div>
      </div>

      {/* ═══════════════════════ CATEGORIAS ═══════════════════════ */}
      <section className="py-14 sm:py-20 px-4 bg-cream-50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8 sm:mb-10"
          >
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-forest-900 mb-2">
              Explore por <span className="text-gradient-brand">Categoria</span>
            </h2>
            <p className="text-forest-500 text-sm sm:text-base">O que você está procurando?</p>
          </motion.div>

          {/* 2 cards grandes portrait */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            {categories.slice(0, 2).map(({ name, emoji, color, href }, i) => (
              <motion.div
                key={name}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Link
                  href={href}
                  className="group relative flex flex-col justify-end overflow-hidden rounded-2xl aspect-[3/4]"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${color} transition-transform duration-500 group-hover:scale-105`} />
                  <div className="absolute inset-0 bg-black/15" />

                  {/* Emoji central flutuante */}
                  <motion.span
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: i * 0.6 }}
                    className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 text-5xl sm:text-6xl select-none"
                  >
                    {emoji}
                  </motion.span>

                  {/* Nome na base */}
                  <div className="relative z-10 px-4 py-4 bg-gradient-to-t from-black/60 to-transparent">
                    <p className="text-cream-50 font-heading font-bold text-xl sm:text-2xl">{name}</p>
                    <p className="text-cream-300 text-xs flex items-center gap-1 mt-0.5">
                      Ver tudo <ArrowRight className="w-3 h-3" />
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* 4 cards menores em 2x2 */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {categories.slice(2).map(({ name, emoji, color, href }, i) => (
              <motion.div
                key={name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: (i + 2) * 0.08 }}
              >
                <Link
                  href={href}
                  className="group relative flex flex-col justify-end overflow-hidden rounded-xl aspect-square"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${color} transition-transform duration-500 group-hover:scale-105`} />
                  <div className="absolute inset-0 bg-black/10" />
                  <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[60%] text-3xl select-none">{emoji}</span>
                  <div className="relative z-10 px-3 py-3 bg-gradient-to-t from-black/55 to-transparent text-center">
                    <p className="text-cream-50 font-semibold text-sm leading-tight">{name}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════ PRODUTOS EM DESTAQUE ═══════════════════════ */}
      <section className="py-14 sm:py-20 bg-cream-100" ref={featuredRef}>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6 sm:mb-10 px-4">
            <div>
              <motion.h2
                initial={{ opacity: 0, x: -16 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                className="font-heading text-3xl sm:text-4xl font-bold text-forest-900 mb-1"
              >
                Mais <span className="text-gradient-brand">Vendidos</span>
              </motion.h2>
              <p className="text-forest-500 text-sm">Os favoritos das nossas clientes</p>
            </div>
            <Button variant="outline" asChild className="shrink-0">
              <Link href="/produtos" className="flex items-center gap-1">
                Ver todos <ChevronRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>

          {/* Carrossel horizontal no mobile, grid no desktop */}
          <div className="overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-2 px-4">
            <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 w-max sm:w-auto">
              {products.length > 0 ? (
                products.map((product, i) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ delay: i * 0.07 }}
                    className="w-[68vw] sm:w-auto shrink-0 snap-start"
                  >
                    <ProductCard {...product} />
                  </motion.div>
                ))
              ) : (
                Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-[68vw] sm:w-auto shrink-0 snap-start rounded-2xl bg-cream-50 border border-cream-300 overflow-hidden"
                  >
                    <div className="aspect-square bg-cream-200 animate-pulse" />
                    <div className="p-3 space-y-2">
                      <div className="h-3 bg-cream-200 rounded animate-pulse w-1/3" />
                      <div className="h-4 bg-cream-200 rounded animate-pulse" />
                      <div className="h-4 bg-cream-200 rounded animate-pulse w-1/2" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════ BANNER FRETE ═══════════════════════ */}
      <section className="py-14 sm:py-20 px-4 bg-cream-50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-forest-800 to-forest-950 border border-sage-700 p-6 sm:p-12 text-center warm-shadow"
          >
            <div className="absolute inset-0 pointer-events-none">
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
                Válido para todo o Brasil via PAC ou SEDEX.
              </p>
              <Button variant="luxury" size="xl" asChild className="w-full sm:w-auto">
                <Link href="/produtos">
                  Aproveitar Oferta <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════ BENEFÍCIOS ═══════════════════════ */}
      <section className="py-12 sm:py-16 px-4 bg-cream-100 border-t border-cream-300">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-8">
            {features.map(({ icon: Icon, title, desc }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex flex-col items-center text-center"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-sage-100 border border-sage-200 flex items-center justify-center mb-3">
                  <Icon className="w-5 h-5 text-sage-600" />
                </div>
                <h3 className="text-forest-900 font-semibold text-sm sm:text-base mb-1">{title}</h3>
                <p className="text-forest-500 text-xs leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

    </div>
  )
}
