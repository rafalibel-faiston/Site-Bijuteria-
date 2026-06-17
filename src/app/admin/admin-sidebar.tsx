"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Warehouse,
  DollarSign,
  Truck,
  LogOut,
  Gem,
} from 'lucide-react'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/produtos', label: 'Produtos', icon: Package },
  { href: '/admin/pedidos', label: 'Pedidos', icon: ShoppingBag },
  { href: '/admin/estoque', label: 'Estoque', icon: Warehouse },
  { href: '/admin/financeiro', label: 'Financeiro', icon: DollarSign },
  { href: '/admin/correios', label: 'Correios', icon: Truck },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-forest-900 border-r border-forest-700 flex flex-col z-30">
      {/* Logo */}
      <div className="p-6 border-b border-forest-700">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-terracotta-400 to-sage-500 rounded-xl flex items-center justify-center">
            <Gem className="w-5 h-5 text-cream-50" />
          </div>
          <div>
            <p className="text-cream-50 font-semibold text-sm">Charme Final Acessórios</p>
            <p className="text-sage-200 text-xs">Admin</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || (href !== '/admin' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-sage-500/20 text-sage-200 border border-sage-500/30'
                  : 'text-cream-50 hover:text-cream-50 hover:bg-forest-800'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-sage-200' : ''}`} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-forest-700">
        <Link
          href="/"
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-cream-50 hover:text-cream-50 hover:bg-forest-800 transition-all mb-1"
        >
          <Gem className="w-4 h-4" />
          Ver Site
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
        >
          <LogOut className="w-4 h-4" />
          Sair
        </button>
      </div>
    </aside>
  )
}
