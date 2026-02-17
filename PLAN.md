# Treefolio — Project Plan

A personal bonsai collection manager with weather-aware care recommendations, species knowledge, image cataloging, and an AI chat companion — wrapped in a minimal, zen-like interface.

---

## Architecture Overview

```
treefolio/
├── .github/
│   └── agents/             # Copilot agent definitions
├── app/                    # Next.js app (or static SPA — TBD)
│   ├── page.tsx            # Dashboard / collection view
│   ├── tree/[id]/          # Individual tree detail page
│   ├── chat/               # Chat interface
│   └── api/                # API routes (weather, LLM, DB)
├── components/             # UI components
├── lib/                    # Shared utilities, DB client, API helpers
├── public/                 # Static assets, tree images
├── styles/                 # Tailwind / global styles
├── supabase/               # Migrations, seed data, types
└── PLAN.md                 # ← You are here
```

---

## Agents

Six specialized agents, each with a single responsibility. They live in `.github/agents/` and can be invoked manually or as subagents by a coordinator.

### 1. `weathercare` — Weather & Weekly Care Agent

**Role:** Location-aware weather integration + LLM-generated weekly maintenance suggestions.

| Detail | Value |
|--------|-------|
| File | `.github/agents/weathercare.agent.md` |
| Tools | `web`, `read`, `search` |
| Trigger | "weather", "weekly care", "maintenance suggestions" |

**Responsibilities:**
- Integrate a public weather API (e.g. Open-Meteo — free, no key required) to fetch current and forecast temperatures, humidity, precipitation, and UV index for the user's location
- Feed weather context + tree species list into an LLM to generate personalized weekly care plans
- Surface frost warnings, heat advisories, and watering schedule adjustments
- Output structured markdown or JSON care cards per tree

**Tasks:**
- [ ] Research and select weather API (Open-Meteo recommended)
- [ ] Design weather data model (temp, humidity, precip, UV, frost risk)
- [ ] Build API route: `GET /api/weather?lat=...&lon=...`
- [ ] Build API route: `POST /api/care-plan` (accepts species list + weather, returns weekly plan)
- [ ] Create LLM prompt template for weekly care generation
- [ ] Add geolocation detection (browser Geolocation API with manual override)
- [ ] Build weather dashboard widget component

---

### 2. `sensei` — Bonsai Expert Agent

**Role:** Deep horticultural and artistic knowledge of bonsai. The authority on species care, styling, and seasonal timing.

| Detail | Value |
|--------|-------|
| File | `.github/agents/sensei.agent.md` |
| Tools | `read`, `search` |
| Trigger | "bonsai", "species", "trim", "defoliate", "repot", "shape", "style" |

**Responsibilities:**
- Maintain a knowledge base of common bonsai species and their care calendars
- Know when each species should be: trimmed, root-pruned, shaped/wired, defoliated, fertilized, watered heavily vs. sparingly, and left dormant
- Understand bonsai art styles (formal upright, informal upright, slanting, cascade, semi-cascade, literati, forest, raft, windswept, etc.)
- Advise on pot selection, soil composition, and display
- Provide seasonal care timelines adjusted to the user's climate zone

