import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(date))
}

export function formatDateTime(date: Date | string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export function slugify(text: string): string {
  return text
    .toString()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
}

export function generateOrderNumber(): string {
  const date = new Date()
  const year = date.getFullYear()
  const random = Math.floor(Math.random() * 9000) + 1000
  return `BJ-${year}-${random}`
}

export const statusLabels: Record<string, string> = {
  PENDENTE: 'Pendente',
  CONFIRMADO: 'Confirmado',
  PREPARANDO: 'Em Preparação',
  ENVIADO: 'Enviado',
  ENTREGUE: 'Entregue',
  CANCELADO: 'Cancelado',
}

export const statusColors: Record<string, string> = {
  PENDENTE: 'bg-yellow-100 text-yellow-800',
  CONFIRMADO: 'bg-blue-100 text-blue-800',
  PREPARANDO: 'bg-purple-100 text-purple-800',
  ENVIADO: 'bg-indigo-100 text-indigo-800',
  ENTREGUE: 'bg-green-100 text-green-800',
  CANCELADO: 'bg-red-100 text-red-800',
}

export const categorias = [
  'Anéis',
  'Colares',
  'Brincos',
  'Pulseiras',
  'Tornozeleiras',
  'Conjuntos',
]
