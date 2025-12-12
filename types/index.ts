/**
 * Shared TypeScript Types and Zod Validation Schemas
 *
 * This file contains all shared types used across the application.
 * Zod schemas are used for runtime validation of API inputs.
 *
 * @owner Shared (Frontend + Backend)
 */

import { z } from "zod";
import type {
  User,
  Lottery,
  LotteryEntry,
  Address,
  Notification,
  PointTransaction,
  LotteryStatus,
  ItemCondition,
} from "@prisma/client";

// ============================================
// RE-EXPORT PRISMA TYPES
// ============================================

export type {
  User,
  Lottery,
  LotteryEntry,
  Address,
  Notification,
  PointTransaction,
  LotteryStatus,
  ItemCondition,
};

// ============================================
// EXTENDED TYPES
// ============================================

/**
 * User with points (for session)
 */
export interface SessionUser {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
  points: number;
}

/**
 * Lottery with creator and entry stats
 */
export interface LotteryWithStats extends Lottery {
  creator: Pick<User, "id" | "name" | "image">;
  _count: {
    entries: number;
  };
  totalPoints: number;
  userEntry?: LotteryEntry | null;
  userProbability?: number;
}

/**
 * Entry with user info and probability
 */
export interface EntryWithProbability extends LotteryEntry {
  user: Pick<User, "id" | "name" | "image">;
  probability: number;
}

// ============================================
// ZOD VALIDATION SCHEMAS
// ============================================

// --- Auth Schemas ---

// Password must be 12+ chars with uppercase, number, and special character
const passwordSchema = z
  .string()
  .min(12, "Password must be at least 12 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character");

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"), // Login only validates presence
});

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;

// --- Address Schemas ---

export const addressSchema = z.object({
  name: z.string().min(2, "Name is required"),
  street: z.string().min(5, "Street address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  postalCode: z.string().min(5, "Postal code is required"),
  country: z.string().default("US"),
  phone: z.string().optional(),
  isDefault: z.boolean().default(false),
});

export type AddressInput = z.infer<typeof addressSchema>;

// --- Lottery Schemas ---

export const itemConditions = ["NEW", "LIKE_NEW", "GOOD", "FAIR", "POOR"] as const;

export const createLotterySchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(100),
  description: z.string().min(20, "Description must be at least 20 characters").max(2000),
  images: z.array(z.string().url()).min(1, "At least one image required").max(5),
  condition: z.enum(itemConditions),
  category: z.string().min(1, "Category is required"),
  pointsPerEntry: z.number().int().min(1, "Minimum 1 point per entry").default(10),
  maxParticipants: z.number().int().min(1).optional().nullable(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
}).refine((data) => data.endDate > data.startDate, {
  message: "End date must be after start date",
  path: ["endDate"],
});

export const updateLotterySchema = createLotterySchema.partial();

export type CreateLotteryInput = z.infer<typeof createLotterySchema>;
export type UpdateLotteryInput = z.infer<typeof updateLotterySchema>;

// --- Entry Schemas ---

export const enterLotterySchema = z.object({
  points: z.number().int().min(1, "Must spend at least 1 point"),
});

export const boostEntrySchema = z.object({
  additionalPoints: z.number().int().min(1, "Must add at least 1 point"),
});

export type EnterLotteryInput = z.infer<typeof enterLotterySchema>;
export type BoostEntryInput = z.infer<typeof boostEntrySchema>;

// --- Query Schemas ---

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const lotteryFilterSchema = z.object({
  status: z.enum(["DRAFT", "SCHEDULED", "ACTIVE", "COMPLETED", "CANCELLED"]).optional(),
  category: z.string().optional(),
  condition: z.enum(itemConditions).optional(),
  search: z.string().optional(),
  sortBy: z.enum(["endDate", "createdAt", "entries", "points"]).default("endDate"),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
});

export type PaginationInput = z.infer<typeof paginationSchema>;
export type LotteryFilterInput = z.infer<typeof lotteryFilterSchema>;

// ============================================
// API RESPONSE TYPES
// ============================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ============================================
// CATEGORY TYPE
// ============================================

export const categories = [
  { name: "Electronics", slug: "electronics", icon: "laptop" },
  { name: "Clothing", slug: "clothing", icon: "shirt" },
  { name: "Home & Garden", slug: "home-garden", icon: "home" },
  { name: "Sports", slug: "sports", icon: "dumbbell" },
  { name: "Books", slug: "books", icon: "book" },
  { name: "Toys & Games", slug: "toys-games", icon: "gamepad" },
  { name: "Collectibles", slug: "collectibles", icon: "trophy" },
  { name: "Other", slug: "other", icon: "box" },
] as const;

export type CategorySlug = (typeof categories)[number]["slug"];
