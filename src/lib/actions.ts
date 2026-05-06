'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { apiFetch, getServerCookies } from '@/lib/api-client'
import type { TreeInsert, TreeUpdate } from '@/lib/types'

async function authedFetch<T>(path: string, opts: { method?: string; body?: unknown } = {}): Promise<T> {
  const cookie = await getServerCookies()
  return apiFetch<T>(path, { ...opts, cookie })
}

async function resolveSpeciesId(formData: FormData): Promise<string | null> {
  const speciesId = formData.get('species_id') as string
  if (speciesId !== '__new__') return speciesId || null

  const commonName = (formData.get('new_species_common') as string)?.trim()
  const scientificName = (formData.get('new_species_scientific') as string)?.trim()
  if (!commonName || !scientificName) return null

  const res = await authedFetch<{ species: { id: string } }>('/treefolio/species', {
    method: 'POST',
    body: { common_name: commonName, scientific_name: scientificName },
  })
  return res.species.id
}

/** Normalize YYYY-MM to YYYY-MM-01 for Postgres DATE columns. */
function toDate(val: string | null): string | null {
  if (!val) return null
  return val.length === 7 ? val + '-01' : val
}

export async function createTreeAction(formData: FormData) {
  const speciesId = await resolveSpeciesId(formData)

  const tree = {
    name: formData.get('name') as string,
    species_id: speciesId,
    age_years: formData.get('age_years') ? Number(formData.get('age_years')) : null,
    acquired_date: toDate((formData.get('acquired_date') as string) || null),
    source: (formData.get('source') as string) || null,
    style: (formData.get('style') as string) || null,
    size_class: (formData.get('size_class') as string) || null,
    pot_type: (formData.get('pot_type') as string) || null,
    soil_mix: (formData.get('soil_mix') as string) || null,
    description: (formData.get('description') as string) || null,
  }

  const res = await authedFetch<{ tree: { id: string } }>('/treefolio/trees', {
    method: 'POST',
    body: tree,
  })

  revalidatePath('/')
  redirect(`/tree/${res.tree.id}`)
}

export async function updateTreeAction(id: string, formData: FormData) {
  const speciesId = await resolveSpeciesId(formData)

  const updates = {
    name: formData.get('name') as string,
    species_id: speciesId,
    age_years: formData.get('age_years') ? Number(formData.get('age_years')) : null,
    acquired_date: toDate((formData.get('acquired_date') as string) || null),
    source: (formData.get('source') as string) || null,
    style: (formData.get('style') as string) || null,
    size_class: (formData.get('size_class') as string) || null,
    pot_type: (formData.get('pot_type') as string) || null,
    soil_mix: (formData.get('soil_mix') as string) || null,
    description: (formData.get('description') as string) || null,
  }

  await authedFetch(`/treefolio/trees/${id}`, {
    method: 'PATCH',
    body: updates,
  })

  revalidatePath('/')
  revalidatePath(`/tree/${id}`)
  redirect(`/tree/${id}`)
}

export async function deleteTreeAction(id: string) {
  await authedFetch(`/treefolio/trees/${id}`, { method: 'DELETE' })
  revalidatePath('/')
  redirect('/')
}

export async function addJournalEntryAction(formData: FormData) {
  const treeId = formData.get('tree_id') as string

  await authedFetch(`/treefolio/trees/${treeId}/journal`, {
    method: 'POST',
    body: {
      entry_type: formData.get('entry_type') as string,
      content: (formData.get('content') as string) || null,
    },
  })

  revalidatePath(`/tree/${treeId}`)
}

export async function setThumbnailAction(treeId: string, imageId: string | null) {
  await authedFetch(`/treefolio/trees/${treeId}`, {
    method: 'PATCH',
    body: { thumbnail_image_id: imageId },
  })

  revalidatePath('/')
  revalidatePath(`/tree/${treeId}`)
}

export async function deleteImageAction(imageId: string, treeId: string) {
  // Clear thumbnail if this was it
  await authedFetch(`/treefolio/trees/${treeId}`, {
    method: 'PATCH',
    body: { thumbnail_image_id: null },
  }).catch(() => {}) // Ignore if thumbnail wasn't set to this image

  // Delete the image (API handles storage cleanup)
  await authedFetch(`/treefolio/images/${imageId}`, { method: 'DELETE' })

  revalidatePath('/')
  revalidatePath(`/tree/${treeId}`)
}
