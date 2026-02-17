export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// ─── Care Calendar ────────────────────────────────────────────
export interface CareCalendar {
  jan?: string[]
  feb?: string[]
  mar?: string[]
  apr?: string[]
  may?: string[]
  jun?: string[]
  jul?: string[]
  aug?: string[]
  sep?: string[]
  oct?: string[]
  nov?: string[]
  dec?: string[]
}

// ─── Row types (what you SELECT) ──────────────────────────────

export interface Species {
  id: string
  scientific_name: string
  common_name: string
  family: string | null
  care_calendar: CareCalendar
  climate_zones: number[]
  indoor_outdoor: 'indoor' | 'outdoor' | 'both' | null
  difficulty: 'beginner' | 'intermediate' | 'advanced' | null
  watering: string | null
  light: string | null
  notes: string | null
  created_at: string
}

export interface Tree {
  id: string
  name: string
  species_id: string | null
  age_years: number | null
  acquired_date: string | null
  source: string | null
  style: string | null
  size_class: 'mame' | 'shohin' | 'kifu' | 'chuhin' | 'dai' | null
  pot_type: string | null
  soil_mix: string | null
  description: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface TreeImage {
  id: string
  tree_id: string
  url: string
  caption: string | null
  angle: 'front' | 'back' | 'left' | 'right' | 'top' | 'detail' | 'roots' | 'canopy' | 'full' | null
  taken_at: string | null
  uploaded_at: string
}

export interface JournalEntry {
  id: string
  tree_id: string
  entry_type: 'prune' | 'repot' | 'water' | 'fertilize' | 'wire' | 'defoliate' | 'style' | 'photo' | 'health' | 'note'
  content: string | null
  images: string[]
  created_at: string
}

export interface CareRecommendation {
  id: string
  tree_id: string
  week_start: string
  recommendations: Json
  weather_snapshot: Json | null
  created_at: string
}

export interface ChatMessage {
  id: string
  session_id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  metadata: Json
  created_at: string
}

// ─── Insert types (what you INSERT — omit generated fields) ───

export type SpeciesInsert = Omit<Species, 'id' | 'created_at'> & {
  id?: string
  created_at?: string
}

export type TreeInsert = Omit<Tree, 'id' | 'created_at' | 'updated_at' | 'is_active'> & {
  id?: string
  created_at?: string
  updated_at?: string
  is_active?: boolean
}

export type TreeImageInsert = Omit<TreeImage, 'id' | 'uploaded_at'> & {
  id?: string
  uploaded_at?: string
}

export type JournalEntryInsert = Omit<JournalEntry, 'id' | 'created_at'> & {
  id?: string
  created_at?: string
}

export type CareRecommendationInsert = Omit<CareRecommendation, 'id' | 'created_at'> & {
  id?: string
  created_at?: string
}

export type ChatMessageInsert = Omit<ChatMessage, 'id' | 'created_at'> & {
  id?: string
  created_at?: string
}

// ─── Update types (partial, no PK) ───────────────────────────

export type TreeUpdate = Partial<Omit<Tree, 'id' | 'created_at' | 'updated_at'>>
export type SpeciesUpdate = Partial<Omit<Species, 'id' | 'created_at'>>
export type TreeImageUpdate = Partial<Omit<TreeImage, 'id' | 'uploaded_at'>>
export type JournalEntryUpdate = Partial<Omit<JournalEntry, 'id' | 'created_at'>>

// ─── Joined / composite types ────────────────────────────────

export interface TreeWithSpecies extends Tree {
  species: Species | null
  images?: TreeImage[]
}

export interface TreeDetail extends Tree {
  species: Species | null
  images: TreeImage[]
  journal: JournalEntry[]
}
