import { supabase } from './supabase'
import type {
  Tree,
  TreeInsert,
  TreeUpdate,
  TreeWithSpecies,
  TreeDetail,
  Species,
  TreeImage,
  TreeImageInsert,
  JournalEntry,
  JournalEntryInsert,
  CareRecommendation,
  CareRecommendationInsert,
  ChatMessage,
  ChatMessageInsert,
} from './types'

// ─── Species ──────────────────────────────────────────────────

export async function getSpecies(): Promise<Species[]> {
  const { data, error } = await supabase
    .from('tf_species')
    .select('*')
    .order('common_name')
  if (error) throw error
  return data as Species[]
}

export async function getSpeciesById(id: string): Promise<Species | null> {
  const { data, error } = await supabase
    .from('tf_species')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw error
  return data as Species
}

export async function getSpeciesByName(scientificName: string): Promise<Species | null> {
  const { data, error } = await supabase
    .from('tf_species')
    .select('*')
    .eq('scientific_name', scientificName)
    .single()
  if (error && error.code !== 'PGRST116') throw error
  return (data as Species) ?? null
}

// ─── Trees ────────────────────────────────────────────────────

export async function getTrees(): Promise<TreeWithSpecies[]> {
  const { data, error } = await supabase
    .from('tf_trees')
    .select('*, species:tf_species(*), images:tf_tree_images!tf_tree_images_tree_id_fkey(*)')
    .eq('is_active', true)
    .order('name')
    .order('taken_at', { referencedTable: 'tf_tree_images!tf_tree_images_tree_id_fkey', ascending: false })
  if (error) throw error
  return data as TreeWithSpecies[]
}

export async function getTreeById(id: string): Promise<TreeDetail | null> {
  const { data, error } = await supabase
    .from('tf_trees')
    .select('*, species:tf_species(*), images:tf_tree_images!tf_tree_images_tree_id_fkey(*), journal:tf_journal_entries(*)')
    .eq('id', id)
    .order('created_at', { referencedTable: 'tf_journal_entries', ascending: false })
    .order('uploaded_at', { referencedTable: 'tf_tree_images!tf_tree_images_tree_id_fkey', ascending: false })
    .single()
  if (error) throw error
  return data as TreeDetail
}

export async function createTree(tree: TreeInsert): Promise<Tree> {
  const { data, error } = await supabase
    .from('tf_trees')
    .insert(tree)
    .select()
    .single()
  if (error) throw error
  return data as Tree
}

export async function updateTree(id: string, updates: TreeUpdate): Promise<Tree> {
  const { data, error } = await supabase
    .from('tf_trees')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data as Tree
}

export async function deleteTree(id: string): Promise<void> {
  // Soft delete — set is_active to false
  const { error } = await supabase
    .from('tf_trees')
    .update({ is_active: false })
    .eq('id', id)
  if (error) throw error
}

// ─── Tree Images ──────────────────────────────────────────────

export async function getTreeImages(treeId: string): Promise<TreeImage[]> {
  const { data, error } = await supabase
    .from('tf_tree_images')
    .select('*')
    .eq('tree_id', treeId)
    .order('taken_at', { ascending: false })
  if (error) throw error
  return data as TreeImage[]
}

export async function addTreeImage(image: TreeImageInsert): Promise<TreeImage> {
  const { data, error } = await supabase
    .from('tf_tree_images')
    .insert(image)
    .select()
    .single()
  if (error) throw error
  return data as TreeImage
}

export async function deleteTreeImage(id: string): Promise<void> {
  const { error } = await supabase
    .from('tf_tree_images')
    .delete()
    .eq('id', id)
  if (error) throw error
}

// ─── Journal Entries ──────────────────────────────────────────

export async function getJournalEntries(treeId: string): Promise<JournalEntry[]> {
  const { data, error } = await supabase
    .from('tf_journal_entries')
    .select('*')
    .eq('tree_id', treeId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data as JournalEntry[]
}

export async function addJournalEntry(entry: JournalEntryInsert): Promise<JournalEntry> {
  const { data, error } = await supabase
    .from('tf_journal_entries')
    .insert(entry)
    .select()
    .single()
  if (error) throw error
  return data as JournalEntry
}

export async function deleteJournalEntry(id: string): Promise<void> {
  const { error } = await supabase
    .from('tf_journal_entries')
    .delete()
    .eq('id', id)
  if (error) throw error
}

// ─── Care Recommendations ─────────────────────────────────────

export async function getCareRecommendations(treeId: string): Promise<CareRecommendation[]> {
  const { data, error } = await supabase
    .from('tf_care_recommendations')
    .select('*')
    .eq('tree_id', treeId)
    .order('week_start', { ascending: false })
    .limit(4)
  if (error) throw error
  return data as CareRecommendation[]
}

export async function upsertCareRecommendation(rec: CareRecommendationInsert): Promise<CareRecommendation> {
  const { data, error } = await supabase
    .from('tf_care_recommendations')
    .upsert(rec, { onConflict: 'tree_id,week_start' })
    .select()
    .single()
  if (error) throw error
  return data as CareRecommendation
}

// ─── Chat Messages ────────────────────────────────────────────

export async function getChatMessages(sessionId: string): Promise<ChatMessage[]> {
  const { data, error } = await supabase
    .from('tf_chat_messages')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at')
  if (error) throw error
  return data as ChatMessage[]
}

export async function addChatMessage(message: ChatMessageInsert): Promise<ChatMessage> {
  const { data, error } = await supabase
    .from('tf_chat_messages')
    .insert(message)
    .select()
    .single()
  if (error) throw error
  return data as ChatMessage
}

// ─── Composite Queries ────────────────────────────────────────

/** Get this month's care actions for all active trees */
export async function getMonthlyCarePlan(): Promise<Array<{ tree: Tree; species: Species; actions: string[] }>> {
  const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']
  const currentMonth = months[new Date().getMonth()]

  const trees = await getTrees()
  return trees
    .filter((t): t is TreeWithSpecies & { species: Species } => t.species !== null)
    .map((t) => ({
      tree: t,
      species: t.species,
      actions: (t.species.care_calendar as Record<string, string[]>)[currentMonth] ?? [],
    }))
}
