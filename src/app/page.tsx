"use client"

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, useInView } from 'framer-motion'
import { ArrowRight, Sparkles, Shield, Truck, RefreshCw, Star, Gem } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ProductCard } from '@/components/products/product-card'

// Sparkle component
function SparkleParticle({ style }: { style: React.CSSProperties }) {
  return (
    <motion.div
      style={style}
      className="absolute w-1 h-1 bg-sage-500 rounded-full"
      animate={{
        y: [0, -30, 0],
        opacity: [0, 1, 0],
        scale: [0, 1, 0],
      }}
      transition={{
        duration: Math.random() * 2 + 2,
        repeat: Infinity,
        delay: Math.random() * 3,
        ease: 'easeInOut',
      }}
    />
  )
}

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
  const [sparkles] = useState(() =>
    Array.from({ length: 20 }, (_, i) => ({
      id: i,
      style: {
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
      },
    }))
  )

  const featuredRef = useRef(null)
  const isInView = useInView(featuredRef, { once: true })

  useEffect(() => {
    fetch('/api/produtos?limit=6&sort=vendas')
      .then(r => r.json())
      .then(data => setProducts(data.produtos || []))
      .catch(() => {})
  }, [])

  const categories = [
    { name: 'Anéis', href: '/produtos?categoria=Anéis' },
    { name: 'Colares', href: '/produtos?categoria=Colares' },
    { name: 'Brincos', href: '/produtos?categoria=Brincos' },
    { name: 'Pulseiras', href: '/produtos?categoria=Pulseiras' },
    { name: 'Tornozeleiras', href: '/produtos?categoria=Tornozeleiras' },
    { name: 'Conjuntos', href: '/produtos?categoria=Conjuntos' },
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
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-cream-100 via-cream-50 to-sage-100">
        {/* Background gradient orbs */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-sage-400/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-terracotta-400/15 rounded-full blur-3xl" />
        </div>

        {/* Sparkles */}
        <div className="absolute inset-0 pointer-events-none">
          {sparkles.map(({ id, style }) => (
            <SparkleParticle key={id} style={style} />
          ))}
        </div>

        {/* Hero content */}
        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center justify-center gap-2 mb-6"
          >
            <Sparkles className="w-5 h-5 text-terracotta-500" />
            <span className="text-terracotta-500 text-sm font-medium tracking-widest uppercase">
              Nova Coleção
            </span>
            <Sparkles className="w-5 h-5 text-terracotta-500" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="font-heading text-5xl md:text-7xl lg:text-8xl font-bold text-forest-900 mb-6 leading-tight"
          >
            Beleza que{' '}
            <span className="text-gradient-brand">brilha</span>
            <br />
            em você
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-forest-500 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Descubra nossa coleção exclusiva de joias e bijuterias.
            Elegância, sofisticação e qualidade para cada momento especial.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button variant="luxury" size="xl" asChild>
              <Link href="/produtos">
                Ver Coleção
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <Button variant="outline" size="xl" asChild>
              <Link href="/produtos?categoria=Conjuntos">
                Conjuntos
              </Link>
            </Button>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-forest-400"
        >
          <span className="text-xs uppercase tracking-widest">Scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-forest-400 to-transparent" />
        </motion.div>
      </section>

      {/* Categories */}
      <section className="py-20 px-4 bg-cream-100">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-heading text-4xl font-bold text-forest-900 mb-4">
              Nossas <span className="text-gradient-brand">Categorias</span>
            </h2>
            <p className="text-forest-500">Explore nossa vasta seleção de bijuterias</p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map(({ name, href }, i) => (
              <motion.div
                key={name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <Link
                  href={href}
                  className="home__categoria group flex flex-col items-center gap-3 px-4 py-7 rounded-2xl bg-cream-50 border border-cream-300 hover:border-terracotta-500/50 hover:bg-white soft-shadow transition-all"
                >
                  <span className="w-12 h-12 rounded-full bg-sage-100 border border-sage-200 flex items-center justify-center group-hover:bg-sage-200 transition-colors">
                    <Gem className="w-5 h-5 text-sage-600" />
                  </span>
                  <span className="font-heading text-base text-forest-900 group-hover:text-terracotta-500 transition-colors">
                    {name}
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 px-4 bg-cream-100" ref={featuredRef}>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <div>
              <motion.h2
                initial={{ opacity: 0, x: -20 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                className="font-heading text-4xl font-bold text-forest-900 mb-2"
              >
                Mais <span className="text-gradient-brand">Vendidos</span>
              </motion.h2>
              <p className="text-forest-500">Os favoritos das nossas clientes</p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/produtos">
                Ver todos
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
              // Skeleton loading
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-2xl bg-cream-50 border border-cream-300 overflow-hidden">
                  <div className="aspect-square bg-cream-200 animate-pulse" />
                  <div className="p-4 space-y-3">
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
      <section className="py-20 px-4 bg-gradient-to-r from-cream-100 via-cream-50 to-cream-100">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-forest-800 to-forest-950 border border-sage-700 p-12 text-center warm-shadow"
          >
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-terracotta-500/15 rounded-full blur-3xl" />
            </div>
            <div className="relative z-10">
              <Sparkles className="w-12 h-12 text-mustard-400 mx-auto mb-6" />
              <h2 className="font-heading text-4xl md:text-5xl font-bold text-cream-50 mb-4">
                Enviamos para{' '}
                <span className="text-gradient-sage">todo o Brasil</span>
              </h2>
              <p className="text-cream-200 text-lg mb-8 max-w-xl mx-auto">
                Frete calculado na hora por PAC ou SEDEX, com código de rastreio para acompanhar até a sua porta.
              </p>
              <Button variant="luxury" size="xl" asChild>
                <Link href="/produtos">
                  Ver Coleção
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-cream-100">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map(({ icon: Icon, title, desc }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center p-6"
              >
                <div className="w-14 h-14 rounded-2xl bg-sage-100 border border-sage-200 flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-7 h-7 text-sage-600" />
                </div>
                <h3 className="text-forest-900 font-semibold mb-2">{title}</h3>
                <p className="text-forest-500 text-sm">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
