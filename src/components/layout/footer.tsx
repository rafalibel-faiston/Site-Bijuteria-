import Link from 'next/link'
import { Gem, Instagram, Facebook, Mail, Phone, MapPin } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-dark-950 border-t border-dark-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-gold-400 to-gold-600 rounded-full flex items-center justify-center">
                <Gem className="w-4 h-4 text-dark-900" />
              </div>
              <span className="font-heading text-xl font-bold text-white">
                Bella <span className="text-gold-500">Bijuteria</span>
              </span>
            </div>
            <p className="text-dark-400 text-sm leading-relaxed mb-6">
              Joias e bijuterias de alta qualidade para momentos especiais.
              Elegância e sofisticação ao seu alcance.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-9 h-9 bg-dark-800 rounded-lg flex items-center justify-center text-dark-400 hover:text-gold-500 hover:bg-dark-700 transition-all">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 bg-dark-800 rounded-lg flex items-center justify-center text-dark-400 hover:text-gold-500 hover:bg-dark-700 transition-all">
                <Facebook className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Products */}
          <div>
            <h3 className="text-white font-semibold mb-4">Produtos</h3>
            <ul className="space-y-3">
              {['Anéis', 'Colares', 'Brincos', 'Pulseiras', 'Tornozeleiras', 'Conjuntos'].map((cat) => (
                <li key={cat}>
                  <Link
                    href={`/produtos?categoria=${cat}`}
                    className="text-dark-400 hover:text-gold-400 text-sm transition-colors"
                  >
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div>
            <h3 className="text-white font-semibold mb-4">Informações</h3>
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
                    className="text-dark-400 hover:text-gold-400 text-sm transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contato</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-dark-400 text-sm">
                <Mail className="w-4 h-4 text-gold-500 flex-shrink-0" />
                contato@bellabijuteria.com
              </li>
              <li className="flex items-center gap-3 text-dark-400 text-sm">
                <Phone className="w-4 h-4 text-gold-500 flex-shrink-0" />
                (11) 98765-4321
              </li>
              <li className="flex items-start gap-3 text-dark-400 text-sm">
                <MapPin className="w-4 h-4 text-gold-500 flex-shrink-0 mt-0.5" />
                São Paulo, SP - Brasil
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-dark-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-dark-500 text-sm">
            © 2024 Bella Bijuteria. Todos os direitos reservados.
          </p>
          <p className="text-dark-600 text-xs">
            Pagamentos seguros via PIX, Cartão e Boleto
          </p>
        </div>
      </div>
    </footer>
  )
}
