import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";
import { Toaster } from "@/components/ui/toaster";
import { SessionProvider } from "@/components/providers/session-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "NextFit — Find Top Trainers & Gyms Near You",
    template: "%s | NextFit",
  },
  description: "Discover verified personal trainers, fitness coaches, and gyms. Read real reviews, compare certifications, and find your perfect fitness match.",
  openGraph: {
    title: "NextFit — Find Top Trainers & Gyms Near You",
    description: "Discover verified personal trainers, fitness coaches, and gyms.",
    url: "https://nextfit.app",
    siteName: "NextFit",
    type: "website",
  },
  metadataBase: new URL("https://nextfit.app"),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased bg-gray-50 text-gray-900`}>
        <SessionProvider>
          <Navbar />
          <main className="min-h-screen">{children}</main>
          <Toaster />
        </SessionProvider>
      </body>
    </html>
  );
}
