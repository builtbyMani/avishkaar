import type { Metadata } from "next";
import localFont from "next/font/local";
import { Archivo_Black, Instrument_Serif, Satisfy } from "next/font/google";
import "./globals.css";
import { AppProvider, MainShell } from "@/components/AppProvider";
import { Navbar } from "@/components/Navbar";
import Preloader from "@/components/Preloader";

const rozha = localFont({
  src: "./fonts/RozhaOne-Regular.ttf",
  variable: "--font-rozha",
  display: "swap",
});

const modak = localFont({
  src: "./fonts/Modak-Regular.ttf",
  variable: "--font-modak",
  display: "swap",
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
      className={`${rozha.variable} ${modak.variable} ${display.variable} ${script.variable} ${preloader.variable}`}
    >
      <body className="min-h-dvh antialiased selection:bg-[#D9A12B]/25 selection:text-[#1B2A22]">
        <AppProvider>
          <Preloader />
          <Navbar />
          <MainShell>{children}</MainShell>
        </AppProvider>
      </body>
    </html>
  );
}
