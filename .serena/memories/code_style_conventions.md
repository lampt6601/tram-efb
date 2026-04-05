# Code Style & Conventions

## Language
- TypeScript everywhere (`.tsx` for components, `.ts` for utils/logic)
- No `any` — prefer `unknown` or proper types
- Strict TS config

## Components
- Functional components + hooks only (no class components)
- Props destructured in function parameters
- Named exports for components in most cases

## Naming
- Component files: PascalCase (`AccountCard.tsx`)
- Utility/hook files: camelCase (`useAuth.ts`, `formatDate.ts`)
- Constants: UPPER_SNAKE_CASE
- Folders: camelCase or kebab-case (match existing project convention)

## Path Alias
- `@/*` → `./src/*` in both apps

## Styling
- Tailwind CSS (utility-first)
- `cn()` from `src/lib/utils.ts` for conditional class merging (tailwind-merge + clsx)
- Shadcn/UI components (in `packages/ui/` and `src/components/ui/`)
- Dark mode via `next-themes` (class strategy)
- No inline styles; avoid arbitrary Tailwind values unless necessary

## Supabase Client Pattern
Four clients in `packages/supabase/src/clients/`:
- `browser.ts` — client components (cookie auth)
- `server.ts` — Server Components / Server Actions (reads request cookies)
- `service.ts` — service role (bypasses RLS, super-admin only)
- `anon.ts` — anonymous (public views, no auth persistence)
Import as: `import { createSupabaseBrowserClient } from '@thc-efb/supabase/browser'`

## Server Actions
- Located in `src/app/actions/`
- Always call `revalidatePath()` or `revalidateTag()` after mutations
- Return `{ success, error }` shape

## Caching
- `unstable_cache` for expensive calls (e.g. `auth.admin.listUsers`) with tags
- Revalidate via `revalidateTag("tag-name")`
- Page-level: use `export const revalidate = N` at top of page/layout files

## No test framework configured
- No Jest/Vitest setup; skip writing tests unless explicitly requested
