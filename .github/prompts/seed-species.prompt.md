---
description: "Seed or update bonsai species data in the tf_species table"
agent: "roots"
tools: ["read", "edit", "search"]
argument-hint: "Species to add or update, e.g. 'add Dwarf Jade (Portulacaria afra)'"
---

Add or update species data in the Treefolio database.

## Context
- Species care knowledge lives in [sensei agent](../agents/sensei.agent.md) — reference it for accurate care calendars
- Data goes into the `tf_species` table
- Care calendars use the JSONB structure: `{ "jan": [...], "feb": [...], ... }`

## Checklist
1. Consult the sensei agent's species knowledge for accurate care data
2. Write a seed/migration SQL file or update the existing seed file in `supabase/`
3. Include: scientific_name, common_name, family, care_calendar, climate_zones, indoor_outdoor, difficulty, watering, light, notes
4. Verify no duplicate scientific_name conflicts
