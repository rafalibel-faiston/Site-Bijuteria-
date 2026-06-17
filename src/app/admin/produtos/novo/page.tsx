'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Plus, X, Save } from 'lucide-react'
import Link from 'next/link'

const categorias = ['Colares', 'Brincos', 'Anéis', 'Pulseiras', 'Tornozeleiras', 'Conjuntos']
const materiais = ['Ouro 18k', 'Prata 925', 'Gold Filled', 'Aço Inoxidável', 'Rose Gold', 'Banho de Ouro', 'Semijoia']

export default function NovoProduto() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [imagens, setImagens] = useState<string[]>([''])
  const [form, setForm] = useState({
    nome: '',
    slug: '',
    descricao: '',
    preco: '',
    precoOriginal: '',
    categoria: 'Colares',
    material: '',
    peso: '',
    estoque: '',
    estoqueMinimo: '5',
    ativo: true,
  })

  const handleNome = (nome: string) => {
    const slug = nome.toLowerCase()
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
    setForm(prev => ({ ...prev, nome, slug }))
  }

  const addImagem = () => setImagens(prev => [...prev, ''])
  const removeImagem = (i: number) => setImagens(prev => prev.filter((_, idx) => idx !== i))
  const updateImagem = (i: number, val: string) => setImagens(prev => prev.map((img, idx) => idx === i ? val : img))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const imgsFiltradas = imagens.filter(img => img.trim())
    const body = {
      ...form,
      preco: parseFloat(form.preco),
      precoOriginal: form.precoOriginal ? parseFloat(form.precoOriginal) : null,
      peso: form.peso ? parseFloat(form.peso) : null,
      estoque: parseInt(form.estoque) || 0,
      estoqueMinimo: parseInt(form.estoqueMinimo) || 5,
      imagens: JSON.stringify(imgsFiltradas),
    }
    const res = await fetch('/api/produtos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (res.ok) {
      router.push('/admin/produtos')
    } else {
      alert('Erro ao salvar produto')
    }
    setSaving(false)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/produtos" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Novo Produto</h1>
          <p className="text-gray-500 mt-1">Adicione um novo item ao catálogo</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4"
        >
          <h2 className="font-semibold text-gray-900">Informações Básicas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Produto *</label>
              <input
                type="text"
                required
                value={form.nome}
                onChange={e => handleNome(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/50"
                placeholder="Ex: Colar Pérola Elegante"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Slug (URL)</label>
              <input
                type="text"
                value={form.slug}
                onChange={e => setForm(prev => ({ ...prev, slug: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/50 bg-gray-50 text-gray-500"
                placeholder="gerado-automaticamente"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoria *</label>
              <select
                required
                value={form.categoria}
                onChange={e => setForm(prev => ({ ...prev, categoria: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/50"
              >
                {categorias.map(cat => <option key={cat}>{cat}</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
              <textarea
                rows={4}
                value={form.descricao}
                onChange={e => setForm(prev => ({ ...prev, descricao: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/50 resize-none"
                placeholder="Descreva o produto, materiais, dimensões..."
              />
            </div>
          </div>
        </motion.div>

        {/* Pricing */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4"
        >
          <h2 className="font-semibold text-gray-900">Preços & Estoque</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Preço (R$) *</label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={form.preco}
                onChange={e => setForm(prev => ({ ...prev, preco: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/50"
                placeholder="0,00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Preço Original (R$)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.precoOriginal}
                onChange={e => setForm(prev => ({ ...prev, precoOriginal: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/50"
                placeholder="Para promoção"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estoque *</label>
              <input
                type="number"
                required
                min="0"
                value={form.estoque}
                onChange={e => setForm(prev => ({ ...prev, estoque: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/50"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estoque Mínimo</label>
              <input
                type="number"
                min="0"
                value={form.estoqueMinimo}
                onChange={e => setForm(prev => ({ ...prev, estoqueMinimo: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/50"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Material</label>
              <select
                value={form.material}
                onChange={e => setForm(prev => ({ ...prev, material: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/50"
              >
                <option value="">Selecione...</option>
                {materiais.map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Peso (g) — para cálculo de frete</label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={form.peso}
                onChange={e => setForm(prev => ({ ...prev, peso: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/50"
                placeholder="Ex: 25"
              />
            </div>
          </div>
        </motion.div>

        {/* Images */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4"
        >
          <h2 className="font-semibold text-gray-900">Imagens</h2>
          <p className="text-sm text-gray-500">Adicione URLs das imagens do produto</p>
          <div className="space-y-3">
            {imagens.map((img, i) => (
              <div key={i} className="flex gap-3">
                <input
                  type="url"
                  value={img}
                  onChange={e => updateImagem(i, e.target.value)}
                  placeholder="https://..."
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/50"
                />
                {imagens.length > 1 && (
                  <button type="button" onClick={() => removeImagem(i)} className="p-2.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addImagem}
            className="flex items-center gap-2 text-sm text-[#C9A84C] hover:text-[#B8962A] font-medium"
          >
            <Plus className="w-4 h-4" />
            Adicionar imagem
          </button>
        </motion.div>

        {/* Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl border border-gray-100 p-6"
        >
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.ativo}
              onChange={e => setForm(prev => ({ ...prev, ativo: e.target.checked }))}
              className="w-5 h-5 rounded accent-[#C9A84C]"
            />
            <div>
              <p className="font-medium text-gray-900">Produto ativo</p>
              <p className="text-sm text-gray-500">Produto visível na loja para clientes</p>
            </div>
          </label>
        </motion.div>

        {/* Actions */}
        <div className="flex items-center gap-4 justify-end">
          <Link href="/admin/produtos" className="px-6 py-3 text-gray-600 hover:text-gray-900 font-medium transition-colors">
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-[#C9A84C] hover:bg-[#B8962A] disabled:opacity-50 text-white px-8 py-3 rounded-xl font-medium transition-colors"
          >
            <Save className="w-5 h-5" />
            {saving ? 'Salvando...' : 'Salvar Produto'}
          </button>
        </div>
      </form>
    </div>
  )
}
