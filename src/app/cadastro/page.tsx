"use client"

import { Suspense, useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Gem, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

function CadastroForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/conta'

  const [form, setForm] = useState({ nome: '', email: '', telefone: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Não foi possível criar a conta')
        setLoading(false)
        return
      }

      // Faz login automaticamente após o cadastro.
      const result = await signIn('credentials', {
        email: form.email,
        password: form.password,
        redirect: false,
      })

      if (result?.error) {
        router.push('/entrar')
      } else {
        router.push(redirectTo)
        router.refresh()
      }
    } catch {
      setError('Erro ao criar conta. Tente novamente.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-cream-100 flex items-center justify-center px-4 pt-24 pb-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="bg-white rounded-3xl border border-cream-300 p-8 soft-shadow">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-terracotta-400 to-sage-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Gem className="w-8 h-8 text-cream-50" />
            </div>
            <h1 className="font-heading text-2xl font-bold text-forest-900">Criar conta</h1>
            <p className="text-forest-500 text-sm mt-1">Acompanhe seus pedidos e compre mais rápido</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <div>
              <label className="text-forest-600 text-sm mb-1.5 block">Nome completo</label>
              <input
                type="text"
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
                required
                className="w-full bg-cream-50 border border-cream-300 rounded-xl px-4 py-3 text-forest-900 placeholder-forest-400 focus:outline-none focus:border-terracotta-500 transition-colors"
                placeholder="Seu nome"
              />
            </div>

            <div>
              <label className="text-forest-600 text-sm mb-1.5 block">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                className="w-full bg-cream-50 border border-cream-300 rounded-xl px-4 py-3 text-forest-900 placeholder-forest-400 focus:outline-none focus:border-terracotta-500 transition-colors"
                placeholder="seu@email.com"
              />
            </div>

            <div>
              <label className="text-forest-600 text-sm mb-1.5 block">Telefone (opcional)</label>
              <input
                type="tel"
                value={form.telefone}
                onChange={(e) => setForm({ ...form, telefone: e.target.value })}
                className="w-full bg-cream-50 border border-cream-300 rounded-xl px-4 py-3 text-forest-900 placeholder-forest-400 focus:outline-none focus:border-terracotta-500 transition-colors"
                placeholder="(11) 99999-9999"
              />
            </div>

            <div>
              <label className="text-forest-600 text-sm mb-1.5 block">Senha</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  minLength={6}
                  className="w-full bg-cream-50 border border-cream-300 rounded-xl px-4 py-3 pr-12 text-forest-900 placeholder-forest-400 focus:outline-none focus:border-terracotta-500 transition-colors"
                  placeholder="Mínimo 6 caracteres"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-forest-400 hover:text-forest-700 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" variant="luxury" size="lg" className="w-full" disabled={loading}>
              {loading ? 'Criando...' : 'Criar conta'}
            </Button>
          </form>

          <p className="text-forest-500 text-sm text-center mt-6">
            Já tem conta?{' '}
            <Link
              href={`/entrar${redirectTo !== '/conta' ? `?redirect=${encodeURIComponent(redirectTo)}` : ''}`}
              className="text-terracotta-500 font-medium hover:text-terracotta-600"
            >
              Entrar
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}

export default function CadastroPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-cream-100" />}>
      <CadastroForm />
    </Suspense>
  )
}
