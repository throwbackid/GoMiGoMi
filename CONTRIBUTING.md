# Contributing to gomigomi

This guide helps frontend and backend team members collaborate effectively.

## Team Structure

| Team | Responsibilities |
|------|-----------------|
| **Frontend** | Components in `components/`, pages in `app/(auth)/` and `app/(main)/` |
| **Backend** | API routes in `app/api/`, lib functions in `lib/`, database schema |

## Getting Started

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your values

# Set up database
npx prisma generate
npx prisma db push

# Run development server
npm run dev
```

## Directory Structure

```
gomigomi/
├── app/
│   ├── (auth)/          # Auth pages (login, register) - Frontend
│   ├── (main)/          # Main app pages - Frontend
│   └── api/             # API routes - Backend
├── components/
│   ├── ui/              # shadcn components (shared)
│   ├── lottery/         # Lottery components - Frontend
│   ├── address/         # Address components - Frontend
│   ├── layout/          # Layout components - Frontend
│   └── shared/          # Shared components - Frontend
├── lib/                 # Utility functions - Backend
├── prisma/              # Database schema - Backend
└── types/               # Shared types (both teams)
```

## Development Workflow

### Frontend Team

1. **Components**: Work in `components/` directories
2. **Pages**: Work in `app/(auth)/` and `app/(main)/`
3. **Styling**: Use Tailwind CSS + shadcn/ui components
4. **State**: Use TanStack Query for server state
5. **Types**: Import from `@/types`

```tsx
// Example: Using types
import { Lottery, LotteryEntry } from "@/types";

// Example: API calls with TanStack Query
import { useQuery } from "@tanstack/react-query";

function useLotteries() {
  return useQuery({
    queryKey: ["lotteries"],
    queryFn: () => fetch("/api/lotteries").then(res => res.json()),
  });
}
```

### Backend Team

1. **API Routes**: Work in `app/api/`
2. **Business Logic**: Work in `lib/`
3. **Database**: Work in `prisma/schema.prisma`
4. **Validation**: Use Zod schemas from `@/types`

```typescript
// Example: Using Zod validation in API routes
import { createLotterySchema } from "@/types";

const validated = createLotterySchema.parse(body);
```

## API Route Conventions

All API routes follow this response format:

```typescript
// Success
{ success: true, data: {...} }

// Error
{ success: false, error: "Error message" }
```

### Status Codes

| Code | Usage |
|------|-------|
| 200 | Success (GET, PUT) |
| 201 | Created (POST) |
| 400 | Bad request / validation error |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not found |
| 500 | Server error |
| 501 | Not implemented (placeholder) |

## File Naming Conventions

- **Components**: PascalCase (`LotteryCard.tsx`)
- **Pages**: lowercase with dashes (`my-entries/page.tsx`)
- **API Routes**: lowercase (`route.ts`)
- **Lib files**: lowercase (`lottery.ts`)

## Component Documentation

Each component stub includes:
- Purpose description
- Props interface
- Feature checklist (TODO items)
- Team ownership

```tsx
/**
 * ComponentName
 *
 * Description of what this component does.
 *
 * @owner Frontend Team
 *
 * Props:
 * - propName: type - description
 *
 * Features:
 * - [ ] Feature to implement
 */
```

## API Route Documentation

Each API route stub includes:
- Endpoint description
- HTTP methods
- Business rules
- TODO checklist

```typescript
/**
 * Resource API - Description
 *
 * GET    /api/resource - List resources
 * POST   /api/resource - Create resource
 *
 * @owner Backend Team
 *
 * TODO:
 * - [ ] Task to implement
 */
```

## Database Changes

1. Edit `prisma/schema.prisma`
2. Run `npx prisma db push` (development)
3. Notify team of schema changes
4. Update types in `types/index.ts` if needed

## Testing Checklist

Before submitting a PR:

- [ ] Code compiles without errors (`npm run build`)
- [ ] Linting passes (`npm run lint`)
- [ ] Types are correct (no `any` unless necessary)
- [ ] API routes return proper status codes
- [ ] Components handle loading and error states

## Git Workflow

1. Create feature branch from `main`
2. Use descriptive branch names: `feature/lottery-entry`, `fix/auth-redirect`
3. Write clear commit messages
4. Create PR with description of changes
5. Request review from relevant team

## Environment Variables

Required variables (see `.env.example`):

| Variable | Description |
|----------|-------------|
| DATABASE_URL | PostgreSQL connection string |
| BETTER_AUTH_SECRET | Auth encryption secret (min 32 chars) |
| BETTER_AUTH_URL | App URL (http://localhost:3000) |
| NEXT_PUBLIC_APP_URL | Public app URL for client |
| GOOGLE_CLIENT_ID | Google OAuth client ID |
| GOOGLE_CLIENT_SECRET | Google OAuth secret |
| UPLOADTHING_SECRET | Uploadthing API secret |
| UPLOADTHING_APP_ID | Uploadthing app ID |

## Communication

- **Questions about types/contracts**: Discuss in team channel
- **API changes**: Notify frontend team before merging
- **Schema changes**: Notify all team members
- **Blocking issues**: Raise immediately

## Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [shadcn/ui](https://ui.shadcn.com)
- [TanStack Query](https://tanstack.com/query)
- [Zod](https://zod.dev)
- [Better Auth](https://better-auth.com)
