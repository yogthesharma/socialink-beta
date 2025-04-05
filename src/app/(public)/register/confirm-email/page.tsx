'use client'

import { useState } from 'react'
import Link from 'next/link'
import { AuthError } from '@supabase/supabase-js'
import { getSupabaseBrowser } from '@/lib/supabase/browser'

export default function ConfirmEmailPage() {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = getSupabaseBrowser()

  const handleResendEmail = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email) {
      setError('Please enter your email address')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email
      })

      if (resendError) throw resendError

      setIsSuccess(true)
    } catch (err) {
      // Type guard for AuthError
      if (err instanceof AuthError) {
        setError(err.message)
      } else if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Failed to resend confirmation email.')
      }
      console.error('Error resending confirmation email:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-md mx-auto py-12">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <div className="text-center mb-6">
          <svg
            className="mx-auto h-14 w-14 text-green-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
          <h2 className="text-2xl font-bold mt-2">Check your email</h2>
        </div>

        <p className="text-gray-600 mb-6 text-center">
          We&apos;ve sent a confirmation link to your email address.
          Please click the link to verify your account.
        </p>

        {isSuccess ? (
          <div className="mb-6 p-3 bg-green-100 border border-green-400 text-green-700 rounded text-center">
            Confirmation email resent successfully.
          </div>
        ) : (
          <>
            {error && (
              <div className="mb-6 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-center">
                {error}
              </div>
            )}

            <div className="mt-6">
              <p className="text-center text-sm text-gray-600 mb-4">
                Didn&apos;t receive the email? Check your spam folder or resend below.
              </p>

              <form onSubmit={handleResendEmail} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Your Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your email"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Sending...' : 'Resend Confirmation Email'}
                </button>
              </form>
            </div>
          </>
        )}

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            <Link href="/login" className="font-medium text-blue-600 hover:underline">
              Return to login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}