# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Orcfax Fact Explorer — a SvelteKit application for browsing and verifying oracle fact statements published on the Cardano blockchain. It displays data feeds, fact statements, validator nodes, and data sources from a PocketBase backend.

## Commands

- **Dev server**: `pnpm dev`
- **Build**: `pnpm build` (Node adapter, outputs to `build/`)
- **Type check**: `pnpm check`
- **Lint**: `pnpm lint` (runs Prettier check then ESLint)
- **Format**: `pnpm format` (Prettier auto-fix)
- **Unit tests**: `pnpm test:unit` (Vitest, pattern: `src/**/*.{test,spec}.{js,ts}`)

Pre-commit hook runs `pnpm format && pnpm lint` via Husky.

## Tech Stack

- **Svelte 4** + SvelteKit 2 with Node adapter (SSR)
- **TypeScript** (strict mode)
- **Tailwind CSS 3** with custom HSL theme variables and dark mode (`selector` strategy)
- **PocketBase** as the database (accessed server-side via `event.locals.pb`)
- **TanStack Svelte Query** for client-side data fetching/caching
- **Zod** for runtime schema validation and type inference
- **UI**: Bits UI + Melt UI (shadcn-svelte pattern), Lucide icons
- **Charts**: Chart.js with svelte-chartjs
- **Preprocessing**: `vitePreprocess()` → `preprocessMeltUI()`

## Architecture

### Data Flow

1. **Server load functions** (`+page.server.ts`, `+layout.server.ts`) query PocketBase and return data (often as streaming promises)
2. **API routes** under `src/routes/api/` handle search, archive downloads, RSS, and error logging
3. **Client components** use TanStack Svelte Query for reactive data fetching with caching
4. **Zod schemas** in `src/lib/types.ts` are the single source of truth for all data types — types are inferred via `z.infer<>`

### Network Selection

Networks are determined by subdomain: `mainnet.explorer.orcfax.io` vs `preview.explorer.orcfax.io`. Parsed in `+layout.server.ts` from `url.hostname`, defaults to Mainnet. The current network is shared app-wide via `networkStore` (Svelte writable store).

### Key Directories

- `src/lib/components/` — Reusable Svelte components (feature components at root, base UI in `ui/`)
- `src/lib/components/ui/` — shadcn-svelte style primitives (card, button, table, etc.)
- `src/lib/client/` — Client-side API functions (`api.ts`) and formatting helpers (`helpers.ts`)
- `src/lib/server/db/` — Server-only PocketBase query functions (`index.ts`) and archive processing (`archive.ts`)
- `src/lib/server/logger.ts` — Winston logger with Discord webhook for production error alerts
- `src/lib/stores/` — Svelte stores for network, archive selection, time, feeds list
- `src/lib/icons/` — Custom SVG icon components
- `src/lib/types.ts` — All Zod schemas and TypeScript types (~600 lines)
- `src/lib/utils.ts` — `cn()` class merging utility (clsx + tailwind-merge), custom transitions

### Routing

- `/` — Dashboard with streaming data sections
- `/feeds/[...feed_id]` — Feed detail pages (variable-depth slug)
- `/feeds/[...feed_id]/facts/[fact_id=fact_id]` — Individual fact statement page (custom param matcher)
- `/api/search`, `/api/archive`, `/api/facts`, `/api/logError`, `/api/rss_feed` — API endpoints

### Server Hooks (`hooks.server.ts`)

- Creates a fresh PocketBase instance per request on `event.locals.pb`
- Sets security headers (X-Frame-Options, CSP)
- Centralized error handling via Winston logger

## Conventions

- **Formatting**: Tabs, single quotes, no trailing commas, 100 char width
- **Class merging**: Use `cn()` from `$lib/utils` (combines clsx + tailwind-merge)
- **Environment vars**: `PUBLIC_*` for browser-accessible, `PRIVATE_*` for server-only; accessed via `$env/dynamic/public` and `$env/dynamic/private`
- **Unused vars**: Prefix with `_` (ESLint configured to allow `_`, `$$Props`, `$$Events`)
- **Tables**: svelte-headless-table with server-side pagination
- **Dark mode**: Managed by mode-watcher library, applied via `.dark` class on `<html>`
- **Custom Tailwind plugin**: `waterReflectionPlugin.js` provides gradient text/border animation utilities
