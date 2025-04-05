import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()

  const { data: { session } } = await supabase.auth.getSession()

  const isAdmin = session?.user?.email?.endsWith('@youradmindomain.com')

  if (!session || !isAdmin) {
    redirect('/dashboard')
  }

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-gray-800 text-white p-4">
        <div className="mb-8">
          <h2 className="text-xl font-bold">Admin Panel</h2>
        </div>
        <nav>
          <ul className="space-y-2">
            <li><a href="/admin/dashboard" className="block p-2 hover:bg-gray-700 rounded">Dashboard</a></li>
            <li><a href="/admin/users" className="block p-2 hover:bg-gray-700 rounded">Users</a></li>
            <li><a href="/admin/settings" className="block p-2 hover:bg-gray-700 rounded">Settings</a></li>
          </ul>
        </nav>
      </aside>
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  )
}