# 💎 Bella Bijuteria — E-commerce Completo

Site de vendas para bijuteria com **loja virtual responsiva e interativa** + **painel administrativo completo** para a dona gerenciar estoque, finanças, pedidos e envios pelos Correios.

## ✨ Funcionalidades

### 🛍️ Loja (Cliente)
- **Página inicial** com hero animado, efeitos de brilho/partículas e produtos em destaque
- **Catálogo** de produtos com filtros por categoria, preço e busca
- **Página de produto** com galeria de imagens e zoom
- **Carrinho** lateral animado (slide-in) com persistência
- **Cálculo de frete** automático via Correios (PAC, SEDEX)
- **Checkout** completo com formulário de endereço e seleção de pagamento
- **Acompanhamento de pedido** com código de rastreio

### 🔐 Painel Admin (Dona do negócio)
- **Dashboard** com KPIs, gráfico de vendas e pedidos recentes
- **Produtos** — cadastro, edição, exclusão, ativar/desativar
- **Estoque** — controle de inventário com alertas de estoque baixo/esgotado
- **Pedidos** — visualizar e atualizar status (pendente → enviado → entregue)
- **Financeiro** — receitas, despesas, lucro e gráficos por mês
- **Correios** — calculadora de frete, código de rastreio e link de rastreamento

## 🚀 Stack Técnica

- **Next.js 14** (App Router) + **TypeScript**
- **Tailwind CSS** + **Framer Motion** (animações)
- **Prisma** + **PostgreSQL**
- **NextAuth.js** (autenticação do admin)
- **Zustand** (carrinho), **Zod** + **React Hook Form** (validação)

## 🔑 Acesso Admin (padrão)

- **URL:** `/login`
- **Email:** `admin@bijuteria.com`
- **Senha:** `admin123`

> ⚠️ Troque a senha após o primeiro acesso em produção.

---

## 🛠️ Rodando localmente

```bash
# 1. Instalar dependências
npm install

# 2. Configurar o banco (.env.local)
#    DATABASE_URL="postgresql://user:senha@localhost:5432/bijuteria"

# 3. Criar as tabelas e popular com dados de exemplo
npm run db:push
npm run db:seed

# 4. Rodar em desenvolvimento
npm run dev
```

Acesse `http://localhost:3000`.

---

## ☁️ Deploy no Railway

1. **Crie um projeto** no [Railway](https://railway.app) e conecte este repositório.
2. **Adicione um banco PostgreSQL** (New → Database → PostgreSQL). O Railway cria a variável `DATABASE_URL` automaticamente.
3. **Configure as variáveis de ambiente** do serviço web:
   - `DATABASE_URL` — referencie o banco: `${{Postgres.DATABASE_URL}}`
   - `NEXTAUTH_SECRET` — uma string secreta aleatória (gere com `openssl rand -base64 32`)
   - `NEXTAUTH_URL` — a URL pública do app (ex: `https://seu-app.up.railway.app`)
4. **Deploy.** O `railway.json` já está configurado para:
   - Build: `npm run build` (inclui `prisma generate`)
   - Start: aplica o schema no banco (`prisma db push`) e inicia o servidor
5. **Popular dados iniciais** (apenas na primeira vez) — abra o terminal do serviço no Railway e rode:
   ```bash
   npm run db:seed
   ```

Pronto! 🎉

---

## 📂 Estrutura do projeto

```
src/
├── app/
│   ├── page.tsx              # Home
│   ├── produtos/             # Catálogo e detalhe
│   ├── carrinho/             # Carrinho
│   ├── checkout/             # Finalização de compra
│   ├── pedidos/[id]/         # Acompanhamento de pedido
│   ├── login/                # Login admin
│   ├── admin/                # Painel administrativo
│   │   ├── page.tsx          # Dashboard
│   │   ├── produtos/         # CRUD de produtos
│   │   ├── estoque/          # Controle de estoque
│   │   ├── pedidos/          # Gestão de pedidos
│   │   ├── financeiro/       # Financeiro
│   │   └── correios/         # Envios e rastreio
│   └── api/                  # Rotas de API (REST)
├── components/               # UI, layout, produtos, carrinho
└── lib/                      # db, auth, correios, utils
prisma/
├── schema.prisma            # Modelos do banco
└── seed.ts                  # Dados de exemplo
```
