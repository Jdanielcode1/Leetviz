# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

LeetViz is an algorithm visualization web app that generates interactive step-by-step visualizations for LeetCode problems. Users can view pre-built visualizations for common problems or create custom visualizations by submitting their own code.

## Tech Stack

- **Frontend**: React 19, TanStack Start, TanStack Router, TanStack Query, TailwindCSS 4
- **Backend**: Convex (real-time database and serverless functions)
- **AI**: Claude API for generating visualization steps
- **Deployment**: Cloudflare (via Vite plugin + Wrangler)
- **Build**: Vite 7, TypeScript

## Development Commands

```bash
npm run dev          # Start both Convex and Vite dev servers concurrently
npm run dev:web      # Start only Vite dev server (port 3000)
npm run dev:convex   # Start only Convex dev server
npm run build        # Build for production
npm run lint         # TypeScript check + ESLint
npm run format       # Prettier format
npm run deploy       # Build and deploy to Cloudflare
```

## Architecture

### TanStack Start + Router
- Full-stack React framework using TanStack Start with file-based routing in `src/routes/`
- Route tree auto-generated in `src/routeTree.gen.ts`
- Router configured in `src/router.tsx` with Convex + React Query integration
- Pre-built problem visualizations at `/problems/<problem-name>.tsx`
- Dynamic visualization view at `/viz/$id.tsx`
- Custom visualization creation at `/create.tsx`

### Convex Backend (`convex/`)
- `schema.ts`: Database schema with `visualizations` table
- `visualizations.ts`: Queries for listing/fetching visualizations
- `generateVisualization.ts`: Node.js action that calls Claude API to generate visualization steps

### Convex + React Query Integration
Uses `@convex-dev/react-query` for data fetching:
```typescript
// For queries
import { convexQuery } from '@convex-dev/react-query'
const { data } = useQuery(convexQuery(api.visualizations.getVisualization, { id }))

// For actions/mutations
import { useConvexAction } from '@convex-dev/react-query'
const mutation = useMutation({
  mutationFn: useConvexAction(api.generateVisualization.generateVisualization),
})
```

### Path Aliases
- `~/` maps to `./src/` (configured in tsconfig.json)

## Convex Guidelines

Follow the patterns in `.cursor/rules/convex_rules.mdc`:
- Use new function syntax with explicit `args` and `returns` validators
- Use `v.null()` for functions that don't return a value
- Use `internalQuery`/`internalMutation`/`internalAction` for private functions
- Include return type validators on all functions
- Use `withIndex()` instead of `filter()` for queries
- Add `"use node";` at the top of action files that use Node.js packages (e.g., `@anthropic-ai/sdk`)

## Environment Variables

Required in `.env.local`:
- `VITE_CONVEX_URL`: Convex deployment URL

Required in Convex dashboard (environment variables):
- `ANTHROPIC_API_KEY`: For Claude API calls in the generateVisualization action
