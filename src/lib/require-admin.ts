import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function requireAdmin() {
  const session = await auth()
  const role = (session?.user as { role?: string } | undefined)?.role

  if (!session) {
    return { error: NextResponse.json({ error: 'Não autenticado' }, { status: 401 }) }
  }
  if (role !== 'ADMIN') {
    return { error: NextResponse.json({ error: 'Acesso negado' }, { status: 403 }) }
  }
  return { session }
}
