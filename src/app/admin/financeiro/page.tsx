'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, DollarSign, Plus, Trash2 } from 'lucide-react'

interface FinanceiroData {
  receitaTotal: number
  receitaMes: number
  despesasTotal: number
  despesasMes: number
  lucroTotal: number
  lucroMes: number
  pedidosPorMes: Array<{ mes: string; receita: number; quantidade: number }>
  despesas: Array<{
    id: string
    descricao: string
    valor: number
    categoria: string
    data: string
  }>
}

const categoriasDespesa = ['FORNECEDOR', 'EMBALAGEM', 'MARKETING', 'CORREIOS', 'OUTROS']
const categoriasCores: Record<string, string> = {
  FORNECEDOR: 'bg-blue-100 text-blue-700',
  EMBALAGEM: 'bg-purple-100 text-purple-700',
  MARKETING: 'bg-pink-100 text-pink-700',
  CORREIOS: 'bg-orange-100 text-orange-700',
  OUTROS: 'bg-gray-100 text-gray-700',
}

export default function FinanceiroAdmin() {
  const [data, setData] = useState<FinanceiroData | null>(null)
  const [loading, setLoading] = useState(true)
  const [showFormDespesa, setShowFormDespesa] = useState(false)
  const [novaDespesa, setNovaDespesa] = useState({ descricao: '', valor: '', categoria: 'FORNECEDOR' })
  const [savingDespesa, setSavingDespesa] = useState(false)

  const carregar = () => {
    fetch('/api/financeiro')
      .then(r => r.json())
      .then(setData)
      .catch(() => setData({
        receitaTotal: 15420.50,
        receitaMes: 4830.00,
        despesasTotal: 3200.00,
        despesasMes: 980.00,
        lucroTotal: 12220.50,
        lucroMes: 3850.00,
        pedidosPorMes: [
          { mes: 'Jan', receita: 1200, quantidade: 8 },
          { mes: 'Fev', receita: 1800, quantidade: 12 },
          { mes: 'Mar', receita: 2400, quantidade: 16 },
          { mes: 'Abr', receita: 2100, quantidade: 14 },
          { mes: 'Mai', receita: 3200, quantidade: 21 },
          { mes: 'Jun', receita: 4830, quantidade: 32 },
        ],
        despesas: [
          { id: '1', descricao: 'Fornecedor Joia Brasil', valor: 1200, categoria: 'FORNECEDOR', data: new Date().toISOString() },
          { id: '2', descricao: 'Embalagens premium', valor: 320, categoria: 'EMBALAGEM', data: new Date().toISOString() },
          { id: '3', descricao: 'Instagram Ads', valor: 400, categoria: 'MARKETING', data: new Date().toISOString() },
          { id: '4', descricao: 'Correios - envios', valor: 260, categoria: 'CORREIOS', data: new Date().toISOString() },
        ],
      }))
      .finally(() => setLoading(false))
  }

  useEffect(() => { carregar() }, [])

  const adicionarDespesa = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingDespesa(true)
    await fetch('/api/financeiro', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...novaDespesa, valor: parseFloat(novaDespesa.valor) }),
    })
    setNovaDespesa({ descricao: '', valor: '', categoria: 'FORNECEDOR' })
    setShowFormDespesa(false)
    carregar()
    setSavingDespesa(false)
  }

  const excluirDespesa = async (id: string) => {
    if (!confirm('Excluir esta despesa?')) return
    await fetch(`/api/financeiro?id=${id}`, { method: 'DELETE' })
    carregar()
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-[#b95a39] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const maxReceita = Math.max(...(data?.pedidosPorMes.map(m => m.receita) || [1]))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Financeiro</h1>
        <p className="text-gray-500 mt-1">Controle suas receitas, despesas e lucros</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { title: 'Receita', total: data?.receitaTotal, mes: data?.receitaMes, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
          { title: 'Despesas', total: data?.despesasTotal, mes: data?.despesasMes, icon: TrendingDown, color: 'text-red-500', bg: 'bg-red-50' },
          { title: 'Lucro', total: data?.lucroTotal, mes: data?.lucroMes, icon: DollarSign, color: 'text-[#b95a39]', bg: 'bg-yellow-50' },
        ].map((kpi, i) => (
          <motion.div
            key={kpi.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white rounded-2xl border border-gray-100 p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-3 rounded-xl ${kpi.bg}`}>
                <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
              </div>
              <span className="font-medium text-gray-600">{kpi.title}</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              R$ {kpi.total?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-sm text-gray-400 mt-1">
              Este mês: R$ {kpi.mes?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl border border-gray-100 p-6"
      >
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Receita por Mês</h2>
        <div className="flex items-end gap-3 h-48">
          {data?.pedidosPorMes.map((mes, i) => (
            <div key={mes.mes} className="flex-1 flex flex-col items-center gap-2">
              <span className="text-xs text-gray-500 font-medium">
                R$ {(mes.receita / 1000).toFixed(1)}k
              </span>
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${(mes.receita / maxReceita) * 160}px` }}
                transition={{ delay: i * 0.1, type: 'spring' }}
                className="w-full bg-gradient-to-t from-terracotta-500 to-sage-600 rounded-t-lg min-h-[4px]"
              />
              <span className="text-xs text-gray-400">{mes.mes}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Expenses */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Despesas</h2>
          <button
            onClick={() => setShowFormDespesa(!showFormDespesa)}
            className="flex items-center gap-2 bg-[#b95a39] hover:bg-[#9c4830] text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nova Despesa
          </button>
        </div>

        {showFormDespesa && (
          <motion.form
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={adicionarDespesa}
            className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6 p-4 bg-gray-50 rounded-xl"
          >
            <input
              type="text"
              placeholder="Descrição"
              required
              value={novaDespesa.descricao}
              onChange={e => setNovaDespesa(prev => ({ ...prev, descricao: e.target.value }))}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#b95a39]/50"
            />
            <input
              type="number"
              placeholder="Valor (R$)"
              required
              min="0"
              step="0.01"
              value={novaDespesa.valor}
              onChange={e => setNovaDespesa(prev => ({ ...prev, valor: e.target.value }))}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#b95a39]/50"
            />
            <select
              value={novaDespesa.categoria}
              onChange={e => setNovaDespesa(prev => ({ ...prev, categoria: e.target.value }))}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#b95a39]/50"
            >
              {categoriasDespesa.map(cat => <option key={cat}>{cat}</option>)}
            </select>
            <button
              type="submit"
              disabled={savingDespesa}
              className="bg-[#b95a39] hover:bg-[#9c4830] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              {savingDespesa ? 'Salvando...' : 'Adicionar'}
            </button>
          </motion.form>
        )}

        <div className="space-y-3">
          {data?.despesas.map((despesa, i) => (
            <motion.div
              key={despesa.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0"
            >
              <div className="flex items-center gap-3">
                <span className={`text-xs px-2 py-1 rounded-md font-medium ${categoriasCores[despesa.categoria]}`}>
                  {despesa.categoria}
                </span>
                <div>
                  <p className="text-sm font-medium text-gray-900">{despesa.descricao}</p>
                  <p className="text-xs text-gray-400">{new Date(despesa.data).toLocaleDateString('pt-BR')}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-semibold text-red-600">
                  - R$ {despesa.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
                <button onClick={() => excluirDespesa(despesa.id)} className="p-1 text-gray-300 hover:text-red-500 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
