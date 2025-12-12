# gomigomi - Point-Based Lottery Platform for Used Goods

## Project Overview

A Next.js web application where users list used items as lotteries. Buyers spend points to enter lotteries, and winners are selected using probability proportional to points contributed.

---

## Tech Stack

| Layer | Technology | Rationale |
|-------|------------|-----------|
| Framework | **Next.js 16** (v16.0.7+) | Latest stable with Turbopack, React Compiler, improved caching |
| Styling | Tailwind CSS + shadcn/ui | Beautiful, accessible components |
| Database | PostgreSQL | Reliable, ACID-compliant |
| ORM | Prisma | Type-safe, excellent DX with Next.js |
| Auth | **NextAuth.js v5 (Auth.js)** | See recommendation below |
| Validation | Zod | Runtime type validation |
| State | React Query (TanStack Query) | Server state management |
| File Upload | Uploadthing or Cloudinary | Image hosting for item photos |

### Authentication Recommendation: NextAuth.js v5

**Why NextAuth.js over alternatives:**

| Option | Pros | Cons |
|--------|------|------|
| **NextAuth.js v5** | Free, self-hosted, Prisma adapter, OAuth + credentials | Slightly more setup |
| Clerk | Excellent DX, pre-built UI | Paid at scale, vendor lock-in |
| Supabase Auth | Good if using Supabase DB | Overkill if only for auth |
| Lucia | Lightweight | Less ecosystem support |

**Auth providers (in order of priority):**
1. **Google OAuth** (primary) - Quick 1-click signup, ~80% of users
2. **Email/Password** (secondary) - For privacy-conscious users who avoid Google
3. **Apple Sign-In** (future) - Add when building iOS app

---

## Database Schema

```prisma
// schema.prisma

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  image         String?
  passwordHash  String?   // For credentials auth
  points        Int       @default(100) // Starting points
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // Relations
  accounts      Account[]
  sessions      Session[]
  addresses     Address[]      // Shipping addresses (required to enter lotteries)
  lotteries     Lottery[]      // Lotteries created by user
  entries       LotteryEntry[] // Lottery participations
  pointHistory  PointTransaction[]
  notifications Notification[]
}

model Address {
  id            String   @id @default(cuid())
  userId        String
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  name          String   // Recipient name
  street        String
  city          String
  state         String
  postalCode    String
  country       String   @default("US")
  phone         String?
  isDefault     Boolean  @default(false)

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model Account {
  // NextAuth.js required fields
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}

model Lottery {
  id              String   @id @default(cuid())
  title           String
  description     String
  images          String[] // Array of image URLs
  condition       String   // "new", "like-new", "good", "fair", "poor"
  category        String

  maxParticipants Int?     // null = unlimited
  pointsPerEntry  Int      @default(10) // Minimum points required to enter (can be as low as 1)

  status          LotteryStatus @default(ACTIVE)
  startDate       DateTime @default(now())
  endDate         DateTime

  creatorId       String
  creator         User     @relation(fields: [creatorId], references: [id])
  winnerId        String?

  entries         LotteryEntry[]
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

enum LotteryStatus {
  DRAFT       // Being created, not visible
  SCHEDULED   // Visible but not joinable until startDate
  ACTIVE      // Open for entries
  COMPLETED   // Winner selected, points awarded to seller
  CANCELLED   // Cancelled by seller, points refunded
}

model LotteryEntry {
  id        String   @id @default(cuid())
  points    Int      // Total points spent (can be increased)

  userId    String
  user      User     @relation(fields: [userId], references: [id])
  lotteryId String
  lottery   Lottery  @relation(fields: [lotteryId], references: [id])

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([userId, lotteryId]) // One entry record per user, but points can be increased
}

model PointTransaction {
  id          String   @id @default(cuid())
  amount      Int      // Positive = earned, Negative = spent
  type        PointTransactionType
  description String?

  userId      String
  user        User     @relation(fields: [userId], references: [id])
  lotteryId   String?  // Reference to lottery if applicable

  createdAt   DateTime @default(now())
}

enum PointTransactionType {
  SIGNUP_BONUS      // Initial points (+100)
  LOTTERY_CREATED   // Earned from creating lottery (+50)
  LOTTERY_ENTRY     // Spent on entering lottery (negative)
  LOTTERY_REFUND    // Refund if lottery cancelled
  REFERRAL_BONUS    // Earned from inviting friends (+25)
}

model Notification {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  type      NotificationType
  title     String
  message   String
  read      Boolean  @default(false)
  data      Json?    // Extra data (lotteryId, etc.)

  createdAt DateTime @default(now())
}

enum NotificationType {
  LOTTERY_WON           // You won a lottery!
  LOTTERY_ENDED         // A lottery you entered has ended
  LOTTERY_CANCELLED     // A lottery was cancelled (points refunded)
  NEW_ENTRY             // Someone entered your lottery
  POINTS_EARNED         // You earned points
}

model Category {
  id    String @id @default(cuid())
  name  String @unique
  slug  String @unique
  icon  String? // Icon name for UI
}
```

