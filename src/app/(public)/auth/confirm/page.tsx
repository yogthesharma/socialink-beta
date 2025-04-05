'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { getSupabaseBrowser } from '@/lib/supabase/browser'

export default function ConfirmPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const statusParam = searchParams.get('status')
  const tokenParam = searchParams.get('token')

  const [isLoading, setIsLoading] = useState(true)
  const [status, setStatus] = useState<'success' | 'error' | 'loading'>('loading')
  const [message, setMessage] = useState<string>('')
  const supabase = getSupabaseBrowser()

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // If we were redirected here with a success status, we know it worked
        if (statusParam === 'success') {
          setStatus('success')
          setMessage('Your email has been verified successfully!')
          setIsLoading(false)

          // Redirect to dashboard after 3 seconds
          setTimeout(() => {
            router.push('/dashboard')
          }, 3000)
          return
        }

        // If we have a token in the URL, try to verify it on the client side
        if (tokenParam) {
          try {
            const { error } = await supabase.auth.verifyOtp({
              token_hash: tokenParam,
              type: 'email'
            })

            if (error) {
              throw error
            }

            setStatus('success')
            setMessage('Your email has been verified successfully!')

            // Redirect to dashboard after 3 seconds
            setTimeout(() => {
              router.push('/dashboard')
            }, 3000)
            return
          } catch (error) {
            console.error('Token verification error:', error)
            setStatus('error')
            setMessage('Email verification failed. The link may be invalid or expired.')
            return
          } finally {
            setIsLoading(false)
          }
        }

        // Otherwise, check if the user is already authenticated
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          throw error
        }

        // If we have a session, the user has been verified
        if (data.session) {
          setStatus('success')
          setMessage('Your email has been verified successfully!')

          // Redirect to dashboard after 3 seconds
          setTimeout(() => {
            router.push('/dashboard')
          }, 3000)
        } else {
          // No session found
          setStatus('error')
          setMessage('Email verification failed. The link may have expired.')
        }
      } catch (err) {
        console.error('Confirmation error:', err)
        setStatus('error')
        setMessage(err instanceof Error ? err.message : 'There was a problem verifying your email.')
      } finally {
        setIsLoading(false)
      }
    }

    checkAuthStatus()
  }, [router, statusParam, tokenParam, supabase.auth])

  if (isLoading || status === 'loading') {
    return (
      <div className="max-w-md mx-auto py-12 text-center">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold mb-4">Verifying Your Email</h1>
          <p className="text-gray-600 mb-4">Please wait while we verify your email address...</p>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="max-w-md mx-auto py-12">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <svg
            className="mx-auto h-16 w-16 text-red-500 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h1 className="text-2xl font-bold mb-4">Verification Failed</h1>
          <p className="text-red-600 mb-6">{message}</p>
          <Link
            href="/register"
            className="inline-block py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Sign Up Again
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto py-12">
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <svg
          className="mx-auto h-16 w-16 text-green-500 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
        <h1 className="text-2xl font-bold mb-4">Email Verified!</h1>
        <p className="text-gray-600 mb-6">
          Thank you for verifying your email address. Your account is now active.
        </p>
        <p className="text-gray-600 mb-6">
          You&apos;ll be redirected to your dashboard shortly...
        </p>
        <Link
          href="/dashboard"
          className="inline-block py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  )
}