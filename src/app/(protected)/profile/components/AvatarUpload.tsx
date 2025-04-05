'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { getSupabaseBrowser } from '@/lib/supabase/browser'
import { v4 as uuidv4 } from 'uuid'

interface AvatarUploadProps {
  uid: string
  url: string | null
  onUpload: (url: string) => void
}

export default function AvatarUpload({ uid, url, onUpload }: AvatarUploadProps) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = getSupabaseBrowser()

  useEffect(() => {
    if (url) {
      setAvatarUrl(url)
    }
  }, [url])

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true)
      setError(null)

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.')
      }

      const file = event.target.files[0]
      const fileExt = file.name.split('.').pop()
      const fileSize = file.size / 1024 / 1024 // in MB

      // Validate file
      if (!['jpg', 'jpeg', 'png', 'webp'].includes(fileExt?.toLowerCase() || '')) {
        throw new Error('Please upload a valid image file (jpg, jpeg, png, webp).')
      }

      if (fileSize > 2) {
        throw new Error('File size should be less than 2MB.')
      }

      // Create a unique file name
      const fileName = `${uid}/${uuidv4()}.${fileExt}`

      // Upload file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true })

      if (uploadError) {
        throw uploadError
      }

      // Get public URL
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName)

      // Update user avatar URL
      const newAvatarUrl = data.publicUrl

      // Update both in the database and in the state
      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: newAvatarUrl }
      })

      if (updateError) {
        throw updateError
      }

      setAvatarUrl(newAvatarUrl)
      onUpload(newAvatarUrl)
    } catch (err) {
      console.error('Error uploading avatar:', err)
      setError(err instanceof Error ? err.message : 'Error uploading avatar')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      {avatarUrl ? (
        <div className="relative w-32 h-32 rounded-full overflow-hidden">
          <Image
            src={avatarUrl}
            alt="Avatar"
            className="object-cover"
            width={128}
            height={128}
            priority
          />
        </div>
      ) : (
        <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center">
          <svg
            className="w-16 h-16 text-gray-400"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      )}

      <div>
        <label
          htmlFor="avatar-upload"
          className="cursor-pointer px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          {uploading ? 'Uploading...' : 'Change Avatar'}
        </label>
        <input
          id="avatar-upload"
          type="file"
          accept="image/*"
          onChange={uploadAvatar}
          disabled={uploading}
          className="sr-only"
        />
      </div>

      {error && (
        <div className="text-red-600 text-sm text-center max-w-xs">
          {error}
        </div>
      )}
    </div>
  )
}