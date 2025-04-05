import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()

  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-gray-100 p-4">
        <div className="mb-8">
          <h2 className="text-xl font-bold">Dashboard</h2>
        </div>
        <nav>
          <ul className="space-y-2">
            <li><a href="/dashboard" className="block p-2 hover:bg-gray-200 rounded">Dashboard</a></li>
            <li><a href="/profile" className="block p-2 hover:bg-gray-200 rounded">Profile</a></li>
            <li><a href="/settings" className="block p-2 hover:bg-gray-200 rounded">Settings</a></li>
          </ul>
        </nav>
      </aside>
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  )
}