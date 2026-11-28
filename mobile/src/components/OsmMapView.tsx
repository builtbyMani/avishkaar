import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { Linking, Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { WebView } from "react-native-webview";
import { escapeHtml } from "../lib/domain";
import { TactilePressable } from "../theme/motion";
import { COLORS } from "../theme/tokens";
import type { LocalVendor, SafetyAlert } from "../types/domain";
import { ArrowRight, MapPin, Navigation } from "./Icons";

export interface MapMarkerPlace {
  id: string;
  title: string;
  region: string;
  lat: number;
  lng: number;
  hiddenGemScore?: number;
  safetyAlerts?: SafetyAlert[];
}

function buildLeafletPayload(params: {
  places: MapMarkerPlace[];
  vendors: LocalVendor[];
  center?: [number, number];
  zoom: number;
}): string {
  return JSON.stringify({
    places: params.places.map((p) => ({
      id: p.id,
      title: escapeHtml(p.title),
      region: escapeHtml(p.region),
      lat: p.lat,
      lng: p.lng,
      hiddenGemScore: p.hiddenGemScore ?? null,
      safetyAlerts: (p.safetyAlerts ?? []).map((a) => ({
        tag: escapeHtml(a.tag),
        message: escapeHtml(a.message),
        lat: a.lat ?? p.lat + 0.0025,
        lng: a.lng ?? p.lng - 0.0025,
      })),
    })),
    vendors: params.vendors.map((v) => ({
      name: escapeHtml(v.name),
      category: escapeHtml(v.category),
      specialty: escapeHtml(v.specialty),
      contact: escapeHtml(v.contact),
      lat: v.lat,
      lng: v.lng,
    })),
    center: params.center ?? null,
    zoom: params.zoom,
  }).replace(/</g, "\\u003c");
}

function buildLeafletHtml(payload: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" onerror="window.__leafletFailed=true"></script>
  <style>
    html, body, #map { margin: 0; padding: 0; width: 100%; height: 100%; background: #EBE4D5; font-family: -apple-system, system-ui, sans-serif; }
    .leaflet-popup-content-wrapper { border-radius: 12px; }
    .open-btn { display: inline-block; margin-top: 6px; color: #C85A32; font-weight: 700; font-size: 12px; text-decoration: none; cursor: pointer; background: none; border: 0; padding: 0; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    (function() {
      function notifyError() {
        window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'mapError' }));
      }
      if (window.__leafletFailed || typeof L === 'undefined') {
        notifyError();
        return;
      }
      var data = ${payload};
      var defCenter = data.center || (data.places.length ? [data.places[0].lat, data.places[0].lng] : [22.9734, 78.6569]);
      var map = L.map('map', { center: defCenter, zoom: data.zoom, zoomControl: true });
      var tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap',
        maxZoom: 18
      }).addTo(map);

      var tileLoaded = false;
      var tileErrors = 0;
      tiles.on('tileload', function() { tileLoaded = true; });
      tiles.on('tileerror', function() {
        tileErrors += 1;
        if (!tileLoaded && tileErrors >= 4) notifyError();
      });

      var bounds = [];
      data.places.forEach(function(p) {
        bounds.push([p.lat, p.lng]);
        var pin = L.divIcon({
          className: '',
          html: '<div style="width:28px;height:28px;border-radius:9999px;background:#6B1D2F;color:#fff;border:2px solid #FAF7F2;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:12px;">G</div>',
          iconSize: [28, 28],
          iconAnchor: [14, 14]
        });
        var marker = L.marker([p.lat, p.lng], { icon: pin }).addTo(map);
        var scoreLine = p.hiddenGemScore ? ' · Gem Score ' + p.hiddenGemScore : '';
        var container = document.createElement('div');
        container.style.minWidth = '165px';
        var titleEl = document.createElement('strong');
        titleEl.style.color = '#6B1D2F';
        titleEl.style.fontSize = '13px';
        titleEl.innerHTML = p.title;
        var metaEl = document.createElement('div');
        metaEl.style.color = '#61454D';
        metaEl.style.fontSize = '11px';
        metaEl.style.marginTop = '2px';
        metaEl.innerHTML = p.region + scoreLine;
        var btn = document.createElement('button');
        btn.className = 'open-btn';
        btn.textContent = 'Open Guide →';
        btn.setAttribute('data-place-id', p.id);
        container.appendChild(titleEl);
        container.appendChild(metaEl);
        container.appendChild(btn);
        marker.bindPopup(container);

        p.safetyAlerts.forEach(function(a) {
          bounds.push([a.lat, a.lng]);
          var warn = L.divIcon({
            className: '',
            html: '<div style="width:22px;height:22px;border-radius:9999px;background:#DC2626;color:#fff;border:2px solid #fff;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:11px;">!</div>',
            iconSize: [22, 22],
            iconAnchor: [11, 11]
          });
          L.marker([a.lat, a.lng], { icon: warn }).addTo(map).bindPopup(
            '<div style="min-width:160px"><span style="display:inline-block;background:#FEE2E2;color:#991B1B;font-size:10px;font-weight:700;padding:2px 6px;border-radius:9999px">' + a.tag + '</span><p style="margin:6px 0 0;font-size:12px;color:#111827">' + a.message + '</p></div>'
          );
        });
      });

      data.vendors.forEach(function(v) {
        bounds.push([v.lat, v.lng]);
        var vIcon = L.divIcon({
          className: '',
          html: '<div style="width:22px;height:22px;border-radius:9999px;background:#D97706;color:#fff;border:2px solid #fff;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:11px;">S</div>',
          iconSize: [22, 22],
          iconAnchor: [11, 11]
        });
        L.marker([v.lat, v.lng], { icon: vIcon }).addTo(map).bindPopup(
          '<div style="min-width:160px"><span style="display:inline-block;background:#FEF3C7;color:#92400E;font-size:10px;font-weight:700;padding:2px 6px;border-radius:9999px">' + v.category + '</span><div style="font-weight:700;color:#6B1D2F;font-size:12px;margin-top:4px">' + v.name + '</div><div style="font-size:11px;color:#61454D;margin-top:2px">' + v.specialty + '</div><div style="font-size:11px;color:#6B1D2F;font-weight:600;margin-top:4px">' + v.contact + '</div></div>'
        );
      });

      if (!data.center && bounds.length > 1) {
        map.fitBounds(bounds, { padding: [30, 30], maxZoom: 13 });
      }

      document.addEventListener('click', function(e) {
        var target = e.target;
        while (target && target !== document) {
          if (target.getAttribute && target.getAttribute('data-place-id')) {
            var id = target.getAttribute('data-place-id');
            if (window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'openPlace', id: id }));
            }
            return;
          }
          target = target.parentNode;
        }
      });
    })();
  </script>
