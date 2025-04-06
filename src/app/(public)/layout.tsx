import Link from "next/link"

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="py-4 px-8 border-b">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">Your App Name</h1>
          <nav>
            <ul className="flex gap-4">
              <li><Link href="/" className="hover:underline">Home</Link></li>
              <li><a href="/login" className="hover:underline">Login</a></li>
              <li><a href="/register" className="hover:underline">Register</a></li>
            </ul>
          </nav>
        </div>
      </header>
      <main className="flex-1 container mx-auto py-8 px-4">
        {children}
      </main>
      <footer className="py-4 px-8 border-t">
        <div className="container mx-auto text-center text-sm text-gray-600">
          &copy; {new Date().getFullYear()} Your App Name. All rights reserved.
        </div>
      </footer>
    </div>
  )
}