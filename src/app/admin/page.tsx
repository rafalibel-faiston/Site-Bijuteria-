'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Package, ShoppingBag, TrendingUp, AlertTriangle, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import Link from 'next/link'

interface DashboardData {
  totalVendas: number
  totalPedidos: number
  pedidosPendentes: number
  produtosEstoqueBaixo: number
  totalProdutos: number
  receitaMes: number
  receitaMesAnterior: number
  pedidosRecentes: Array<{
    id: string
    numeroPedido: string
    clienteNome: string
    total: number
    status: string
    createdAt: string
  }>
  produtosMaisVendidos: Array<{
    id: string
    nome: string
    vendas: number
    estoque: number
  }>
}

const statusColors: Record<string, string> = {
  PENDENTE: 'bg-yellow-100 text-yellow-800',
  CONFIRMADO: 'bg-blue-100 text-blue-800',
  PREPARANDO: 'bg-purple-100 text-purple-800',
  ENVIADO: 'bg-indigo-100 text-indigo-800',
  ENTREGUE: 'bg-green-100 text-green-800',
  CANCELADO: 'bg-red-100 text-red-800',
}

const statusLabels: Record<string, string> = {
  PENDENTE: 'Pendente',
  CONFIRMADO: 'Confirmado',
  PREPARANDO: 'Preparando',
  ENVIADO: 'Enviado',
  ENTREGUE: 'Entregue',
  CANCELADO: 'Cancelado',
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/dashboard')
      .then(r => r.json())
      .then(setData)
      .catch(() => {
        // Mock data for display
        setData({
          totalVendas: 15420.5,
          totalPedidos: 87,
          pedidosPendentes: 12,
          produtosEstoqueBaixo: 4,
          totalProdutos: 24,
          receitaMes: 4830.0,
          receitaMesAnterior: 3900.0,
          pedidosRecentes: [
            { id: '1', numeroPedido: '#00087', clienteNome: 'Maria Silva', total: 189.9, status: 'PENDENTE', createdAt: new Date().toISOString() },
            { id: '2', numeroPedido: '#00086', clienteNome: 'João Oliveira', total: 320.0, status: 'ENVIADO', createdAt: new Date().toISOString() },
            { id: '3', numeroPedido: '#00085', clienteNome: 'Ana Costa', total: 75.0, status: 'ENTREGUE', createdAt: new Date().toISOString() },
          ],
          produtosMaisVendidos: [
            { id: '1', nome: 'Colar Pérola Elegante', vendas: 34, estoque: 8 },
            { id: '2', nome: 'Anel Zircônia Gold', vendas: 28, estoque: 3 },
            { id: '3', nome: 'Brinco Argola Rose Gold', vendas: 22, estoque: 15 },
          ],
        })
      })
      .finally(() => setLoading(false))
  }, [])

  const receitaVariacao = data && data.receitaMesAnterior > 0
    ? ((data.receitaMes - data.receitaMesAnterior) / data.receitaMesAnterior) * 100
    : 0

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-[#b95a39] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Visão geral da sua loja</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            title: 'Receita Total',
            value: `R$ ${data?.totalVendas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
            icon: TrendingUp,
            color: 'text-terracotta-600',
            bg: 'bg-terracotta-50',
            sub: `Este mês: R$ ${data?.receitaMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
            trend: receitaVariacao,
          },
          {
            title: 'Total de Pedidos',
            value: data?.totalPedidos,
            icon: ShoppingBag,
            color: 'text-blue-600',
            bg: 'bg-blue-50',
            sub: `${data?.pedidosPendentes} pendentes`,
          },
          {
            title: 'Produtos',
            value: data?.totalProdutos,
            icon: Package,
            color: 'text-sage-600',
            bg: 'bg-sage-50',
            sub: 'no catálogo',
          },
          {
            title: 'Alertas',
            value: data?.produtosEstoqueBaixo,
            icon: AlertTriangle,
            color: 'text-red-500',
            bg: 'bg-red-50',
            sub: 'itens para repor',
          },
        ].map((kpi, i) => (
          <motion.div
            key={kpi.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${kpi.bg}`}>
                <kpi.icon className={`w-6 h-6 ${kpi.color}`} />
              </div>
              {kpi.trend !== undefined && (
                <span className={`flex items-center text-sm font-medium ${kpi.trend >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                  {kpi.trend >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                  {Math.abs(kpi.trend).toFixed(1)}%
                </span>
              )}
            </div>
            <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
            <p className="text-sm text-gray-500 mt-1">{kpi.title}</p>
            <p className="text-xs text-gray-400 mt-1">{kpi.sub}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Pedidos Recentes</h2>
            <Link href="/admin/pedidos" className="text-sm text-[#b95a39] hover:underline">
              Ver todos
            </Link>
          </div>
          <div className="space-y-4">
            {data?.pedidosRecentes.map(pedido => (
              <div key={pedido.id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                <div>
                  <p className="font-medium text-gray-900">{pedido.numeroPedido}</p>
                  <p className="text-sm text-gray-500">{pedido.clienteNome}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    R$ {pedido.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                  <span className={`text-xs px-2 py-1 rounded-full ${statusColors[pedido.status]}`}>
                    {statusLabels[pedido.status]}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Top Products */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Mais Vendidos</h2>
            <Link href="/admin/produtos" className="text-sm text-[#b95a39] hover:underline">
              Ver todos
            </Link>
          </div>
          <div className="space-y-4">
            {data?.produtosMaisVendidos.map((produto, i) => (
              <div key={produto.id} className="flex items-center gap-4">
                <span className="w-6 h-6 rounded-full bg-[#b95a39]/10 text-[#b95a39] text-xs font-bold flex items-center justify-center">
                  {i + 1}
                </span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{produto.nome}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                      <div
                        className="bg-[#b95a39] h-1.5 rounded-full"
                        style={{ width: `${(produto.vendas / 40) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500">{produto.vendas} vendas</span>
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${produto.estoque <= 5 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                  {produto.estoque} und
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-gradient-to-r from-[#1c2620] to-[#233028] rounded-2xl p-6 text-white"
      >
        <h2 className="text-lg font-semibold mb-4">Ações Rápidas</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Novo Produto', href: '/admin/produtos/novo', icon: '💎' },
            { label: 'Ver Pedidos', href: '/admin/pedidos', icon: '📦' },
            { label: 'Financeiro', href: '/admin/financeiro', icon: '💰' },
            { label: 'Correios', href: '/admin/correios', icon: '📮' },
          ].map(action => (
            <Link
              key={action.href}
              href={action.href}
              className="flex flex-col items-center gap-2 p-4 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
            >
              <span className="text-2xl">{action.icon}</span>
              <span className="text-sm font-medium">{action.label}</span>
            </Link>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
