"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CreditCard, Barcode, QrCode, Loader2, CheckCircle2, Truck } from 'lucide-react'
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
  const [pagamento, setPagamento] = useState<'idle' | 'processando' | 'aprovado'>('idle')
  // Chave de idempotência: gerada uma vez por carregamento, evita pedido
  // duplicado em duplo-clique/retry de envio.
  const [idempotencyKey] = useState(() =>
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`
  )

  // Frete Correios
  interface ServicoFrete { servico: string; codigo: string; preco: string; prazo: string; estimado?: boolean }
  const [fretes, setFretes] = useState<ServicoFrete[]>([])
  const [freteSelecionado, setFreteSelecionado] = useState<ServicoFrete | null>(null)
  const [calculandoFrete, setCalculandoFrete] = useState(false)
  const [erroFrete, setErroFrete] = useState('')

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

  // Pré-preenche nome/email do cliente logado.
  const { data: session } = useSession()
  useEffect(() => {
    const u = session?.user as { name?: string | null; email?: string | null } | undefined
    if (u?.name) setValue('nome', u.name)
    if (u?.email) setValue('email', u.email)
  }, [session, setValue])

  const frete = freteSelecionado ? parseFloat(freteSelecionado.preco) : 0
  const totalComFrete = total() + frete

  const calcularFrete = async (cep: string) => {
    const clean = cep.replace(/\D/g, '')
    if (clean.length !== 8) return
    setCalculandoFrete(true)
    setErroFrete('')
    setFretes([])
    setFreteSelecionado(null)
    try {
      const res = await fetch('/api/correios/frete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cepDestino: clean,
          itens: items.map(item => ({ produtoId: item.id, quantidade: item.quantidade })),
        }),
      })
      const data = await res.json()
      const servicos: ServicoFrete[] = data.servicos || []
      setFretes(servicos)
      if (servicos.length > 0) setFreteSelecionado(servicos[0])
      else setErroFrete('Não foi possível calcular o frete para este CEP.')
    } catch {
      setErroFrete('Erro ao calcular o frete. Tente novamente.')
    } finally {
      setCalculandoFrete(false)
    }
  }

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
    // Calcula o frete assim que o CEP é informado.
    calcularFrete(clean)
  }

  const onSubmit = async (data: CheckoutForm) => {
    if (!freteSelecionado) {
      setErroFrete('Selecione uma opção de frete antes de continuar.')
      return
    }
    setLoading(true)
    setPagamento('processando')
    try {
      const response = await fetch('/api/pedidos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clienteNome: data.nome,
          clienteEmail: data.email,
          clienteTelefone: data.telefone,
          cep: data.cep,
          enderecoEntrega: {
            logradouro: data.logradouro,
            numero: data.numero,
            complemento: data.complemento,
            bairro: data.bairro,
            cidade: data.cidade,
            estado: data.estado,
          },
          formaPagamento: data.formaPagamento,
          servicoCorreios: freteSelecionado.servico,
          itens: items.map(item => ({
            produtoId: item.id,
            quantidade: item.quantidade,
            precoUnit: item.preco,
          })),
          subtotal: total(),
          frete,
          total: totalComFrete,
          idempotencyKey,
        }),
      })

      if (!response.ok) throw new Error('Falha ao criar pedido')

      const pedido = await response.json()
      clearCart()

      // Tenta abrir o checkout do gateway (Mercado Pago). Se não estiver
      // configurado, checkoutUrl vem null e seguimos para a confirmação.
      let checkoutUrl: string | null = null
      try {
        const r = await fetch('/api/pagamento/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pedidoId: pedido.id, token: pedido.acessoToken }),
        })
        if (r.ok) checkoutUrl = (await r.json()).checkoutUrl
      } catch {
        // ignora — cai no fluxo manual
      }

      if (checkoutUrl) {
        window.location.href = checkoutUrl // redireciona para o Mercado Pago
        return
      }

      setPagamento('aprovado')
      await new Promise((resolve) => setTimeout(resolve, 900))
      // Token de acesso para abrir a confirmação do próprio pedido (guest).
      router.push(`/pedidos/${pedido.id}${pedido.acessoToken ? `?t=${pedido.acessoToken}` : ''}`)
    } catch (error) {
      console.error(error)
      setPagamento('idle')
      setLoading(false)
      alert('Não foi possível finalizar o pedido. Tente novamente.')
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
      {/* Overlay de pagamento simulado (modo teste) */}
      {pagamento !== 'idle' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-forest-900/60 backdrop-blur-sm px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-cream-50 rounded-2xl border border-cream-300 p-8 text-center max-w-sm w-full shadow-xl"
          >
            {pagamento === 'processando' ? (
              <>
                <Loader2 className="w-12 h-12 text-terracotta-500 animate-spin mx-auto mb-4" />
                <p className="text-forest-900 font-semibold text-lg">Registrando seu pedido</p>
                <p className="text-forest-500 text-sm mt-1">Aguarde um instante...</p>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-12 h-12 text-sage-600 mx-auto mb-4" />
                <p className="text-forest-900 font-semibold text-lg">Pedido recebido!</p>
                <p className="text-forest-500 text-sm mt-1">Redirecionando para o seu pedido...</p>
              </>
            )}
          </motion.div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-heading text-4xl font-bold text-forest-900 mb-8">
          Finalizar <span className="text-gradient-brand">Compra</span>
        </h1>

        <div className="mb-6 p-3 rounded-xl bg-mustard-400/15 border border-mustard-400/30 text-sm text-forest-700">
          <strong className="font-semibold">Pagamento:</strong> ao confirmar, você é direcionado ao pagamento seguro (PIX, boleto ou cartão). O envio é liberado após a confirmação do pagamento.
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

              {/* Shipping (Correios) */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="bg-cream-50 rounded-2xl border border-cream-300 p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-forest-900 font-semibold text-lg">Entrega (Correios)</h2>
                  <button
                    type="button"
                    onClick={() => calcularFrete(watch('cep') || '')}
                    disabled={calculandoFrete}
                    className="text-sm text-terracotta-500 hover:text-terracotta-600 disabled:opacity-50"
                  >
                    {calculandoFrete ? 'Calculando...' : 'Recalcular'}
                  </button>
                </div>

                {calculandoFrete && (
                  <div className="flex items-center gap-2 text-forest-500 text-sm py-4">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Calculando frete pelos Correios...
                  </div>
                )}

                {!calculandoFrete && fretes.length === 0 && (
                  <p className="text-forest-500 text-sm py-2">
                    {erroFrete || 'Informe o CEP acima para calcular o frete.'}
                  </p>
                )}

                {!calculandoFrete && fretes.length > 0 && (
                  <div className="space-y-3">
                    {fretes.map((f) => {
                      const ativo = freteSelecionado?.codigo === f.codigo
                      return (
                        <label
                          key={f.codigo}
                          className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                            ativo ? 'border-terracotta-500 bg-terracotta-500/10' : 'border-cream-300 hover:border-sage-300'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="radio"
                              name="frete"
                              checked={ativo}
                              onChange={() => { setFreteSelecionado(f); setErroFrete('') }}
                              className="sr-only"
                            />
                            <Truck className={`w-5 h-5 ${ativo ? 'text-terracotta-500' : 'text-forest-400'}`} />
                            <div>
                              <p className={`text-sm font-medium ${ativo ? 'text-forest-900' : 'text-forest-600'}`}>
                                {f.servico}{f.estimado ? ' (estimado)' : ''}
                              </p>
                              <p className="text-xs text-forest-400">Entrega em até {f.prazo} dias úteis</p>
                            </div>
                          </div>
                          <span className={`text-sm font-semibold ${ativo ? 'text-terracotta-500' : 'text-forest-600'}`}>
                            {formatCurrency(parseFloat(f.preco))}
                          </span>
                        </label>
                      )
                    })}
                  </div>
                )}
                {erroFrete && fretes.length > 0 && (
                  <p className="text-red-400 text-xs mt-2">{erroFrete}</p>
                )}
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
                    <span className="text-forest-500">Frete{freteSelecionado ? ` (${freteSelecionado.servico})` : ''}</span>
                    <span className="text-forest-900">
                      {freteSelecionado ? formatCurrency(frete) : 'A calcular'}
                    </span>
                  </div>
                  <div className="flex justify-between font-semibold pt-2 border-t border-cream-300">
                    <span className="text-forest-900">Total</span>
                    <span className="text-terracotta-500 text-lg">{formatCurrency(totalComFrete)}</span>
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="luxury"
                  size="lg"
                  className="w-full mt-6"
                  disabled={loading || !freteSelecionado}
                >
                  {loading ? 'Processando...' : !freteSelecionado ? 'Calcule o frete' : 'Confirmar Pedido'}
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
