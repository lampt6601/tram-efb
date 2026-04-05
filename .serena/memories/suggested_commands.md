# Suggested Commands

## Development
```bash
# Run both apps (web + admin) concurrently
pnpm dev

# Run only web storefront (port 3000)
pnpm dev:web

# Run only admin app
pnpm dev:admin
```

## Build
```bash
pnpm build           # Build all apps
pnpm build:web       # Build web only
pnpm build:admin     # Build admin only
```

## Lint
```bash
pnpm lint            # Lint all apps via Turbo
```

## Per-app commands (run from apps/web or apps/admin)
```bash
npm run dev          # next dev --port 3000
npm run build        # next build
npm start            # next start
npm run lint         # eslint
```

## Package manager
- Use `pnpm` (not npm/yarn) — pnpm@10.33.0
- Add deps: `pnpm add <pkg> --filter @thc-efb/web`
- Workspace packages referenced as `workspace:*`

## Database
- Migrations: SQL files in `supabase/migrations/` applied via Supabase dashboard
- No automated migration runner in CI
