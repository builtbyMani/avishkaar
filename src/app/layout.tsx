import type { Metadata } from "next";
import { Archivo_Black, Hind, Instrument_Serif, Satisfy } from "next/font/google";
import "./globals.css";
import { AppProvider, MainShell } from "@/components/AppProvider";
import { Navbar } from "@/components/Navbar";
import Preloader from "@/components/Preloader";

const sans = Hind({
  subsets: ["latin", "devanagari"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
});

const display = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-display",
});

const script = Satisfy({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-script",
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
    <html
      lang="en"
      className={`${sans.variable} ${display.variable} ${script.variable} ${preloader.variable}`}
    >
      <body className="min-h-dvh antialiased selection:bg-[#667D5C]/25 selection:text-[#1F271C]">
        <AppProvider>
          <Preloader />
          <Navbar />
          <MainShell>{children}</MainShell>
        </AppProvider>
      </body>
    </html>
  );
}
