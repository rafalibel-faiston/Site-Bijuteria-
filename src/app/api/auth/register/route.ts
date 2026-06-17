import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const registerSchema = z.object({
  nome: z.string().min(3, 'Nome muito curto'),
  email: z.string().email('Email inválido'),
  telefone: z.string().optional(),
  password: z.string().min(6, 'A senha deve ter ao menos 6 caracteres'),
})

export async function POST(req: NextRequest) {
  const body = await req.json()
  const parsed = registerSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message || 'Dados inválidos' },
      { status: 400 }
    )
  }

  const { nome, email, telefone, password } = parsed.data

  const existente = await prisma.user.findUnique({ where: { email } })
  if (existente) {
    return NextResponse.json({ error: 'Já existe uma conta com este email' }, { status: 409 })
  }

  const senhaHash = await bcrypt.hash(password, 10)
  const user = await prisma.user.create({
    data: {
      name: nome,
      email,
      telefone,
      password: senhaHash,
      role: 'CLIENTE',
    },
  })

  return NextResponse.json({ id: user.id, email: user.email, name: user.name }, { status: 201 })
}
