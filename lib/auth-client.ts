import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL,
});

export const { useSession, signIn, signUp, signOut } = authClient;
```

**`app/(auth)/layout.tsx`**
```tsx
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20">
      <div className="w-full max-w-md px-4">
        {children}
      </div>
    </div>
  );
}