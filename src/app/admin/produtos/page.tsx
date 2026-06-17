'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Search, Edit2, Trash2, Eye, EyeOff, Package } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

interface Produto {
  id: string
  nome: string
  slug: string
  preco: number
  precoOriginal?: number
  imagens: string
  categoria: string
  estoque: number
  estoqueMinimo: number
  ativo: boolean
  vendas: number
}

const categorias = ['Todos', 'Colares', 'Brincos', 'Anéis', 'Pulseiras', 'Tornozeleiras', 'Conjuntos']

export default function ProdutosAdmin() {
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState('')
  const [categoriaFiltro, setCategoriaFiltro] = useState('Todos')
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/produtos')
      .then(r => r.json())
      .then(data => setProdutos(data.produtos || []))
      .catch(() => setProdutos([]))
      .finally(() => setLoading(false))
  }, [])

  const produtosFiltrados = produtos.filter(p => {
    const matchBusca = p.nome.toLowerCase().includes(busca.toLowerCase())
    const matchCategoria = categoriaFiltro === 'Todos' || p.categoria === categoriaFiltro
    return matchBusca && matchCategoria
  })

  const toggleAtivo = async (id: string, ativo: boolean) => {
    await fetch(`/api/produtos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ativo: !ativo }),
    })
    setProdutos(prev => prev.map(p => p.id === id ? { ...p, ativo: !ativo } : p))
  }

  const deletar = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return
    setDeletingId(id)
    await fetch(`/api/produtos/${id}`, { method: 'DELETE' })
    setProdutos(prev => prev.filter(p => p.id !== id))
    setDeletingId(null)
  }

  const getImagem = (imagens: string) => {
    try {
      const arr = JSON.parse(imagens)
      return arr[0] || '/placeholder.jpg'
    } catch { return '/placeholder.jpg' }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Produtos</h1>
          <p className="text-gray-500 mt-1">{produtos.length} produtos cadastrados</p>
        </div>
        <Link
          href="/admin/produtos/novo"
          className="flex items-center gap-2 bg-[#C9A84C] hover:bg-[#B8962A] text-white px-5 py-3 rounded-xl font-medium transition-colors"
        >
          <Plus className="w-5 h-5" />
          Novo Produto
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar produto..."
            value={busca}
            onChange={e => setBusca(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/50"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {categorias.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoriaFiltro(cat)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                categoriaFiltro === cat
                  ? 'bg-[#C9A84C] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-8 h-8 border-4 border-[#C9A84C] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : produtosFiltrados.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-gray-400">
            <Package className="w-10 h-10 mb-2" />
            <p>Nenhum produto encontrado</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Produto</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Categoria</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Preço</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Estoque</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Vendas</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">Status</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {produtosFiltrados.map((produto, i) => (
                  <motion.tr
                    key={produto.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          <Image
                            src={getImagem(produto.imagens)}
                            alt={produto.nome}
                            fill
                            className="object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/48x48/f5f5f5/999?text=💎' }}
                          />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{produto.nome}</p>
                          <p className="text-xs text-gray-400">{produto.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded-md">{produto.categoria}</span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <p className="font-semibold text-gray-900 text-sm">
                        R$ {produto.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                      {produto.precoOriginal && (
                        <p className="text-xs text-gray-400 line-through">
                          R$ {produto.precoOriginal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className={`text-sm font-medium ${produto.estoque <= produto.estoqueMinimo ? 'text-red-600' : 'text-gray-900'}`}>
                        {produto.estoque}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-sm text-gray-600">{produto.vendas}</td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => toggleAtivo(produto.id, produto.ativo)}
                        className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${
                          produto.ativo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {produto.ativo ? 'Ativo' : 'Inativo'}
                      </button>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => toggleAtivo(produto.id, produto.ativo)} className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors">
                          {produto.ativo ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <Link href={`/admin/produtos/${produto.id}/editar`} className="p-1.5 text-gray-400 hover:text-[#C9A84C] transition-colors">
                          <Edit2 className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => deletar(produto.id)}
                          disabled={deletingId === produto.id}
                          className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
