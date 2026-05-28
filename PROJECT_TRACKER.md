# PROJECT_TRACKER

## Last Session
2026-05-23

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
- 2026-05-01: Built `DashboardDailyStat` materialized view to fix analytics performance and inaccuracies. Implemented `DashboardStatSubscriber` to incrementally update daily stats on Order/User creation. Consolidated API requests into unified `/admin/stats/dashboard`.
- 2026-05-01: Built fully functional Orders management interface: `admin.orders.index.tsx` (data tables, filters, search, pagination) and `admin.orders.$id.tsx` (detailed views, status updates). Resolved import path issues for utilities.
- 2026-05-02: Fixed Checkout "Cart is empty" bug and "Guest cart lost on login" bug by implementing Continuous Cart Synchronization. Refactored `useCartStore` to sync with backend `CartModule` matching `useWishlistStore` architecture, updated backend `CartRepository` to include variant mappings, and added automated fetching upon login to ensure cross-device persistence.
- 2026-05-23: Implemented Category Update & Validation. Added Edit action to data tables, introduced multi-mode form reset and submit logic in CategoryFormModal, refactored mutation hooks for hook-safety, and enforced type-safe class-validator schemas on NestJS category update requests.


## Known Issues / Blockers
- None. All major authentication, data loading, and checkout bugs are resolved.

## Scope Changes
- Added custom proxy middleware for cookie sanitization to support local HTTP development.
- Materialized Dashboard Stats implementation added to resolve performance and strict table-join bugs on the dashboard.