---

## Application Structure

```
gomigomi/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── layout.tsx
│   ├── (main)/
│   │   ├── page.tsx                    # Home - Browse lotteries
│   │   ├── lotteries/
│   │   │   ├── page.tsx                # Lottery listing
│   │   │   ├── [id]/page.tsx           # Lottery detail
│   │   │   └── create/page.tsx         # Create lottery
│   │   ├── dashboard/
│   │   │   ├── page.tsx                # User dashboard
│   │   │   ├── my-lotteries/page.tsx   # User's created lotteries
│   │   │   ├── my-entries/page.tsx     # User's entries
│   │   │   └── points/page.tsx         # Point history
│   │   ├── settings/
│   │   │   ├── page.tsx                # Settings overview
│   │   │   ├── profile/page.tsx        # Edit profile
│   │   │   └── addresses/page.tsx      # Manage shipping addresses
│   │   └── layout.tsx
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts
│   │   ├── lotteries/
│   │   │   ├── route.ts                # GET all, POST create
│   │   │   └── [id]/
│   │   │       ├── route.ts            # GET one, PUT update, DELETE
│   │   │       ├── enter/route.ts      # POST enter/boost lottery
│   │   │       └── draw/route.ts       # POST select winner
│   │   ├── addresses/
│   │   │   ├── route.ts                # GET all, POST create
│   │   │   └── [id]/route.ts           # PUT update, DELETE
│   │   ├── notifications/
│   │   │   ├── route.ts                # GET all notifications
│   │   │   └── [id]/read/route.ts      # POST mark as read
│   │   └── upload/route.ts
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── ui/                             # shadcn components
│   ├── lottery/
│   │   ├── lottery-card.tsx
│   │   ├── lottery-form.tsx
│   │   ├── lottery-grid.tsx
│   │   ├── entry-dialog.tsx
│   │   └── boost-dialog.tsx            # Boost existing entry
│   ├── layout/
│   │   ├── header.tsx
│   │   ├── footer.tsx
│   │   ├── sidebar.tsx
│   │   └── notification-bell.tsx       # In-app notification dropdown
│   ├── address/
│   │   ├── address-form.tsx
│   │   └── address-card.tsx
│   └── shared/
│       ├── point-badge.tsx
│       └── probability-indicator.tsx
├── lib/
│   ├── auth.ts                         # NextAuth config
│   ├── db.ts                           # Prisma client
│   ├── lottery.ts                      # Lottery business logic
│   ├── points.ts                       # Point system logic
│   ├── notifications.ts                # Notification helpers
│   └── utils.ts
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── types/
│   └── index.ts
└── public/
```

---

## Core Features Implementation

### 1. User Authentication & Point Wallet

- NextAuth.js with Prisma adapter
- New users receive 100 starting points
- Point balance displayed in header
- Protected routes via middleware
- **Guest browsing**: Unregistered users can browse lotteries but must sign up to enter

### 2. Lottery Creation

**Form Fields:**
- Title, Description
- Photos (up to 5)
- Item condition (dropdown)
- Category
- Points per entry (minimum: 1, default: 10)
- Max participants (optional - can be unlimited)
- **Start date/time** (can schedule for future)
- End date/time

