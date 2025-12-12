/**
 * Better Auth Client
 *
 * TODO: BACKEND_2 - Implement client-side auth utilities
 *
 * Required exports:
 * - authClient - Main auth client instance
 * - signIn - Sign in functions (email, social)
 * - signUp - Sign up function
 * - signOut - Sign out function
 * - useSession - React hook for session state
 * - getSession - Get current session
 *
 * See: team-guides/BACKEND_2_API_AUTH_LOTTERY.md
 */

// Placeholder hooks - BACKEND_2 will implement with createAuthClient
export const authClient = {
  signIn: {
    email: async () => {
      throw new Error("Auth not implemented - BACKEND_2 TODO");
    },
    social: async () => {
      throw new Error("Auth not implemented - BACKEND_2 TODO");
    },
  },
  signUp: {
    email: async () => {
      throw new Error("Auth not implemented - BACKEND_2 TODO");
    },
  },
  signOut: async () => {
    throw new Error("Auth not implemented - BACKEND_2 TODO");
  },
  useSession: () => ({ data: null, isPending: true }),
  getSession: async () => null,
};

export const signIn = authClient.signIn;
export const signUp = authClient.signUp;
export const signOut = authClient.signOut;
export const useSession = authClient.useSession;
export const getSession = authClient.getSession;
