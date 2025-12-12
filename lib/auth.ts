/**
 * Better Auth Configuration
 *
 * TODO: BACKEND_2 - Implement authentication with Better Auth
 *
 * Required features:
 * - Google OAuth sign-in
 * - Email/password authentication
 * - Signup bonus (100 points) on user creation via databaseHooks
 * - Session management with user data
 *
 * See: team-guides/BACKEND_2_API_AUTH_LOTTERY.md
 */

// Placeholder - BACKEND_2 will implement
export const auth = {
  api: {
    getSession: async () => null,
  },
  handler: () => {
    throw new Error("Auth not implemented - BACKEND_2 TODO");
  },
};

export type Session = {
  user: {
    id: string;
    email: string;
    name: string | null;
    image: string | null;
    points: number;
  };
  session: {
    id: string;
    expiresAt: Date;
  };
} | null;
