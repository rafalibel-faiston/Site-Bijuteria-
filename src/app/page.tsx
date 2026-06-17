"use client"

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, useInView } from 'framer-motion'
import { ArrowRight, Sparkles, Shield, Truck, RefreshCw, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ProductCard } from '@/components/products/product-card'

// Sparkle component
function SparkleParticle({ style }: { style: React.CSSProperties }) {
  return (
    <motion.div
      style={style}
      className="absolute w-1 h-1 bg-gold-400 rounded-full"
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
    { name: 'Anéis', emoji: '💍', color: 'from-gold-600 to-gold-400', href: '/produtos?categoria=Anéis' },
    { name: 'Colares', emoji: '📿', color: 'from-purple-600 to-purple-400', href: '/produtos?categoria=Colares' },
    { name: 'Brincos', emoji: '✨', color: 'from-pink-600 to-pink-400', href: '/produtos?categoria=Brincos' },
    { name: 'Pulseiras', emoji: '🌟', color: 'from-indigo-600 to-indigo-400', href: '/produtos?categoria=Pulseiras' },
    { name: 'Tornozeleiras', emoji: '⭐', color: 'from-emerald-600 to-emerald-400', href: '/produtos?categoria=Tornozeleiras' },
    { name: 'Conjuntos', emoji: '👑', color: 'from-amber-600 to-amber-400', href: '/produtos?categoria=Conjuntos' },
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
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-dark-950 via-dark-900 to-dark-800">
        {/* Background gradient orbs */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
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
            <Sparkles className="w-5 h-5 text-gold-400" />
            <span className="text-gold-400 text-sm font-medium tracking-widest uppercase">
              Nova Coleção 2024
            </span>
            <Sparkles className="w-5 h-5 text-gold-400" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="font-heading text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6 leading-tight"
          >
            Beleza que{' '}
            <span className="text-gradient-gold">brilha</span>
            <br />
            em você
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-dark-300 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
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

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex justify-center gap-12 mt-16"
          >
            {[
              { value: '500+', label: 'Produtos' },
              { value: '10k+', label: 'Clientes' },
              { value: '4.9★', label: 'Avaliação' },
            ].map(({ value, label }) => (
              <div key={label} className="text-center">
                <div className="text-2xl font-bold text-gold-400 font-heading">{value}</div>
                <div className="text-dark-400 text-sm">{label}</div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-dark-500"
        >
          <span className="text-xs uppercase tracking-widest">Scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-dark-500 to-transparent" />
        </motion.div>
      </section>

      {/* Categories */}
      <section className="py-20 px-4 bg-dark-900">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-heading text-4xl font-bold text-white mb-4">
              Nossas <span className="text-gradient-gold">Categorias</span>
            </h2>
            <p className="text-dark-400">Explore nossa vasta seleção de bijuterias</p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map(({ name, emoji, color, href }, i) => (
              <motion.div
                key={name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Link
                  href={href}
                  className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-dark-800 border border-dark-700 hover:border-gold-500/50 hover:bg-dark-700 transition-all group"
                >
                  <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${color} flex items-center justify-center text-2xl group-hover:scale-110 transition-transform`}>
                    {emoji}
                  </div>
                  <span className="text-white text-sm font-medium">{name}</span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 px-4 bg-dark-950" ref={featuredRef}>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <div>
              <motion.h2
                initial={{ opacity: 0, x: -20 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                className="font-heading text-4xl font-bold text-white mb-2"
              >
                Mais <span className="text-gradient-gold">Vendidos</span>
              </motion.h2>
              <p className="text-dark-400">Os favoritos das nossas clientes</p>
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
                <div key={i} className="rounded-2xl bg-dark-800 border border-dark-700 overflow-hidden">
                  <div className="aspect-square bg-dark-700 animate-pulse" />
                  <div className="p-4 space-y-3">
                    <div className="h-3 bg-dark-700 rounded animate-pulse w-1/3" />
                    <div className="h-4 bg-dark-700 rounded animate-pulse" />
                    <div className="h-4 bg-dark-700 rounded animate-pulse w-1/2" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Banner */}
      <section className="py-20 px-4 bg-gradient-to-r from-dark-900 via-dark-800 to-dark-900">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gold-600/20 to-dark-800 border border-gold-500/30 p-12 text-center luxury-shadow"
          >
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-gold-500/10 rounded-full blur-3xl" />
            </div>
            <div className="relative z-10">
              <Sparkles className="w-12 h-12 text-gold-400 mx-auto mb-6" />
              <h2 className="font-heading text-4xl md:text-5xl font-bold text-white mb-4">
                Frete Grátis acima de{' '}
                <span className="text-gradient-gold">R$ 200</span>
              </h2>
              <p className="text-dark-300 text-lg mb-8 max-w-xl mx-auto">
                Compre mais e economize no frete. Válido para todo o Brasil via PAC ou SEDEX.
              </p>
              <Button variant="luxury" size="xl" asChild>
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
      <section className="py-20 px-4 bg-dark-950">
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
                <div className="w-14 h-14 rounded-2xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-7 h-7 text-gold-500" />
                </div>
                <h3 className="text-white font-semibold mb-2">{title}</h3>
                <p className="text-dark-400 text-sm">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
