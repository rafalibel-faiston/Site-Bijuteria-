import Link from 'next/link'
import { Gem, Instagram, Facebook, Mail, Phone, MapPin } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-forest-950 border-t border-forest-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-terracotta-500 to-sage-600 rounded-full flex items-center justify-center">
                <Gem className="w-4 h-4 text-cream-50" />
              </div>
              <span className="font-heading text-xl font-bold text-cream-50">
                Charme <span className="text-terracotta-400">Final</span>
              </span>
            </div>
            <p className="text-cream-200 text-sm leading-relaxed mb-6">
              Joias e bijuterias de alta qualidade para momentos especiais.
              Elegância e sofisticação ao seu alcance.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-9 h-9 bg-forest-900 rounded-lg flex items-center justify-center text-cream-200 hover:text-terracotta-400 hover:bg-forest-800 transition-all">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 bg-forest-900 rounded-lg flex items-center justify-center text-cream-200 hover:text-terracotta-400 hover:bg-forest-800 transition-all">
                <Facebook className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Products */}
          <div>
            <h3 className="text-cream-50 font-semibold mb-4">Produtos</h3>
            <ul className="space-y-3">
              {['Anéis', 'Colares', 'Brincos', 'Pulseiras', 'Tornozeleiras', 'Conjuntos'].map((cat) => (
                <li key={cat}>
                  <Link
                    href={`/produtos?categoria=${cat}`}
                    className="text-cream-200 hover:text-terracotta-400 text-sm transition-colors"
                  >
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div>
            <h3 className="text-cream-50 font-semibold mb-4">Informações</h3>
            <ul className="space-y-3">
              {[
                { href: '#', label: 'Sobre Nós' },
                { href: '#', label: 'Política de Privacidade' },
                { href: '#', label: 'Trocas e Devoluções' },
                { href: '#', label: 'Prazo de Entrega' },
                { href: '#', label: 'Formas de Pagamento' },
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-cream-200 hover:text-terracotta-400 text-sm transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-cream-50 font-semibold mb-4">Contato</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-cream-200 text-sm">
                <Mail className="w-4 h-4 text-terracotta-400 flex-shrink-0" />
                contato@charmefinal.com
              </li>
              <li className="flex items-center gap-3 text-cream-200 text-sm">
                <Phone className="w-4 h-4 text-terracotta-400 flex-shrink-0" />
                (11) 98765-4321
              </li>
              <li className="flex items-start gap-3 text-cream-200 text-sm">
                <MapPin className="w-4 h-4 text-terracotta-400 flex-shrink-0 mt-0.5" />
                São Paulo, SP - Brasil
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-forest-900 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sage-200 text-sm">
            © 2024 Charme Final Acessórios. Todos os direitos reservados.
          </p>
          <p className="text-sage-200/70 text-xs">
            Pagamentos seguros via PIX, Cartão e Boleto
          </p>
        </div>
      </div>
    </footer>
  )
}
