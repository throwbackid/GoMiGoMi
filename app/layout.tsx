import type { Metadata } from "next";
import { Sora, Fraunces } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
});

export const metadata: Metadata = {
  title: "GoMiGoMi - Point-Based Lottery Platform",
  description: "Win used goods through point-based lotteries",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${sora.variable} ${fraunces.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}