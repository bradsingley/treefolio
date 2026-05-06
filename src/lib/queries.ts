import { apiFetch, getServerCookies } from './api-client'
import type {
  Tree,
  TreeWithSpecies,
  TreeDetail,
  Species,
  TreeImage,
  JournalEntry,
  CareRecommendation,
  CareRecommendationInsert,
  ChatMessage,
  ChatMessageInsert,
} from './types'

async function authedFetch<T>(path: string, opts: { method?: string; body?: unknown } = {}): Promise<T> {
  const cookie = await getServerCookies()
  return apiFetch<T>(path, { ...opts, cookie })
}

// ─── Species ──────────────────────────────────────────────────

export async function getSpecies(): Promise<Species[]> {
  const res = await apiFetch<{ species: Species[] }>('/treefolio/species')
  return res.species
}

export async function getSpeciesById(id: string): Promise<Species | null> {
  try {
    const res = await apiFetch<{ species: Species }>(`/treefolio/species/${id}`)
    return res.species
  } catch {
    return null
  }
}

export async function getSpeciesByName(scientificName: string): Promise<Species | null> {
  // lab-api doesn't have a by-name endpoint; search client-side
  const all = await getSpecies()
  return all.find((s) => s.scientific_name === scientificName) ?? null
}

// ─── Trees ────────────────────────────────────────────────────

export async function getTrees(): Promise<TreeWithSpecies[]> {
  const res = await authedFetch<{ trees: TreeWithSpecies[] }>('/treefolio/trees')
  return res.trees
}

export async function getTreeById(id: string): Promise<TreeDetail | null> {
  try {
    const res = await authedFetch<{ tree: TreeDetail }>(`/treefolio/trees/${id}`)
    return res.tree
  } catch {
    return null
  }
}

export async function createTree(tree: Record<string, unknown>): Promise<Tree> {
  const res = await authedFetch<{ tree: Tree }>('/treefolio/trees', {
    method: 'POST',
    body: tree,
  })
  return res.tree
}

export async function updateTree(id: string, updates: Record<string, unknown>): Promise<Tree> {
  const res = await authedFetch<{ tree: Tree }>(`/treefolio/trees/${id}`, {
    method: 'PATCH',
    body: updates,
  })
  return res.tree
}

export async function deleteTree(id: string): Promise<void> {
  // Soft delete via API (sets is_active=false or actual DELETE)
  await authedFetch(`/treefolio/trees/${id}`, { method: 'DELETE' })
}

// ─── Tree Images ──────────────────────────────────────────────

export async function getTreeImages(treeId: string): Promise<TreeImage[]> {
  const res = await authedFetch<{ images: TreeImage[] }>(`/treefolio/trees/${treeId}/images`)
  return res.images
}

export async function addTreeImage(image: { tree_id: string; url: string; caption?: string; angle?: string; taken_at?: string }): Promise<TreeImage> {
  const res = await authedFetch<{ image: TreeImage }>(`/treefolio/trees/${image.tree_id}/images`, {
    method: 'POST',
    body: { url: image.url, caption: image.caption, angle: image.angle, takenAt: image.taken_at },
  })
  return res.image
}

export async function deleteTreeImage(id: string): Promise<void> {
  await authedFetch(`/treefolio/images/${id}`, { method: 'DELETE' })
}

// ─── Journal Entries ──────────────────────────────────────────

export async function getJournalEntries(treeId: string): Promise<JournalEntry[]> {
  const res = await authedFetch<{ entries: JournalEntry[] }>(`/treefolio/trees/${treeId}/journal`)
  return res.entries
}

export async function addJournalEntry(entry: { tree_id: string; entry_type: string; content?: string }): Promise<JournalEntry> {
  const res = await authedFetch<{ entry: JournalEntry }>(`/treefolio/trees/${entry.tree_id}/journal`, {
    method: 'POST',
    body: { entryType: entry.entry_type, content: entry.content },
  })
  return res.entry
}

export async function deleteJournalEntry(id: string): Promise<void> {
  await authedFetch(`/treefolio/journal/${id}`, { method: 'DELETE' })
}

// ─── Care Recommendations ─────────────────────────────────────

export async function getCareRecommendations(treeId: string): Promise<CareRecommendation[]> {
  const res = await authedFetch<{ recommendations: CareRecommendation[] }>(`/treefolio/trees/${treeId}/recommendations`)
  return res.recommendations
}

export async function upsertCareRecommendation(rec: CareRecommendationInsert): Promise<CareRecommendation> {
  const res = await authedFetch<{ recommendation: CareRecommendation }>(`/treefolio/trees/${rec.tree_id}/recommendations`, {
    method: 'PUT',
    body: rec,
  })
  return res.recommendation
}

// ─── Chat Messages ────────────────────────────────────────────

export async function getChatMessages(sessionId: string): Promise<ChatMessage[]> {
  const res = await authedFetch<{ messages: ChatMessage[] }>(`/treefolio/chat/${sessionId}`)
  return res.messages
}

export async function addChatMessage(message: ChatMessageInsert): Promise<ChatMessage> {
  const res = await authedFetch<{ message: ChatMessage }>('/treefolio/chat', {
    method: 'POST',
    body: message,
  })
  return res.message
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
