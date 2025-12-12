# Database Documentation

> **gomigomi** - Point-based lottery platform database schema

## Quick Reference

| Model | Purpose | Key Relations |
|-------|---------|---------------|
| User | Platform users | has many: accounts, sessions, addresses, lotteries, entries |
| Account | Auth providers (credential/OAuth) | belongs to: user |
| Session | Active user sessions | belongs to: user |
| Lottery | Lottery listings | belongs to: creator, winner; has many: entries |
| LotteryEntry | User entries in lotteries | belongs to: user, lottery |
| PointTransaction | Point history ledger | belongs to: user |
| Notification | User notifications | belongs to: user |
| Category | Lottery categories | standalone |
| Address | Shipping addresses | belongs to: user |
| Verification | Email/password reset tokens | standalone |

---

## Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                   USER                                      │
│  id, email, name, image, points, emailVerified                             │
└─────────────────────────────────────────────────────────────────────────────┘
         │           │           │            │              │
         │           │           │            │              │
    ┌────┴────┐ ┌────┴────┐ ┌────┴────┐  ┌────┴────┐   ┌────┴────┐
    │ Account │ │ Session │ │ Address │  │ Lottery │   │  Entry  │
    │(auth)   │ │(tokens) │ │(ship to)│  │(creator)│   │(entries)│
    └─────────┘ └─────────┘ └─────────┘  └────┬────┘   └────┬────┘
                                              │             │
                                              └──────┬──────┘
                                                     │
                                              ┌──────┴──────┐
                                              │LotteryEntry │
                                              │(user+points)│
                                              └─────────────┘
                                                     │
                                              ┌──────┴──────┐
                                              │PointTrans   │
                                              │(ledger)     │
                                              └─────────────┘
```

---

## Models

### User
Core user model for the platform.

| Field | Type | Description |
|-------|------|-------------|
| id | String (cuid) | Primary key |
| email | String | Unique email address |
| emailVerified | Boolean | Email verification status |
| name | String? | Display name |
| image | String? | Profile image URL |
| points | Int | Current point balance (default: 100) |
| createdAt | DateTime | Account creation time |
| updatedAt | DateTime | Last update time |

**Relations:**
- `accounts` - Auth provider accounts (credential, Google, etc.)
- `sessions` - Active login sessions
- `addresses` - Shipping addresses
- `lotteries` - Created lotteries
- `wonLotteries` - Won lotteries
- `entries` - Lottery entries
- `pointHistory` - Point transaction records
- `notifications` - User notifications

---

### Account (Better Auth)
Authentication provider accounts.

| Field | Type | Description |
|-------|------|-------------|
| id | String (cuid) | Primary key |
| accountId | String | Provider-specific account ID |
| providerId | String | Provider name ("credential", "google") |
| userId | String | Foreign key to User |
| password | String? | Hashed password (credential provider) |
| accessToken | String? | OAuth access token |
| refreshToken | String? | OAuth refresh token |

**Table mapping:** `@@map("account")`

---

### Session (Better Auth)
Active user sessions.

| Field | Type | Description |
|-------|------|-------------|
| id | String (cuid) | Primary key |
| token | String | Unique session token |
| expiresAt | DateTime | Session expiry |
| userId | String | Foreign key to User |
| ipAddress | String? | Client IP |
| userAgent | String? | Client user agent |

**Table mapping:** `@@map("session")`

---

### Lottery
Lottery listings created by users.

| Field | Type | Description |
|-------|------|-------------|
| id | String (cuid) | Primary key |
| title | String | Listing title |
| description | String (Text) | Detailed description |
| images | String[] | Array of image URLs |
| condition | ItemCondition | Item condition enum |
| category | String | Category slug |
| pointsPerEntry | Int | Minimum points to enter (default: 10) |
| maxParticipants | Int? | Max entries (null = unlimited) |
| status | LotteryStatus | Current status |
| startDate | DateTime | When lottery becomes active |
| endDate | DateTime | When lottery ends |
| creatorId | String | Foreign key to creator User |
| winnerId | String? | Foreign key to winner User |

**Statuses:**
- `DRAFT` - Being created, not visible
- `SCHEDULED` - Published, visible but not joinable
- `ACTIVE` - Open for entries
- `COMPLETED` - Winner selected
- `CANCELLED` - Cancelled, points refunded

---

### LotteryEntry
User entries in lotteries.

| Field | Type | Description |
|-------|------|-------------|
| id | String (cuid) | Primary key |
| points | Int | Total points committed |
| userId | String | Foreign key to User |
| lotteryId | String | Foreign key to Lottery |

**Constraints:**
- `@@unique([userId, lotteryId])` - One entry per user per lottery (can boost)

---

### PointTransaction
Immutable ledger of point movements.

| Field | Type | Description |
|-------|------|-------------|
| id | String (cuid) | Primary key |
| amount | Int | Points (+/-) |
| type | PointTransactionType | Transaction type |
| description | String? | Human-readable description |
| userId | String | Foreign key to User |
| lotteryId | String? | Related lottery (if applicable) |
| createdAt | DateTime | Transaction time |

**Transaction Types:**
- `SIGNUP_BONUS` - +100 on registration
- `LOTTERY_ENTRY` - Negative, entering lottery
- `LOTTERY_BOOST` - Negative, boosting entry
- `LOTTERY_CREATED` - Positive, seller receives pool
- `LOTTERY_REFUND` - Positive, cancelled lottery refund
- `REFERRAL_BONUS` - +25 for referrals

---

### Notification
User notifications.

| Field | Type | Description |
|-------|------|-------------|
| id | String (cuid) | Primary key |
| userId | String | Foreign key to User |
| type | NotificationType | Notification type |
| title | String | Notification title |
| message | String | Notification body |
| read | Boolean | Read status |
| data | Json? | Extra structured data |
| createdAt | DateTime | Creation time |

**Notification Types:**
- `LOTTERY_WON` - User won a lottery
- `LOTTERY_ENDED` - Entered lottery ended
- `LOTTERY_CANCELLED` - Lottery cancelled
- `NEW_ENTRY` - Someone entered your lottery
- `POINTS_EARNED` - Points received

---

### Category
Lottery categories.

| Field | Type | Description |
|-------|------|-------------|
| id | String (cuid) | Primary key |
| name | String | Display name (unique) |
| slug | String | URL slug (unique) |
| icon | String? | Lucide icon name |

**Seeded Categories:**
electronics, fashion, home-garden, sports, books-media, toys-games, collectibles, jewelry, music, other

---

### Address
User shipping addresses.

| Field | Type | Description |
|-------|------|-------------|
| id | String (cuid) | Primary key |
| userId | String | Foreign key to User |
| name | String | Recipient name |
| street | String | Street address |
| city | String | City |
| state | String | State/Province |
| postalCode | String | ZIP/Postal code |
| country | String | Country (default: "US") |
| phone | String? | Phone number |
| isDefault | Boolean | Default address flag |

---

## Enums

### LotteryStatus
```prisma
enum LotteryStatus {
  DRAFT
  SCHEDULED
  ACTIVE
  COMPLETED
  CANCELLED
}
```

### ItemCondition
```prisma
enum ItemCondition {
  NEW
  LIKE_NEW
  GOOD
  FAIR
  POOR
}
```

### PointTransactionType
```prisma
enum PointTransactionType {
  SIGNUP_BONUS
  LOTTERY_CREATED
  LOTTERY_ENTRY
  LOTTERY_BOOST
  LOTTERY_REFUND
  REFERRAL_BONUS
}
```

### NotificationType
```prisma
enum NotificationType {
  LOTTERY_WON
  LOTTERY_ENDED
  LOTTERY_CANCELLED
  NEW_ENTRY
  POINTS_EARNED
}
```

---

## Index Strategy

| Model | Index | Purpose |
|-------|-------|---------|
| Lottery | `@@index([status, endDate])` | Cron: Find ACTIVE lotteries past endDate |
| Lottery | `@@index([status, startDate])` | Cron: Find SCHEDULED lotteries past startDate |
| Lottery | `@@index([creatorId, status])` | My lotteries page with status filter |
| Lottery | `@@index([category])` | Browse by category |
| LotteryEntry | `@@index([lotteryId])` | Get all entries for a lottery |
| LotteryEntry | `@@index([userId, createdAt])` | My entries page |
| PointTransaction | `@@index([userId, createdAt])` | Points history page |
| Notification | `@@index([userId, read])` | Unread notification count |
| Address | `@@index([userId])` | User's addresses |

---

## Common Query Patterns

### Get Active Lotteries (Browse Page)
```typescript
db.lottery.findMany({
  where: { status: 'ACTIVE' },
  include: {
    creator: { select: { id: true, name: true, image: true } },
    _count: { select: { entries: true } },
  },
  orderBy: { endDate: 'asc' },
});
```

### Get Lottery with Entry Stats
```typescript
db.lottery.findUnique({
  where: { id: lotteryId },
  include: {
    entries: {
      include: { user: { select: { id: true, name: true, image: true } } },
    },
    creator: true,
  },
});

