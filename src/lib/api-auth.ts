import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

// Guarda de rota: exige sessão com papel ADMIN.
// Uso:
//   const gate = await requireAdmin()
//   if (!gate.ok) return gate.response
export async function requireAdmin() {
  const session = await auth()
  const role = (session?.user as { role?: string } | undefined)?.role
  if (role !== 'ADMIN') {
    return {
      ok: false as const,
      response: NextResponse.json({ error: 'Não autorizado' }, { status: 403 }),
    }
  }
  return { ok: true as const, session }
}

// Retorna { id, role } do usuário logado (ou nulos para visitante).
export async function getSessionUser() {
  const session = await auth()
  const user = session?.user as { id?: string; role?: string } | undefined
  return { id: user?.id ?? null, role: user?.role ?? null }
}
