# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.


## MCP & Serena — BẮT BUỘC

**Ở đầu MỖI conversation, Claude PHẢI gọi theo thứ tự:**

1. `mcp__serena__initial_instructions` — đọc Serena manual
2. `mcp__serena__check_onboarding_performed` — kiểm tra project đã index chưa

**Ưu tiên Serena tools cho mọi thao tác code (KHÔNG dùng Read/Glob/Grep để explore):**

- `find_symbol` — tìm function/class/component theo tên
- `get_symbols_overview` — xem cấu trúc symbols trong một file
- `search_for_pattern` — tìm pattern khi chưa biết tên symbol
- `list_dir` — duyệt thư mục
- Chỉ dùng `Read` khi cần đọc file non-code hoặc Serena không đủ

**Monorepo paths** (KHÔNG dùng `src/` trực tiếp):
- `apps/web/src/` — Public storefront
- `apps/admin/src/` — Admin dashboard
- `packages/supabase/src/` — Shared Supabase clients & types
- `packages/ui/src/` — Shared UI components

### Subagents & Planning — BẮT BUỘC

Khi spawn bất kỳ subagent nào (Plan, Explore, general-purpose), **PHẢI** include đoạn sau vào cuối prompt:

```
IMPORTANT — Use Serena MCP tools instead of Grep/Read/Glob/Bash for all code exploration:
- mcp__serena__initial_instructions — call this FIRST before doing anything
- mcp__serena__check_onboarding_performed — call this SECOND
- mcp__serena__find_symbol — find functions/classes/components by name
- mcp__serena__search_for_pattern — search when symbol name is unknown
- mcp__serena__get_symbols_overview — get symbols overview for a specific file
- mcp__serena__list_dir — browse directories
Only use Read for non-code files or when Serena tools are insufficient.
Monorepo paths (NEVER use src/ directly): apps/web/src/, apps/admin/src/, packages/supabase/src/, packages/ui/src/
```

Lý do: subagents không tự đọc CLAUDE.md — nếu không truyền instructions vào prompt, chúng sẽ dùng Grep/Read/Glob và tốn token không cần thiết.


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
  - `src/app/actions/` — Server Actions for mutations (account CRUD, super-admin ops, image upload, reviews, events, sell/seller requests)
  - `src/app/api/` — API routes (quick-approve link, contact redirects)
  - `src/app/admin/dashboard/` — Admin pages; `super/` subdirectory is super-admin only
  - `src/app/accounts/[id]/` — Public account detail page
  - `src/app/shop/[name]/` — Per-seller public shop page
- `src/components/ui/` — Shadcn/UI primitives
- `src/components/admin/` — Admin-specific components (Sidebar, AccountForm, AdminShell)
- `src/components/storefront/` — Public-facing components (Header, Footer, AccountCard, filters)
- `src/lib/` — Utilities and client factories
- `src/types/database.ts` — Supabase schema types (AccountStatus, SellRequestStatus, and all table row types)
- `supabase/schema.sql` — Core database schema; `supabase/migrations/` for incremental changes

### Supabase Client Pattern

Four Supabase clients used depending on context:  

- `supabase-browser.ts` — Browser client (cookie-based auth)
- `supabase-server.ts` — Server Components/Actions client (reads cookies from request)
- `supabase-service.ts` — Service role client (bypasses RLS, used for super-admin operations)
- `supabase-anon.ts` — Anonymous client (no cookie persistence, for public views that don't need auth)

### Authentication & Authorization

Middleware (`src/middleware.ts`) protects routes:

- `/admin/dashboard/*` requires an authenticated user
- `/admin/dashboard/super/*` additionally requires the super-admin email
- Super-admin check: `src/lib/super-admin.ts` verifies against `SUPER_ADMIN_EMAIL` env var
- Middleware is optimized to skip `supabase.auth.getUser()` when no `sb-*` cookies exist
- Admin disabled check is in dashboard `layout.tsx`, not middleware (avoids DB query on every request)

### Data Flow & Caching

- Public pages use Server Components that fetch from Supabase views (`public_accounts`, `public_sold_accounts`, `public_reviews`)
- Admin mutations go through Server Actions in `src/app/actions/` → Supabase → `revalidatePath()` for cache invalidation
- **Page-level revalidation**: Profile pages use `revalidate = 0` (always fresh), admin dashboards use 120s, public seller pages 300s, static guides/detail pages 3600s
- **Tag-based caching**: `src/lib/cached-users.ts` wraps `auth.admin.listUsers()` with `unstable_cache` (5min TTL, `admin-users` tag)

### Business Logic

- **Priority accounts:** Max 1 Available account per admin can be `is_priority: true` (enforced in `src/lib/account-priority.ts`). Priority accounts appear in the homepage carousel.
- **Image handling:** Images stored via ImageKit (`src/lib/imagekit.ts`). Upload limit 4MB (`src/lib/constants.ts`). Server action body size limit is 5MB in `next.config.ts`. Preset URL transforms in `src/lib/image-utils.ts` (thumbCard, galleryMain, galleryFull, ogImage, adminThumb).
- **Telegram Bot notifications:** `packages/shared/src/telegram-bot.ts` sends non-blocking notifications (album up to 10 photos, inline URL buttons). Env: `TELEGRAM_BOT_TOKEN` / `TELEGRAM_CHAT_ID` and reviewer group `TELEGRAM_REVIEWER_*`. Used from `apps/admin` actions (e.g. `notify-admin.ts`, sell requests, seller applications, reviewer actions, daily summary cron).
- **Rate limiting:** In-memory sliding window limiter in `src/lib/rate-limit.ts` — used for sell requests (3/10min per IP) and approve API (10/min).
- **Buyback policy:** `src/lib/buyback.ts` calculates refund rates by days elapsed (80% → 60% over 21 days).
- **Account approval workflow:** Admins create accounts (is_approved=false by default), super-admin approves before public visibility. Per-admin `auto_approve` setting in `admin_settings` table can bypass this. Quick-approve link available via `/api/approve/[id]?token=SECRET`.
- **Seller applications:** Public form at `/seller/apply`, creates auth user + admin_settings row on approval.
- **Reviews:** Buyer feedback with star rating, requires super-admin approval before public display.
- **Collateral tracking:** Per-admin security deposit with audit history in `seller_collateral_history` table.

### Database Views (used for public queries)

- `public_accounts` — Available + is_approved accounts, joined with seller profile (name, avatar, collateral, sold count)
- `public_sold_accounts` — Sold + is_approved accounts
- `public_reviews` — Only is_approved reviews

### Path Alias

`@/*` maps to `./src/*` (configured in tsconfig.json).

### Styling

Tailwind CSS with CSS variables for theming. Dark mode via `next-themes` (class strategy). Custom aspect ratio `game-screenshot` (16/7). Shadcn/UI components use Class Variance Authority. `cn()` utility in `src/lib/utils.ts` merges Tailwind classes. Images use ImageKit CDN transformations instead of Next.js image optimization (`images.unoptimized: true`).