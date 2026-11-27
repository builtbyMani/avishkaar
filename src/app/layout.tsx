import type { Metadata } from "next";
import { Archivo_Black, Fraunces, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/components/AppProvider";
import { Navbar } from "@/components/Navbar";
import Preloader from "@/components/Preloader";

const sans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
});

const preloader = Archivo_Black({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-preloader",
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
    <html lang="en" className={`${sans.variable} ${display.variable} ${preloader.variable}`}>
      <body className="min-h-dvh antialiased selection:bg-[#C85A32]/20">
        <Preloader />
        <AppProvider>
          <Navbar />
          <main className="mx-auto max-w-[1440px] px-4 pb-16 pt-5 sm:px-6 md:pl-20 lg:px-8 lg:pl-24">
            {children}
          </main>
        </AppProvider>
      </body>
    </html>
  );
}
