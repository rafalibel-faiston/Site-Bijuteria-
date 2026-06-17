'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Filter, Package, ChevronDown } from 'lucide-react'

interface Pedido {
  id: string
  numeroPedido: string
  status: string
  clienteNome: string
  clienteEmail: string
  total: number
  frete: number
  servicoCorreios?: string
  codigoRastreio?: string
  createdAt: string
  itens: Array<{ quantidade: number; precoUnit: number; produto: { nome: string } }>
}

const statusColors: Record<string, string> = {
  PENDENTE: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  CONFIRMADO: 'bg-blue-100 text-blue-800 border-blue-200',
  PREPARANDO: 'bg-purple-100 text-purple-800 border-purple-200',
  ENVIADO: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  ENTREGUE: 'bg-green-100 text-green-800 border-green-200',
  CANCELADO: 'bg-red-100 text-red-800 border-red-200',
}

const statusOptions = ['PENDENTE', 'CONFIRMADO', 'PREPARANDO', 'ENVIADO', 'ENTREGUE', 'CANCELADO']
const statusLabels: Record<string, string> = {
  PENDENTE: 'Pendente', CONFIRMADO: 'Confirmado', PREPARANDO: 'Preparando',
  ENVIADO: 'Enviado', ENTREGUE: 'Entregue', CANCELADO: 'Cancelado',
}

export default function PedidosAdmin() {
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState('')
  const [statusFiltro, setStatusFiltro] = useState('TODOS')
  const [expandido, setExpandido] = useState<string | null>(null)
  const [rastreios, setRastreios] = useState<Record<string, string>>({})

  useEffect(() => {
    fetch('/api/pedidos')
      .then(r => r.json())
      .then(data => setPedidos(data.pedidos || []))
      .catch(() => setPedidos([]))
      .finally(() => setLoading(false))
  }, [])

  const atualizarStatus = async (id: string, status: string) => {
    await fetch(`/api/pedidos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    setPedidos(prev => prev.map(p => p.id === id ? { ...p, status } : p))
  }

  const adicionarRastreio = async (id: string) => {
    const codigo = rastreios[id]
    if (!codigo) return
    await fetch(`/api/pedidos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ codigoRastreio: codigo, status: 'ENVIADO' }),
    })
    setPedidos(prev => prev.map(p => p.id === id ? { ...p, codigoRastreio: codigo, status: 'ENVIADO' } : p))
    setRastreios(prev => ({ ...prev, [id]: '' }))
  }

  const pedidosFiltrados = pedidos.filter(p => {
    const matchBusca = p.numeroPedido.includes(busca) || p.clienteNome.toLowerCase().includes(busca.toLowerCase())
    const matchStatus = statusFiltro === 'TODOS' || p.status === statusFiltro
    return matchBusca && matchStatus
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Pedidos</h1>
        <p className="text-gray-500 mt-1">{pedidos.length} pedidos no total</p>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
        {['PENDENTE', 'CONFIRMADO', 'PREPARANDO', 'ENVIADO', 'ENTREGUE', 'CANCELADO'].map(status => {
          const count = pedidos.filter(p => p.status === status).length
          return (
            <button
              key={status}
              onClick={() => setStatusFiltro(statusFiltro === status ? 'TODOS' : status)}
              className={`p-3 rounded-xl border text-center transition-all ${
                statusFiltro === status ? statusColors[status] + ' shadow-sm' : 'bg-white border-gray-100 text-gray-600 hover:border-gray-200'
              }`}
            >
              <p className="text-xl font-bold">{count}</p>
              <p className="text-xs mt-0.5">{statusLabels[status]}</p>
            </button>
          )
        })}
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por número ou cliente..."
            value={busca}
            onChange={e => setBusca(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#b95a39]/50"
          />
        </div>
        <button
          onClick={() => setStatusFiltro('TODOS')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            statusFiltro === 'TODOS' ? 'bg-[#b95a39] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <Filter className="w-4 h-4" />
          Todos
        </button>
      </div>

      {/* Orders List */}
      <div className="space-y-3">
        {loading ? (
          <div className="flex items-center justify-center h-40 bg-white rounded-2xl border border-gray-100">
            <div className="w-8 h-8 border-4 border-[#b95a39] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : pedidosFiltrados.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 bg-white rounded-2xl border border-gray-100 text-gray-400">
            <Package className="w-10 h-10 mb-2" />
            <p>Nenhum pedido encontrado</p>
          </div>
        ) : (
          pedidosFiltrados.map((pedido, i) => (
            <motion.div
              key={pedido.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
            >
              <div
                className="flex items-center justify-between p-5 cursor-pointer hover:bg-gray-50"
                onClick={() => setExpandido(expandido === pedido.id ? null : pedido.id)}
              >
                <div className="flex items-center gap-4">
                  <div>
                    <p className="font-semibold text-gray-900">{pedido.numeroPedido}</p>
                    <p className="text-sm text-gray-500">{pedido.clienteNome} • {new Date(pedido.createdAt).toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`text-xs px-3 py-1 rounded-full border font-medium ${statusColors[pedido.status]}`}>
                    {statusLabels[pedido.status]}
                  </span>
                  <p className="font-semibold text-gray-900 min-w-[80px] text-right">
                    R$ {pedido.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${expandido === pedido.id ? 'rotate-180' : ''}`} />
                </div>
              </div>

              {expandido === pedido.id && (
                <div className="border-t border-gray-100 p-5 bg-gray-50/50 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Items */}
                    <div className="md:col-span-2">
                      <p className="text-sm font-medium text-gray-700 mb-2">Itens do pedido</p>
                      <div className="space-y-2">
                        {pedido.itens?.map((item, j) => (
                          <div key={j} className="flex items-center justify-between text-sm bg-white rounded-lg p-3 border border-gray-100">
                            <span className="text-gray-700">{item.produto?.nome}</span>
                            <span className="text-gray-500">{item.quantidade}x R$ {item.precoUnit.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-between text-sm pt-2 mt-2 border-t border-gray-200">
                        <span className="text-gray-500">Frete ({pedido.servicoCorreios || '-'})</span>
                        <span>R$ {pedido.frete.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">Atualizar status</p>
                        <select
                          value={pedido.status}
                          onChange={e => atualizarStatus(pedido.id, e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#b95a39]/50"
                        >
                          {statusOptions.map(s => (
                            <option key={s} value={s}>{statusLabels[s]}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">Código de rastreio</p>
                        {pedido.codigoRastreio ? (
                          <p className="text-sm font-mono bg-white border border-gray-200 rounded-lg px-3 py-2 text-[#b95a39]">
                            {pedido.codigoRastreio}
                          </p>
                        ) : (
                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder="Ex: BR123456789"
                              value={rastreios[pedido.id] || ''}
                              onChange={e => setRastreios(prev => ({ ...prev, [pedido.id]: e.target.value }))}
                              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#b95a39]/50"
                            />
                            <button
                              onClick={() => adicionarRastreio(pedido.id)}
                              className="px-3 py-2 bg-[#b95a39] text-white rounded-lg text-sm hover:bg-[#9c4830] transition-colors"
                            >
                              Salvar
                            </button>
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-gray-400">{pedido.clienteEmail}</p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}
