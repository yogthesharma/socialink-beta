'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { getSupabaseBrowser } from '@/lib/supabase/browser'
import { AuthError } from '@supabase/supabase-js'
import AvatarUpload from './components/AvatarUpload'

// Define validation schema
const profileSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email').optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  avatar_url: z.string().optional(),
})

type ProfileFormValues = z.infer<typeof profileSchema>
type FormField = keyof ProfileFormValues

export default function ProfilePage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const supabase = getSupabaseBrowser()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setError,
    setValue,
  } = useForm<ProfileFormValues>()

  // Load user profile data
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        // Get user session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()

        if (sessionError) throw sessionError
        if (!session?.user) {
          throw new Error('No user session found')
        }

        setUserId(session.user.id)

        // Get user profile from our custom users table
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single()

        if (userError) throw userError

        // Set avatar URL
        setAvatarUrl(userData.avatar_url)

        // Reset form with user data
        reset({
          fullName: userData.full_name || '',
          email: userData.email || '',
          phone: userData.phone_number || '',
          address: userData.address || '',
          avatar_url: userData.avatar_url || '',
        })
      } catch (err) {
        console.error('Error loading profile:', err)
        setMessage({
          type: 'error',
          text: 'Failed to load profile. Please try again later.'
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadUserProfile()
  }, [supabase, reset])

  const handleAvatarUpload = (url: string) => {
    setAvatarUrl(url)
    setValue('avatar_url', url)
  }

  const onSubmit = async (data: ProfileFormValues) => {
    // Manual validation
    try {
      profileSchema.parse(data)
    } catch (error) {
      if (error instanceof z.ZodError) {
        error.errors.forEach((err) => {
          if (err.path && err.path.length > 0) {
            const fieldName = err.path[0] as FormField
            setError(fieldName, {
              type: 'manual',
              message: err.message
            })
          }
        })
      }
      return
    }

    setIsSaving(true)
    setMessage(null)

    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError) throw userError
      if (!user) throw new Error('No user found')

      // Update auth metadata (this will trigger our database update trigger)
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          full_name: data.fullName,
          avatar_url: data.avatar_url,
        }
      })

      if (updateError) throw updateError

      // Update additional fields in users table that aren't in auth metadata
      const { error: profileError } = await supabase
        .from('users')
        .update({
          phone_number: data.phone,
          address: data.address,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (profileError) throw profileError

      setMessage({
        type: 'success',
        text: 'Profile updated successfully!'
      })
    } catch (err) {
      console.error('Error updating profile:', err)
      let errorMessage = 'Failed to update profile. Please try again.'

      if (err instanceof AuthError) {
        errorMessage = err.message
      } else if (err instanceof Error) {
        errorMessage = err.message
      }

      setMessage({
        type: 'error',
        text: errorMessage
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Your Profile</h1>

        {message && (
          <div className={`mb-6 p-3 rounded ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
            {message.text}
          </div>
        )}

        {userId && (
          <div className="mb-8 flex justify-center">
            <AvatarUpload
              uid={userId}
              url={avatarUrl}
              onUpload={handleAvatarUpload}
            />
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Full Name Field */}
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
              Full Name
            </label>
            <input
              id="fullName"
              type="text"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              {...register('fullName')}
            />
            {errors.fullName && (
              <p className="mt-1 text-sm text-red-600">{errors.fullName.message}</p>
            )}
          </div>

          {/* Email Field - Read Only */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50"
              {...register('email')}
              disabled
            />
            <p className="mt-1 text-sm text-gray-500">Email cannot be changed</p>
          </div>

          {/* Phone Number Field */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              Phone Number
            </label>
            <input
              id="phone"
              type="tel"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              {...register('phone')}
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
            )}
          </div>

          {/* Address Field */}
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700">
              Address
            </label>
            <textarea
              id="address"
              rows={3}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              {...register('address')}
            />
            {errors.address && (
              <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
            )}
          </div>

          {/* Hidden field for avatar URL */}
          <input type="hidden" {...register('avatar_url')} />

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}