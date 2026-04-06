

## Plan: Cleanup — Fix CSS Errors and Remove Dead Code

### Issues Found

**1. CSS `@import` order error (active bug)**
The dev server logs show repeated warnings: `@import must precede all other statements`. In `src/index.css`, the `@tailwind` directives come before the `@import url(...)` font declarations. Per CSS spec, `@import` must come first. This can cause fonts to fail loading in some browsers.

**2. Dead files — old SPA architecture (Index.tsx)**
`src/pages/Index.tsx` (428 lines) is the old single-page app shell that managed all views with local state. It was replaced by the React Router architecture but was never deleted. It imports several files that are ONLY used by it:
- `src/views/LoginView.tsx` (342 lines) — replaced by `src/pages/auth/Login.tsx`
- `src/views/ResetPasswordView.tsx` (247 lines) — replaced by `src/pages/auth/ResetPassword.tsx`
- `src/components/PageTransition.tsx` (167 lines) — no longer used
- `src/components/BottomNav.tsx` (191 lines) — replaced by `src/components/layout/BottomNavRouter.tsx`

**3. Dead data file**
`src/data/initialData.ts` (155 lines) contains hardcoded demo data (fake properties, jobs, profile). It's not imported anywhere — all data now comes from the database.

### Changes

| # | File | Action |
|---|---|---|
| 1 | `src/index.css` | Move `@import url(...)` lines ABOVE the `@tailwind` directives |
| 2 | `src/pages/Index.tsx` | Delete |
| 3 | `src/views/LoginView.tsx` | Delete |
| 4 | `src/views/ResetPasswordView.tsx` | Delete |
| 5 | `src/components/PageTransition.tsx` | Delete |
| 6 | `src/components/BottomNav.tsx` | Delete |
| 7 | `src/data/initialData.ts` | Delete |

**Total: ~1,530 lines of dead code removed + 1 CSS bug fixed.**

No functional changes — the app will work exactly the same, just cleaner and without the CSS warnings.

