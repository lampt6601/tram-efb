# THC eFootball — Project Overview

## Purpose
eFootball game account marketplace (THC eFootball Shop). Public storefront for buying/selling game accounts, admin dashboard for sellers, super-admin management layer.

## Monorepo Structure (Turborepo + pnpm)
- `apps/web/` — Public storefront (Next.js 16, port 3000)
- `apps/admin/` — Admin/seller dashboard (Next.js, separate app)
- `packages/ui/` — Shared Shadcn/UI primitives
- `packages/shared/` — Shared utilities/logic
- `packages/supabase/` — Supabase client factories (browser, server, service, anon)
- `supabase/` — Schema SQL + migrations
- `scripts/` — Utility scripts
- `data-migrate/` — Data migration tools

## Tech Stack
- **Framework:** Next.js 16 (App Router) + React 19 + TypeScript
- **Database/Auth:** Supabase (PostgreSQL + Auth)
- **Styling:** Tailwind CSS v3 + Shadcn/UI + CVA
- **Build:** Turborepo + pnpm workspaces
- **Deployment:** Vercel
- **Images:** ImageKit CDN
- **Notifications:** Zalo Bot + Web Push (VAPID)
- **Forms:** react-hook-form
- **UI extras:** vaul (drawer), sonner (toasts), lucide-react (icons), next-themes (dark mode)

## Key env vars (needed in Vercel + .env.local)
NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY,
IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY, IMAGEKIT_URL_ENDPOINT,
ZALO_BOT_TOKEN, ZALO_BOT_CHAT_ID, APPROVE_SECRET_TOKEN, SUPER_ADMIN_EMAIL,
VAPID_PRIVATE_KEY, VAPID_EMAIL, NEXT_PUBLIC_VAPID_PUBLIC_KEY
