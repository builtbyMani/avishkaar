"use client";

import { useEffect, useRef } from "react";
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

      // 1. Place pins (Terracotta)
      for (const p of places) {
        bounds.push([p.lat, p.lng]);
        const pinIcon = L.divIcon({
          className: "avishkaar-pin",
          html: `<div style="width:28px;height:28px;border-radius:9999px;background:#1B3B36;color:#fff;border:3px solid #FAF7F2;box-shadow:0 3px 10px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;">★</div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });

        L.marker([p.lat, p.lng], { icon: pinIcon })
          .addTo(mapInstance)
          .bindPopup(
            `<div style="min-width:170px">
              <strong style="color:#1B3B36;font-size:13px">${p.title}</strong>
              <div style="color:#52635F;font-size:11px;margin-top:2px">${p.region}${
                p.hiddenGemScore ? ` · Gem Score ${p.hiddenGemScore}` : ""
              }</div>
              <a href="/place/${p.id}" style="display:inline-block;margin-top:6px;color:#C85A32;font-weight:700;font-size:12px;text-decoration:none">Open Guide →</a>
            </div>`,
          );

        // 2. Red safety warning markers
        for (const alert of p.safetyAlerts ?? []) {
          const aLat = alert.lat ?? p.lat + 0.0025;
          const aLng = alert.lng ?? p.lng - 0.0025;
          bounds.push([aLat, aLng]);
          const warnIcon = L.divIcon({
            className: "avishkaar-safety-pin",
            html: `<div style="width:24px;height:24px;border-radius:9999px;background:#DC2626;color:#fff;border:2px solid #fff;box-shadow:0 2px 8px rgba(220,38,38,0.45);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800;">!</div>`,
            iconSize: [24, 24],
            iconAnchor: [12, 12],
          });

          L.marker([aLat, aLng], { icon: warnIcon })
            .addTo(mapInstance)
            .bindPopup(
              `<div style="min-width:170px">
                <span style="display:inline-block;background:#FEE2E2;color:#991B1B;font-size:10px;font-weight:700;padding:2px 6px;border-radius:9999px">${alert.tag}</span>
                <p style="margin:6px 0 0;font-size:12px;color:#111827">${alert.message}</p>
              </div>`,
            );
        }
      }

      // 3. Support Local vendor pins (Amber/Emerald)
      for (const v of vendors) {
        bounds.push([v.lat, v.lng]);
        const vendorIcon = L.divIcon({
          className: "avishkaar-vendor-pin",
          html: `<div style="width:24px;height:24px;border-radius:9999px;background:#D97706;color:#fff;border:2px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.25);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;">L</div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });

        L.marker([v.lat, v.lng], { icon: vendorIcon })
          .addTo(mapInstance)
          .bindPopup(
            `<div style="min-width:170px">
              <span style="display:inline-block;background:#FEF3C7;color:#92400E;font-size:10px;font-weight:700;padding:2px 6px;border-radius:9999px">${v.category}</span>
              <div style="font-weight:700;color:#1B3B36;font-size:12px;margin-top:4px">${v.name}</div>
              <div style="font-size:11px;color:#52635F;margin-top:2px">${v.specialty}</div>
              <div style="font-size:11px;color:#1B3B36;font-weight:600;margin-top:4px">${v.contact}</div>
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
    <div className="overflow-hidden rounded-2xl border border-[#E8E0D4] bg-white shadow-xs">
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
