'use client'

import { useState, useRef } from 'react'

interface JournalEntryFormProps {
  treeId: string
  onCreated: () => void
}

const ENTRY_TYPES = [
  { value: 'prune',     label: 'Pruned',       icon: '✂' },
  { value: 'repot',     label: 'Repotted',     icon: '🪴' },
  { value: 'water',     label: 'Watered',      icon: '💧' },
  { value: 'fertilize', label: 'Fertilized',   icon: '🌱' },
  { value: 'wire',      label: 'Wired',        icon: '🔧' },
  { value: 'defoliate', label: 'Defoliated',   icon: '🍂' },
  { value: 'style',     label: 'Styled',       icon: '🎨' },
  { value: 'photo',     label: 'Photo',        icon: '📷' },
  { value: 'health',    label: 'Health Check', icon: '🩺' },
  { value: 'note',      label: 'Note',         icon: '📝' },
] as const

export function JournalEntryForm({ treeId, onCreated }: JournalEntryFormProps) {
  const [selectedType, setSelectedType] = useState<string>('')
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const formRef = useRef<HTMLFormElement>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedType) return

    setSubmitting(true)
    setError(null)

    try {
      const { addJournalEntryAction } = await import('@/lib/actions')
      const formData = new FormData()
      formData.set('tree_id', treeId)
      formData.set('entry_type', selectedType)
      formData.set('content', content)
      await addJournalEntryAction(formData)

      setSelectedType('')
      setContent('')
      onCreated()
    } catch {
      setError('Failed to add entry. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
      {/* Entry type chips */}
      <fieldset>
        <legend className="mb-2 text-xs font-medium text-[var(--muted)]">What did you do?</legend>
        <div className="flex flex-wrap gap-2">
          {ENTRY_TYPES.map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() => setSelectedType(type.value)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors ${
                selectedType === type.value
                  ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--foreground)]'
                  : 'border-[var(--border)] text-[var(--muted)] hover:border-[var(--accent)]/50 hover:text-[var(--foreground)]'
              }`}
            >
              <span aria-hidden="true">{type.icon}</span>
              {type.label}
            </button>
          ))}
        </div>
      </fieldset>

      {/* Content */}
      {selectedType && (
        <div className="animate-fade-in">
          <label htmlFor="journal-content" className="mb-1 block text-xs font-medium text-[var(--muted)]">
            Notes <span className="font-normal">(optional)</span>
          </label>
          <textarea
            id="journal-content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Any details to remember..."
            rows={3}
            className="field-input resize-none"
          />
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      {/* Submit */}
      {selectedType && (
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center gap-2 rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-[var(--accent-fg)] transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {submitting ? 'Saving…' : 'Add Entry'}
        </button>
      )}
    </form>
  )
}
