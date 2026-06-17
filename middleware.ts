import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const role = (req.auth?.user as { role?: string } | undefined)?.role
  const { pathname, origin } = req.nextUrl

  const isAdminRoute = pathname.startsWith('/admin')
  const isContaRoute = pathname.startsWith('/conta')

  // Painel admin: exige login E papel de administrador.
  if (isAdminRoute) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL('/login', origin))
    }
    if (role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', origin))
    }
  }

  // Área do cliente: exige apenas estar logado.
  if (isContaRoute && !isLoggedIn) {
    const url = new URL('/entrar', origin)
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/admin/:path*', '/conta/:path*'],
}
