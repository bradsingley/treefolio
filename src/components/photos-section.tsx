'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ImageGallery } from '@/components/image-gallery'
import { ImageUpload } from '@/components/image-upload'
import type { TreeImage } from '@/lib/types'

interface PhotosSectionProps {
  treeId: string
  treeName: string
  initialImages: TreeImage[]
  thumbnailId: string | null
}

export function PhotosSection({ treeId, treeName, initialImages, thumbnailId }: PhotosSectionProps) {
  const router = useRouter()
  const [images, setImages] = useState(initialImages)
  const [showUpload, setShowUpload] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [currentThumbnailId, setCurrentThumbnailId] = useState(thumbnailId)

  const handleUploaded = useCallback((image: TreeImage) => {
    setImages((prev) => [image, ...prev])
    setShowUpload(false)
    router.refresh()
  }, [router])

  const handleDelete = useCallback(async (imageId: string) => {
    if (!confirm('Delete this photo?')) return

    setDeletingId(imageId)
    try {
      const { deleteImageAction } = await import('@/lib/actions')
      await deleteImageAction(imageId, treeId)
      setImages((prev) => prev.filter((img) => img.id !== imageId))
      if (currentThumbnailId === imageId) setCurrentThumbnailId(null)
      router.refresh()
    } catch {
      alert('Failed to delete image')
    } finally {
      setDeletingId(null)
    }
  }, [treeId, router, currentThumbnailId])

  const handleSetThumbnail = useCallback(async (imageId: string | null) => {
    try {
      const { setThumbnailAction } = await import('@/lib/actions')
      await setThumbnailAction(treeId, imageId)
      setCurrentThumbnailId(imageId)
      router.refresh()
    } catch {
      alert('Failed to set thumbnail')
    }
  }, [treeId, router])

  return (
    <div className="space-y-4">
      {/* Upload toggle */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setShowUpload(!showUpload)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] px-3 py-1.5 text-sm text-[var(--muted)] transition-colors hover:border-[var(--accent)] hover:text-[var(--foreground)]"
        >
          {showUpload ? (
            <>
              <MinusIcon className="h-3.5 w-3.5" />
              Cancel
            </>
          ) : (
            <>
              <PlusIcon className="h-3.5 w-3.5" />
              Add Photo
            </>
          )}
        </button>
        <span className="text-xs text-[var(--muted)]">
          {images.length} photo{images.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Upload form */}
      {showUpload && (
        <div className="animate-fade-in rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
          <ImageUpload treeId={treeId} onUploaded={handleUploaded} />
        </div>
      )}

      {/* Gallery with delete */}
      <ImageGallery
        images={images}
        treeName={treeName}
        thumbnailId={currentThumbnailId}
        onDelete={handleDelete}
        onSetThumbnail={handleSetThumbnail}
        deletingId={deletingId}
      />
    </div>
  )
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}

function MinusIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}
