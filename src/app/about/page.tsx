import Link from "next/link";
import { Compass, HandHeart, Info, Mail, MapPin, ShieldCheck } from "@/components/Icons";
import { VOLUNTEER_GUIDE_DISCLAIMERS } from "@/lib/domain";

const PILLARS = [
  {
    icon: Compass,
    title: "Hidden Gem Ranking",
    desc: "Mainstream tourist traps decay logarithmically in score while quiet villages, crafts, and community-verified kitchens rise on real traveler vouches and GPS check-ins.",
  },
  {
    icon: ShieldCheck,
    title: "Safety & Ground Truth",
    desc: "Scam warnings, roadblock notes, and seasonal cautions require community verification consensus (or Pathfinder/Field Scout status) before surfacing publicly.",
  },
  {
    icon: HandHeart,
    title: "Direct Local Economy",
    desc: "Homestays, weavers, potters, and regional kitchens appear with direct phone and WhatsApp contact plus Google Maps pins—zero middleman commissions.",
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-12">
      <header className="rounded-3xl border border-[#2B141A]/12 bg-[#FAF7F0] p-6 sm:p-8">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-[#D9A12B]/40 bg-[#D9A12B]/15 px-3 py-1 text-xs font-semibold text-[#2B141A]">
          <Info className="h-3.5 w-3.5 text-[#6B1D2F]" />
          About Avishkaar
        </span>
        <h1 className="mt-3 font-rozha text-3xl text-[#6B1D2F] sm:text-4xl">
          Travel slower. Trust locals. Leave crowded traps behind.
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#61454D] sm:text-base">
          Avishkaar is a visual-first, community-verified discovery platform built for travelers
          seeking lesser-known Indian destinations, regional cuisines, living crafts, and safer
          slow-travel routes backed by real on-the-ground feedback.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full bg-[#6B1D2F] px-5 py-2.5 text-xs font-bold text-[#F5F0E6] transition hover:bg-[#82253A]"
          >
            <MapPin className="h-3.5 w-3.5" />
            Explore Destinations
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 rounded-full border border-[#2B141A]/20 bg-white px-5 py-2.5 text-xs font-bold text-[#2B141A] transition hover:border-[#6B1D2F]"
          >
            <Mail className="h-3.5 w-3.5 text-[#6B1D2F]" />
            Contact Us
          </Link>
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-3">
        {PILLARS.map((pillar) => {
          const Icon = pillar.icon;
          return (
            <div
              key={pillar.title}
              className="rounded-2xl border border-[#E8E0D4] bg-white p-5 space-y-2.5"
            >
              <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[#F5F0E6] text-[#6B1D2F]">
                <Icon className="h-5 w-5" />
              </div>
              <h2 className="font-display text-xl font-bold text-[#6B1D2F]">{pillar.title}</h2>
              <p className="text-xs leading-relaxed text-[#52635F]">{pillar.desc}</p>
            </div>
          );
        })}
      </section>

      <section className="rounded-2xl border border-amber-200 bg-amber-50/75 p-6 space-y-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-[#6B1D2F]" />
          <h2 className="font-display text-xl font-bold text-[#6B1D2F]">
            Volunteer Local Guide Principles &amp; Disclaimers
          </h2>
        </div>
        <ul className="space-y-2 text-xs leading-relaxed text-amber-950 sm:text-sm">
          {VOLUNTEER_GUIDE_DISCLAIMERS.points.map((line) => (
            <li key={line} className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#6B1D2F]" />
              <span>{line}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
