# gomigomi

A point-based lottery platform for used goods. Users list items as lotteries, buyers spend points to enter, and winners are selected using probability proportional to points contributed.

## Features

- **Point-Based Lottery System** - List used items as lotteries with customizable entry costs
- **Fair Winner Selection** - Uses Probability Proportional to Size (PPS) algorithm
- **Boost Your Chances** - Spend additional points to increase your winning probability
- **User Authentication** - Google OAuth and Email/Password support
- **Shipping Address Management** - Required for lottery participation
- **In-App Notifications** - Stay updated on lottery results and activity
- **Point Economy** - Earn points through signups, referrals, and completed lotteries

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 16 (App Router) |
| Runtime | React 19 |
| Language | TypeScript |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Database | PostgreSQL |
| ORM | Prisma 5 |
| Authentication | Better Auth |
| State Management | TanStack Query |
| Validation | Zod |
| File Upload | Uploadthing |

## Prerequisites

- Node.js 18+
- PostgreSQL database
- Google OAuth credentials (optional, for Google sign-in)
- Uploadthing account (optional, for image uploads)

## Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd gomigomi
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local` with your values:

```env
# Database (Required)
DATABASE_URL="postgresql://user:password@localhost:5432/gomigomi"

# Better Auth (Required)
BETTER_AUTH_SECRET="your-secret-key"  # Generate with: openssl rand -base64 32
BETTER_AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Google OAuth (Optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Uploadthing (Optional)
UPLOADTHING_SECRET="your-uploadthing-secret"
UPLOADTHING_APP_ID="your-uploadthing-app-id"

# Cron Jobs (Required for production)
CRON_SECRET="your-cron-secret"

# Rate Limiting - Upstash Redis (Optional)
UPSTASH_REDIS_REST_URL="your-upstash-url"
UPSTASH_REDIS_REST_TOKEN="your-upstash-token"
```

### 4. Set up the database

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database (development)
npx prisma db push

# Or create migrations (production)
npx prisma migrate dev --name init
```

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
gomigomi/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication pages
│   │   ├── login/         # Login page
│   │   └── register/      # Registration page
│   ├── (main)/            # Main app pages (protected)
│   │   ├── dashboard/     # User dashboard
│   │   │   ├── my-entries/    # User's lottery entries
│   │   │   ├── my-lotteries/  # User's created lotteries
│   │   │   └── points/        # Point history
│   │   ├── how-it-works/  # How it works page
│   │   ├── lotteries/     # Lottery browsing & creation
│   │   │   ├── [id]/      # Lottery detail page
│   │   │   └── create/    # Create lottery page
│   │   └── settings/      # User settings
│   │       ├── profile/   # Profile settings
│   │       └── addresses/ # Address management
│   └── api/               # API routes
│       ├── auth/          # Better Auth endpoints
│       ├── lotteries/     # Lottery CRUD & actions
│       │   └── [id]/      # Lottery-specific endpoints
│       │       ├── enter/ # Enter/boost lottery
│       │       └── draw/  # Manual winner draw
│       ├── addresses/     # Address management
│       ├── notifications/ # Notification endpoints
│       ├── cron/          # Scheduled jobs
│       │   └── complete-lotteries/
│       └── health/        # Health check
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── lottery/           # Lottery-specific components
│   ├── address/           # Address form & cards
│   ├── layout/            # Header, footer, sidebar
│   └── shared/            # Reusable components
├── lib/                   # Utility functions
│   ├── auth.ts           # Better Auth configuration
│   ├── auth-client.ts    # Better Auth client
│   ├── db.ts             # Prisma client
│   ├── lottery.ts        # Lottery business logic
│   ├── points.ts         # Point system
│   ├── notifications.ts  # Notification helpers
│   ├── errors.ts         # Custom error classes
│   ├── logger.ts         # Logging utility
│   ├── utils.ts          # Utility functions
│   ├── rate-limit.ts     # Rate limiting
│   └── cron-lock.ts      # Distributed cron locking
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── seed.ts           # Database seeding
├── types/                # TypeScript types & Zod schemas
├── middleware.ts         # Route protection
└── public/               # Static assets
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npx prisma studio` | Open Prisma database GUI |
| `npx prisma generate` | Generate Prisma client |
| `npx prisma db push` | Push schema changes to database |
| `npx prisma migrate dev` | Create and apply migrations |
| `npx tsx prisma/seed.ts` | Seed database with test data |

## Business Rules

### Point System

| Action | Points |
|--------|--------|
| Sign up | +100 |
| Lottery completed (seller) | +All entry points |
| Refer a friend | +25 |
| Enter lottery | -Variable (set by creator, min 1) |
| Boost entry | -Additional points |

### Lottery Rules

- **No minimum participants** - If only 1 person enters, they automatically win
- **Seller receives all points** - The entire point pool goes to the seller when lottery completes
- **Address required** - Users must have a shipping address to enter lotteries
- **Boost allowed** - Users can add more points to increase their probability
- **Guest browsing** - Unregistered users can browse but must sign up to enter
- **Scheduled lotteries** - Lotteries can be scheduled to start at a future date

### Winner Selection (PPS Algorithm)

Winners are selected using Probability Proportional to Size:
- Your probability = Your points / Total pool points
- Example: 30 points in a 100-point pool = 30% chance of winning

## Database Models

- **User** - Account info, point balance
- **Account** - OAuth providers & credentials (Better Auth)
- **Session** - User session management
- **Verification** - Email verification tokens
- **Address** - Shipping addresses
- **Lottery** - Listed items with status tracking
- **LotteryEntry** - User entries with point amounts
- **PointTransaction** - Point history audit trail
- **Notification** - In-app notifications
- **Category** - Item categories

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for team collaboration guidelines.

## License

[Add license here]
