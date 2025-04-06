import Link from 'next/link'

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center translate-y-1/2">
      <main className="flex flex-col items-center justify-center flex-1 px-20 text-center">
        <h1 className="text-6xl font-bold">
          Welcome to{' '}
          <span className="text-blue-600">
            Your App
          </span>
        </h1>

        <p className="mt-3 text-2xl">
          A Next.js boilerplate with TypeScript and Supabase authentication
        </p>

        <div className="flex gap-4 flex-wrap items-center justify-around max-w-4xl mt-6 sm:w-full">
          <Link
            href="/login"
            className="p-6 mt-6 text-left border w-96 rounded-xl hover:text-blue-600 focus:text-blue-600 hover:shadow-2xl"
          >
            <h3 className="text-2xl font-bold">Login &rarr;</h3>
            <p className="mt-4 text-xl">
              Sign in to your account and access your dashboard.
            </p>
          </Link>

          <Link
            href="/register"
            className="p-6 mt-6 text-left border w-96 rounded-xl hover:text-blue-600 focus:text-blue-600 hover:shadow-2xl"
          >
            <h3 className="text-2xl font-bold">Register &rarr;</h3>
            <p className="mt-4 text-xl">
              Create a new account to get started.
            </p>
          </Link>
        </div>
      </main>
    </div>
  )
}