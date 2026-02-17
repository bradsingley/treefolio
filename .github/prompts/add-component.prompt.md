---
description: "Scaffold a new React component following the Treefolio zen design system"
agent: "enso"
tools: ["read", "edit", "search", "execute"]
argument-hint: "Component name and purpose, e.g. 'TreeCard - displays a tree summary in the collection grid'"
---

Create a new React component for the Treefolio app.

## Requirements
- Use TypeScript (.tsx)
- Style with Tailwind CSS using the design tokens from [enso agent](../agents/enso.agent.md)
- Place the file in `components/` (or a subfolder if it's page-specific)
- Follow the zen aesthetic: muted earth tones, generous whitespace, subtle motion
- Mobile-first responsive design
- Accessible (proper ARIA attributes, keyboard support, contrast ratios)

## Checklist
1. Read existing components in `components/` to match patterns
2. Create the component file
3. Export from `components/index.ts` if that barrel file exists
4. Add any needed Tailwind theme extensions to `tailwind.config.ts`
