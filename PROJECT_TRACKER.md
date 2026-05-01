# PROJECT_TRACKER

## Last Session
2026-05-01

## Phases & Progress
- Phase 1: Planning production-grade architecture (Completed - 100%)

## Session Log
- 2026-04-29: Initialized project tracker. Created implementation plan for turning the static basic dashboard into a production-grade application (env files, layout fix, API adapters).
- 2026-04-29: Completed implementation of API adapters, environment variables, layout fixes, and replaced AdminPlaceholder with real data tables for Products and Users.
- 2026-04-29: Debugged "401 Unauthorized" loop. Identified malformed Set-Cookie headers in the TanStack Start proxy and implemented cookie sanitization (stripping Secure/Domain flags and enforcing SameSite=Lax) to fix local development authentication.
- 2026-04-29: Identified and fixed "refresh storm" race condition causing automatic logouts. Deduplicated token refresh requests using a shared promise and implemented Bearer token injection for retried requests.
- 2026-04-29: FIXED root cause of instant-logout. Removed `beforeLoad` auth guard from admin.tsx (it was catching 401s before the axios interceptor could retry). Moved guard into AdminShell component-level using useAdminProfile + useEffect. Auth persistence VERIFIED via automated stress test: login, navigation between routes, page refresh — all PASS ✅.
- 2026-04-29: FIXED remaining UI bugs across the dashboard:
  - Fixed dashboard stats widgets crashing (`slice is not a function`) by safely unwrapping the API arrays.
  - Fixed sidebar showing "undefined undefined" for user profile names by unwrapping the `useAdminProfile` response.
  - Silenced expected 403 Forbidden toasts on the dashboard caused by role-restricted badge checks (added `_silent` config option to the Axios interceptor).
  - Fixed empty data tables (Products and Categories) by updating `BaseAdapter` to safely normalize backend paginated responses (`{items, meta}`) into the expected frontend format (`{data, total, ...}`).
- 2026-05-01: Fixed badge visibility issues. Added explicit `/health` endpoint to backend `AppController`. Re-applied avatar status badge (Green/Red dot) and uncommented notification badges in `TopBar.tsx`. Verified fix in browser.

## Known Issues / Blockers
- None. All major authentication and data loading UI bugs are resolved.

## Scope Changes
- Added custom proxy middleware for cookie sanitization to support local HTTP development.
