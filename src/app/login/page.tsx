"use client"

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Gem, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    if (result?.error) {
      setError('Email ou senha incorretos')
      setLoading(false)
    } else {
      router.push('/admin')
    }
  }

  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center px-4">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="bg-dark-800 rounded-3xl border border-dark-700 p-8 shadow-2xl">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-gold-400 to-gold-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Gem className="w-8 h-8 text-dark-900" />
            </div>
            <h1 className="font-heading text-2xl font-bold text-white">
              Bella <span className="text-gold-500">Bijuteria</span>
            </h1>
            <p className="text-dark-400 text-sm mt-1">Painel Administrativo</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3"
              >
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <p className="text-red-400 text-sm">{error}</p>
              </motion.div>
            )}

            <div>
              <label className="text-dark-300 text-sm mb-1.5 block">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-dark-700 border border-dark-600 rounded-xl px-4 py-3 text-white placeholder-dark-500 focus:outline-none focus:border-gold-500 transition-colors"
                placeholder="admin@bijuteria.com"
              />
            </div>

            <div>
              <label className="text-dark-300 text-sm mb-1.5 block">Senha</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-dark-700 border border-dark-600 rounded-xl px-4 py-3 pr-12 text-white placeholder-dark-500 focus:outline-none focus:border-gold-500 transition-colors"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="luxury"
              size="lg"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>

          <p className="text-dark-600 text-xs text-center mt-6">
            Acesso restrito aos administradores
          </p>
        </div>
      </motion.div>
    </div>
  )
}