// Calculate total points
const totalPoints = entries.reduce((sum, e) => sum + e.points, 0);
```

### Winner Selection (PPS Algorithm)
```typescript
// Probability Proportional to Size
const entries = await db.lotteryEntry.findMany({
  where: { lotteryId },
});

const totalPoints = entries.reduce((sum, e) => sum + e.points, 0);
const random = Math.random() * totalPoints;

let cumulative = 0;
for (const entry of entries) {
  cumulative += entry.points;
  if (random <= cumulative) {
    return entry.userId; // Winner!
  }
}
```

### Cron: Complete Expired Lotteries
```typescript
db.lottery.findMany({
  where: {
    status: 'ACTIVE',
    endDate: { lte: new Date() },
  },
});
```

### Cron: Activate Scheduled Lotteries
```typescript
db.lottery.findMany({
  where: {
    status: 'SCHEDULED',
    startDate: { lte: new Date() },
  },
});
```

---

## Database Commands

```bash
# Generate Prisma client
npm run db:generate

# Push schema changes (dev)
npm run db:push

# Create migration
npm run db:migrate

# Seed database
npm run db:seed

# Open Prisma Studio
npm run db:studio
```

---

## Demo Data

After seeding, the following demo accounts are available:

| Email | Password | Starting Points |
|-------|----------|-----------------|
| alice@demo.com | DemoPass123! | 1000 |
| bob@demo.com | DemoPass123! | 1000 |
| carol@demo.com | DemoPass123! | 1000 |
| david@demo.com | DemoPass123! | 1000 |
| emma@demo.com | DemoPass123! | 1000 |
| frank@demo.com | DemoPass123! | 1000 |
| grace@demo.com | DemoPass123! | 1000 |
| henry@demo.com | DemoPass123! | 1000 |

Seed includes:
- 10 categories
- 41 lotteries (various statuses)
- 83 entries
- 104 point transactions
- 61 notifications
