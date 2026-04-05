# Task Completion Checklist

After completing any coding task in thc-efb:

1. **Lint** — run `pnpm lint` (or `npm run lint` inside the app) to catch TS/ESLint errors
2. **Type-check** — if lint doesn't cover it, run `npx tsc --noEmit` inside the relevant app
3. **Revalidation** — if you mutated Supabase data, ensure `revalidatePath()` or `revalidateTag()` is called in the Server Action
4. **Env vars** — if you added new env vars, add them to:
   - `turbo.json` → `globalEnv` array
   - Vercel project settings (production + preview)
   - `.env.local` example comment
5. **No secrets committed** — never commit `.env.local` or files with real keys
6. **Consistent client usage** — use the right Supabase client for the context (browser/server/service/anon)
7. **Mobile check** — test on mobile viewport if touching UI components (vaul drawers, fixed positioning)
