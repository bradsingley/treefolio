'use client'

import { useState } from 'react'
import type { Species, Tree } from '@/lib/types'

interface TreeFormProps {
  species: Species[]
  action: (formData: FormData) => void
  defaultValues?: Partial<Tree>
  submitLabel?: string
}

const bonsaiStyles = [
  'chokkan (formal upright)',
  'moyogi (informal upright)',
  'shakan (slanting)',
  'kengai (cascade)',
  'han-kengai (semi-cascade)',
  'bunjin (literati)',
  'fukinagashi (windswept)',
  'hokidachi (broom)',
  'sekijoju (root-over-rock)',
  'yose-ue (forest)',
  'sokan (twin trunk)',
  'ikadabuki (raft)',
]

const sizeClasses = [
  { value: 'mame', label: 'Mame (< 10 cm)' },
  { value: 'shohin', label: 'Shohin (10–20 cm)' },
  { value: 'kifu', label: 'Kifu (20–40 cm)' },
  { value: 'chuhin', label: 'Chuhin (40–60 cm)' },
  { value: 'dai', label: 'Dai (> 60 cm)' },
]

const sources = ['nursery', 'collected', 'gift', 'seed', 'cutting', 'auction', 'club']

export function TreeForm({ species, action, defaultValues, submitLabel = 'Add Tree' }: TreeFormProps) {
  const [addingNewSpecies, setAddingNewSpecies] = useState(false)

  const handleSpeciesChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setAddingNewSpecies(e.target.value === '__new__')
  }

  return (
    <form action={action} className="space-y-6">
      {/* Name */}
      <Field label="Name" required>
        <input
          name="name"
          type="text"
          required
          defaultValue={defaultValues?.name ?? ''}
          placeholder="Give your tree a name"
          className="field-input"
        />
      </Field>

      {/* Species */}
      <Field label="Species">
        <select
          name="species_id"
          aria-label="Species"
          defaultValue={defaultValues?.species_id ?? ''}
          onChange={handleSpeciesChange}
          className="field-input"
        >
          <option value="">Select a species…</option>
          {species.map((s) => (
            <option key={s.id} value={s.id}>
              {s.common_name} — {s.scientific_name}
            </option>
          ))}
          <option value="__new__">+ Add new species…</option>
        </select>
      </Field>

      {/* New species fields */}
      {addingNewSpecies && (
        <div className="grid grid-cols-2 gap-4 rounded-lg border border-dashed border-[var(--accent)]/40 bg-[var(--accent)]/5 p-4">
          <Field label="Common name" required>
            <input
              name="new_species_common"
              type="text"
              required
              placeholder="e.g. Japanese Maple"
              className="field-input"
            />
          </Field>
          <Field label="Scientific name" required>
            <input
              name="new_species_scientific"
              type="text"
              required
              placeholder="e.g. Acer palmatum"
              className="field-input"
            />
          </Field>
        </div>
      )}

      {/* Age + Acquired date — side by side */}
      <div className="grid grid-cols-2 gap-4">
        <Field label="Age at acquisition">
          <input
            name="age_years"
            type="number"
            min={0}
            defaultValue={defaultValues?.age_years ?? ''}
            placeholder="Estimated years"
            className="field-input"
          />
        </Field>
        <Field label="Acquired">
          <MonthYearPicker
            name="acquired_date"
            defaultValue={defaultValues?.acquired_date?.slice(0, 7) ?? ''}
          />
        </Field>
      </div>

      {/* Style + Size — side by side */}
      <div className="grid grid-cols-2 gap-4">
        <Field label="Style">
          <select name="style" aria-label="Bonsai style" defaultValue={defaultValues?.style ?? ''} className="field-input">
            <option value="">Select…</option>
            {bonsaiStyles.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </Field>
        <Field label="Size class">
          <select name="size_class" aria-label="Size class" defaultValue={defaultValues?.size_class ?? ''} className="field-input">
            <option value="">Select…</option>
            {sizeClasses.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </Field>
      </div>

      {/* Source */}
      <Field label="Source">
        <select name="source" aria-label="Source" defaultValue={defaultValues?.source ?? ''} className="field-input">
          <option value="">Select…</option>
          {sources.map((s) => (
            <option key={s} value={s} className="capitalize">{s}</option>
          ))}
        </select>
      </Field>

      {/* Pot + Soil — side by side */}
      <div className="grid grid-cols-2 gap-4">
        <Field label="Pot type">
          <input
            name="pot_type"
            type="text"
            defaultValue={defaultValues?.pot_type ?? ''}
            placeholder="e.g. unglazed oval"
            className="field-input"
          />
        </Field>
        <Field label="Soil mix">
          <input
            name="soil_mix"
            type="text"
            defaultValue={defaultValues?.soil_mix ?? ''}
            placeholder="e.g. akadama/pumice 2:1"
            className="field-input"
          />
        </Field>
      </div>

      {/* Description */}
      <Field label="Description">
        <textarea
          name="description"
          rows={3}
          defaultValue={defaultValues?.description ?? ''}
          placeholder="Notes about this tree — its history, personality, goals…"
          className="field-input resize-y"
        />
      </Field>

      {/* Submit */}
      <div className="flex items-center gap-4 pt-2">
        <button
          type="submit"
          className="rounded-lg bg-[var(--accent)] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 focus:ring-offset-[var(--background)]"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  )
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
        {label}
        {required && <span className="ml-0.5 text-red-500 dark:text-red-400">*</span>}
      </span>
      {children}
    </label>
  )
}

const MONTHS = [
  { value: '01', label: 'Jan' }, { value: '02', label: 'Feb' }, { value: '03', label: 'Mar' },
  { value: '04', label: 'Apr' }, { value: '05', label: 'May' }, { value: '06', label: 'Jun' },
  { value: '07', label: 'Jul' }, { value: '08', label: 'Aug' }, { value: '09', label: 'Sep' },
  { value: '10', label: 'Oct' }, { value: '11', label: 'Nov' }, { value: '12', label: 'Dec' },
]

function MonthYearPicker({ name, defaultValue }: { name: string; defaultValue: string }) {
  const [m, setM] = useState(defaultValue?.slice(5, 7) ?? '')
  const [y, setY] = useState(defaultValue?.slice(0, 4) ?? '')

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 50 }, (_, i) => String(currentYear - i))

  // Emit hidden input with YYYY-MM value
  const value = m && y ? `${y}-${m}` : ''

  return (
    <div className="flex gap-2">
      <input type="hidden" name={name} value={value} />
      <select
        value={m}
        onChange={(e) => setM(e.target.value)}
        aria-label="Month"
        className="field-input flex-1"
      >
        <option value="">Month</option>
        {MONTHS.map((mo) => (
          <option key={mo.value} value={mo.value}>{mo.label}</option>
        ))}
      </select>
      <select
        value={y}
        onChange={(e) => setY(e.target.value)}
        aria-label="Year"
        className="field-input flex-1"
      >
        <option value="">Year</option>
        {years.map((yr) => (
          <option key={yr} value={yr}>{yr}</option>
        ))}
      </select>
    </div>
  )
}