</body>
</html>`;
}

export function OsmMapView({
  places,
  vendors = [],
  center,
  zoom = 5,
  height = 380,
}: {
  places: MapMarkerPlace[];
  vendors?: LocalVendor[];
  center?: [number, number];
  zoom?: number;
  height?: number;
}) {
  const router = useRouter();
  const [offlineFallback, setOfflineFallback] = useState(false);

  // Memoize by serialized content signature so inline arrays in parent components never trigger WebView reloads
  const serializedPayload = buildLeafletPayload({ places, vendors, center, zoom });
  const html = useMemo(() => buildLeafletHtml(serializedPayload), [serializedPayload]);

  const openNativeMaps = (lat: number, lng: number, label: string) => {
    const q = encodeURIComponent(label);
    const url = Platform.select({
      ios: `https://maps.apple.com/?ll=${lat},${lng}&q=${q}`,
      android: `geo:${lat},${lng}?q=${lat},${lng}(${q})`,
      default: `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=14/${lat}/${lng}`,
    });
    if (url) void Linking.openURL(url);
  };

  return (
    <View style={styles.card}>
      {offlineFallback ? (
        <View style={[styles.fallbackBox, { maxHeight: Math.max(height, 280) }]}>
          <Text style={styles.fallbackTitle}>Offline Coordinate Directory ({places.length})</Text>
          <Text style={styles.fallbackSub}>
            Map tiles unavailable — tap any destination to open guide or launch native GPS directions.
          </Text>
          <ScrollView nestedScrollEnabled showsVerticalScrollIndicator={false}>
            {places.map((p) => (
              <View key={p.id} style={styles.fallbackRow}>
                <TactilePressable
                  onPress={() => router.push(`/place/${p.id}`)}
                  style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: 8 }}
                >
                  <MapPin size={15} color={COLORS.wine} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.fallbackPlace} numberOfLines={1}>
                      {p.title}
                    </Text>
                    <Text style={styles.fallbackCoords}>
                      {p.lat.toFixed(4)}, {p.lng.toFixed(4)} · {p.region}
                    </Text>
                  </View>
                  <ArrowRight size={14} color={COLORS.terracotta} />
                </TactilePressable>
                <TactilePressable
                  onPress={() => openNativeMaps(p.lat, p.lng, p.title)}
                  style={styles.navChip}
                >
                  <Navigation size={12} color={COLORS.parchment} />
                </TactilePressable>
              </View>
            ))}
          </ScrollView>
        </View>
      ) : (
        <View style={{ height }}>
          <WebView
            originWhitelist={["*"]}
            source={{ html }}
            style={styles.webview}
            javaScriptEnabled
            domStorageEnabled
            nestedScrollEnabled
            onError={() => setOfflineFallback(true)}
            onHttpError={() => setOfflineFallback(true)}
            onMessage={(e) => {
              try {
                const msg = JSON.parse(e.nativeEvent.data) as { type?: string; id?: string };
                if (msg.type === "openPlace" && msg.id) {
                  router.push(`/place/${msg.id}`);
                } else if (msg.type === "mapError") {
                  setOfflineFallback(true);
                }
              } catch {
                // Ignore malformed WebView message
              }
            }}
          />
        </View>
      )}

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: COLORS.wine }]} />
          <Text style={styles.legendText}>Destination Pin</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: "#D97706" }]} />
          <Text style={styles.legendText}>Support Local Vendor</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: COLORS.redAlertBorder }]} />
          <Text style={styles.legendText}>Safety Advisory Marker</Text>
        </View>
        {!offlineFallback ? (
          <TactilePressable onPress={() => setOfflineFallback(true)} style={{ marginLeft: "auto" }}>
            <Text style={styles.toggleCoords}>Coords List</Text>
          </TactilePressable>
        ) : (
          <TactilePressable onPress={() => setOfflineFallback(false)} style={{ marginLeft: "auto" }}>
            <Text style={styles.toggleCoords}>Retry Map</Text>
          </TactilePressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: "hidden",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  webview: {
    flex: 1,
    backgroundColor: COLORS.well,
  },
  legend: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.surface,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 99,
  },
  legendText: {
    fontSize: 11,
    color: COLORS.muted,
    fontWeight: "600",
  },
  toggleCoords: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.wine,
    textDecorationLine: "underline",
  },
  fallbackBox: {
    padding: 16,
    gap: 10,
    backgroundColor: COLORS.surface,
  },
  fallbackTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.wine,
  },
  fallbackSub: {
    fontSize: 12,
    color: COLORS.muted,
  },
  fallbackRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  fallbackPlace: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.ink,
  },
  fallbackCoords: {
    fontSize: 11,
    color: COLORS.muted,
  },
  navChip: {
    width: 32,
    height: 32,
    borderRadius: 99,
    backgroundColor: COLORS.wine,
    alignItems: "center",
    justifyContent: "center",
  },
});
