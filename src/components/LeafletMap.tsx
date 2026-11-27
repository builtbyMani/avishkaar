"use client";

import { useEffect, useRef } from "react";
import { escapeHtml } from "@/lib/domain";
import type { LocalVendor, SafetyAlert } from "@/types/domain";

export interface MapMarkerPlace {
  id: string;
  title: string;
  region: string;
  lat: number;
  lng: number;
  hiddenGemScore?: number;
  safetyAlerts?: SafetyAlert[];
}

export function LeafletMap({
  places,
  vendors = [],
  center,
  zoom = 5,
  heightClass = "h-[380px]",
}: {
  places: MapMarkerPlace[];
  vendors?: LocalVendor[];
  center?: [number, number];
  zoom?: number;
  heightClass?: string;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let mapInstance: import("leaflet").Map | null = null;
    let cancelled = false;

    async function initMap() {
      if (!containerRef.current) return;
      const L = (await import("leaflet")).default;
      if (cancelled || !containerRef.current) return;

      const defaultCenter: [number, number] =
        center ??
        (places.length > 0 ? [places[0].lat, places[0].lng] : [22.9734, 78.6569]);

      mapInstance = L.map(containerRef.current, {
        center: defaultCenter,
        zoom,
        scrollWheelZoom: false,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
        maxZoom: 18,
      }).addTo(mapInstance);

      const bounds: [number, number][] = [];

      // 1. Place pins (Forest)
      for (const p of places) {
        bounds.push([p.lat, p.lng]);
        const pinIcon = L.divIcon({
          className: "avishkaar-pin",
          html: `<div style="width:28px;height:28px;border-radius:9999px;background:#1B3B36;color:#fff;border:2px solid #FAF7F2;display:flex;align-items:center;justify-content:center;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg></div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });

        L.marker([p.lat, p.lng], { icon: pinIcon })
          .addTo(mapInstance)
          .bindPopup(
            `<div style="min-width:170px">
              <strong style="color:#1B3B36;font-size:13px">${escapeHtml(p.title)}</strong>
              <div style="color:#52635F;font-size:11px;margin-top:2px">${escapeHtml(p.region)}${
                p.hiddenGemScore ? ` · Gem Score ${p.hiddenGemScore}` : ""
              }</div>
              <a href="/place/${encodeURIComponent(p.id)}" style="display:inline-flex;align-items:center;gap:4px;margin-top:6px;color:#C85A32;font-weight:700;font-size:12px;text-decoration:none">Open Guide <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg></a>
            </div>`,
          );

        // 2. Red safety warning markers
        for (const alert of p.safetyAlerts ?? []) {
          const aLat = alert.lat ?? p.lat + 0.0025;
          const aLng = alert.lng ?? p.lng - 0.0025;
          bounds.push([aLat, aLng]);
          const warnIcon = L.divIcon({
            className: "avishkaar-safety-pin",
            html: `<div style="width:24px;height:24px;border-radius:9999px;background:#DC2626;color:#fff;border:2px solid #FFFFFF;display:flex;align-items:center;justify-content:center;"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg></div>`,
            iconSize: [24, 24],
            iconAnchor: [12, 12],
          });

          L.marker([aLat, aLng], { icon: warnIcon })
            .addTo(mapInstance)
            .bindPopup(
              `<div style="min-width:170px">
                <span style="display:inline-block;background:#FEE2E2;color:#991B1B;font-size:10px;font-weight:700;padding:2px 6px;border-radius:9999px">${escapeHtml(alert.tag)}</span>
                <p style="margin:6px 0 0;font-size:12px;color:#111827">${escapeHtml(alert.message)}</p>
              </div>`,
            );
        }
      }

      // 3. Support Local vendor pins (Amber)
      for (const v of vendors) {
        bounds.push([v.lat, v.lng]);
        const vendorIcon = L.divIcon({
          className: "avishkaar-vendor-pin",
          html: `<div style="width:24px;height:24px;border-radius:9999px;background:#D97706;color:#fff;border:2px solid #FFFFFF;display:flex;align-items:center;justify-content:center;"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/></svg></div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });

        L.marker([v.lat, v.lng], { icon: vendorIcon })
          .addTo(mapInstance)
          .bindPopup(
            `<div style="min-width:170px">
              <span style="display:inline-block;background:#FEF3C7;color:#92400E;font-size:10px;font-weight:700;padding:2px 6px;border-radius:9999px">${escapeHtml(v.category)}</span>
              <div style="font-weight:700;color:#1B3B36;font-size:12px;margin-top:4px">${escapeHtml(v.name)}</div>
              <div style="font-size:11px;color:#52635F;margin-top:2px">${escapeHtml(v.specialty)}</div>
              <div style="font-size:11px;color:#1B3B36;font-weight:600;margin-top:4px">${escapeHtml(v.contact)}</div>
            </div>`,
          );
      }

      if (!center && bounds.length > 1) {
        mapInstance.fitBounds(bounds, { padding: [36, 36], maxZoom: 13 });
      }
    }

    void initMap();

    return () => {
      cancelled = true;
      if (mapInstance) {
        mapInstance.remove();
      }
    };
  }, [places, vendors, center, zoom]);

  return (
    <div className="overflow-hidden rounded-2xl border border-black/12 bg-white">
      <div ref={containerRef} className={`w-full ${heightClass}`} />
      <div className="flex flex-wrap items-center gap-4 border-t border-[#E8E0D4] bg-[#FAF7F2] px-4 py-2 text-xs text-[#52635F]">
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-full bg-[#1B3B36]" /> Destination Pin
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-full bg-[#D97706]" /> Support Local Vendor
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-full bg-red-600" /> Safety Advisory Marker
        </span>
      </div>
    </div>
  );
}
