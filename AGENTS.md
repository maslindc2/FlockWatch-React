# Flock Watch React — Agent Guide

## Project Overview

Flock Watch is a React SPA that monitors avian influenza across the U.S. It renders a choropleth map with per-state stats, info tiles for US-level summaries (30-day / all-time), and a detailed state-info panel. Data is fetched from a Node.js backend via TanStack Query.

## Tech Stack

- **Framework:** React 19, TypeScript 5.8, Vite 7, SWC
- **Data Fetching:** TanStack React Query v5
- **Visualization:** D3 v7 (d3-geo, topojson-client)
- **Testing:** Vitest 3 + Testing Library (React, jest-dom, user-event)
- **Tooling:** ESLint 9 (typescript-eslint, react-hooks, react-refresh), Prettier 3.6
- **CI:** GitHub Actions (Prettier, Vitest unit tests)

## Project Structure

```
src/
├── App.tsx                          — Root component, state management
├── main.tsx                         — Entry point
├── Components/
│   ├── ChoroplethMap/               — D3 US map with color scale, labels, legend
│   ├── InfoTiles/                   — Summary stat tiles (30-day / all-time)
│   ├── SelectedState/               — (placeholder/related to state info)
│   ├── StateDropdown/               — Dropdown to select a state
│   ├── StateInfo/                   — Expanded detail panel for a single state
│   └── TanStackPages/              — Error / loading boundaries
├── Hooks/
│   ├── useFlockCases.ts             — Fetches per-state flock data
│   ├── useUsSummaryData.ts          — Fetches US-level summary
│   └── useBackToClose.ts            — Mobile back-button handler
├── Utils/
│   ├── dateFormatter.ts             — Date formatting helper
│   └── state-abbreviation-fips.ts   — FIPS ↔ abbreviation mapping
tests/
├── unit/                            — Unit tests for components & utils
└── integration/                     — Integration tests
data/
├── flock-data.json                  — Local dev fixture for flock cases
└── us-summary.json                  — Local dev fixture for US summary
```

## Coding Conventions

- **Indentation:** 4 spaces (see `.prettierrc.json`)
- **Quotes:** Double quotes (`"`)
- **Semicolons:** Required
- **Trailing commas:** ES5 style (objects/arrays, not function params)
- **JSX:** Use `.tsx` extension, `react-jsx` transform
- **Imports:** No default import style for React; use `import { ... } from "react"`
- **Types:** Prefer `interface` over `type` for object shapes; use inline `type` for unions/utility types. Export interfaces/types used across files.
- **Hooks:** Named exports (e.g. `export function useFlockCases(...)`). Custom hooks in `src/Hooks/`, TanStack Query hooks return `UseQueryResult`.
- **Components:** `const Component: FC<Props> = ({ ... }) =>` pattern, default exported.
- **CSS:** Plain CSS files imported directly (e.g. `import "./App.css"`), no CSS modules or Tailwind.
- **Avoid comments** unless necessary for JSDoc explaining public API.

## Environment Variables

| Variable | Purpose | Default |
|---|---|---|
| `VITE_FLOCKWATCH_SERVER` | Backend base URL | `http://localhost:3000/data` |
| `VITE_USE_LOCAL` | Use local JSON fixtures (`"true"` to enable) | `"false"` |

## Common Commands

```bash
npm run dev          # Start Vite dev server (--host)
npm run build        # TypeScript check + Vite build
npm run test         # Run all Vitest tests
npm run test:unit    # Run only unit tests (tests/unit)
npm run test:coverage # Run with coverage (src/**, excludes main.tsx, vite-env.d.ts)
npm run lint         # ESLint fix
npm run format       # Prettier format
```

## Testing Conventions

- **Framework:** Vitest with jsdom environment, globals enabled
- **Setup:** `vitest.setup.ts` imports `@testing-library/jest-dom`
- **Coverage:** Configured in `vitest.config.ts`, covers `src/**` (excludes entry point and env types)
- **Pattern:** Tests live in `tests/unit/` and `tests/integration/`, outside `src/`
- **Mocks:** Use `nock` for HTTP mock (listed in dependencies)
- **Local dev:** When `VITE_USE_LOCAL=true`, hooks import JSON fixtures directly; those code paths are marked `/* v8 ignore start */`

## TanStack Query Patterns

- Query keys: `["flockCases"]` and `["usSummaryData"]`
- `staleTime: 15 * 60 * 1000` (15 minutes) on both queries
- Hooks accept the full server URL and append the path segment (`/data/flock-cases`, `/data/us-summary`)
- Error handling: components check `isPending`/`error` from the query result

## State Management

- No global state library; all state lives in `App.tsx` via `useState`
- `selectedState` — `StateInformation | null` (controls showing state info panel)
- `selectedStat` — `"30days" | "allTime"` (toggles info tiles mode)
- `useBackToClose` hook handles mobile browser back button to close the state panel

## CI/CD (GitHub Actions)

- **Prettier:** Runs on push/PR to `main`, auto-formats and commits
- **Unit Tests:** Runs on push/PR to `main`, executes `npm run test:unit`
