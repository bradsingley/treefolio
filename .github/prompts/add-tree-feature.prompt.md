---
description: "Add a new feature to the tree detail page"
agent: "agent"
tools: ["read", "edit", "search", "execute"]
argument-hint: "Feature description, e.g. 'add a care timeline showing journal entries'"
---

Add a feature to the tree detail page (`app/tree/[id]/page.tsx`).

## Context
- Database schema uses `tf_`-prefixed tables — see [roots agent](../agents/roots.agent.md)
- UI follows zen aesthetic — see [enso agent](../agents/enso.agent.md)
- Species knowledge is in [sensei agent](../agents/sensei.agent.md)

## Checklist
1. Read the current tree detail page and related components
2. Read the relevant database schema / query helpers in `lib/`
3. Implement the feature (component + data fetching)
4. Ensure it matches the existing design language
5. Test that it renders correctly
