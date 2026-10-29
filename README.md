# GoMiGoMi

GoMiGoMi is a prototype for a secondhand marketplace where items are offered through point-based lotteries. Users list used goods, enter lotteries with virtual points, and add points to boost their chances of winning.

Developed as a school group project, it explores this marketplace concept for demonstration and learning. It does not support real-money transactions and is not intended for public launch.

Original group project: [PBL4-2025/pbl_gomigomi](https://github.com/PBL4-2025/pbl_gomigomi).

## Features

- **Item listings:** Browse by category, view item details and photos, and create or manage lotteries.
- **Lottery entries and boosts:** Spend virtual points to enter, then add points to increase the entry's share of the pool.
- **Weighted winner selection:** Each participant's chance of winning is proportional to their points contributed. An entry of 30 points in a 100-point pool has a 30% chance.
- **Personal dashboard:** Track created lotteries, entries, point balances, and transaction history.
- **Accounts and notifications:** Email/password and Google sign-in, profile and shipping address management, and in-app activity notifications.

When a lottery completes, the creator receives the points in its pool. Cancelled lotteries refund participants' points.

## Tech stack

| Area | Technologies |
| --- | --- |
| Application | Next.js 16 App Router, React 19, TypeScript |
| Interface | Tailwind CSS 4, shadcn/ui, TanStack Query |
| Data | PostgreSQL, Prisma 5 |
| Authentication | Better Auth |
| Validation and uploads | Zod, UploadThing |
| Testing | Jest, Playwright |

## Run locally

Requires Node.js 22, npm, and a PostgreSQL database.

```bash
git clone https://github.com/throwbackid/gomigomi.git
cd gomigomi
```

Create a `.env` file in the project root with the following values, replacing the database credentials and auth secret:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/gomigomi"
BETTER_AUTH_SECRET="replace-with-a-random-secret-at-least-32-characters-long"
BETTER_AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

Generate an auth secret with `openssl rand -base64 32`. For the corresponding integrations, add:

| Variable | Purpose |
| --- | --- |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Google sign-in |
| `UPLOADTHING_TOKEN` | Image uploads; obtain a token from [UploadThing](https://docs.uploadthing.com/getting-started/appdir) |
| `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | Redis-backed rate limiting and scheduled-job locking |
| `CRON_SECRET` | Authenticate requests to the lottery completion endpoint |

Install dependencies, initialize the local database, and start the app:

```bash
npm ci
npm run db:push
npm run dev
```

Open [localhost:3000](http://localhost:3000). The install step generates the Prisma client. Optionally run `npm run db:seed` to add sample data to the local database.

Scheduled lottery completion is configured in `vercel.json`. For local testing, invoke `GET /api/cron/complete-lotteries`; if `CRON_SECRET` is set, send it as a Bearer token.

## Development commands

| Command | Purpose |
| --- | --- |
| `npm run lint` | Check code with ESLint |
| `npm test` | Run unit tests |
| `npm run test:e2e` | Run Playwright tests |
| `npm run build` | Build the application |
| `npm run db:studio` | Browse the database with Prisma Studio |
