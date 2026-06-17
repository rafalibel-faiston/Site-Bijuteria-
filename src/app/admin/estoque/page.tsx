'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, TrendingDown, Package, Plus, Minus, Save } from 'lucide-react'

interface Produto {
  id: string
  nome: string
  categoria: string
  estoque: number
  estoqueMinimo: number
  vendas: number
  imagens: string
}

export default function EstoqueAdmin() {
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [loading, setLoading] = useState(true)
  const [ajustes, setAjustes] = useState<Record<string, number>>({})
  const [saving, setSaving] = useState<string | null>(null)
  const [filtro, setFiltro] = useState<'todos' | 'baixo' | 'critico'>('todos')

  useEffect(() => {
    fetch('/api/produtos')
      .then(r => r.json())
      .then(data => setProdutos(data.produtos || []))
      .catch(() => setProdutos([]))
      .finally(() => setLoading(false))
  }, [])

  const produtosFiltrados = produtos.filter(p => {
    if (filtro === 'baixo') return p.estoque <= p.estoqueMinimo
    if (filtro === 'critico') return p.estoque === 0
    return true
  })

  const estoqueTotal = produtos.reduce((acc, p) => acc + p.estoque, 0)
  const produtosEstoqueBaixo = produtos.filter(p => p.estoque > 0 && p.estoque <= p.estoqueMinimo).length
  const produtosZerados = produtos.filter(p => p.estoque === 0).length

  const ajustar = async (id: string, delta: number) => {
    setSaving(id)
    const produto = produtos.find(p => p.id === id)
    if (!produto) return
    const novoEstoque = Math.max(0, produto.estoque + delta)
    await fetch(`/api/produtos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estoque: novoEstoque }),
    })
    setProdutos(prev => prev.map(p => p.id === id ? { ...p, estoque: novoEstoque } : p))
    setAjustes(prev => ({ ...prev, [id]: 0 }))
    setSaving(null)
  }

  const salvarAjuste = async (id: string) => {
    const delta = ajustes[id] || 0
    if (delta === 0) return
    await ajustar(id, delta)
    setAjustes(prev => ({ ...prev, [id]: 0 }))
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Controle de Estoque</h1>
        <p className="text-gray-500 mt-1">Gerencie o inventário da sua loja</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-50 rounded-xl"><Package className="w-5 h-5 text-blue-600" /></div>
            <p className="text-sm font-medium text-gray-500">Total em Estoque</p>
          </div>
          <p className="text-3xl font-bold text-gray-900">{estoqueTotal}</p>
          <p className="text-sm text-gray-400">unidades</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-2xl border border-yellow-100 p-5 border-l-4 border-l-yellow-400">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-yellow-50 rounded-xl"><TrendingDown className="w-5 h-5 text-yellow-600" /></div>
            <p className="text-sm font-medium text-gray-500">Estoque Baixo</p>
          </div>
          <p className="text-3xl font-bold text-yellow-600">{produtosEstoqueBaixo}</p>
          <p className="text-sm text-gray-400">produtos abaixo do mínimo</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-2xl border border-red-100 p-5 border-l-4 border-l-red-500">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-50 rounded-xl"><AlertTriangle className="w-5 h-5 text-red-500" /></div>
            <p className="text-sm font-medium text-gray-500">Sem Estoque</p>
          </div>
          <p className="text-3xl font-bold text-red-600">{produtosZerados}</p>
          <p className="text-sm text-gray-400">produtos esgotados</p>
        </motion.div>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {[
          { key: 'todos', label: 'Todos os produtos' },
          { key: 'baixo', label: '⚠️ Estoque baixo' },
          { key: 'critico', label: '🚨 Esgotados' },
        ].map(f => (
          <button
            key={f.key}
            onClick={() => setFiltro(f.key as 'todos' | 'baixo' | 'critico')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filtro === f.key ? 'bg-[#b95a39] text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-8 h-8 border-4 border-[#b95a39] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Produto</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">Estoque Atual</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">Mínimo</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">Status</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">Ajustar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {produtosFiltrados.map((produto, i) => {
                  const critico = produto.estoque === 0
                  const baixo = produto.estoque > 0 && produto.estoque <= produto.estoqueMinimo
                  return (
                    <motion.tr
                      key={produto.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      className={`hover:bg-gray-50 transition-colors ${critico ? 'bg-red-50/30' : baixo ? 'bg-yellow-50/30' : ''}`}
                    >
                      <td className="py-3 px-4">
                        <p className="font-medium text-gray-900">{produto.nome}</p>
                        <p className="text-xs text-gray-400">{produto.categoria}</p>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`text-lg font-bold ${critico ? 'text-red-600' : baixo ? 'text-yellow-600' : 'text-gray-900'}`}>
                          {produto.estoque}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center text-sm text-gray-500">{produto.estoqueMinimo}</td>
                      <td className="py-3 px-4 text-center">
                        {critico ? (
                          <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">Esgotado</span>
                        ) : baixo ? (
                          <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">Baixo</span>
                        ) : (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">OK</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => ajustar(produto.id, -1)}
                            disabled={produto.estoque === 0 || saving === produto.id}
                            className="p-1.5 bg-gray-100 hover:bg-gray-200 disabled:opacity-40 rounded-lg transition-colors"
                          >
                            <Minus className="w-4 h-4 text-gray-600" />
                          </button>
                          <input
                            type="number"
                            value={ajustes[produto.id] || 0}
                            onChange={e => setAjustes(prev => ({ ...prev, [produto.id]: parseInt(e.target.value) || 0 }))}
                            className="w-16 text-center border border-gray-200 rounded-lg py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#b95a39]/50"
                          />
                          <button
                            onClick={() => ajustar(produto.id, 1)}
                            disabled={saving === produto.id}
                            className="p-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                          >
                            <Plus className="w-4 h-4 text-gray-600" />
                          </button>
                          <button
                            onClick={() => salvarAjuste(produto.id)}
                            disabled={!ajustes[produto.id] || saving === produto.id}
                            className="p-1.5 bg-[#b95a39] hover:bg-[#9c4830] disabled:opacity-40 text-white rounded-lg transition-colors"
                          >
                            <Save className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
