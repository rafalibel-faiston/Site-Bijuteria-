import type { Metadata } from 'next'
import { Inter, Cormorant_Garamond } from 'next/font/google'
import './globals.css'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { CartDrawer } from '@/components/cart/cart-drawer'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  variable: '--font-cormorant',
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Bella Bijuteria - Joias e Bijuterias de Alta Qualidade',
  description: 'Descubra nossa coleção exclusiva de joias e bijuterias. Anéis, colares, brincos, pulseiras e muito mais com preços especiais.',
  keywords: 'bijuteria, joias, anéis, colares, brincos, pulseiras, acessórios femininos',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${cormorant.variable}`}>
      <body className="bg-dark-950 text-white min-h-screen">
        <Header />
        <CartDrawer />
        <main>
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}
