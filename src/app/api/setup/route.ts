import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'

export const dynamic = 'force-dynamic'

// Endpoint de configuracao inicial (idempotente).
// Cria o usuario admin, a configuracao da loja e os produtos de exemplo.
// Protegido pela mesma chave secreta do NextAuth.
// Uso: /api/setup?key=SEU_NEXTAUTH_SECRET

const PRODUTOS = [
  { nome: 'Anel Dourado Clássico', slug: 'anel-dourado-classico', descricao: 'Anel elegante banhado a ouro 18k com acabamento polido. Perfeito para uso diário ou ocasiões especiais.', preco: 89.9, precoOriginal: 120, categoria: 'Anéis', material: 'Metal banhado a ouro', peso: 5, estoque: 25, estoqueMinimo: 5, vendas: 142, imagens: ['https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&q=80', 'https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=600&q=80'] },
  { nome: 'Colar Pérolas Elegante', slug: 'colar-perolas-elegante', descricao: 'Colar com pérolas sintéticas de alta qualidade. Fecho dourado ajustável. Comprimento: 45cm.', preco: 145, precoOriginal: 180, categoria: 'Colares', material: 'Pérola sintética e metal dourado', peso: 15, estoque: 18, estoqueMinimo: 5, vendas: 87, imagens: ['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&q=80', 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&q=80'] },
  { nome: 'Brinco Argola Grande', slug: 'brinco-argola-grande', descricao: 'Brinco argola grande em metal dourado. Leve e confortável para uso diário. Diâmetro: 5cm.', preco: 45.9, precoOriginal: null, categoria: 'Brincos', material: 'Metal dourado', peso: 8, estoque: 35, estoqueMinimo: 10, vendas: 203, imagens: ['https://images.unsplash.com/photo-1630019852942-f89202989a59?w=600&q=80', 'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=600&q=80'] },
  { nome: 'Pulseira Delicada Dourada', slug: 'pulseira-delicada-dourada', descricao: 'Pulseira fina e delicada banhada a ouro. Fecho de lagosta. Comprimento ajustável: 16-20cm.', preco: 65, precoOriginal: 85, categoria: 'Pulseiras', material: 'Metal banhado a ouro', peso: 6, estoque: 20, estoqueMinimo: 5, vendas: 118, imagens: ['https://images.unsplash.com/photo-1573408301185-9519f94816b5?w=600&q=80', 'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=600&q=80'] },
  { nome: 'Colar Coração Cristal', slug: 'colar-coracao-cristal', descricao: 'Colar com pingente de coração cravejado com cristais de Strass. Corrente dourada fina.', preco: 79.9, precoOriginal: 99.9, categoria: 'Colares', material: 'Metal dourado e cristal', peso: 10, estoque: 15, estoqueMinimo: 5, vendas: 95, imagens: ['https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=600&q=80', 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&q=80'] },
  { nome: 'Anel Solitário Zircônia', slug: 'anel-solitario-zirconia', descricao: 'Anel solitário com pedra de zircônia brilhante. Banhado em ouro branco.', preco: 125, precoOriginal: 160, categoria: 'Anéis', material: 'Metal banhado a ouro branco e zircônia', peso: 4, estoque: 12, estoqueMinimo: 5, vendas: 67, imagens: ['https://images.unsplash.com/photo-1511464510422-77dcbea5d6e9?w=600&q=80', 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&q=80'] },
  { nome: 'Brinco Gota Perolada', slug: 'brinco-gota-perolada', descricao: 'Brinco em formato de gota com pérola sintética. Haste de aço inoxidável dourado.', preco: 38.9, precoOriginal: null, categoria: 'Brincos', material: 'Aço inox dourado e pérola sintética', peso: 6, estoque: 28, estoqueMinimo: 8, vendas: 156, imagens: ['https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&q=80', 'https://images.unsplash.com/photo-1630019852942-f89202989a59?w=600&q=80'] },
  { nome: 'Conjunto Floral 3 Peças', slug: 'conjunto-floral-3-pecas', descricao: 'Conjunto completo com colar, brinco e anel em design floral delicado. Banhado a ouro rosé.', preco: 189.9, precoOriginal: 250, categoria: 'Conjuntos', material: 'Metal banhado a ouro rosé', peso: 25, estoque: 8, estoqueMinimo: 3, vendas: 43, imagens: ['https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&q=80', 'https://images.unsplash.com/photo-1573408301185-9519f94816b5?w=600&q=80'] },
  { nome: 'Pulseira Charms Personalizada', slug: 'pulseira-charms-personalizada', descricao: 'Pulseira com 5 charms variados (estrela, coração, lua, flor, borboleta). Fecho deslizante dourado.', preco: 95, precoOriginal: 120, categoria: 'Pulseiras', material: 'Metal dourado', peso: 12, estoque: 22, estoqueMinimo: 5, vendas: 78, imagens: ['https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=600&q=80', 'https://images.unsplash.com/photo-1573408301185-9519f94816b5?w=600&q=80'] },
  { nome: 'Anel Serpente Dourada', slug: 'anel-serpente-dourada', descricao: 'Anel articulado em formato de serpente enrolada. Design exclusivo e impactante.', preco: 110, precoOriginal: null, categoria: 'Anéis', material: 'Metal dourado', peso: 7, estoque: 3, estoqueMinimo: 5, vendas: 29, imagens: ['https://images.unsplash.com/photo-1601121141461-9d6647bef0a7?w=600&q=80', 'https://images.unsplash.com/photo-1511464510422-77dcbea5d6e9?w=600&q=80'] },
  { nome: 'Brinco Cascata Cristal', slug: 'brinco-cascata-cristal', descricao: 'Brinco longo em formato de cascata com múltiplos cristais. Perfeito para festas e eventos.', preco: 72, precoOriginal: 90, categoria: 'Brincos', material: 'Metal dourado e cristal', peso: 9, estoque: 16, estoqueMinimo: 5, vendas: 112, imagens: ['https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=600&q=80', 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&q=80'] },
  { nome: 'Tornozeleira Dourada Fina', slug: 'tornozeleira-dourada-fina', descricao: 'Tornozeleira fina e delicada banhada a ouro. Com pingente de estrela. Tamanho ajustável.', preco: 55, precoOriginal: 70, categoria: 'Tornozeleiras', material: 'Metal banhado a ouro', peso: 5, estoque: 30, estoqueMinimo: 8, vendas: 89, imagens: ['https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&q=80', 'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=600&q=80'] },
]

async function runSetup() {
  // 1. Usuario admin (senha vem de env; só é aplicada na CRIACAO — o upsert
  // com update:{} nao reescreve a senha de um admin ja existente).
  const senhaHash = await bcrypt.hash(process.env.ADMIN_INITIAL_PASSWORD || 'admin123', 10)
  await prisma.user.upsert({
    where: { email: 'admin@bijuteria.com' },
    update: {},
    create: {
      email: 'admin@bijuteria.com',
      password: senhaHash,
      name: 'Administrador',
      role: 'ADMIN',
    },
  })

  // 2. Configuracao da loja
  await prisma.configuracaoLoja.upsert({
    where: { id: 'default' },
    update: {},
    create: { id: 'default', nome: 'Charme Final Acessórios', cepOrigem: '01310100' },
  })

  // 3. Produtos de exemplo
  for (const p of PRODUTOS) {
    await prisma.produto.upsert({
      where: { slug: p.slug },
      update: {},
      create: { ...p, imagens: JSON.stringify(p.imagens) },
    })
  }

  const totalProdutos = await prisma.produto.count()
  return totalProdutos
}

function autorizado(req: NextRequest) {
  const key = new URL(req.url).searchParams.get('key')
  const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET
  return secret && key === secret
}

export async function GET(req: NextRequest) {
  if (!autorizado(req)) {
    return NextResponse.json(
      { ok: false, erro: 'Chave inválida. Use /api/setup?key=SEU_NEXTAUTH_SECRET' },
      { status: 401 }
    )
  }
  try {
    const totalProdutos = await runSetup()
    return NextResponse.json({
      ok: true,
      mensagem: 'Configuração concluída com sucesso! ✅',
      admin: { email: 'admin@bijuteria.com' },
      totalProdutos,
      proximoPasso:
        'Acesse /login com o e-mail acima e a senha definida em ADMIN_INITIAL_PASSWORD. Troque a senha após o primeiro acesso.',
    })
  } catch (e) {
    return NextResponse.json(
      { ok: false, erro: 'Falha ao configurar', detalhe: String(e) },
      { status: 500 }
    )
  }
}

export const POST = GET
