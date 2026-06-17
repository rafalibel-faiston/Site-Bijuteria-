import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10)

  await prisma.user.upsert({
    where: { email: 'admin@bijuteria.com' },
    update: {},
    create: {
      email: 'admin@bijuteria.com',
      password: hashedPassword,
      name: 'Administrador',
      role: 'ADMIN',
    },
  })

  // Create store config
  await prisma.configuracaoLoja.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      nome: 'Bella Bijuteria',
      cepOrigem: '01310100',
    },
  })

  // Create sample products
  const produtos = [
    {
      nome: 'Anel Dourado Clássico',
      slug: 'anel-dourado-classico',
      descricao: 'Anel elegante banhado a ouro 18k com acabamento polido. Perfeito para uso diário ou ocasiões especiais.',
      preco: 89.90,
      precoOriginal: 120.00,
      imagens: JSON.stringify([
        'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&q=80',
        'https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=600&q=80',
      ]),
      categoria: 'Anéis',
      material: 'Metal banhado a ouro',
      peso: 5,
      estoque: 25,
      estoqueMinimo: 5,
      vendas: 142,
    },
    {
      nome: 'Colar Pérolas Elegante',
      slug: 'colar-perolas-elegante',
      descricao: 'Colar com pérolas sintéticas de alta qualidade. Fecho dourado ajustável. Comprimento: 45cm.',
      preco: 145.00,
      precoOriginal: 180.00,
      imagens: JSON.stringify([
        'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&q=80',
        'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&q=80',
      ]),
      categoria: 'Colares',
      material: 'Pérola sintética e metal dourado',
      peso: 15,
      estoque: 18,
      estoqueMinimo: 5,
      vendas: 87,
    },
    {
      nome: 'Brinco Argola Grande',
      slug: 'brinco-argola-grande',
      descricao: 'Brinco argola grande em metal dourado. Leve e confortável para uso diário. Diâmetro: 5cm.',
      preco: 45.90,
      precoOriginal: null,
      imagens: JSON.stringify([
        'https://images.unsplash.com/photo-1630019852942-f89202989a59?w=600&q=80',
        'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=600&q=80',
      ]),
      categoria: 'Brincos',
      material: 'Metal dourado',
      peso: 8,
      estoque: 35,
      estoqueMinimo: 10,
      vendas: 203,
    },
    {
      nome: 'Pulseira Delicada Dourada',
      slug: 'pulseira-delicada-dourada',
      descricao: 'Pulseira fina e delicada banhada a ouro. Fecho de lagosta. Comprimento ajustável: 16-20cm.',
      preco: 65.00,
      precoOriginal: 85.00,
      imagens: JSON.stringify([
        'https://images.unsplash.com/photo-1573408301185-9519f94816b5?w=600&q=80',
        'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=600&q=80',
      ]),
      categoria: 'Pulseiras',
      material: 'Metal banhado a ouro',
      peso: 6,
      estoque: 20,
      estoqueMinimo: 5,
      vendas: 118,
    },
    {
      nome: 'Colar Coração Cristal',
      slug: 'colar-coracao-cristal',
      descricao: 'Colar com pingente de coração cravejado com cristais de Strass. Corrente dourada fina. Romanticamente perfeito.',
      preco: 79.90,
      precoOriginal: 99.90,
      imagens: JSON.stringify([
        'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=600&q=80',
        'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&q=80',
      ]),
      categoria: 'Colares',
      material: 'Metal dourado e cristal',
      peso: 10,
      estoque: 15,
      estoqueMinimo: 5,
      vendas: 95,
    },
    {
      nome: 'Anel Solitário Zircônia',
      slug: 'anel-solitario-zirconia',
      descricao: 'Anel solitário com pedra de zircônia brilhante. Banhado em ouro branco. Elegância e sofisticação.',
      preco: 125.00,
      precoOriginal: 160.00,
      imagens: JSON.stringify([
        'https://images.unsplash.com/photo-1511464510422-77dcbea5d6e9?w=600&q=80',
        'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&q=80',
      ]),
      categoria: 'Anéis',
      material: 'Metal banhado a ouro branco e zircônia',
      peso: 4,
      estoque: 12,
      estoqueMinimo: 5,
      vendas: 67,
    },
    {
      nome: 'Brinco Gota Perolada',
      slug: 'brinco-gota-perolada',
      descricao: 'Brinco em formato de gota com pérola sintética. Haste de aço inoxidável dourado. Elegante e versátil.',
      preco: 38.90,
      precoOriginal: null,
      imagens: JSON.stringify([
        'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&q=80',
        'https://images.unsplash.com/photo-1630019852942-f89202989a59?w=600&q=80',
      ]),
      categoria: 'Brincos',
      material: 'Aço inox dourado e pérola sintética',
      peso: 6,
      estoque: 28,
      estoqueMinimo: 8,
      vendas: 156,
    },
    {
      nome: 'Conjunto Floral 3 Peças',
      slug: 'conjunto-floral-3-pecas',
      descricao: 'Conjunto completo com colar, brinco e anel em design floral delicado. Banhado a ouro rosé.',
      preco: 189.90,
      precoOriginal: 250.00,
      imagens: JSON.stringify([
        'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&q=80',
        'https://images.unsplash.com/photo-1573408301185-9519f94816b5?w=600&q=80',
      ]),
      categoria: 'Conjuntos',
      material: 'Metal banhado a ouro rosé',
      peso: 25,
      estoque: 8,
      estoqueMinimo: 3,
      vendas: 43,
    },
    {
      nome: 'Pulseira Charms Personalizada',
      slug: 'pulseira-charms-personalizada',
      descricao: 'Pulseira com 5 charms variados (estrela, coração, lua, flor, borboleta). Fecho deslizante dourado.',
      preco: 95.00,
      precoOriginal: 120.00,
      imagens: JSON.stringify([
        'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=600&q=80',
        'https://images.unsplash.com/photo-1573408301185-9519f94816b5?w=600&q=80',
      ]),
      categoria: 'Pulseiras',
      material: 'Metal dourado',
      peso: 12,
      estoque: 22,
      estoqueMinimo: 5,
      vendas: 78,
    },
    {
      nome: 'Anel Serpente Dourada',
      slug: 'anel-serpente-dourada',
      descricao: 'Anel articulado em formato de serpente enrolada. Design exclusivo e impactante. Peça única.',
      preco: 110.00,
      precoOriginal: null,
      imagens: JSON.stringify([
        'https://images.unsplash.com/photo-1601121141461-9d6647bef0a7?w=600&q=80',
        'https://images.unsplash.com/photo-1511464510422-77dcbea5d6e9?w=600&q=80',
      ]),
      categoria: 'Anéis',
      material: 'Metal dourado',
      peso: 7,
      estoque: 3,
      estoqueMinimo: 5,
      vendas: 29,
    },
    {
      nome: 'Brinco Cascata Cristal',
      slug: 'brinco-cascata-cristal',
      descricao: 'Brinco longo em formato de cascata com múltiplos cristais. Perfeito para festas e eventos.',
      preco: 72.00,
      precoOriginal: 90.00,
      imagens: JSON.stringify([
        'https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=600&q=80',
        'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&q=80',
      ]),
      categoria: 'Brincos',
      material: 'Metal dourado e cristal',
      peso: 9,
      estoque: 16,
      estoqueMinimo: 5,
      vendas: 112,
    },
    {
      nome: 'Tornozeleira Dourada Fina',
      slug: 'tornozeleira-dourada-fina',
      descricao: 'Tornozeleira fina e delicada banhada a ouro. Com pingente de estrela. Tamanho ajustável.',
      preco: 55.00,
      precoOriginal: 70.00,
      imagens: JSON.stringify([
        'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&q=80',
        'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=600&q=80',
      ]),
      categoria: 'Tornozeleiras',
      material: 'Metal banhado a ouro',
      peso: 5,
      estoque: 30,
      estoqueMinimo: 8,
      vendas: 89,
    },
  ]

  for (const produto of produtos) {
    await prisma.produto.upsert({
      where: { slug: produto.slug },
      update: {},
      create: produto,
    })
  }

  // Create sample expenses
  const despesas = [
    { descricao: 'Compra de estoque - Fornecedor SP', valor: 1500.00, categoria: 'FORNECEDOR' },
    { descricao: 'Caixas e embalagens premium', valor: 350.00, categoria: 'EMBALAGEM' },
    { descricao: 'Anúncio Instagram', valor: 200.00, categoria: 'MARKETING' },
    { descricao: 'Etiquetas de envio', valor: 85.00, categoria: 'CORREIOS' },
    { descricao: 'Taxa de plataforma', valor: 49.90, categoria: 'OUTROS' },
  ]

  for (const despesa of despesas) {
    await prisma.despesa.create({ data: despesa })
  }

  // Create sample orders
  const pedidos = [
    {
      numeroPedido: 'BJ-2024-001',
      status: 'ENTREGUE',
      clienteNome: 'Maria Silva',
      clienteEmail: 'maria@email.com',
      clienteTelefone: '(11) 98765-4321',
      enderecoEntrega: JSON.stringify({
        logradouro: 'Rua das Flores, 123',
        complemento: 'Apto 45',
        bairro: 'Jardim Primavera',
        cidade: 'São Paulo',
        estado: 'SP',
        cep: '01310100',
      }),
      cep: '01310100',
      frete: 18.50,
      servicoCorreios: 'PAC',
      codigoRastreio: 'BR123456789SP',
      subtotal: 89.90,
      total: 108.40,
      formaPagamento: 'PIX',
    },
    {
      numeroPedido: 'BJ-2024-002',
      status: 'ENVIADO',
      clienteNome: 'Ana Rodrigues',
      clienteEmail: 'ana@email.com',
      clienteTelefone: '(21) 97654-3210',
      enderecoEntrega: JSON.stringify({
        logradouro: 'Av. Copacabana, 500',
        complemento: '',
        bairro: 'Copacabana',
        cidade: 'Rio de Janeiro',
        estado: 'RJ',
        cep: '22020080',
      }),
      cep: '22020080',
      frete: 24.90,
      servicoCorreios: 'SEDEX',
      codigoRastreio: 'BR987654321RJ',
      subtotal: 145.00,
      total: 169.90,
      formaPagamento: 'CARTAO_CREDITO',
    },
    {
      numeroPedido: 'BJ-2024-003',
      status: 'PENDENTE',
      clienteNome: 'Carla Mendes',
      clienteEmail: 'carla@email.com',
      clienteTelefone: '(31) 96543-2109',
      enderecoEntrega: JSON.stringify({
        logradouro: 'Rua da Liberdade, 200',
        complemento: 'Casa',
        bairro: 'Centro',
        cidade: 'Belo Horizonte',
        estado: 'MG',
        cep: '30140071',
      }),
      cep: '30140071',
      frete: 15.00,
      servicoCorreios: 'PAC',
      codigoRastreio: null,
      subtotal: 189.90,
      total: 204.90,
      formaPagamento: 'BOLETO',
    },
  ]

  for (const pedido of pedidos) {
    const created = await prisma.pedido.upsert({
      where: { numeroPedido: pedido.numeroPedido },
      update: {},
      create: pedido,
    })

    // Add items to orders
    const produtos_list = await prisma.produto.findMany({ take: 2 })
    if (produtos_list.length > 0) {
      await prisma.itemPedido.create({
        data: {
          pedidoId: created.id,
          produtoId: produtos_list[0].id,
          quantidade: 1,
          precoUnit: produtos_list[0].preco,
        },
      })
    }
  }

  console.log('✅ Seed data created successfully!')
  console.log('📧 Admin email: admin@bijuteria.com')
  console.log('🔑 Admin password: admin123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
