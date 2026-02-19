'use client'

import { useState } from 'react'
import type { TreeImage } from '@/lib/types'

interface ImageGalleryProps {
  images: TreeImage[]
  treeName: string
  thumbnailId?: string | null
  onDelete?: (imageId: string) => void
  onSetThumbnail?: (imageId: string | null) => void
  deletingId?: string | null
}

export function ImageGallery({ images, treeName, thumbnailId, onDelete, onSetThumbnail, deletingId }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  if (images.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center rounded-xl border-2 border-dashed border-[var(--border)]">
        <p className="text-sm text-[var(--muted)]">No photos yet</p>
      </div>
    )
  }

  return (
    <>
      {/* Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {images.map((image, i) => (
          <button
            key={image.id}
            onClick={() => setSelectedIndex(i)}
            className="group relative aspect-square overflow-hidden rounded-lg border border-[var(--border)] transition-shadow hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2"
          >
            <img
              src={image.url}
              alt={image.caption ?? `${treeName} photo`}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
            />
            {thumbnailId === image.id && (
              <span className="absolute top-1.5 left-1.5 flex items-center gap-1 rounded bg-[var(--accent)]/90 px-1.5 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
                <StarIcon className="h-3 w-3" />
                Thumbnail
              </span>
            )}
            {image.taken_at && (
              <span className="absolute bottom-1.5 left-1.5 rounded bg-[var(--background)]/80 px-1.5 py-0.5 text-[10px] text-[var(--muted)] backdrop-blur-sm">
                {formatDate(image.taken_at)}
              </span>
            )}
            {image.angle && (
              <span className="absolute top-1.5 right-1.5 rounded bg-[var(--background)]/80 px-1.5 py-0.5 text-[10px] capitalize text-[var(--muted)] backdrop-blur-sm">
                {image.angle}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {selectedIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => setSelectedIndex(null)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') setSelectedIndex(null)
            if (e.key === 'ArrowRight' && selectedIndex < images.length - 1) setSelectedIndex(selectedIndex + 1)
            if (e.key === 'ArrowLeft' && selectedIndex > 0) setSelectedIndex(selectedIndex - 1)
          }}
          role="dialog"
          aria-label="Image lightbox"
          tabIndex={0}
        >
          <button
            className="absolute top-4 right-4 rounded-full p-2 text-white/70 transition-colors hover:text-white"
            onClick={() => setSelectedIndex(null)}
            aria-label="Close"
          >
            <XIcon className="h-6 w-6" />
          </button>

          {/* Previous */}
          {selectedIndex > 0 && (
            <button
              className="absolute left-4 rounded-full p-2 text-white/70 transition-colors hover:text-white"
              onClick={(e) => { e.stopPropagation(); setSelectedIndex(selectedIndex - 1) }}
              aria-label="Previous image"
            >
              <ChevronIcon className="h-8 w-8 rotate-180" />
            </button>
          )}

          {/* Image */}
          <div className="max-h-[85vh] max-w-[90vw]" onClick={(e) => e.stopPropagation()}>
            <img
              src={images[selectedIndex].url}
              alt={images[selectedIndex].caption ?? `${treeName} photo`}
              className="max-h-[85vh] max-w-[90vw] rounded-lg object-contain"
            />
            <div className="mt-3 text-center">
              {images[selectedIndex].caption && (
                <p className="text-sm text-white/90">{images[selectedIndex].caption}</p>
              )}
              {images[selectedIndex].taken_at && (
                <p className="mt-1 text-xs text-white/50">{formatDate(images[selectedIndex].taken_at!)}</p>
              )}
              <div className="mt-3 flex items-center justify-center gap-3">
                {onSetThumbnail && (
                  thumbnailId === images[selectedIndex].id ? (
                    <button
                      onClick={(e) => { e.stopPropagation(); onSetThumbnail(null) }}
                      className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs text-[var(--accent)] transition-colors hover:bg-white/10"
                    >
                      <StarFilledIcon className="h-3.5 w-3.5" />
                      Thumbnail
                    </button>
                  ) : (
                    <button
                      onClick={(e) => { e.stopPropagation(); onSetThumbnail(images[selectedIndex].id) }}
                      className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                    >
                      <StarIcon className="h-3.5 w-3.5" />
                      Set as thumbnail
                    </button>
                  )
                )}
                {onDelete && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      const img = images[selectedIndex]
                      setSelectedIndex(null)
                      onDelete(img.id)
                    }}
                    disabled={deletingId === images[selectedIndex].id}
                    className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs text-red-400 transition-colors hover:bg-red-500/20 hover:text-red-300 disabled:opacity-50"
                    aria-label="Delete image"
                  >
                    <TrashIcon className="h-3.5 w-3.5" />
                    Delete
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Next */}
          {selectedIndex < images.length - 1 && (
            <button
              className="absolute right-4 rounded-full p-2 text-white/70 transition-colors hover:text-white"
              onClick={(e) => { e.stopPropagation(); setSelectedIndex(selectedIndex + 1) }}
              aria-label="Next image"
            >
              <ChevronIcon className="h-8 w-8" />
            </button>
          )}
        </div>
      )}
    </>
  )
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  })
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="9 18 15 12 9 6" />
    </svg>
  )
}

function StarIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  )
}

function StarFilledIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  )
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  )
}
