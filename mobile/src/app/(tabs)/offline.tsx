import * as Print from "expo-print";
import { useRouter } from "expo-router";
import * as Sharing from "expo-sharing";
import React from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import Animated, { FadeOutUp, useAnimatedScrollHandler } from "react-native-reanimated";
import { useApp } from "../../components/AppProvider";
import {
  Bus,
  ChevronRight,
  Landmark,
  Printer,
  ShieldAlert,
  Store,
  Trash2,
  Utensils,
  WifiOff,
} from "../../components/Icons";
import { escapeHtml, getPlaceSlug } from "../../lib/domain";
import {
  LIST_LAYOUT_TRANSITION,
  StaggerReveal,
  TactilePressable,
  triggerHaptic,
} from "../../theme/motion";
import {
  COLORS,
  FONTS,
  GUIDE_MODULE_COLORS,
  PLACE_CATEGORY_BADGE,
} from "../../theme/tokens";
import type { OfflinePocketCard, PlaceCategory } from "../../types/domain";

function buildOfflinePocketPdfHtml(cards: OfflinePocketCard[]): string {
  const sections = cards
    .map(
      (c) => `
    <div style="border:1px solid #E5DDD0;border-radius:14px;padding:16px;margin-bottom:16px;page-break-inside:avoid;">
      <div style="font-size:11px;text-transform:uppercase;color:#61454D;font-weight:700;">${escapeHtml(
        c.region,
      )} · ${escapeHtml(c.category)}</div>
      <h2 style="margin:4px 0 10px;color:#6B1D2F;">${escapeHtml(c.title)}</h2>
      <p style="font-size:12px;"><strong>Last-Mile Commute:</strong> ${c.commute
        .map(escapeHtml)
        .join(" | ")}</p>
      <p style="font-size:12px;"><strong>Must-Try Food:</strong> ${c.food
        .map((f) => `${escapeHtml(f.name)}: ${escapeHtml(f.detail)}`)
        .join(" | ")}</p>
      ${
        c.livingHeritage?.length
          ? `<p style="font-size:12px;"><strong>Living Heritage:</strong> ${c.livingHeritage
              .map(escapeHtml)
              .join(" | ")}</p>`
          : ""
      }
      ${
        c.localVendors?.length
          ? `<p style="font-size:12px;"><strong>Support Local (0% Commission):</strong> ${c.localVendors
              .map((v) => `${escapeHtml(v.name)} (${escapeHtml(v.contact)})`)
              .join(" | ")}</p>`
          : ""
      }
      ${
        c.safetyAlerts.length
          ? `<div style="background:#FEF2F2;border:1px solid #FECACA;border-radius:8px;padding:8px;font-size:12px;color:#7F1D1D;"><strong>Safety:</strong> ${c.safetyAlerts
              .map((a) => `[${escapeHtml(a.tag)}] ${escapeHtml(a.message)}`)
              .join(" | ")}</div>`
          : ""
      }
    </div>`,
    )
    .join("");

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /><style>body{font-family:-apple-system,sans-serif;padding:24px;color:#2B141A;}</style></head>
<body>
  <h1 style="color:#6B1D2F;margin-bottom:4px;">Avishkaar Offline Pocket Cards</h1>
  <p style="color:#61454D;font-size:13px;margin-bottom:18px;">${cards.length} destination field guides · Zero-network ready</p>
  ${sections}
</body>
</html>`;
}

export default function OfflinePocketScreen() {
  const router = useRouter();
  const { offlineCards, removeOfflineCard, scrollProgress } = useApp();

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      const maxScroll = Math.max(1, event.contentSize.height - event.layoutMeasurement.height);
      scrollProgress.value = Math.min(1, Math.max(0, event.contentOffset.y / maxScroll));
    },
  });

  async function handleExportPdf() {
    if (offlineCards.length === 0) return;
    try {
      const html = buildOfflinePocketPdfHtml(offlineCards);
      if (Platform.OS === "ios") {
        await Print.printAsync({ html });
      } else {
        const { uri } = await Print.printToFileAsync({ html });
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(uri, {
            mimeType: "application/pdf",
            dialogTitle: "Avishkaar Offline Pocket Cards",
          });
        } else {
          await Print.printAsync({ html });
        }
      }
    } catch {
      // Ignore print cancellation
    }
  }

  return (
    <Animated.ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      onScroll={scrollHandler}
      scrollEventThrottle={16}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Offline Pocket Cards</Text>
          <Text style={styles.subtitle}>
            {offlineCards.length} cached on device · Zero-network & print-ready
          </Text>
        </View>

        {offlineCards.length > 0 && (
          <TactilePressable onPress={() => void handleExportPdf()} style={styles.printBtn}>
            <Printer size={15} color="#FFFFFF" />
            <Text style={styles.printBtnText}>Print / PDF</Text>
          </TactilePressable>
        )}
      </View>

      {offlineCards.length === 0 ? (
        <View style={styles.emptyBox}>
          <WifiOff size={38} color={COLORS.terracotta} strokeWidth={1.75} />
          <Text style={styles.emptyTitle}>No offline pocket cards saved yet</Text>
          <Text style={styles.emptySub}>
            Open any destination and tap Save Offline before entering low-signal terrain.
          </Text>
          <TactilePressable
            onPress={() => router.push("/(tabs)")}
            style={styles.browseBtn}
          >
            <Text style={styles.browseBtnText}>Browse Destinations</Text>
          </TactilePressable>
        </View>
      ) : (
        <View style={{ gap: 14 }}>
          {offlineCards.map((card, idx) => {
            const catStyle = PLACE_CATEGORY_BADGE[card.category as PlaceCategory];
            return (
              <StaggerReveal key={card.placeId} index={idx}>
                <Animated.View
                  layout={LIST_LAYOUT_TRANSITION}
                  exiting={FadeOutUp.duration(160)}
                  style={styles.card}
                >
                  <View style={styles.cardHeader}>
                    <View style={{ flex: 1, gap: 4 }}>
                      <View style={styles.metaRow}>
                        <Text style={styles.regionText}>{card.region}</Text>
                        <View
                          style={[
                            styles.catPill,
                            catStyle
                              ? { backgroundColor: catStyle.bg, borderColor: catStyle.border }
                              : { backgroundColor: COLORS.surface, borderColor: COLORS.border },
                          ]}
                        >
                          <Text style={styles.catText}>{card.category}</Text>
                        </View>
                      </View>

                      <TactilePressable
                        onPress={() =>
                          router.push(`/place/${getPlaceSlug({ id: card.placeId, title: card.title })}`)
                        }
                      >
                        <Text style={styles.cardTitle}>{card.title}</Text>
                      </TactilePressable>
                    </View>

                    <TactilePressable
                      onPress={() => {
                        triggerHaptic("light");
                        removeOfflineCard(card.placeId);
                      }}
                      style={styles.deleteBtn}
                      accessibilityLabel="Remove offline card"
                    >
                      <Trash2 size={16} color={COLORS.muted} />
                    </TactilePressable>
                  </View>

                  <View
                    style={[styles.moduleBlock, { borderLeftColor: GUIDE_MODULE_COLORS.commute }]}
                  >
                    <View style={styles.moduleHeadingRow}>
                      <Bus size={13} color={GUIDE_MODULE_COLORS.commute} />
                      <Text style={styles.moduleHeading}>LAST-MILE COMMUTE</Text>
                    </View>
                    {card.commute.map((step, i) => (
                      <Text key={i} style={styles.moduleLine}>
                        {i + 1}. {step}
                      </Text>
                    ))}
                  </View>

                  <View
                    style={[styles.moduleBlock, { borderLeftColor: GUIDE_MODULE_COLORS.food }]}
                  >
                    <View style={styles.moduleHeadingRow}>
                      <Utensils size={13} color={GUIDE_MODULE_COLORS.food} />
                      <Text style={styles.moduleHeading}>MUST-TRY FOOD</Text>
                    </View>
                    {card.food.map((f, i) => (
                      <Text key={i} style={styles.moduleLine}>
                        <Text style={{ fontWeight: "700" }}>{f.name}:</Text> {f.detail}
                      </Text>
                    ))}
                  </View>

                  {card.livingHeritage && card.livingHeritage.length > 0 && (
                    <View
                      style={[
                        styles.moduleBlock,
                        { borderLeftColor: GUIDE_MODULE_COLORS.livingHeritage },
                      ]}
                    >
                      <View style={styles.moduleHeadingRow}>
                        <Landmark size={13} color={GUIDE_MODULE_COLORS.livingHeritage} />
                        <Text style={styles.moduleHeading}>LIVING HERITAGE & ETIQUETTE</Text>
                      </View>
                      {card.livingHeritage.map((item, i) => (
                        <View key={i} style={styles.heritageRow}>
                          <ChevronRight size={13} color="#B45309" />
                          <Text style={[styles.moduleLine, { flex: 1 }]}>{item}</Text>
                        </View>
                      ))}
                    </View>
                  )}

                  {card.localVendors && card.localVendors.length > 0 && (
                    <View style={styles.vendorsBox}>
                      <View style={styles.moduleHeadingRow}>
                        <Store size={13} color={COLORS.wine} />
                        <Text style={styles.moduleHeading}>SUPPORT LOCAL (OFFLINE CONTACTS)</Text>
                      </View>
                      {card.localVendors.map((v) => (
                        <Text key={v.id} style={styles.moduleLine}>
                          <Text style={{ fontWeight: "700" }}>{v.name}:</Text> {v.specialty} ·{" "}
                          {v.contact}
                        </Text>
                      ))}
                    </View>
                  )}

                  {card.safetyAlerts.length > 0 && (
                    <View style={styles.safetyBox}>
                      <View style={styles.moduleHeadingRow}>
                        <ShieldAlert size={13} color={COLORS.redAlertBorder} />
                        <Text style={[styles.moduleHeading, { color: COLORS.redAlertText }]}>
                          Safety & Do Not Do
                        </Text>
                      </View>
                      {card.safetyAlerts.map((a, i) => (
                        <Text key={i} style={styles.safetyLine}>
                          <Text style={{ fontWeight: "700" }}>[{a.tag}]</Text> {a.message}
                        </Text>
                      ))}
                    </View>
                  )}
                </Animated.View>
              </StaggerReveal>
            );
          })}
        </View>
      )}
    </Animated.ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.parchment,
  },
  content: {
    padding: 16,
    gap: 14,
    paddingBottom: 28,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  title: {
    fontFamily: FONTS.display,
    fontSize: 30,
    color: COLORS.wine,
  },
  subtitle: {
    marginTop: 2,
    fontSize: 13,
    color: COLORS.muted,
  },
  printBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 999,
    backgroundColor: COLORS.wine,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  printBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  emptyBox: {
    borderRadius: 20,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: COLORS.borderStrong,
    backgroundColor: COLORS.white,
    padding: 32,
    alignItems: "center",
    gap: 8,
  },
  emptyTitle: {
    marginTop: 6,
    fontFamily: FONTS.display,
    fontSize: 22,
    color: COLORS.wine,
    textAlign: "center",
  },
  emptySub: {
    fontSize: 13,
    color: COLORS.muted,
    textAlign: "center",
    lineHeight: 19,
  },
  browseBtn: {
    marginTop: 10,
    borderRadius: 999,
    backgroundColor: COLORS.wine,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  browseBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    padding: 16,
    gap: 14,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: 12,
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 8,
  },
  regionText: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.7,
    color: COLORS.muted,
  },
  catPill: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  catText: {
    fontSize: 10,
    fontWeight: "700",
    color: COLORS.wine,
  },
  cardTitle: {
    fontFamily: FONTS.display,
    fontSize: 22,
    color: COLORS.wine,
  },
  deleteBtn: {
    width: 34,
    height: 34,
    borderRadius: 99,
    backgroundColor: COLORS.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  moduleBlock: {
    borderLeftWidth: 2,
    paddingLeft: 10,
    gap: 4,
  },
  moduleHeadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  moduleHeading: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.6,
    color: COLORS.wine,
  },
  moduleLine: {
    fontSize: 12,
    lineHeight: 18,
    color: COLORS.muted,
  },
  heritageRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 5,
  },
  vendorsBox: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    padding: 12,
    gap: 4,
  },
  safetyBox: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FECACA",
    backgroundColor: COLORS.redAlertBg,
    padding: 12,
    gap: 4,
  },
  safetyLine: {
    fontSize: 12,
    lineHeight: 17,
    color: COLORS.redAlertText,
  },
});
