"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingBag, Search, Menu, X, Gem, User } from 'lucide-react'
import { useCartStore } from '@/components/cart/cart-store'

const navLinks = [
  { href: '/', label: 'Início' },
  { href: '/produtos', label: 'Produtos' },
  { href: '/produtos?categoria=Anéis', label: 'Anéis' },
  { href: '/produtos?categoria=Colares', label: 'Colares' },
  { href: '/produtos?categoria=Brincos', label: 'Brincos' },
]

const mobileCategories = [
  { href: '/produtos?categoria=Anéis', label: 'Anéis', emoji: '💍' },
  { href: '/produtos?categoria=Colares', label: 'Colares', emoji: '📿' },
  { href: '/produtos?categoria=Brincos', label: 'Brincos', emoji: '✨' },
  { href: '/produtos?categoria=Pulseiras', label: 'Pulseiras', emoji: '🌟' },
  { href: '/produtos?categoria=Tornozeleiras', label: 'Tornozeleiras', emoji: '⭐' },
  { href: '/produtos?categoria=Conjuntos', label: 'Conjuntos', emoji: '👑' },
]

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const { totalItems, openCart } = useCartStore()

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setIsMobileMenuOpen(false)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled || isMobileMenuOpen
          ? 'bg-cream-100/97 backdrop-blur-md soft-shadow border-b border-cream-300'
          : 'bg-cream-50/80 backdrop-blur-sm border-b border-cream-200/60'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-15 lg:h-20" style={{ height: '60px' }}>
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-gradient-to-br from-terracotta-500 to-sage-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
              <Gem className="w-4 h-4 text-cream-50" />
            </div>
            <span className="font-heading text-xl font-bold text-forest-900">
              Charme <span className="text-terracotta-500">Final</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-forest-700 hover:text-terracotta-500 transition-colors relative group"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-terracotta-500 group-hover:w-full transition-all duration-300" />
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-1 sm:gap-3">
            {/* Desktop Search */}
            <form action="/produtos" className="hidden md:flex items-center">
              <div className="relative">
                <input
                  type="text"
                  name="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar joias..."
                  className="bg-cream-50 border border-cream-300 rounded-full px-4 py-2 pr-10 text-sm text-forest-900 placeholder-forest-400 focus:outline-none focus:border-terracotta-500 w-40 focus:w-52 transition-all"
                />
                <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Search className="w-4 h-4 text-forest-400" />
                </button>
              </div>
            </form>

            {/* Account */}
            <Link
              href="/conta"
              className="hidden lg:flex p-2 text-forest-700 hover:text-terracotta-500 transition-colors"
            >
              <User className="w-5 h-5" />
            </Link>

            {/* Cart */}
            <button
              onClick={openCart}
              className="relative p-2.5 text-forest-700 hover:text-terracotta-500 transition-colors"
              aria-label="Abrir carrinho"
            >
              <ShoppingBag className="w-6 h-6" />
              {totalItems() > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-0.5 -right-0.5 bg-terracotta-500 text-cream-50 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
                >
                  {totalItems()}
                </motion.span>
              )}
            </button>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2.5 text-forest-700 hover:text-terracotta-500 transition-colors"
              aria-label="Menu"
            >
              <AnimatePresence mode="wait" initial={false}>
                {isMobileMenuOpen ? (
                  <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                    <X className="w-6 h-6" />
                  </motion.div>
                ) : (
                  <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
                    <Menu className="w-6 h-6" />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="lg:hidden overflow-hidden border-t border-cream-300"
          >
            <div className="bg-cream-50 px-4 py-5 space-y-5">
              {/* Mobile Search */}
              <form action="/produtos" className="flex items-center">
                <div className="relative w-full">
                  <input
                    type="text"
                    name="search"
                    placeholder="Buscar joias..."
                    className="w-full bg-white border border-cream-300 rounded-full px-4 py-3 pr-11 text-sm text-forest-900 placeholder-forest-400 focus:outline-none focus:border-terracotta-500 shadow-sm"
                  />
                  <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2">
                    <Search className="w-4 h-4 text-forest-400" />
                  </button>
                </div>
              </form>

              {/* Categories grid */}
              <div>
                <p className="text-xs text-forest-400 font-medium uppercase tracking-wider mb-3">Categorias</p>
                <div className="grid grid-cols-3 gap-2">
                  {mobileCategories.map((cat) => (
                    <Link
                      key={cat.href}
                      href={cat.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-white border border-cream-200 hover:border-sage-300 hover:bg-cream-50 transition-all"
                    >
                      <span className="text-xl">{cat.emoji}</span>
                      <span className="text-forest-700 text-xs font-medium text-center leading-tight">{cat.label}</span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Nav links */}
              <div className="border-t border-cream-200 pt-4 space-y-1">
                <Link
                  href="/produtos"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-between w-full py-3 px-1 text-forest-700 hover:text-terracotta-500 transition-colors font-medium"
                >
                  <span>Todos os Produtos</span>
                  <Search className="w-4 h-4" />
                </Link>
                <Link
                  href="/conta"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-between w-full py-3 px-1 text-forest-700 hover:text-terracotta-500 transition-colors font-medium"
                >
                  <span>Minha Conta</span>
                  <User className="w-4 h-4" />
                </Link>
                <Link
                  href="/pedidos"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-between w-full py-3 px-1 text-forest-700 hover:text-terracotta-500 transition-colors font-medium"
                >
                  <span>Meus Pedidos</span>
                  <ShoppingBag className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
