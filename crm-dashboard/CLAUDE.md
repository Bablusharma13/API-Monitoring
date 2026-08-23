# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server (Vite HMR)
npm run build     # Production build
npm run lint      # ESLint check
npm run preview   # Preview production build locally
```

There is no test suite configured.

## Architecture

This is a React 19 + Vite CRM dashboard. The core stack is:
- **UI**: React 19, TailwindCSS v4, Lucide React
- **Routing**: React Router v7
- **Server state**: TanStack Query v5 (for feature data fetching)
- **Client state**: Redux Toolkit (RTK Query for global/shared API slices)
- **HTTP**: Axios (used directly in services and hooks, not RTK Query, for feature-level calls)
- **Notifications**: Sonner (primary); react-hot-toast also present but prefer Sonner

### Directory layout

```
src/
  features/                   # Feature modules (apis, incidents, categories, checks,
                              #   cronHeartbeat, cronInventory, cronJobHistory,
                              #   apiDashboard, apiDetails, apiForm, apiLeaderboard,
                              #   tenants, auth)
  components/
    layout/                   # ApplicationLayout (sidebar + outlet), PrivateRoute (auth guard)
    ui/                       # Shared design-system components (Badge, Drawer, Modal, …)
    TableComponents/          # Table.jsx and all sub-components (ColPanel, Cell, etc.)
    ButtonComponents/         # Button.jsx, ExportButton.jsx
  pages/                      # Page-level components for monitoring routes (LogExplorer,
                              #   Alerts, Traffic, UserDetail, etc.)
  formComponents/             # Standalone form field components (MultiSelect, TextEditor, …)
  redux/
    slices/                   # RTK slices and RTK Query API slices
    reducers.js               # Combines non-RTK-Query reducers
    store.js                  # Configures store + middleware
  hooks/                      # App-wide hooks (useFetchCurrentUser, useSidebar)
  utils/
    exportCsv.js              # CSV export with per-feature column configs
    helpers.js                # isValidUrl, formatCount, formatDateTime, …
  index.css                   # All custom utility classes (Tailwind @layer components)
  App.jsx                     # BrowserRouter + route tree root
```

### Feature module pattern

Each feature under `src/features/<name>/` follows this structure:
1. `services/index.js` — raw Axios calls, returns unwrapped `data.data`
2. `hooks/query/use*Query.js` — TanStack Query wrappers (queries and mutations)
3. `components/` — React components that call the query hooks
4. `components/columns.jsx` — table column definitions for that feature
5. `constants.jsx` — column groups, filter configs, and other static data

### Routing

`src/App.jsx` defines the full route tree using React Router v7 with `BrowserRouter`. All protected routes live under a `PrivateRoute` wrapper → `ApplicationLayout`. Route paths follow `/dashboard/<feature>`.

### Authentication flow

`PrivateRoute.jsx` is the auth gate. On mount it calls `VITE_GLOBAL_AUTH_BACKEND/api/auth/verify` (with `withCredentials`). On failure it redirects to the external auth frontend (`VITE_GLOBAL_AUTH_FRONTEND`). The verified token is stored in the `user` Redux slice.

Sidebar menu items are permission-based and fetched from `VITE_GLOBAL_AUTH_BACKEND/api/menu/get-menu-based-on-permissions/:userId`.

### Redux store

Three RTK Query API slices registered in the store: `cardApi`, `LookUpAPI`, `globalApi`. Standard (non-RTK-Query) slices: `user`, `calender`, `general`, `ticket`, `navbarSettings`, `permission`.

### Styling conventions

Custom utility classes live in `src/index.css` inside `@layer components` — this is the canonical place for reusable Tailwind-based classes. Key classes:

| Class | Purpose |
|---|---|
| `container-page` | Page root (`flex flex-col gap-5`) |
| `wrapper-main` | Main content area (padding, bg) |
| `wrapper-sidebar` / `wrapper-expanded` / `wrapper-collapsed` | Sidebar layout |
| `wrapper-card` | White card with border |
| `wrapper-table` | Table container card |
| `table-toolbar` / `table-pagination` / `table-cell` | Table sub-areas |
| `btn`, `btn-primary`, `btn-red`, `btn-sm`, `btn-icon` | Button variants |
| `badge`, `b-green`, `b-red`, `b-amber`, `b-blue`, … | Badge variants |
| `drawer-*` / `drow` / `dkey` / `dval` | Drawer detail rows |
| `pageheader-*` | PageHeader sub-elements |

CSS custom properties (defined in `:root`): `--sidebar-width`, `--sidebar-collapsed-width`, `--main-wrapper-padding`, `--main-bg-colour`, `--main-border-color`.

### Table component

`src/components/TableComponents/Table.jsx` is the central, most complex UI component (~1,700 lines). It is fully server-side (pagination, search, sort, filters are all managed externally and passed as props). Key props:

- `columns` — array of column definitions (see JSDoc at top of file for full schema)
- `additionalFilters` — filter pills config (defined in feature `constants.jsx`)
- `group` — column group color mapping object (also from `constants.jsx`)
- `selectable` + `bulkActions` — enable row checkboxes and bulk action bar
- `onRowClick` — opens a `Drawer` for detail view
- Column preferences (visibility, pin, width) are persisted to `localStorage` keyed by `tableName`

Sub-components in the same directory: `ColPanel`, `Cell`, `EditableCell`, `Heading`, `ActionsCell`, `TableControl`, `HeaderDropdownMenu`, `SelectWithPagination`.

### Environment variables

| Variable | Purpose |
|---|---|
| `VITE_GLOBAL_AUTH_BACKEND` | Auth API (verify, me, menu) |
| `VITE_GLOBAL_AUTH_FRONTEND` | External login/verify UI redirect target |
| `VITE_BILLING_BACKEND` | Base URL for `globalApi` RTK Query slice |
| `VITE_GLOBAL_MARKETING_BACKEND_API_URL` | Marketing project list API |
| `VITE_GLOBAL_MARKETING_API_URL` | Marketing frontend URL (for sidebar links) |
| `VITE_CRM_BACKEND` | Base URL for feature services (apis, incidents, categories, dashboard) |
