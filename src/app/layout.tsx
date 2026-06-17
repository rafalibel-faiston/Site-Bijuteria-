import type { Metadata } from 'next'
import { Mulish, Fraunces } from 'next/font/google'
import './globals.css'
import { SiteChrome } from '@/components/layout/site-chrome'
import { Providers } from './providers'

const mulish = Mulish({
  subsets: ['latin'],
  variable: '--font-mulish',
  display: 'swap',
})

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  weight: ['300', '400', '500', '600', '700', '900'],
  style: ['normal', 'italic'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Charme Final Acessórios - Bijoux e Acessórios',
  description: 'Charme Final Acessórios — bijoux, semijoias e acessórios com charme. Anéis, colares, brincos, pulseiras e muito mais.',
  keywords: 'bijoux, bijuteria, acessórios, semijoias, anéis, colares, brincos, pulseiras, charme final',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className={`${mulish.variable} ${fraunces.variable}`}>
      <body className="bg-cream-100 text-forest-900 min-h-screen">
        <Providers>
          <SiteChrome>{children}</SiteChrome>
        </Providers>
      </body>
    </html>
  )
}
