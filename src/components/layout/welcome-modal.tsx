"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Gem, UserPlus, LogIn } from 'lucide-react'

const DISMISS_KEY = 'cf-welcome-dismissed'

export function WelcomeModal() {
  const { status } = useSession()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    // Só para visitantes não logados, uma vez por sessão.
    if (status !== 'unauthenticated') return
    if (typeof window === 'undefined') return
    if (sessionStorage.getItem(DISMISS_KEY)) return
    // Não mostrar nas próprias telas de login/cadastro.
    if (pathname?.startsWith('/entrar') || pathname?.startsWith('/cadastro')) return

    const timer = setTimeout(() => setOpen(true), 1200)
    return () => clearTimeout(timer)
  }, [status, pathname])

  const fechar = () => {
    setOpen(false)
    try { sessionStorage.setItem(DISMISS_KEY, '1') } catch {}
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-forest-900/60 backdrop-blur-sm px-4"
          onClick={fechar}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md bg-cream-50 rounded-3xl border border-cream-300 p-8 text-center shadow-xl"
          >
            <button
              onClick={fechar}
              className="absolute top-4 right-4 text-forest-400 hover:text-forest-700 transition-colors"
              aria-label="Fechar"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-16 h-16 bg-gradient-to-br from-terracotta-400 to-sage-500 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <Gem className="w-8 h-8 text-cream-50" />
            </div>

            <h2 className="font-heading text-2xl font-bold text-forest-900 mb-2">
              Bem-vinda à Charme Final!
            </h2>
            <p className="text-forest-600 text-sm mb-6">
              Crie sua conta para acompanhar seus pedidos e finalizar suas compras com mais rapidez.
            </p>

            <div className="space-y-3">
              <Link
                href="/cadastro"
                onClick={fechar}
                className="flex items-center justify-center gap-2 w-full bg-terracotta-500 hover:bg-terracotta-600 text-cream-50 font-semibold py-3 rounded-xl transition-colors"
              >
                <UserPlus className="w-5 h-5" />
                Criar minha conta
              </Link>
              <Link
                href="/entrar"
                onClick={fechar}
                className="flex items-center justify-center gap-2 w-full bg-cream-100 hover:bg-cream-200 border border-cream-300 text-forest-700 font-medium py-3 rounded-xl transition-colors"
              >
                <LogIn className="w-5 h-5" />
                Já tenho conta
              </Link>
            </div>

            <button
              onClick={fechar}
              className="mt-4 text-forest-400 hover:text-forest-600 text-sm transition-colors"
            >
              Agora não, continuar navegando
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
