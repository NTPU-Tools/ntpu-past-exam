# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

NTPU Past Exam frontend — a Next.js 14 app for National Taipei University students to browse and upload past exam papers, organized by department and course.

## Commands

```bash
pnpm dev          # Start dev server (localhost:3000)
pnpm build        # Production build (standalone output)
pnpm start        # Start production server
pnpm lint         # ESLint
```

Package manager is **pnpm** (v9.12.2). Do not use npm or yarn.

## Tech Stack

- **Next.js 14** with **Pages Router** (`pages/` directory, NOT App Router)
- TypeScript, Tailwind CSS, shadcn/ui (Radix UI primitives)
- SWR for data fetching, Axios for HTTP client, Zustand for global state
- React Hook Form + Zod for form validation
- react-pdf for PDF viewing, Google OAuth for authentication
- Deployed on Zeabur as standalone Next.js (`output: "standalone"`)

## Architecture

### Routing (Pages Router)

```
pages/
├── index.tsx                              # Home — department selector
├── login.tsx                              # Google OAuth + username/password fallback
├── 404.tsx
├── [department_id]/
│   ├── index.tsx                          # Department bulletins
│   └── [course_id]/
│       ├── index.tsx                      # Course posts list
│       └── [post_id].tsx                  # Post detail with PDF viewer
└── admin/
    └── [admin_department_id]/index.tsx     # Admin dashboard
```

### Auth Flow

1. Google OAuth code → `POST /exchange` → access + refresh JWT tokens
2. Tokens stored in cookies: `ntpu-past-exam-access-token` (30 days), `ntpu-past-exam-refresh-token` (365 days)
3. `middleware.ts` calls backend `/verify-token` to protect routes and check department/admin access
4. `api-client/instance.ts` — Axios interceptor auto-refreshes tokens on 401 "Credentials Expired"

### Key Patterns

- **Dialog state via URL**: Dialogs open/close via `router.query` params (e.g., `?open_create_post_dialog=true`). All dialogs mounted in `containers/Dialogs/index.tsx`, rendered in `_app.tsx`.
- **Resizable layout**: `components/Layout.tsx` uses `react-resizable-panels` — sidebar (courses by category) + main content. Simple layout for `/` and `/login`.
- **Course grouping**: `hooks/useDepartmentCourse.ts` fetches courses and groups by category, sorted with Chinese locale.
- **PDF viewer**: `components/PDFViewer.tsx` with page navigation, download button, and iframe fallback on error.
- **Admin easter egg**: 20 clicks on login page toggles username/password mode.

### State Management

- `store/userStore.ts` — logged-in user data (Zustand)
- `store/globalUiStateStore.ts` — resizable panel width (Zustand)

### Schemas (`schemas/`)

Zod validation schemas for: login, user profile edit, course add, post create (PDF-only file validation), bulletin add.

### API Client

`api-client/instance.ts` — Axios instance with:
- Base URL from cookie-stored origin or env
- Bearer token from cookie
- Response interceptor: auto-refresh on 401, logout on refresh failure

## Environment Variables

```
NEXT_PUBLIC_API_ORIGIN              # Backend URL (client-side)
API_ORIGIN                          # Backend URL (server-side, middleware)
NEXT_PUBLIC_GOOGLE_LOGIN_CLIENT_ID  # Google OAuth client ID
NEXT_PUBLIC_GA_MEASUREMENT_ID       # Google Analytics
NEXT_PUBLIC_CLARITY_MEASUREMENT_ID  # Microsoft Clarity
```

## Code Style

- ESLint: Airbnb + Next.js + Prettier
- Import sorting: `@trivago/prettier-plugin-sort-imports`
- Path alias: `@/*` maps to project root
- `utils/cn.ts` — `cn()` helper (clsx + tailwind-merge)
