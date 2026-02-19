'use client'

import { useState, useRef, useCallback } from 'react'
import exifr from 'exifr'
import type { TreeImage } from '@/lib/types'

interface ImageUploadProps {
  treeId: string
  onUploaded: (image: TreeImage) => void
}

type UploadState = 'idle' | 'dragging' | 'uploading'

const ANGLE_OPTIONS = [
  { value: '', label: 'No angle' },
  { value: 'front', label: 'Front' },
  { value: 'back', label: 'Back' },
  { value: 'left', label: 'Left' },
  { value: 'right', label: 'Right' },
  { value: 'top', label: 'Top' },
  { value: 'detail', label: 'Detail' },
  { value: 'roots', label: 'Roots' },
  { value: 'canopy', label: 'Canopy' },
  { value: 'full', label: 'Full' },
]

export function ImageUpload({ treeId, onUploaded }: ImageUploadProps) {
  const [state, setState] = useState<UploadState>('idle')
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [caption, setCaption] = useState('')
  const [angle, setAngle] = useState('')
  const [takenAt, setTakenAt] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const reset = useCallback(() => {
    setState('idle')
    setError(null)
    setPreview(null)
    setCaption('')
    setAngle('')
    setTakenAt('')
    setSelectedFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }, [])

  const handleFile = useCallback(async (file: File) => {
    setError(null)

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('Image must be under 10 MB')
      return
    }

    setSelectedFile(file)

    // Extract EXIF capture date
    try {
      const exif = await exifr.parse(file, ['DateTimeOriginal', 'CreateDate', 'DateTimeDigitized'])
      const exifDate = exif?.DateTimeOriginal ?? exif?.CreateDate ?? exif?.DateTimeDigitized
      if (exifDate instanceof Date && !isNaN(exifDate.getTime())) {
        const yyyy = exifDate.getFullYear()
        const mm = String(exifDate.getMonth() + 1).padStart(2, '0')
        const dd = String(exifDate.getDate()).padStart(2, '0')
        setTakenAt(`${yyyy}-${mm}-${dd}`)
      }
    } catch {
      // EXIF extraction is best-effort — ignore failures
    }

    const reader = new FileReader()
    reader.onload = (e) => setPreview(e.target?.result as string)
    reader.readAsDataURL(file)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setState('idle')
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [handleFile])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setState('dragging')
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setState('idle')
  }, [])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }, [handleFile])

  const handleUpload = async () => {
    if (!selectedFile) return

    setState('uploading')
    setError(null)

    const formData = new FormData()
    formData.append('file', selectedFile)
    formData.append('tree_id', treeId)
    if (caption) formData.append('caption', caption)
    if (angle) formData.append('angle', angle)
    if (takenAt) formData.append('taken_at', takenAt)

    try {
      const res = await fetch('/api/images', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Upload failed')
        setState('idle')
        return
      }

      onUploaded(data.image)
      reset()
    } catch {
      setError('Upload failed. Please try again.')
      setState('idle')
    }
  }

  return (
    <div className="space-y-4">
      {/* Drop zone / preview */}
      {preview ? (
        <div className="relative">
          <img
            src={preview}
            alt="Preview"
            className="max-h-64 w-full rounded-lg border border-[var(--border)] object-contain bg-[var(--surface)]"
          />
          <button
            onClick={reset}
            className="absolute top-2 right-2 rounded-full bg-[var(--background)]/80 p-1.5 text-[var(--muted)] backdrop-blur-sm transition-colors hover:text-[var(--foreground)]"
            aria-label="Remove image"
          >
            <XIcon className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`flex h-40 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition-colors ${
            state === 'dragging'
              ? 'border-[var(--accent)] bg-[var(--accent)]/5'
              : 'border-[var(--border)] hover:border-[var(--accent)]/50'
          }`}
          role="button"
          tabIndex={0}
          aria-label="Upload image"
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click() }}
        >
          <UploadIcon className="mb-2 h-8 w-8 text-[var(--muted)]" />
          <p className="text-sm text-[var(--muted)]">
            Drop an image here or <span className="text-[var(--accent)] underline">browse</span>
          </p>
          <p className="mt-1 text-xs text-[var(--muted)]/60">JPEG, PNG, WebP · Max 10 MB</p>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heic"
        onChange={handleInputChange}
        className="hidden"
        aria-label="Select image file"
      />

      {/* Metadata fields */}
      {selectedFile && (
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="block">
            <span className="text-xs font-medium text-[var(--muted)]">Caption</span>
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="A note about this photo..."
              className="field-input mt-1"
            />
          </label>

          <label className="block">
            <span className="text-xs font-medium text-[var(--muted)]">Angle</span>
            <select
              value={angle}
              onChange={(e) => setAngle(e.target.value)}
              className="field-input mt-1"
            >
              {ANGLE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-xs font-medium text-[var(--muted)]">Date taken</span>
            <input
              type="date"
              value={takenAt}
              onChange={(e) => setTakenAt(e.target.value)}
              className="field-input mt-1"
            />
          </label>
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      {/* Upload button */}
      {selectedFile && (
        <button
          onClick={handleUpload}
          disabled={state === 'uploading'}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--accent)] px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50 sm:w-auto"
        >
          {state === 'uploading' ? (
            <>
              <SpinnerIcon className="h-4 w-4 animate-spin" />
              Uploading…
            </>
          ) : (
            <>
              <UploadIcon className="h-4 w-4" />
              Upload Photo
            </>
          )}
        </button>
      )}
    </div>
  )
}

// ─── Icons ────────────────────────────────────────────────────

function XIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

function UploadIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  )
}

function SpinnerIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className={className}>
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  )
}
