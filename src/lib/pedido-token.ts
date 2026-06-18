import crypto from 'crypto'

// Token de acesso ao pedido derivado do próprio id via HMAC com o segredo do
// servidor. Permite que o visitante (guest checkout) acesse a confirmação do
// SEU pedido por link, sem que um atacante consiga adivinhar/enumerar pedidos
// de terceiros — e sem precisar de coluna nova no banco.
function segredo(): string {
  return process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || 'dev-secret'
}

export function gerarTokenPedido(id: string): string {
  return crypto.createHmac('sha256', segredo()).update(id).digest('hex').slice(0, 32)
}

export function validarTokenPedido(id: string, token?: string | null): boolean {
  if (!token) return false
  const esperado = gerarTokenPedido(id)
  const a = Buffer.from(token)
  const b = Buffer.from(esperado)
  if (a.length !== b.length) return false
  return crypto.timingSafeEqual(a, b)
}
