'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import type { TreeInsert, TreeUpdate } from '@/lib/types'

async function resolveSpeciesId(formData: FormData): Promise<string | null> {
  const speciesId = formData.get('species_id') as string
  if (speciesId !== '__new__') return speciesId || null

  const commonName = (formData.get('new_species_common') as string)?.trim()
  const scientificName = (formData.get('new_species_scientific') as string)?.trim()
  if (!commonName || !scientificName) return null

  const { data, error } = await supabase
    .from('tf_species')
    .insert({ common_name: commonName, scientific_name: scientificName })
    .select('id')
    .single()

  if (error) throw error
  return data.id
}

/** Normalize YYYY-MM to YYYY-MM-01 for Postgres DATE columns. */
function toDate(val: string | null): string | null {
  if (!val) return null
  return val.length === 7 ? val + '-01' : val
}

export async function createTreeAction(formData: FormData) {
  const speciesId = await resolveSpeciesId(formData)

  const tree: TreeInsert = {
    name: formData.get('name') as string,
    species_id: speciesId,
    age_years: formData.get('age_years') ? Number(formData.get('age_years')) : null,
    acquired_date: toDate((formData.get('acquired_date') as string) || null),
    source: (formData.get('source') as string) || null,
    style: (formData.get('style') as string) || null,
    size_class: (formData.get('size_class') as string as TreeInsert['size_class']) || null,
    pot_type: (formData.get('pot_type') as string) || null,
    soil_mix: (formData.get('soil_mix') as string) || null,
    description: (formData.get('description') as string) || null,
    thumbnail_image_id: null,
  }

  const { data, error } = await supabase
    .from('tf_trees')
    .insert(tree)
    .select('id')
    .single()

  if (error) throw error

  revalidatePath('/')
  redirect(`/tree/${data.id}`)
}

export async function updateTreeAction(id: string, formData: FormData) {
  const speciesId = await resolveSpeciesId(formData)

  const updates: TreeUpdate = {
    name: formData.get('name') as string,
    species_id: speciesId,
    age_years: formData.get('age_years') ? Number(formData.get('age_years')) : null,
    acquired_date: toDate((formData.get('acquired_date') as string) || null),
    source: (formData.get('source') as string) || null,
    style: (formData.get('style') as string) || null,
    size_class: (formData.get('size_class') as string as TreeUpdate['size_class']) || null,
    pot_type: (formData.get('pot_type') as string) || null,
    soil_mix: (formData.get('soil_mix') as string) || null,
    description: (formData.get('description') as string) || null,
  }

  const { error } = await supabase
    .from('tf_trees')
    .update(updates)
    .eq('id', id)

  if (error) throw error

  revalidatePath('/')
  revalidatePath(`/tree/${id}`)
  redirect(`/tree/${id}`)
}

export async function deleteTreeAction(id: string) {
  // Soft delete
  const { error } = await supabase
    .from('tf_trees')
    .update({ is_active: false })
    .eq('id', id)

  if (error) throw error

  revalidatePath('/')
  redirect('/')
}

export async function addJournalEntryAction(formData: FormData) {
  const treeId = formData.get('tree_id') as string
  const entry = {
    tree_id: treeId,
    entry_type: formData.get('entry_type') as string,
    content: (formData.get('content') as string) || null,
  }

  const { error } = await supabase
    .from('tf_journal_entries')
    .insert(entry)

  if (error) throw error

  revalidatePath(`/tree/${treeId}`)
}

export async function setThumbnailAction(treeId: string, imageId: string | null) {
  const { error } = await supabase
    .from('tf_trees')
    .update({ thumbnail_image_id: imageId })
    .eq('id', treeId)

  if (error) throw error

  revalidatePath('/')
  revalidatePath(`/tree/${treeId}`)
}

export async function deleteImageAction(imageId: string, treeId: string) {
  // Get the image record to find the storage path
  const { data: image, error: fetchError } = await supabase
    .from('tf_tree_images')
    .select('url')
    .eq('id', imageId)
    .single()

  if (fetchError) throw fetchError

  // Extract file path from the public URL
  const url = new URL(image.url)
  const pathParts = url.pathname.split('/storage/v1/object/public/treefolio/')
  if (pathParts[1]) {
    await supabase.storage.from('treefolio').remove([pathParts[1]])
  }

  // If this image was the thumbnail, clear it
  await supabase
    .from('tf_trees')
    .update({ thumbnail_image_id: null })
    .eq('id', treeId)
    .eq('thumbnail_image_id', imageId)

  // Delete the database record
  const { error } = await supabase
    .from('tf_tree_images')
    .delete()
    .eq('id', imageId)

  if (error) throw error

  revalidatePath('/')
  revalidatePath(`/tree/${treeId}`)
}