**Business Rules:**
- **Seller receives ALL points** from the lottery pool when it ends
- **No minimum participants** - if only 1 person enters, they automatically win when timer expires
- Creator cannot enter own lottery
- Lottery can be **scheduled** (visible but not joinable until start date)
- Lottery ends at end date or when max participants reached (if set)
- If lottery is cancelled, all points are refunded to participants

**Lottery State Flow:**
```
DRAFT → SCHEDULED → ACTIVE → COMPLETED
                ↘          ↘
              CANCELLED  CANCELLED
```
- **DRAFT**: Being edited, not visible to others
- **SCHEDULED**: Published, visible to all, but entries open at startDate
- **ACTIVE**: Open for entries until endDate or maxParticipants
- **COMPLETED**: Winner selected, seller receives all points
- **CANCELLED**: Seller cancelled, all participants refunded

### 3. Lottery Browsing & Entry

**Browse Page:**
- Grid of active lotteries
- Filter by category, condition
- Sort by end date, participants
- Search by title

**Entry Flow:**
1. User clicks "Enter Lottery"
2. Check if user has a shipping address (required)
   - If no address: prompt to add one in profile first
3. Modal shows: minimum entry cost, current probability, wallet balance
4. User can choose to spend more points for higher probability
5. User confirms entry
6. Points deducted, entry recorded
7. Probability updates for all participants

**Increase Entry Flow:**
1. User already has an entry, clicks "Boost Entry"
2. Modal shows: current points spent, current probability, option to add more
3. User selects additional points to spend
4. Points deducted, entry updated, probabilities recalculated

### 4. Winner Selection Algorithm

```typescript
// Probability Proportional to Size (PPS) Selection
function selectWinner(entries: LotteryEntry[]): string {
  const totalPoints = entries.reduce((sum, e) => sum + e.points, 0);
  const random = Math.random() * totalPoints;

  let cumulative = 0;
  for (const entry of entries) {
    cumulative += entry.points;
    if (random <= cumulative) {
      return entry.userId;
    }
  }

  return entries[entries.length - 1].userId;
}
```

**Transparency:**
- Show each participant's probability on lottery page
- Log random seed for auditability (optional)

### 5. Point System (Earn Only - No Purchases)

**Earning Points:**
| Action | Points |
|--------|--------|
| Sign up | +100 |
| **Lottery completion (seller)** | **+ALL points from pool** |
| Refer a friend | +25 |

**Spending Points:**
| Action | Points |
|--------|--------|
| Enter lottery | Minimum 1 point (set by creator) |
| Boost entry | Additional points to increase odds |

**Point Flow Example:**
1. Seller lists item with 10 points per entry
2. 5 participants enter (50 points total in pool)
3. Participant A boosts with 20 more points (70 points total)
4. Lottery timer expires, winner selected via PPS algorithm
5. **Seller receives all 70 points**, winner receives the item

---

## Implementation Phases

### Phase 1: Project Setup
- [ ] Initialize Next.js 16 with TypeScript (`npx create-next-app@latest`)
- [ ] Install and configure Tailwind CSS
- [ ] Install and configure shadcn/ui
- [ ] Set up Prisma with PostgreSQL
- [ ] Configure NextAuth.js v5
- [ ] Set up environment variables
- [ ] Create base layout and navigation

### Phase 2: Authentication
- [ ] Implement login page (with Google + Email/Password options)
- [ ] Implement registration page
- [ ] Configure Google OAuth provider
- [ ] Configure Email/Password (credentials) provider
- [ ] Create auth middleware for protected routes
- [ ] Add user profile display in header with point balance

### Phase 3: Core Database & Models
- [ ] Create Prisma schema (all models including Address, Notification)
- [ ] Run migrations
- [ ] Seed categories
- [ ] Create database utility functions

### Phase 4: User Profile & Addresses
- [ ] Build settings page layout
- [ ] Create address form component
- [ ] Implement address CRUD API routes
- [ ] Build addresses management page
- [ ] Add "set as default" functionality

