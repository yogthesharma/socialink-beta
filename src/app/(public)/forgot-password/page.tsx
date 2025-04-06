'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { AuthError } from '@supabase/supabase-js'
import { getSupabaseBrowser } from '@/lib/supabase/browser'

// Define validation schema
const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>
type FormField = keyof ForgotPasswordFormValues

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const supabase = getSupabaseBrowser()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<ForgotPasswordFormValues>({
    defaultValues: {
      email: '',
    },
  })

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    // Manual validation
    try {
      forgotPasswordSchema.parse(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        error.errors.forEach((err) => {
          if (err.path && err.path.length > 0) {
            const fieldName = err.path[0] as FormField;
            setError(fieldName, {
              type: 'manual',
              message: err.message
            });
          }
        });
      }
      return;
    }

    setIsLoading(true)
    setServerError(null)

    try {
      // Send password reset email with Supabase Auth
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        data.email,
        {
          redirectTo: `${window.location.origin}/reset-password`,
        }
      )

      if (resetError) throw resetError

      // Show success message
      setIsSuccess(true)

    } catch (err) {
      if (err instanceof AuthError) {
        setServerError(err.message)
      } else if (err instanceof Error) {
        setServerError(err.message)
      } else {
        setServerError('An unexpected error occurred.')
      }
      console.error('Password reset error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto py-8">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Reset Password</h1>

        {isSuccess ? (
          <div className="text-center">
            <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
              Password reset email sent! Please check your inbox and follow the instructions.
            </div>
            <p className="mt-4 text-gray-600">
              Didn&apos;t receive the email? Check your spam folder or{" "}
              <button
                onClick={() => setIsSuccess(false)}
                className="text-blue-600 hover:underline"
              >
                try again
              </button>.
            </p>
            <div className="mt-6">
              <Link
                href="/login"
                className="text-blue-600 hover:underline"
              >
                Return to login
              </Link>
            </div>
          </div>
        ) : (
          <>
            {serverError && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {serverError}
              </div>
            )}

            <p className="mb-4 text-gray-600">
              Enter your email address and we&apos;ll send you a link to reset your password.
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="your@email.com"
                  {...register('email')}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </div>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                <Link href="/login" className="font-medium text-blue-600 hover:underline">
                  Return to login
                </Link>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}