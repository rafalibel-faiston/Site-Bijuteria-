"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CreditCard, Barcode, QrCode, ChevronRight } from 'lucide-react'
import Image from 'next/image'
import { useCartStore } from '@/components/cart/cart-store'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'

const checkoutSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter ao menos 3 caracteres'),
  email: z.string().email('Email inválido'),
  telefone: z.string().min(10, 'Telefone inválido'),
  cep: z.string().min(8, 'CEP inválido'),
  logradouro: z.string().min(5, 'Endereço inválido'),
  numero: z.string().min(1, 'Número obrigatório'),
  complemento: z.string().optional(),
  bairro: z.string().min(2, 'Bairro obrigatório'),
  cidade: z.string().min(2, 'Cidade obrigatória'),
  estado: z.string().min(2, 'Estado obrigatório'),
  formaPagamento: z.enum(['PIX', 'CARTAO_CREDITO', 'BOLETO']),
})

type CheckoutForm = z.infer<typeof checkoutSchema>

export default function CheckoutPage() {
  const router = useRouter()
  const { items, total, clearCart } = useCartStore()
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { formaPagamento: 'PIX' },
  })

  const formaPagamento = watch('formaPagamento')

  const searchCep = async (cep: string) => {
    const clean = cep.replace(/\D/g, '')
    if (clean.length !== 8) return
    try {
      const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`)
      const data = await res.json()
      if (!data.erro) {
        setValue('logradouro', data.logradouro)
        setValue('bairro', data.bairro)
        setValue('cidade', data.localidade)
        setValue('estado', data.uf)
      }
    } catch {}
  }

  const onSubmit = async (data: CheckoutForm) => {
    setLoading(true)
    try {
      const response = await fetch('/api/pedidos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          itens: items.map(item => ({
            produtoId: item.id,
            quantidade: item.quantidade,
            precoUnit: item.preco,
          })),
          subtotal: total(),
          frete: 0,
          total: total(),
        }),
      })

      const pedido = await response.json()
      clearCart()
      router.push(`/pedidos/${pedido.id}`)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-cream-100 pt-24 pb-20 flex flex-col items-center justify-center text-center px-4">
        <p className="text-forest-900 text-xl mb-4">Seu carrinho está vazio</p>
        <Button onClick={() => router.push('/produtos')}>Ver produtos</Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream-100 pt-24 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-heading text-4xl font-bold text-forest-900 mb-8">
          Finalizar <span className="text-gradient-brand">Compra</span>
        </h1>

        {/* Steps */}
        <div className="flex items-center gap-4 mb-10">
          {[
            { n: 1, label: 'Endereço' },
            { n: 2, label: 'Pagamento' },
            { n: 3, label: 'Confirmar' },
          ].map(({ n, label }, i) => (
            <div key={n} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                step >= n ? 'bg-terracotta-500 text-cream-50' : 'bg-cream-200 text-forest-400'
              }`}>
                {n}
              </div>
              <span className={`text-sm ${step >= n ? 'text-forest-900' : 'text-forest-400'}`}>{label}</span>
              {i < 2 && <ChevronRight className="w-4 h-4 text-forest-400" />}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Address */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-cream-50 rounded-2xl border border-cream-300 p-6"
              >
                <h2 className="text-forest-900 font-semibold text-lg mb-6">Dados de Entrega</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="text-forest-600 text-sm mb-1.5 block">Nome completo *</label>
                    <input
                      {...register('nome')}
                      className="w-full bg-white border border-cream-300 rounded-xl px-4 py-2.5 text-forest-900 placeholder-forest-400 focus:outline-none focus:border-sage-500 text-sm"
                      placeholder="Seu nome completo"
                    />
                    {errors.nome && <p className="text-red-400 text-xs mt-1">{errors.nome.message}</p>}
                  </div>

                  <div>
                    <label className="text-forest-600 text-sm mb-1.5 block">Email *</label>
                    <input
                      {...register('email')}
                      type="email"
                      className="w-full bg-white border border-cream-300 rounded-xl px-4 py-2.5 text-forest-900 placeholder-forest-400 focus:outline-none focus:border-sage-500 text-sm"
                      placeholder="seu@email.com"
                    />
                    {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
                  </div>

                  <div>
                    <label className="text-forest-600 text-sm mb-1.5 block">Telefone *</label>
                    <input
                      {...register('telefone')}
                      className="w-full bg-white border border-cream-300 rounded-xl px-4 py-2.5 text-forest-900 placeholder-forest-400 focus:outline-none focus:border-sage-500 text-sm"
                      placeholder="(11) 99999-9999"
                    />
                    {errors.telefone && <p className="text-red-400 text-xs mt-1">{errors.telefone.message}</p>}
                  </div>

                  <div>
                    <label className="text-forest-600 text-sm mb-1.5 block">CEP *</label>
                    <input
                      {...register('cep')}
                      onBlur={(e) => searchCep(e.target.value)}
                      className="w-full bg-white border border-cream-300 rounded-xl px-4 py-2.5 text-forest-900 placeholder-forest-400 focus:outline-none focus:border-sage-500 text-sm"
                      placeholder="00000-000"
                    />
                    {errors.cep && <p className="text-red-400 text-xs mt-1">{errors.cep.message}</p>}
                  </div>

                  <div>
                    <label className="text-forest-600 text-sm mb-1.5 block">Número *</label>
                    <input
                      {...register('numero')}
                      className="w-full bg-white border border-cream-300 rounded-xl px-4 py-2.5 text-forest-900 placeholder-forest-400 focus:outline-none focus:border-sage-500 text-sm"
                      placeholder="123"
                    />
                    {errors.numero && <p className="text-red-400 text-xs mt-1">{errors.numero.message}</p>}
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-forest-600 text-sm mb-1.5 block">Endereço *</label>
                    <input
                      {...register('logradouro')}
                      className="w-full bg-white border border-cream-300 rounded-xl px-4 py-2.5 text-forest-900 placeholder-forest-400 focus:outline-none focus:border-sage-500 text-sm"
                      placeholder="Rua, Avenida..."
                    />
                    {errors.logradouro && <p className="text-red-400 text-xs mt-1">{errors.logradouro.message}</p>}
                  </div>

                  <div>
                    <label className="text-forest-600 text-sm mb-1.5 block">Complemento</label>
                    <input
                      {...register('complemento')}
                      className="w-full bg-white border border-cream-300 rounded-xl px-4 py-2.5 text-forest-900 placeholder-forest-400 focus:outline-none focus:border-sage-500 text-sm"
                      placeholder="Apto, Bloco... (opcional)"
                    />
                  </div>

                  <div>
                    <label className="text-forest-600 text-sm mb-1.5 block">Bairro *</label>
                    <input
                      {...register('bairro')}
                      className="w-full bg-white border border-cream-300 rounded-xl px-4 py-2.5 text-forest-900 placeholder-forest-400 focus:outline-none focus:border-sage-500 text-sm"
                      placeholder="Seu bairro"
                    />
                    {errors.bairro && <p className="text-red-400 text-xs mt-1">{errors.bairro.message}</p>}
                  </div>

                  <div>
                    <label className="text-forest-600 text-sm mb-1.5 block">Cidade *</label>
                    <input
                      {...register('cidade')}
                      className="w-full bg-white border border-cream-300 rounded-xl px-4 py-2.5 text-forest-900 placeholder-forest-400 focus:outline-none focus:border-sage-500 text-sm"
                      placeholder="Sua cidade"
                    />
                    {errors.cidade && <p className="text-red-400 text-xs mt-1">{errors.cidade.message}</p>}
                  </div>

                  <div>
                    <label className="text-forest-600 text-sm mb-1.5 block">Estado *</label>
                    <select
                      {...register('estado')}
                      className="w-full bg-white border border-cream-300 rounded-xl px-4 py-2.5 text-forest-900 focus:outline-none focus:border-sage-500 text-sm"
                    >
                      <option value="">Selecione...</option>
                      {['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'].map(uf => (
                        <option key={uf} value={uf}>{uf}</option>
                      ))}
                    </select>
                    {errors.estado && <p className="text-red-400 text-xs mt-1">{errors.estado.message}</p>}
                  </div>
                </div>
              </motion.div>

              {/* Payment */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-cream-50 rounded-2xl border border-cream-300 p-6"
              >
                <h2 className="text-forest-900 font-semibold text-lg mb-6">Forma de Pagamento</h2>

                <div className="grid grid-cols-3 gap-4">
                  {[
                    { value: 'PIX', label: 'PIX', icon: QrCode, desc: 'Aprovação imediata' },
                    { value: 'CARTAO_CREDITO', label: 'Cartão', icon: CreditCard, desc: 'Até 12x sem juros' },
                    { value: 'BOLETO', label: 'Boleto', icon: Barcode, desc: 'Até 3 dias úteis' },
                  ].map(({ value, label, icon: Icon, desc }) => (
                    <label
                      key={value}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border cursor-pointer transition-all ${
                        formaPagamento === value
                          ? 'border-terracotta-500 bg-terracotta-500/10'
                          : 'border-cream-300 hover:border-sage-300'
                      }`}
                    >
                      <input
                        type="radio"
                        value={value}
                        {...register('formaPagamento')}
                        className="sr-only"
                      />
                      <Icon className={`w-6 h-6 ${formaPagamento === value ? 'text-terracotta-500' : 'text-forest-400'}`} />
                      <span className={`text-sm font-medium ${formaPagamento === value ? 'text-forest-900' : 'text-forest-600'}`}>
                        {label}
                      </span>
                      <span className="text-xs text-forest-400 text-center">{desc}</span>
                    </label>
                  ))}
                </div>

                {formaPagamento === 'PIX' && (
                  <div className="mt-4 p-4 bg-sage-500/10 border border-sage-500/30 rounded-xl">
                    <p className="text-sage-700 text-sm">
                      Após confirmar o pedido, você receberá um QR Code PIX para pagamento.
                    </p>
                  </div>
                )}
              </motion.div>
            </div>

            {/* Order Summary */}
            <div className="space-y-4">
              <div className="bg-cream-50 rounded-2xl border border-cream-300 p-6 sticky top-24">
                <h3 className="text-forest-900 font-semibold mb-4">Resumo do Pedido</h3>

                <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                        <Image src={item.imagem} alt={item.nome} fill className="object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-forest-900 text-sm truncate">{item.nome}</p>
                        <p className="text-forest-500 text-xs">Qty: {item.quantidade}</p>
                      </div>
                      <span className="text-terracotta-500 text-sm font-medium">
                        {formatCurrency(item.preco * item.quantidade)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-cream-300 pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-forest-500">Subtotal</span>
                    <span className="text-forest-900">{formatCurrency(total())}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-forest-500">Frete</span>
                    <span className="text-forest-900">A calcular</span>
                  </div>
                  <div className="flex justify-between font-semibold pt-2 border-t border-cream-300">
                    <span className="text-forest-900">Total</span>
                    <span className="text-terracotta-500 text-lg">{formatCurrency(total())}</span>
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="luxury"
                  size="lg"
                  className="w-full mt-6"
                  disabled={loading}
                >
                  {loading ? 'Processando...' : 'Confirmar Pedido'}
                </Button>

                <p className="text-forest-400 text-xs text-center mt-3">
                  Seus dados estão protegidos
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