### Phase 5: Lottery CRUD
- [ ] Create lottery creation form
- [ ] Implement image upload (Uploadthing)
- [ ] Build lottery listing page with filters
- [ ] Build lottery detail page
- [ ] Add edit/delete functionality for creators

### Phase 6: Entry System
- [ ] Implement lottery entry API (with address validation)
- [ ] Create entry confirmation modal
- [ ] Add point deduction logic
- [ ] Implement "Boost Entry" feature (add more points)
- [ ] Display participant count and probabilities
- [ ] Build "My Entries" page

### Phase 7: Winner Selection
- [ ] Implement winner selection algorithm (PPS)
- [ ] Create automated end-date checker (cron/scheduled function)
- [ ] Share winner's address with creator
- [ ] Create in-app notifications for winner/participants

### Phase 8: Notifications
- [ ] Build notification bell component
- [ ] Implement notifications API
- [ ] Mark as read functionality
- [ ] Real-time updates (optional: polling or WebSocket)

### Phase 9: Dashboard & Polish
- [ ] User dashboard with stats (active entries, wins, points)
- [ ] Point history page
- [ ] My lotteries management
- [ ] Responsive design refinement
- [ ] Error handling and loading states
- [ ] Empty states and onboarding

---

## Key Files to Create

| Priority | File | Purpose |
|----------|------|---------|
| 1 | `package.json` | Dependencies |
| 2 | `prisma/schema.prisma` | Database schema |
| 3 | `lib/auth.ts` | NextAuth configuration |
| 4 | `lib/db.ts` | Prisma client singleton |
| 5 | `app/api/auth/[...nextauth]/route.ts` | Auth API route |
| 6 | `middleware.ts` | Route protection |
| 7 | `lib/lottery.ts` | Winner selection algorithm |
| 8 | `lib/points.ts` | Point transaction logic |
| 9 | `lib/notifications.ts` | In-app notification helpers |
| 10 | `components/lottery/lottery-form.tsx` | Create lottery form |
| 11 | `components/lottery/entry-dialog.tsx` | Enter/boost lottery modal |
| 12 | `components/address/address-form.tsx` | Shipping address form |
| 13 | `app/(main)/lotteries/[id]/page.tsx` | Lottery detail page |
| 14 | `app/(main)/settings/addresses/page.tsx` | Address management |

---

## Environment Variables

```env
# .env.local
DATABASE_URL="postgresql://user:password@localhost:5432/gomigomi"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# OAuth Providers
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."

# File Upload (Uploadthing)
UPLOADTHING_SECRET="..."
UPLOADTHING_APP_ID="..."
```

---

## Design Decisions (Confirmed)

| Decision | Choice |
|----------|--------|
| **Multiple Entries** | Allowed - users can spend more points to increase probability |
| **Point Economy** | Earn only (free) - no real money purchases |
| **Item Delivery** | Address-based (like Amazon) - users must have shipping address to enter |
| **Notifications** | In-app only - no email notifications |
| **Guest Browsing** | Yes - unregistered users can browse, must sign up to enter |
| **Scheduled Lotteries** | Yes - sellers can schedule lotteries to start in the future |
| **Admin Panel** | No - skip for MVP |
| **Delivery Confirmation** | No - skip for MVP |

---

## Diagram Corrections Needed

The UML diagrams need the following updates to match requirements:

### Class Diagram Fixes:
1. **Remove `minParticipants`** from Lottery class (no minimum required)
2. **Address field**: Change from single `address: String` to reference separate Address model with full fields
3. **Remove Administrator class** for MVP (can add later)
4. **Remove `rating` field** from RegisteredUser for MVP

### State Machine Diagram Fixes:
1. **Remove `minParticipants` condition** from Active → PendingDraw transition
2. **Remove transition**: `Active → Cancelled [participants < minParticipants]`
3. **Simplify**: `Active → Completed` when endDate reached (no participant check)
4. **Remove PENDING_DRAW state** for MVP (can process winner selection synchronously)
5. **Remove `confirmDelivery()`** transition for MVP

### Use Case Diagram:
- Diagram is correct as-is

---

## Ready to Implement

Implementation begins with Phase 1 (Project Setup).
