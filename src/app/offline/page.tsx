"use client";

import Link from "next/link";
import { Bus, Printer, ShieldAlert, Trash2, Utensils, WifiOff } from "lucide-react";
import { useApp } from "@/components/AppProvider";

export default function OfflinePocketPage() {
  const { offlineCards, removeOfflineCard } = useApp();

  return (
    <div className="space-y-6">
      <div className="no-print flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-[#1B3B36]">
            Offline Pocket Cards
          </h1>
          <p className="mt-1 text-sm text-[#52635F]">
            Cached locally in <code className="rounded bg-[#EAE2D6] px-1.5 py-0.5 text-xs">localStorage</code>{" "}
            for zero-network valleys and mountain passes.
          </p>
        </div>
        {offlineCards.length > 0 && (
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-full bg-[#1B3B36] px-4 py-2 text-xs font-bold text-white hover:bg-[#C85A32]"
          >
            <Printer className="h-4 w-4" />
            Print / Save as PDF
          </button>
        )}
      </div>

      {offlineCards.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-[#E8E0D4] bg-white p-12 text-center">
          <WifiOff className="mx-auto h-10 w-10 text-[#C85A32]" />
          <h2 className="mt-3 font-display text-xl font-bold text-[#1B3B36]">
            No offline pocket cards saved yet
          </h2>
          <p className="mt-1 text-sm text-[#52635F]">
            Open any destination and click <strong>Save for Offline</strong> before heading off-grid.
          </p>
          <Link
            href="/"
            className="mt-5 inline-block rounded-full bg-[#1B3B36] px-5 py-2 text-xs font-bold text-white"
          >
            Browse Destinations
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {offlineCards.map((card) => (
            <article
              key={card.placeId}
              className="print-card space-y-4 rounded-2xl border border-[#E8E0D4] bg-white p-5 shadow-xs"
            >
              <div className="flex items-start justify-between gap-3 border-b border-[#F1EBE1] pb-3">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#C85A32]">
                    {card.region} · {card.category}
                  </span>
                  <Link href={`/place/${card.placeId}`} className="block">
                    <h2 className="font-display text-xl font-bold text-[#1B3B36] hover:underline">
                      {card.title}
                    </h2>
                  </Link>
                </div>
                <button
                  type="button"
                  onClick={() => removeOfflineCard(card.placeId)}
                  className="no-print rounded-full p-1.5 text-[#52635F] hover:bg-red-50 hover:text-red-600"
                  aria-label="Remove offline card"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div>
                <h3 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#1B3B36]">
                  <Bus className="h-3.5 w-3.5 text-[#C85A32]" /> Last-Mile Commute
                </h3>
                <ul className="mt-1.5 space-y-1 text-xs text-[#52635F]">
                  {card.commute.map((step, i) => (
                    <li key={i}>
                      {i + 1}. {step}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#1B3B36]">
                  <Utensils className="h-3.5 w-3.5 text-[#C85A32]" /> Must-Try Food
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
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#1B3B36]">
                    Living Heritage &amp; Etiquette
                  </h3>
                  <ul className="mt-1.5 space-y-1 text-xs text-[#52635F]">
                    {card.livingHeritage.map((item, i) => (
                      <li key={i}>• {item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {card.safetyAlerts.length > 0 && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3">
                  <h3 className="flex items-center gap-1.5 text-xs font-bold text-red-900">
                    <ShieldAlert className="h-3.5 w-3.5 text-red-600" /> Safety &amp; Do Not Do
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
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
