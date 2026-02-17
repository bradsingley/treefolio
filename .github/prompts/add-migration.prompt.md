---
description: "Create a new Supabase migration with tf_-prefixed tables for Treefolio"
agent: "roots"
tools: ["read", "edit", "search", "execute"]
argument-hint: "What the migration does, e.g. 'add health_status column to tf_trees'"
---

Create a new Supabase migration file for Treefolio.

## Rules
- ALL table names MUST use the `tf_` prefix — this is a shared Supabase project
- ALL indexes, triggers, and functions MUST also use the `tf_` prefix
- Never modify tables without the `tf_` prefix — those belong to other apps
- Place the migration file in `supabase/migrations/` with timestamp naming: `YYYYMMDDHHMMSS_description.sql`

## Checklist
1. Read the current schema in [roots agent](../agents/roots.agent.md) and any existing migrations in `supabase/migrations/`
2. Write the migration SQL
3. Update TypeScript types in `lib/` if they exist
4. Provide a rollback comment at the top of the migration file
