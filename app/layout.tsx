import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";

import { StoreProvider } from "@/lib/store";
import { AuthGate } from "@/components/auth-gate";
import { AppSidebar, MobileNav } from "@/components/app-sidebar";
import { AppHeader } from "@/components/app-header";
import { CommandPalette } from "@/components/command-palette";
import { QuickAdd, RecordDialog, Toaster } from "@/components/dialogs";

const ui = Space_Grotesk({ variable: "--font-ui", subsets: ["latin"], weight: ["400", "500", "600", "700"] });
const data = JetBrains_Mono({ variable: "--font-data", subsets: ["latin"], weight: ["400", "500"] });

export const metadata: Metadata = {
  title: "Dev Command Center",
  description: "A private workspace for projects, tasks, notes and bugs.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${ui.variable} ${data.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full bg-canvas text-ink">
        <AuthGate>
          <StoreProvider>
            <AppSidebar />
            <div className="min-h-dvh md:pl-56">
              <AppHeader />
              <main className="mx-auto flex max-w-5xl flex-col gap-6 px-4 pb-28 pt-6 md:px-8 md:pb-12">{children}</main>
            </div>
            <MobileNav />
            <CommandPalette />
            <RecordDialog />
            <QuickAdd />
            <Toaster />
          </StoreProvider>
        </AuthGate>
      </body>
    </html>
  );
}
