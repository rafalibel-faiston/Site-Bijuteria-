import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { AdminSidebar } from './admin-sidebar'

export const metadata = {
  title: 'Admin | Charme Final Acessórios',
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session) {
    redirect('/login')
  }

  if ((session.user as { role?: string })?.role !== 'ADMIN') {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-cream-100 flex">
      <AdminSidebar />
      <main className="flex-1 ml-64 p-8 text-gray-900">
        {children}
      </main>
    </div>
  )
}
