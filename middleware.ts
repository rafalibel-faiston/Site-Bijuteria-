import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const isAdminRoute = req.nextUrl.pathname.startsWith('/admin')

  if (isAdminRoute && !isLoggedIn) {
    const loginUrl = new URL('/login', req.nextUrl.origin)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/admin/:path*'],
}
