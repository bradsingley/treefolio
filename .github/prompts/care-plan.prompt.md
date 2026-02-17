---
description: "Build or update the weekly care plan feature using weather + species data"
agent: "weathercare"
tools: ["web", "read", "edit", "search", "execute"]
argument-hint: "What to build or fix, e.g. 'create the /api/care-plan route'"
---

Work on the weather-aware care plan feature.

## Context
- Weather API: Open-Meteo (free, no key) — see [weathercare agent](../agents/weathercare.agent.md)
- LLM: Azure OpenAI Service — env vars: `AZURE_OPENAI_ENDPOINT`, `AZURE_OPENAI_API_KEY`, `AZURE_OPENAI_DEPLOYMENT`
- Database: `tf_trees` joined with `tf_species` for species care calendars — see [roots agent](../agents/roots.agent.md)
- Generated plans are stored in `tf_care_recommendations`

## Checklist
1. Read existing API routes and weather-related code
2. Implement the requested feature
3. Ensure weather data is fetched (never fabricated)
4. Ensure care plans reference actual species from the database
5. Store generated recommendations in `tf_care_recommendations`
