"use client"

import { signOut } from 'next-auth/react'
import { LogOut } from 'lucide-react'

export function ContaHeader() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: '/' })}
      className="flex items-center gap-2 text-sm text-forest-600 hover:text-terracotta-500 transition-colors"
    >
      <LogOut className="w-4 h-4" />
      Sair
    </button>
  )
}
