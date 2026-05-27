import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";
import BottomNav from "@/components/layout/BottomNav";
import { LanguageProvider } from "@/lib/language-context";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ArthaAI — India's Smartest Payment Companion",
  description: "AI-powered UPI spending analysis, smart bill splitting, and fraud protection for India.",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "ArthaAI" },
};

export const viewport: Viewport = {
  themeColor: "#6366f1",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geist.className} bg-gray-50 antialiased`}>
        <LanguageProvider>
          <Sidebar />
          <main className="md:ml-60 min-h-screen pb-20 md:pb-0">
            {children}
          </main>
          <BottomNav />
        </LanguageProvider>
      </body>
    </html>
  );
}
