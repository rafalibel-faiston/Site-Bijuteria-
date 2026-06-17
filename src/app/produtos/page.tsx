"use client"

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { ProductCard } from '@/components/products/product-card'
import { categorias } from '@/lib/utils'

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

function ProdutosContent() {
  const searchParams = useSearchParams()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('categoria') || '')
  const [priceRange, setPriceRange] = useState({ min: '', max: '' })
  const [sort, setSort] = useState('createdAt')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (selectedCategory) params.set('categoria', selectedCategory)
    if (priceRange.min) params.set('precoMin', priceRange.min)
    if (priceRange.max) params.set('precoMax', priceRange.max)
    params.set('sort', sort)
    params.set('limit', '100')

    setLoading(true)
    fetch(`/api/produtos?${params}`)
      .then(r => r.json())
      .then(data => setProducts(data.produtos || []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false))
  }, [search, selectedCategory, priceRange, sort])

  const clearFilters = () => {
    setSearch('')
    setSelectedCategory('')
    setPriceRange({ min: '', max: '' })
    setSort('createdAt')
  }

  const hasFilters = search || selectedCategory || priceRange.min || priceRange.max

  return (
    <div className="min-h-screen bg-cream-100 pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-heading text-4xl font-bold text-forest-900 mb-2">
            Todos os <span className="text-gradient-brand">Produtos</span>
          </h1>
          <p className="text-forest-500">{products.length} produtos encontrados</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className={`lg:w-64 flex-shrink-0 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-cream-50 rounded-2xl border border-cream-300 p-6 sticky top-24 soft-shadow">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-forest-900 font-semibold">Filtros</h2>
                {hasFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-terracotta-500 text-sm hover:text-terracotta-600 flex items-center gap-1"
                  >
                    <X className="w-3 h-3" />
                    Limpar
                  </button>
                )}
              </div>

              {/* Search */}
              <div className="mb-6">
                <label className="text-forest-600 text-sm font-medium mb-2 block">Buscar</label>
                <div className="relative">
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Nome do produto..."
                    className="w-full bg-white border border-cream-300 rounded-xl px-4 py-2.5 pr-10 text-sm text-forest-900 placeholder-forest-400 focus:outline-none focus:border-sage-500"
                  />
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-forest-400" />
                </div>
              </div>

              {/* Categories */}
              <div className="mb-6">
                <label className="text-forest-600 text-sm font-medium mb-3 block">Categoria</label>
                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedCategory('')}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      !selectedCategory
                        ? 'bg-sage-100 text-sage-700 border border-sage-300'
                        : 'text-forest-600 hover:text-forest-900 hover:bg-cream-200'
                    }`}
                  >
                    Todas
                  </button>
                  {categorias.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        selectedCategory === cat
                          ? 'bg-sage-100 text-sage-700 border border-sage-300'
                          : 'text-forest-600 hover:text-forest-900 hover:bg-cream-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <label className="text-forest-600 text-sm font-medium mb-3 block">Faixa de Preço</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={priceRange.min}
                    onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                    placeholder="Min"
                    className="w-full bg-white border border-cream-300 rounded-lg px-3 py-2 text-sm text-forest-900 placeholder-forest-400 focus:outline-none focus:border-sage-500"
                  />
                  <span className="text-forest-400 self-center">-</span>
                  <input
                    type="number"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                    placeholder="Max"
                    className="w-full bg-white border border-cream-300 rounded-lg px-3 py-2 text-sm text-forest-900 placeholder-forest-400 focus:outline-none focus:border-sage-500"
                  />
                </div>
              </div>

              {/* Sort */}
              <div>
                <label className="text-forest-600 text-sm font-medium mb-3 block">Ordenar por</label>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="w-full bg-white border border-cream-300 rounded-xl px-3 py-2.5 text-sm text-forest-900 focus:outline-none focus:border-sage-500"
                >
                  <option value="createdAt">Mais Recentes</option>
                  <option value="vendas">Mais Vendidos</option>
                  <option value="preco_asc">Menor Preço</option>
                  <option value="preco_desc">Maior Preço</option>
                  <option value="nome">A-Z</option>
                </select>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            {/* Mobile filter toggle */}
            <div className="flex items-center justify-between mb-6 lg:hidden">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 bg-cream-50 border border-cream-300 rounded-xl px-4 py-2.5 text-sm text-forest-900"
              >
                <SlidersHorizontal className="w-4 h-4" />
                {showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
              </button>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="rounded-2xl bg-cream-50 border border-cream-300 overflow-hidden">
                    <div className="aspect-square bg-cream-200 animate-pulse" />
                    <div className="p-4 space-y-3">
                      <div className="h-3 bg-cream-200 rounded animate-pulse w-1/3" />
                      <div className="h-4 bg-cream-200 rounded animate-pulse" />
                      <div className="h-4 bg-cream-200 rounded animate-pulse w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="text-6xl mb-4">💎</div>
                <h3 className="text-forest-900 text-xl font-semibold mb-2">Nenhum produto encontrado</h3>
                <p className="text-forest-500 mb-6">Tente ajustar os filtros ou buscar por outro termo</p>
                <button
                  onClick={clearFilters}
                  className="text-terracotta-500 hover:text-terracotta-600"
                >
                  Limpar filtros
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {products.map((product, i) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <ProductCard {...product} />
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ProdutosPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-cream-100 pt-24 flex items-center justify-center"><div className="text-forest-900">Carregando...</div></div>}>
      <ProdutosContent />
    </Suspense>
  )
}
