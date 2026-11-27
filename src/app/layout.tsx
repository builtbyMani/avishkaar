import type { Metadata } from "next";
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/components/AppProvider";
import { Navbar } from "@/components/Navbar";

const sans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "Avishkaar — Offbeat Tourism & Local Heritage Discovery",
  description:
    "Visual-first, community-verified discovery platform for hidden destinations, regional cuisines, safety advisories, and volunteer local guides.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${sans.variable} ${display.variable}`}>
      <body className="min-h-screen antialiased selection:bg-[#C85A32]/20">
        <AppProvider>
          <Navbar />
          <main className="mx-auto max-w-7xl px-4 pb-16 pt-6 sm:px-6 lg:px-8">
            {children}
          </main>
        </AppProvider>
      </body>
    </html>
  );
}
