# KOMI — Development Guide

## Setup

### Prerequisites
- Node.js 20+
- npm / pnpm
- GitHub account (repo: `komi`)
- Supabase project

### Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key |

### Install & Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Project Structure

```
src/
├── actions/          # Server Actions
│   ├── auth.ts       # login, signup, logout, resetPassword
│   └── workspace.ts  # bootstrapWorkspace, ensureUserProfile
├── app/
│   ├── (auth)/       # Public auth pages (no layout)
│   │   ├── login/
│   │   ├── signup/
│   │   └── reset-password/
│   ├── (dashboard)/  # Protected pages (dashboard layout)
│   │   └── dashboard/
│   ├── (onboarding)/ # First-run onboarding
│   │   └── onboarding/
│   └── auth/
│       └── callback/ # Supabase auth callback route
├── lib/
│   └── supabase/
│       ├── client.ts  # Browser Supabase client
│       ├── server.ts  # Server Supabase client (SSR)
│       └── types.ts   # TypeScript types for DB schema
├── components/
│   └── ui/           # shadcn/ui components
└── middleware.ts      # Auth session refresh + route protection
supabase/
└── migrations/
    ├── 001_core_schema.sql   # All tables + indexes
    ├── 002_rls_policies.sql  # RLS enable + policies
    └── 003_storage.sql       # Storage bucket + policies
```

---

## Authentication Flow

1. User visits `/` → redirected to `/dashboard`
2. Middleware checks session → redirects to `/login` if unauthenticated
3. After login → `/dashboard`
4. First login (no user profile) → `/onboarding` (2-step wizard)
5. Onboarding creates: workspace → user profile → first insurance company

---

## Database

### Key Tables (Phase 0)
| Table | Purpose |
|---|---|
| `workspaces` | Agency container |
| `users` | Extends `auth.users` with workspace + role |
| `insurance_companies` | Companies per workspace |
| `reporting_periods` | Monthly cycles |
| `contracts` | Insurance agreements (versioned) |
| `contract_rules` | Commission rules per contract |
| `clients` | Individual clients |
| `families` | Household groups |
| `family_memberships` | Client↔family history |
| `products` | Insurance products per company |
| `policies` | Insurance policies |
| `policy_history` | Monthly snapshot per policy |
| `client_match_candidates` | Unresolved client matches |
| `external_references` | CRM bridge table |
| `company_file_definitions` | Expected file structure per company |
| `audit_logs` | Immutable action log |

### RLS
All tables use Row Level Security. Every row is scoped to `workspace_id`.
The helper function `public.get_my_workspace_id()` returns the calling user's workspace.

---

## Known Limitations (Phase 0)

- No email confirmation flow UI (Supabase sends the email, but there's no "check your email" redirect page yet)
- Onboarding only allows one company — more can be added via Supabase dashboard or Phase 1 UI
- No role-based access control enforcement in UI yet (roles exist in DB)
- Storage bucket created but no upload UI until Phase 1
- `NEXT_PUBLIC_SITE_URL` not set — email redirect defaults to `http://localhost:3000`

---

## Verification Checklist

- [ ] `npm run dev` starts without errors
- [ ] `/signup` creates user in Supabase Auth
- [ ] After signup, user is redirected to `/onboarding`
- [ ] Onboarding creates workspace + user profile + company
- [ ] After onboarding, `/dashboard` loads with company count
- [ ] `/login` authenticates and redirects to `/dashboard`
- [ ] Logout clears session and redirects to `/login`
- [ ] Unauthenticated access to `/dashboard` redirects to `/login`
- [ ] Different users cannot see each other's workspace data (RLS)

---

## Deployment (Vercel)

1. Push to GitHub
2. Import repo in Vercel → team: `milmangroup`
3. Add environment variables in Vercel project settings
4. Add `NEXT_PUBLIC_SITE_URL=https://your-vercel-domain.vercel.app`
