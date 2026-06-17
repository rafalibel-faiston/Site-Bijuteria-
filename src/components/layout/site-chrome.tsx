"use client"

import { usePathname } from 'next/navigation'
import { Header } from './header'
import { Footer } from './footer'
import { CartDrawer } from '../cart/cart-drawer'

// Mostra o cabecalho/rodape/carrinho apenas na loja (cliente).
// No painel admin e na tela de login, eles ficam ocultos.
export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAppInterna =
    pathname?.startsWith('/admin') || pathname?.startsWith('/login')

  if (isAppInterna) {
    return <>{children}</>
  }

  return (
    <>
      <Header />
      <CartDrawer />
      <main>{children}</main>
      <Footer />
    </>
  )
}
