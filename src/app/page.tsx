"use client"

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { motion, useInView } from 'framer-motion'
import { ArrowRight, ChevronRight } from 'lucide-react'
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

const categories = [
  { name: 'Anéis',         href: '/produtos?categoria=Anéis' },
  { name: 'Colares',       href: '/produtos?categoria=Colares' },
  { name: 'Brincos',       href: '/produtos?categoria=Brincos' },
  { name: 'Pulseiras',     href: '/produtos?categoria=Pulseiras' },
  { name: 'Tornozeleiras', href: '/produtos?categoria=Tornozeleiras' },
  { name: 'Conjuntos',     href: '/produtos?categoria=Conjuntos' },
]

const benefits = [
  { title: 'Compra Segura',     desc: 'Pagamentos protegidos e criptografados' },
  { title: 'Entrega Rápida',    desc: 'Enviamos para todo o Brasil' },
  { title: 'Troca Garantida',   desc: '30 dias para troca ou devolução' },
  { title: 'Qualidade Premium', desc: 'Peças selecionadas com rigoroso controle' },
]

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([])
  const featuredRef = useRef(null)
  const isInView = useInView(featuredRef, { once: true, margin: '-80px' })

  useEffect(() => {
    fetch('/api/produtos?limit=6&sort=vendas')
      .then(r => r.json())
      .then(data => setProducts(data.produtos || []))
      .catch(() => {})
  }, [])

  return (
    <div className="bg-cream-50">

      {/* ══════════════════════ HERO ══════════════════════ */}
      <section className="min-h-[95vh] flex flex-col justify-end px-5 sm:px-12 lg:px-20 pt-28 pb-14 sm:pb-20">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7 }}
          className="text-terracotta-500 text-[10px] tracking-[0.4em] uppercase mb-6 sm:mb-8 font-medium"
        >
          Nova Coleção · 2025
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.1 }}
          className="font-heading font-bold text-forest-900 leading-[0.95] mb-10 sm:mb-14"
          style={{ fontSize: 'clamp(3.5rem, 11vw, 9rem)' }}
        >
          Bijuterias<br />
          para quem<br />
          <em className="not-italic text-gradient-brand">sabe seu</em><br />
          valor.
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.35 }}
          className="flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-10"
        >
          <Link
            href="/produtos"
            className="inline-flex items-center gap-3 text-forest-900 text-sm sm:text-base font-medium border-b border-forest-900 pb-0.5 hover:text-terracotta-500 hover:border-terracotta-500 transition-colors group"
          >
            Ver Coleção
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/produtos?categoria=Conjuntos"
            className="inline-flex items-center gap-3 text-forest-400 text-sm sm:text-base hover:text-forest-900 transition-colors group"
          >
            Explorar Conjuntos
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </section>

      {/* ══════════════════════ CATEGORIAS ══════════════════════ */}
      <section className="border-t border-cream-300 bg-cream-50">
        <div className="px-5 sm:px-12 lg:px-20 pt-14 pb-4">
          <p className="text-[10px] text-forest-400 tracking-[0.35em] uppercase mb-8">Categorias</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 divide-x divide-y divide-cream-200 border-t border-cream-200">
          {categories.map(({ name, href }, i) => (
            <motion.div
              key={name}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
            >
              <Link
                href={href}
                className="flex items-center justify-between px-5 sm:px-6 py-6 sm:py-8 bg-cream-50 hover:bg-terracotta-500 hover:text-cream-50 text-forest-900 transition-colors group"
              >
                <span className="font-heading font-semibold text-base sm:text-lg">{name}</span>
                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ══════════════════════ PRODUTOS ══════════════════════ */}
      <section className="py-20 sm:py-28 px-5 sm:px-12 lg:px-20 bg-cream-100" ref={featuredRef}>
        <div className="max-w-7xl mx-auto">

          <div className="flex items-end justify-between mb-10 sm:mb-14">
            <div>
              <p className="text-[10px] text-forest-400 tracking-[0.35em] uppercase mb-3">Destaques</p>
              <motion.h2
                initial={{ opacity: 0, y: 14 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                className="font-heading text-3xl sm:text-5xl font-bold text-forest-900"
              >
                Mais Vendidos
              </motion.h2>
            </div>
            <Link
              href="/produtos"
              className="text-xs sm:text-sm text-forest-400 hover:text-terracotta-500 transition-colors flex items-center gap-1 shrink-0 mb-1"
            >
              Ver todos <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
            {products.length > 0 ? (
              products.map((product, i) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: i * 0.07 }}
                >
                  <ProductCard {...product} />
                </motion.div>
              ))
            ) : (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-xl bg-cream-50 overflow-hidden">
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
      </section>

      {/* ══════════════════════ FRETE GRÁTIS ══════════════════════ */}
      <section className="py-24 sm:py-36 px-5 sm:px-12 lg:px-20 bg-cream-50 border-y border-cream-300">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center"
        >
          <p className="text-[10px] text-forest-400 tracking-[0.35em] uppercase mb-8">Promoção</p>
          <h2 className="font-heading text-4xl sm:text-6xl lg:text-7xl font-bold text-forest-900 leading-tight mb-8">
            Frete Grátis<br />
            acima de{' '}
            <span className="text-terracotta-500">R$ 200</span>
          </h2>
          <p className="text-forest-400 text-sm sm:text-base mb-10 max-w-sm mx-auto">
            Válido para todo o Brasil via PAC ou SEDEX.
          </p>
          <Link
            href="/produtos"
            className="inline-flex items-center gap-3 text-forest-900 text-sm sm:text-base font-medium border-b border-forest-900 pb-0.5 hover:text-terracotta-500 hover:border-terracotta-500 transition-colors group"
          >
            Aproveitar oferta
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </section>

      {/* ══════════════════════ BENEFÍCIOS ══════════════════════ */}
      <section className="py-16 sm:py-20 px-5 sm:px-12 lg:px-20 bg-cream-100">
        <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12">
          {benefits.map(({ title, desc }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              <p className="font-heading font-semibold text-forest-900 text-sm sm:text-base mb-1">{title}</p>
              <p className="text-forest-400 text-xs sm:text-sm leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

    </div>
  )
}
