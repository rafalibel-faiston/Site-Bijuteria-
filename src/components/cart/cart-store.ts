import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
  id: string
  nome: string
  preco: number
  imagem: string
  quantidade: number
  slug: string
}

interface CartStore {
  items: CartItem[]
  isOpen: boolean
  addItem: (item: Omit<CartItem, 'quantidade'>) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantidade: number) => void
  clearCart: () => void
  openCart: () => void
  closeCart: () => void
  toggleCart: () => void
  total: () => number
  totalItems: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (item) => {
        const existing = get().items.find((i) => i.id === item.id)
        if (existing) {
          set({
            items: get().items.map((i) =>
              i.id === item.id ? { ...i, quantidade: i.quantidade + 1 } : i
            ),
            isOpen: true,
          })
        } else {
          set({
            items: [...get().items, { ...item, quantidade: 1 }],
            isOpen: true,
          })
        }
      },

      removeItem: (id) => {
        set({ items: get().items.filter((i) => i.id !== id) })
      },

      updateQuantity: (id, quantidade) => {
        if (quantidade <= 0) {
          get().removeItem(id)
          return
        }
        set({
          items: get().items.map((i) =>
            i.id === id ? { ...i, quantidade } : i
          ),
        })
      },

      clearCart: () => set({ items: [] }),

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set({ isOpen: !get().isOpen }),

      total: () =>
        get().items.reduce((sum, item) => sum + item.preco * item.quantidade, 0),

      totalItems: () =>
        get().items.reduce((sum, item) => sum + item.quantidade, 0),
    }),
    {
      name: 'bijuteria-cart',
    }
  )
)
