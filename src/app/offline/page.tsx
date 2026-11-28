"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Bus, ChevronRight, Landmark, Printer, ShieldAlert, Trash2, Utensils, WifiOff } from "@/components/Icons";
import { useApp } from "@/components/AppProvider";
import { getPlaceSlug, GUIDE_MODULE_STYLES, PLACE_CATEGORY_STYLES } from "@/lib/domain";
import type { PlaceCategory } from "@/types/domain";

export default function OfflinePocketPage() {
  const { offlineCards, removeOfflineCard } = useApp();

  return (
    <div className="space-y-6">
      <div className="no-print flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-[#6B1D2F]">
            Offline Pocket Cards
          </h1>
          <p className="mt-1 text-sm text-[#52635F]">
            {offlineCards.length} cached in{" "}
            <code className="rounded bg-[#EAE2D6] px-1.5 py-0.5 text-xs">localStorage</code>{" "}
            · Zero-network &amp; print-ready
          </p>
        </div>
        {offlineCards.length > 0 && (
          <button
            type="button"
            onClick={() => window.print()}
            className="tactile-press inline-flex min-h-10 items-center gap-2 rounded-full bg-[#6B1D2F] px-4 py-2 text-xs font-bold text-white hover:bg-[#C85A32]"
          >
            <Printer className="h-4 w-4" strokeWidth={2} />
            Print / Save as PDF
          </button>
        )}
      </div>

      {offlineCards.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-black/15 bg-white p-12 text-center">
          <WifiOff className="mx-auto h-10 w-10 text-[#C85A32]" strokeWidth={1.75} />
          <h2 className="mt-3 font-display text-xl font-bold text-[#6B1D2F]">
            No offline pocket cards saved yet
          </h2>
          <p className="mt-1 text-sm text-[#52635F]">
            Open any destination and select <strong>Save for Offline</strong> before entering low-signal terrain.
          </p>
          <Link
            href="/"
            className="mt-5 inline-flex min-h-10 items-center rounded-full bg-[#6B1D2F] px-5 py-2 text-xs font-bold text-white hover:bg-[#C85A32]"
          >
            Browse Destinations
          </Link>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {offlineCards.map((card, idx) => (
            <motion.article
              key={card.placeId}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.3, delay: Math.min(idx, 3) * 0.05, ease: [0.22, 1, 0.36, 1] }}
              className="print-card flex h-full flex-col space-y-4 rounded-2xl border border-black/12 bg-white p-5"
            >
              <div className="flex items-start justify-between gap-3 border-b border-black/10 pb-3">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#52635F]">
                      {card.region}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        PLACE_CATEGORY_STYLES[card.category as PlaceCategory]?.badge ??
                        "border border-black/12 bg-[#FAF7F2] text-[#6B1D2F]"
                      }`}
                    >
                      {card.category}
                    </span>
                  </div>
                  <Link href={`/place/${getPlaceSlug({ id: card.placeId, title: card.title })}`} className="block">
                    <h2 className="font-display text-xl font-bold text-[#6B1D2F] hover:text-[#C85A32]">
                      {card.title}
                    </h2>
                  </Link>
                </div>
                <button
                  type="button"
                  onClick={() => removeOfflineCard(card.placeId)}
                  className="no-print flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#52635F] transition hover:bg-red-50 hover:text-red-600"
                  aria-label="Remove offline card"
                >
                  <Trash2 className="h-4 w-4" strokeWidth={1.75} />
                </button>
              </div>

              <div className={GUIDE_MODULE_STYLES.commute.offline}>
                <h3 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#6B1D2F]">
                  <Bus className={`h-3.5 w-3.5 ${GUIDE_MODULE_STYLES.commute.icon}`} strokeWidth={2} /> Last-Mile Commute
                </h3>
                <ul className="mt-1.5 space-y-1 text-xs text-[#52635F]">
                  {card.commute.map((step, i) => (
                    <li key={i}>
                      {i + 1}. {step}
                    </li>
                  ))}
                </ul>
              </div>

              <div className={GUIDE_MODULE_STYLES.food.offline}>
                <h3 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#6B1D2F]">
                  <Utensils className={`h-3.5 w-3.5 ${GUIDE_MODULE_STYLES.food.icon}`} strokeWidth={2} /> Must-Try Food
                </h3>
                <ul className="mt-1.5 space-y-1 text-xs text-[#52635F]">
                  {card.food.map((f, i) => (
                    <li key={i}>
                      <strong>{f.name}:</strong> {f.detail}
                    </li>
                  ))}
                </ul>
              </div>

              {card.livingHeritage && card.livingHeritage.length > 0 && (
                <div className={GUIDE_MODULE_STYLES.livingHeritage.offline}>
                  <h3 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#6B1D2F]">
                    <Landmark className={`h-3.5 w-3.5 ${GUIDE_MODULE_STYLES.livingHeritage.icon}`} strokeWidth={2} /> Living Heritage &amp; Etiquette
                  </h3>
                  <ul className="mt-1.5 space-y-1 text-xs text-[#52635F]">
                    {card.livingHeritage.map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <ChevronRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-700" strokeWidth={2} />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {card.safetyAlerts.length > 0 && (
                <div className="mt-auto rounded-lg border border-red-200 bg-red-50 p-3">
                  <h3 className="flex items-center gap-1.5 text-xs font-bold text-red-900">
                    <ShieldAlert className="h-3.5 w-3.5 text-red-600" strokeWidth={2} /> Safety &amp; Do Not Do
                  </h3>
                  <ul className="mt-1.5 space-y-1 text-xs text-red-950">
                    {card.safetyAlerts.map((a, i) => (
                      <li key={i}>
                        <strong>[{a.tag}]</strong> {a.message}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.article>
          ))}
        </div>
      )}
    </div>
  );
}
