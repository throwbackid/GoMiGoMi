import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { db } from "./db";
import bcrypt from "bcryptjs";

export const auth = betterAuth({
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),

  emailAndPassword: {
    enabled: true,
    // Use bcryptjs for Vercel compatibility (no native deps)
    password: {
      hash: async (password: string) => {
        return bcrypt.hash(password, 10);
      },
      verify: async (data: { password: string; hash: string }) => {
        return bcrypt.compare(data.password, data.hash);
      },
    },
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },

  session: {
    expiresIn: 60 * 60 * 4, // 4 hours
    updateAge: 60 * 60, // Update every hour
  },

  user: {
    additionalFields: {
      points: {
        type: "number",
        required: false,
        defaultValue: 100,
      },
    },
  },

  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["google"],
    },
  },

  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          // Award signup bonus
          try {
            await db.pointTransaction.create({
              data: {
                userId: user.id,
                amount: 100,
                type: "SIGNUP_BONUS",
                description: "Welcome bonus for signing up!",
              },
            });
            console.log(`Awarded 100 signup bonus to user ${user.id}`);
          } catch (error) {
            console.error("Failed to award signup bonus:", error);
          }
        },
      },
    },
  },

  plugins: [nextCookies()],
});

export type Session = typeof auth.$Infer.Session;
