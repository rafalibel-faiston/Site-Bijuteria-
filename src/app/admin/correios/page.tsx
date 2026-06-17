'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Package, ExternalLink, Settings, Truck } from 'lucide-react'

interface PedidoEnvio {
  id: string
  numeroPedido: string
  clienteNome: string
  cep: string
  enderecoEntrega: string
  servicoCorreios?: string
  codigoRastreio?: string
  status: string
  total: number
  frete: number
  createdAt: string
}

export default function CorreiosAdmin() {
  const [pedidos, setPedidos] = useState<PedidoEnvio[]>([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState('')
  const [rastreioInput, setRastreioInput] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState<string | null>(null)
  const [cepOrigem, setCepOrigem] = useState('01001000')
  const [calculo, setCalculo] = useState({ cepDestino: '', peso: '100', servicos: [] as Array<{ servico: string; preco: string; prazo: string }> })
  const [calculando, setCalculando] = useState(false)

  useEffect(() => {
    fetch('/api/pedidos?status=CONFIRMADO,PREPARANDO')
      .then(r => r.json())
      .then(data => setPedidos(data.pedidos || []))
      .catch(() => setPedidos([]))
      .finally(() => setLoading(false))
  }, [])

  const calcularFrete = async () => {
    if (!calculo.cepDestino || calculo.cepDestino.length < 8) return
    setCalculando(true)
    const res = await fetch(`/api/correios/frete?cepOrigem=${cepOrigem}&cepDestino=${calculo.cepDestino}&peso=${calculo.peso}`)
    const data = await res.json()
    setCalculo(prev => ({ ...prev, servicos: data.servicos || [] }))
    setCalculando(false)
  }

  const salvarRastreio = async (pedidoId: string) => {
    const codigo = rastreioInput[pedidoId]
    if (!codigo) return
    setSaving(pedidoId)
    await fetch(`/api/pedidos/${pedidoId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ codigoRastreio: codigo, status: 'ENVIADO' }),
    })
    setPedidos(prev => prev.map(p => p.id === pedidoId ? { ...p, codigoRastreio: codigo, status: 'ENVIADO' } : p))
    setRastreioInput(prev => ({ ...prev, [pedidoId]: '' }))
    setSaving(null)
  }

  const getEndereco = (enderecoJson: string) => {
    try {
      const e = JSON.parse(enderecoJson)
      return `${e.logradouro}, ${e.numero} - ${e.bairro}, ${e.cidade}/${e.estado}`
    } catch { return enderecoJson }
  }

  const pedidosFiltrados = pedidos.filter(p =>
    p.numeroPedido.includes(busca) || p.clienteNome.toLowerCase().includes(busca.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Correios</h1>
        <p className="text-gray-500 mt-1">Gerencie envios e rastreamentos</p>
      </div>

      {/* Frete Calculator */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-gray-100 p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-terracotta-50 rounded-xl">
            <Truck className="w-5 h-5 text-terracotta-600" />
          </div>
          <h2 className="font-semibold text-gray-900">Calculadora de Frete</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">CEP de Origem</label>
            <input
              type="text"
              value={cepOrigem}
              onChange={e => setCepOrigem(e.target.value.replace(/\D/g, ''))}
              maxLength={8}
              placeholder="00000000"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#b95a39]/50"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">CEP de Destino</label>
            <input
              type="text"
              value={calculo.cepDestino}
              onChange={e => setCalculo(prev => ({ ...prev, cepDestino: e.target.value.replace(/\D/g, '') }))}
              maxLength={8}
              placeholder="00000000"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#b95a39]/50"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Peso (gramas)</label>
            <input
              type="number"
              value={calculo.peso}
              onChange={e => setCalculo(prev => ({ ...prev, peso: e.target.value }))}
              min="1"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#b95a39]/50"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={calcularFrete}
              disabled={calculando}
              className="w-full py-2 bg-[#b95a39] hover:bg-[#9c4830] text-white rounded-lg text-sm font-medium transition-colors"
            >
              {calculando ? 'Calculando...' : 'Calcular'}
            </button>
          </div>
        </div>
        {calculo.servicos.length > 0 && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
            {calculo.servicos.map(s => (
              <div key={s.servico} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <p className="font-semibold text-gray-900">{s.servico}</p>
                <p className="text-xl font-bold text-[#b95a39] mt-1">R$ {s.preco}</p>
                <p className="text-xs text-gray-500 mt-1">{s.prazo} dias úteis</p>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Config */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-start gap-3">
        <Settings className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm font-medium text-blue-900">Integração Correios</p>
          <p className="text-xs text-blue-600 mt-0.5">
            Para gerar etiquetas automaticamente, configure seu contrato Correios (SIGEP Web) nas configurações da loja.
            A calculadora de frete funciona sem contrato para os serviços PAC e SEDEX.
          </p>
        </div>
      </div>

      {/* Pending Shipments */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">Pedidos para Enviar</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar..."
              value={busca}
              onChange={e => setBusca(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#b95a39]/50"
            />
          </div>
        </div>
        {loading ? (
          <div className="flex items-center justify-center h-24">
            <div className="w-6 h-6 border-4 border-[#b95a39] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : pedidosFiltrados.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Package className="w-10 h-10 mx-auto mb-2 opacity-40" />
            <p>Nenhum pedido pendente de envio</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pedidosFiltrados.map((pedido, i) => (
              <motion.div
                key={pedido.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.05 }}
                className="border border-gray-100 rounded-xl p-4"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-900">{pedido.numeroPedido}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${pedido.status === 'ENVIADO' ? 'bg-indigo-100 text-indigo-700' : 'bg-purple-100 text-purple-700'}`}>
                        {pedido.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{pedido.clienteNome}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{getEndereco(pedido.enderecoEntrega)} — CEP: {pedido.cep}</p>
                    {pedido.servicoCorreios && (
                      <p className="text-xs text-[#b95a39] mt-0.5">Serviço: {pedido.servicoCorreios} — Frete: R$ {pedido.frete.toFixed(2)}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {pedido.codigoRastreio ? (
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-lg text-[#b95a39]">
                          {pedido.codigoRastreio}
                        </span>
                        <a
                          href={`https://rastreamento.correios.com.br/app/index.php?objeto=${pedido.codigoRastreio}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-gray-400 hover:text-[#b95a39] transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="Código de rastreio"
                          value={rastreioInput[pedido.id] || ''}
                          onChange={e => setRastreioInput(prev => ({ ...prev, [pedido.id]: e.target.value.toUpperCase() }))}
                          className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#b95a39]/50 w-40"
                        />
                        <button
                          onClick={() => salvarRastreio(pedido.id)}
                          disabled={saving === pedido.id || !rastreioInput[pedido.id]}
                          className="px-4 py-1.5 bg-[#b95a39] hover:bg-[#9c4830] disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                          {saving === pedido.id ? '...' : 'Marcar Enviado'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
