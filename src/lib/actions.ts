'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import type { TreeInsert, TreeUpdate } from '@/lib/types'

export async function createTreeAction(formData: FormData) {
  const tree: TreeInsert = {
    name: formData.get('name') as string,
    species_id: (formData.get('species_id') as string) || null,
    age_years: formData.get('age_years') ? Number(formData.get('age_years')) : null,
    acquired_date: (formData.get('acquired_date') as string) || null,
    source: (formData.get('source') as string) || null,
    style: (formData.get('style') as string) || null,
    size_class: (formData.get('size_class') as string as TreeInsert['size_class']) || null,
    pot_type: (formData.get('pot_type') as string) || null,
    soil_mix: (formData.get('soil_mix') as string) || null,
    description: (formData.get('description') as string) || null,
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
  const updates: TreeUpdate = {
    name: formData.get('name') as string,
    species_id: (formData.get('species_id') as string) || null,
    age_years: formData.get('age_years') ? Number(formData.get('age_years')) : null,
    acquired_date: (formData.get('acquired_date') as string) || null,
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

  // Delete the database record
  const { error } = await supabase
    .from('tf_tree_images')
    .delete()
    .eq('id', imageId)

  if (error) throw error

  revalidatePath(`/tree/${treeId}`)
}
