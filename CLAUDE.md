# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
npm run dev      # Start dev server on http://localhost:3000
npm run build    # Production build
npm start        # Start production server
npm run lint     # Run ESLint
```

No test framework is configured. Database migrations are applied via SQL files in `supabase/migrations/` through the Supabase dashboard.

## Architecture

**Stack:** Next.js 16 (App Router) + React 19 + TypeScript + Supabase + Tailwind CSS + Shadcn/UI

**What this is:** An eFootball game account marketplace (THC eFootball Shop) with a public storefront, admin dashboard, and super-admin management layer. Deployed on Vercel.

### Key Directories

- `src/app/` — Next.js App Router pages and layouts
  - `src/app/actions/` — Server Actions for mutations (account CRUD, super-admin ops, image upload)
  - `src/app/api/` — API routes (search suggestions)
  - `src/app/admin/dashboard/` — Admin pages; `super/` subdirectory is super-admin only
  - `src/app/accounts/[id]/` — Public account detail page
- `src/components/ui/` — Shadcn/UI primitives
- `src/components/admin/` — Admin-specific components (Sidebar, AccountForm, AdminShell)
- `src/components/storefront/` — Public-facing components (Header, Footer, AccountCard, filters)
- `src/lib/` — Utilities and client factories
- `src/types/database.ts` — Supabase schema types
- `supabase/schema.sql` — Full database schema; `supabase/migrations/` for incremental changes

### Supabase Client Pattern

Three Supabase clients are used depending on context:
- `supabase-browser.ts` — Browser client (cookie-based auth)
- `supabase-server.ts` — Server Components/Actions client (reads cookies from request)
- `supabase-service.ts` — Service role client (bypasses RLS, used for super-admin operations)

### Authentication & Authorization

Middleware (`src/middleware.ts`) protects routes:
- `/admin/dashboard/*` requires an authenticated user
- `/admin/dashboard/super/*` additionally requires the super-admin email
- Super-admin check: `src/lib/super-admin.ts` verifies against a hardcoded email

### Data Flow

- Public pages use Server Components that fetch from Supabase `public_accounts` view (read-only, only Available items)
- Admin mutations go through Server Actions in `src/app/actions/` which call Supabase, then `revalidatePath()` for cache invalidation
- Account approval workflow: admins create accounts (is_approved=false by default), super-admin approves before public visibility. Per-admin `auto_approve` setting in `admin_settings` table can bypass this.

### Business Logic

- **Priority accounts:** Max 2 Available accounts per admin can be `is_priority: true` (enforced in `src/lib/account-priority.ts`). Priority accounts appear in the homepage carousel.
- **Image handling:** Images stored via ImageKit. Upload limit 4MB (see `src/lib/constants.ts`). Server action body size limit is 5MB in `next.config.ts`.
- **Email notifications:** Nodemailer with Gmail SMTP (`src/lib/mail.ts`)

### Path Alias

`@/*` maps to `./src/*` (configured in tsconfig.json).

### Styling

Tailwind CSS with CSS variables for theming. Custom aspect ratio `game-screenshot` (16/7). Shadcn/UI components use Class Variance Authority. `cn()` utility in `src/lib/utils.ts` merges Tailwind classes.