**Knowledge base (seed species):**
| Species | Key traits |
|---------|-----------|
| Japanese Maple (*Acer palmatum*) | Deciduous, defoliate early summer, protect from hard frost |
| Chinese Elm (*Ulmus parvifolia*) | Semi-evergreen, vigorous grower, prune year-round |
| Juniper (*Juniperus*) | Evergreen conifer, pinch (don't cut) foliage, full sun |
| Ficus (*Ficus retusa / microcarpa*) | Tropical, indoor-friendly, tolerates heavy pruning |
| Japanese Black Pine (*Pinus thunbergii*) | Conifer, candle pruning in spring, needle pulling in fall |
| Trident Maple (*Acer buergerianum*) | Deciduous, vigorous roots, repot every 1–2 years |
| Azalea (*Rhododendron*) | Flowering, prune immediately after bloom, acidic soil |
| Bougainvillea | Tropical, flowers on new wood, prune hard after flowering |
| Carmona (*Ehretia microphylla*) | Tropical, sensitive to cold, frequent watering |
| Serissa (*Serissa foetida*) | "Tree of a thousand stars", temperamental, hates being moved |

**Tasks:**
- [ ] Write comprehensive species care data (JSON or markdown)
- [ ] Define care calendar schema (action × month × climate zone)
- [ ] Build species lookup utility
- [ ] Create agent prompt with embedded horticultural knowledge
- [ ] Add bonsai style reference guide

---

### 3. `archivist` — Tree Catalog & Image Agent

**Role:** Tracks every tree in the collection — images, age, species, acquisition date, and descriptions.

| Detail | Value |
|--------|-------|
| File | `.github/agents/archivist.agent.md` |
| Tools | `read`, `edit`, `search` |
| Trigger | "catalog", "add tree", "image", "collection", "inventory" |

**Responsibilities:**
- Manage the tree catalog (CRUD operations on tree records)
- Handle image uploads, organize photos chronologically per tree
- Track metadata: species, age, acquisition date, source, pot, soil mix, size, style
- Maintain a timeline/journal for each tree (repotting events, pruning dates, health notes)
- Generate collection statistics and summaries

**Tree record schema:**
```ts
interface Tree {
  id: string
  name: string                   // User-given name
  species: string                // Scientific name
  commonName: string             // Common name
  age: number                    // Estimated age in years
  acquiredDate: string           // ISO date
  source: string                 // Nursery, collected, gift, etc.
  style: string                  // Bonsai style classification
  potType: string
  soilMix: string
  images: TreeImage[]
  journal: JournalEntry[]
  description: string
}
```

**Tasks:**
- [ ] Define tree data schema (TypeScript types)
- [ ] Design image storage strategy (Supabase Storage or local `/public`)
- [ ] Build tree CRUD API routes
- [ ] Build image upload + gallery component
- [ ] Build tree detail page with timeline/journal view
- [ ] Build collection overview / grid view
- [ ] Add search and filter for the collection

---

### 4. `enso` — Frontend Designer & Engineer

**Role:** Designs and builds the UI with a minimal, zen-like aesthetic. Named after the zen circle (円相).

| Detail | Value |
|--------|-------|
| File | `.github/agents/enso.agent.md` |
| Tools | `read`, `edit`, `search`, `execute` |
| Trigger | "design", "UI", "layout", "style", "component", "page" |

**Responsibilities:**
- Establish the visual language: muted earth tones, generous whitespace, subtle animations
- Build all React components with accessibility in mind
- Implement responsive layouts (mobile-first)
- Create a consistent design token system (colors, spacing, typography)
- Ensure performance (lazy loading images, optimized bundles)

**Design direction:**
- **Palette:** Stone, sand, moss, charcoal, cream — inspired by Japanese rock gardens
- **Typography:** Clean serif for headings (e.g. `Playfair Display`), sans-serif for body (e.g. `Inter`)
- **Layout:** Card-based, grid with breathing room, no visual clutter
- **Motion:** Gentle fades, subtle parallax, no jarring transitions
- **Imagery:** Large hero images of trees, soft shadows, natural textures
- **Icons:** Minimal line icons, possibly custom botanical line art

**Tasks:**
- [ ] Define design tokens (colors, typography, spacing, shadows)
- [ ] Set up Tailwind config with custom theme
- [ ] Build layout shell (nav, sidebar, main content area)
- [ ] Build tree card component
- [ ] Build tree detail page layout
- [ ] Build dashboard / home page
- [ ] Build chat interface UI
- [ ] Build weather widget UI
- [ ] Build image gallery / lightbox component
- [ ] Add dark mode support (dusk/night theme)
- [ ] Add subtle page transitions and micro-interactions
- [ ] Responsive pass for mobile and tablet

---

### 5. `roots` — Database Agent

**Role:** Designs, manages, and queries the database. Generates species-specific care recommendations from stored data.

| Detail | Value |
|--------|-------|
| File | `.github/agents/roots.agent.md` |
| Tools | `read`, `edit`, `search`, `execute` |
| Trigger | "database", "schema", "migration", "query", "supabase", "recommendation" |

**Responsibilities:**
- Design and maintain the Supabase (PostgreSQL) schema
- Write migrations and seed data
- Build type-safe database queries (using Supabase client or Drizzle)
- Generate individualized care recommendations by joining tree records with species knowledge + weather data
- Handle row-level security (RLS) policies if multi-user is ever needed

**Proposed schema** (all tables use `tf_` prefix to coexist in shared Supabase project)**:**
```
tf_trees
  ├── id (uuid, PK)
  ├── name (text)
  ├── species_id (FK → tf_species)
  ├── age_years (int)
  ├── acquired_date (date)
  ├── source (text)
  ├── style (text)
  ├── pot_type (text)
  ├── soil_mix (text)
  ├── description (text)
  ├── created_at (timestamptz)
  └── updated_at (timestamptz)

tf_species
  ├── id (uuid, PK)
  ├── scientific_name (text, unique)
  ├── common_name (text)
  ├── care_calendar (jsonb)      — month-by-month actions
  ├── climate_zones (int[])      — USDA hardiness zones
  ├── indoor_outdoor (text)
  ├── difficulty (text)
  └── notes (text)

tf_tree_images
  ├── id (uuid, PK)
  ├── tree_id (FK → tf_trees)
  ├── url (text)
  ├── caption (text)
  ├── taken_at (date)
  └── uploaded_at (timestamptz)

tf_journal_entries
  ├── id (uuid, PK)
  ├── tree_id (FK → tf_trees)
  ├── entry_type (text)          — prune, repot, water, fertilize, note, photo
  ├── content (text)
  ├── images (text[])
  └── created_at (timestamptz)

tf_care_recommendations
  ├── id (uuid, PK)
  ├── tree_id (FK → tf_trees)
  ├── week_start (date)
  ├── recommendations (jsonb)
  ├── weather_snapshot (jsonb)
  └── created_at (timestamptz)

tf_chat_messages
  ├── id (uuid, PK)
  ├── session_id (uuid)
  ├── role (text)
  ├── content (text)
  ├── metadata (jsonb)
  └── created_at (timestamptz)
```

**Tasks:**
- [ ] Finalize schema design (all tables `tf_` prefixed)
- [ ] Connect to existing Supabase project
- [ ] Write initial migration files (prefixed tables only)
- [ ] Create seed data for species table
- [ ] Build typed database client / query helpers
- [ ] Build recommendation engine (species care calendar × weather × season)
- [ ] Add journal entry CRUD
- [ ] Add image metadata storage

---

### 6. `kodama` — Chat Companion Agent

**Role:** A conversational interface for discussing your trees. Named after the tree spirits in Japanese folklore.

| Detail | Value |
|--------|-------|
| File | `.github/agents/kodama.agent.md` |
| Tools | `read`, `search`, `web` |
| Trigger | "chat", "ask", "question", "help", "advice" |

**Responsibilities:**
- Provide a natural-language chat interface within the app
- Answer questions about the user's specific trees (pulling from the catalog)
- Offer care advice by consulting the bonsai knowledge base
- Help diagnose problems (yellowing leaves, pests, root rot, etc.)
- Suggest next actions based on season, weather, and tree history
- Maintain conversational context within a session

**Tasks:**
- [ ] Design chat data model (messages, sessions)
- [ ] Build chat API route (streaming LLM responses)
- [ ] Build chat UI component (message bubbles, input, scroll)
- [ ] Create system prompt that includes tree catalog context
- [ ] Add ability to reference specific trees in conversation ("How is Kaze doing?")
- [ ] Add problem diagnosis flow (symptom → possible causes → remedies)
- [ ] Store chat history (optional, for continuity)

---

## Tech Stack (Proposed)

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Framework | Next.js 14+ (App Router) | SSR, API routes, file-based routing |
| Styling | Tailwind CSS | Rapid iteration, design token friendly |
| Database | Supabase (PostgreSQL) | **Existing project** — all tables use `tf_` prefix for isolation |
| Weather API | Open-Meteo | Free, no API key, reliable |
| LLM | Azure OpenAI Service | Care plan generation, chat — uses existing Azure credits |
| Image Storage | Supabase Storage | `treefolio` bucket in existing project |
| Deployment | Vercel | Seamless Next.js hosting |
| Package Manager | pnpm | Fast, disk-efficient |

---

## Milestones

### Phase 1 — Foundation
- [ ] Scaffold Next.js project with Tailwind
- [ ] Connect to existing Supabase project and create `tf_`-prefixed schema
- [ ] Implement tree CRUD (add, view, edit, delete)
- [ ] Build collection grid view
- [ ] Build tree detail page

### Phase 2 — Intelligence
- [ ] Integrate Open-Meteo weather API
- [ ] Build weekly care plan generator (LLM)
- [ ] Seed species knowledge base
- [ ] Build recommendation engine

### Phase 3 — Chat & Polish
- [ ] Build chat interface and connect to LLM
- [ ] Add image upload and gallery
- [ ] Add journal/timeline per tree
- [ ] Dark mode and responsive polish
- [ ] Micro-interactions and transitions

### Phase 4 — Refinement
- [ ] Search and filter across collection
- [ ] Problem diagnosis chat flow
- [ ] Export/backup collection data
- [ ] Performance optimization
- [ ] Accessibility audit

---

## Agent Interaction Map

```
                    ┌─────────────┐
                    │   User      │
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │   kodama    │  ← Chat companion (entry point)
                    │  (chat)     │
                    └──┬───┬───┬──┘
                       │   │   │
          ┌────────────┘   │   └────────────┐
          ▼                ▼                ▼
   ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
   │   sensei    │ │  archivist  │ │ weathercare  │
   │  (species)  │ │  (catalog)  │ │  (weather)   │
   └──────┬──────┘ └──────┬──────┘ └──────┬──────┘
          │               │               │
          └───────┬───────┘───────┬───────┘
                  ▼               ▼
           ┌─────────────┐ ┌─────────────┐
           │   roots     │ │    enso     │
           │  (database) │ │  (frontend) │
           └─────────────┘ └─────────────┘
```

- **kodama** queries **sensei** for species knowledge, **archivist** for tree data, and **weathercare** for conditions
- **roots** serves data to all agents that need tree or species records
- **enso** builds the visual layer that surfaces everything to the user

---

## Open Questions

- [x] Database: Using existing Supabase project with `tf_` table prefix for isolation
- [ ] Auth: Single-user for now, or plan for accounts from the start?
- [x] LLM provider: Azure OpenAI Service (using Azure credits)
- [ ] Image strategy: Upload to Supabase Storage (`treefolio` bucket), or reference local files?
- [ ] Static vs. dynamic: Could v1 be a simpler static site with JSON, or go full-stack from day one?
- [ ] Mobile: PWA support for quick photo capture in the garden?

---

## Build Checklist — Step by Step

Work through these in order. Each step lists the agent to invoke, the prompt to use (if applicable), and what to ask for.

### Step 1: Scaffold the project
> **Agent:** `@enso` · **Prompt:** n/a (one-time setup)

```
@enso Scaffold a Next.js 14+ project with App Router in the treefolio/ directory.
Set up Tailwind CSS with the design tokens from your design system.
Use pnpm. Create the layout shell with a sidebar nav and main content area.
Add Inter and Playfair Display fonts. Set up light/dark theme CSS variables.
```

### Step 2: Create Supabase migrations
> **Agent:** `@roots` · **Prompt:** `/add-migration`

```
@roots Create the initial migration for Treefolio. Include all tf_-prefixed
tables: tf_species, tf_trees, tf_tree_images, tf_journal_entries,
tf_care_recommendations, tf_chat_messages. Plus indexes and the updated_at trigger.
```

### Step 3: Seed species data
> **Agent:** `@roots` (consult `@sensei` for knowledge) · **Prompt:** `/seed-species`

```
/seed-species Seed all 10 species from the sensei knowledge base: Japanese Maple,
Chinese Elm, Juniper, Ficus, Japanese Black Pine, Trident Maple, Azalea,
Bougainvillea, Carmona, and Serissa. Include full care calendars.
```

### Step 4: Build the Supabase client + types
> **Agent:** `@roots`

```
@roots Create a typed Supabase client in lib/supabase.ts. Generate TypeScript
types for all tf_ tables. Create query helper functions for tree CRUD,
species lookup, and journal entries.
```

### Step 5: Build the collection page
> **Agent:** `@enso` · **Prompt:** `/add-component`

```
/add-component TreeCard - displays a tree summary with thumbnail, name, species,
age, and style in a card for the collection grid

Then:
@enso Build the home/dashboard page with a grid of TreeCards showing all trees
from tf_trees. Include an "Add Tree" button. Use the zen design system.
```

### Step 6: Build the tree detail page
> **Agent:** `@enso` · **Prompt:** `/add-tree-feature`

```
@enso Build the tree detail page at app/tree/[id]/page.tsx. Show the tree's
hero image, name, species, age, description, and metadata. Include sections
for the image gallery, journal timeline, and care recommendations.
```

### Step 7: Build tree CRUD forms
> **Agent:** `@enso` + `@roots`

```
@enso Build an "Add Tree" form with fields: name, species (dropdown from
tf_species), age, acquired date, source, style, pot type, soil mix,
description, and image upload. Submit creates a record in tf_trees.
```

### Step 8: Integrate weather API
> **Agent:** `@weathercare` · **Prompt:** `/care-plan`

```
/care-plan Create the GET /api/weather route that fetches 7-day forecast from
Open-Meteo using browser geolocation coordinates. Return structured weather data.
```

### Step 9: Build the care plan generator
> **Agent:** `@weathercare` · **Prompt:** `/care-plan`

```
/care-plan Create the POST /api/care-plan route. It should:
1. Fetch all active trees with their species care calendars
2. Get the current weather forecast
3. Send both to Azure OpenAI to generate a weekly care plan
4. Store the result in tf_care_recommendations
5. Return the plan as structured JSON
```

### Step 10: Build the weather + care widget
> **Agent:** `@enso` · **Prompt:** `/add-component`

```
/add-component WeatherCareWidget - shows current weather conditions and this
week's care plan summary on the dashboard. Expandable per-tree care cards.
```

### Step 11: Build the chat interface
> **Agent:** `@enso` (UI) + `@kodama` (system prompt)

```
@enso Build the chat page at app/chat/page.tsx. Message bubbles (user on right,
assistant on left), text input at bottom, smooth scroll, loading indicator
for streaming responses. Zen-styled.

Then:
@kodama Write the system prompt for the chat API that includes the user's tree
catalog context and can reference trees by name.
```

### Step 12: Build the chat API
> **Agent:** `@roots` + `@weathercare`

```
@roots Create the POST /api/chat route. It should:
1. Load the user's tree catalog from tf_trees + tf_species
2. Get current weather from the weather API
3. Build a system prompt with tree context
4. Stream the response from Azure OpenAI
5. Store messages in tf_chat_messages
```

### Step 13: Image upload + gallery
> **Agent:** `@enso` · **Prompt:** `/add-tree-feature`

```
/add-tree-feature Image upload and gallery. Upload to Supabase Storage
(treefolio bucket), store metadata in tf_tree_images. Show a chronological
gallery on the tree detail page with lightbox view.
```

### Step 14: Journal / timeline
> **Agent:** `@enso` · **Prompt:** `/add-tree-feature`

```
/add-tree-feature Journal timeline. Show all journal entries for a tree in a
vertical timeline with icons per entry type (prune, repot, water, etc.).
Add a form to create new entries with type, content, and optional image.
```

### Step 15: Dark mode + responsive polish
> **Agent:** `@enso`

```
@enso Add dark mode toggle using the dusk/night theme tokens. Ensure all
components, cards, and backgrounds switch correctly. Do a responsive pass
for mobile (< 640px) and tablet (768px). Add page transition animations.
```

### Step 16: Search, filter, and final polish
> **Agent:** `@enso` + `@roots`

```
@enso Add search and filter controls to the collection page. Filter by species,
style, and size class. Search by tree name. Add smooth filter transitions.
```

---

### Prompt Files Reference

| Prompt | Command | Agent | Use for |
|--------|---------|-------|---------|
| [add-component](../.github/prompts/add-component.prompt.md) | `/add-component` | enso | New UI components |
| [add-migration](../.github/prompts/add-migration.prompt.md) | `/add-migration` | roots | Schema changes |
| [add-tree-feature](../.github/prompts/add-tree-feature.prompt.md) | `/add-tree-feature` | agent | Tree detail page features |
| [seed-species](../.github/prompts/seed-species.prompt.md) | `/seed-species` | roots | Species data |
| [care-plan](../.github/prompts/care-plan.prompt.md) | `/care-plan` | weathercare | Weather + care features |
