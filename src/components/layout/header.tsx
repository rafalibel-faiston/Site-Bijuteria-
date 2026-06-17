"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingBag, Search, Menu, X, Gem } from 'lucide-react'
import { useCartStore } from '@/components/cart/cart-store'

const navLinks = [
  { href: '/', label: 'Início' },
  { href: '/produtos', label: 'Produtos' },
  { href: '/produtos?categoria=Anéis', label: 'Anéis' },
  { href: '/produtos?categoria=Colares', label: 'Colares' },
  { href: '/produtos?categoria=Brincos', label: 'Brincos' },
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

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'bg-dark-900/95 backdrop-blur-md shadow-lg shadow-dark-900/50'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-gradient-to-br from-gold-400 to-gold-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
              <Gem className="w-4 h-4 text-dark-900" />
            </div>
            <span className="font-heading text-xl font-bold text-white">
              Bella <span className="text-gold-500">Bijuteria</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-dark-200 hover:text-gold-400 transition-colors relative group"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gold-500 group-hover:w-full transition-all duration-300" />
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Search */}
            <form action="/produtos" className="hidden md:flex items-center">
              <div className="relative">
                <input
                  type="text"
                  name="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar joias..."
                  className="bg-dark-800/80 border border-dark-700 rounded-full px-4 py-2 pr-10 text-sm text-white placeholder-dark-400 focus:outline-none focus:border-gold-500 w-40 focus:w-52 transition-all"
                />
                <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Search className="w-4 h-4 text-dark-400" />
                </button>
              </div>
            </form>

            {/* Cart */}
            <button
              onClick={openCart}
              className="relative p-2 text-white hover:text-gold-400 transition-colors"
            >
              <ShoppingBag className="w-6 h-6" />
              {totalItems() > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 bg-gold-500 text-dark-900 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
                >
                  {totalItems()}
                </motion.span>
              )}
            </button>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-white"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
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
            className="lg:hidden bg-dark-900/98 backdrop-blur-md border-t border-dark-700"
          >
            <div className="px-4 py-6 space-y-4">
              {/* Mobile Search */}
              <form action="/produtos" className="flex items-center">
                <div className="relative w-full">
                  <input
                    type="text"
                    name="search"
                    placeholder="Buscar joias..."
                    className="w-full bg-dark-800 border border-dark-700 rounded-full px-4 py-2 pr-10 text-sm text-white placeholder-dark-400 focus:outline-none focus:border-gold-500"
                  />
                  <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Search className="w-4 h-4 text-dark-400" />
                  </button>
                </div>
              </form>

              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block text-dark-200 hover:text-gold-400 transition-colors py-2 text-lg"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
