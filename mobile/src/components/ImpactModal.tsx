import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AnimatedBottomSheet, TactilePressable } from "../theme/motion";
import { COLORS, FONTS } from "../theme/tokens";
import { Layers, XIcon } from "./Icons";

const ARCH_BOXES = [
  { title: "Expo Native App", sub: "SDK 58 + Reanimated UI Motion + Offline Pocket Cards" },
  { title: "Supabase + PostGIS", sub: "5 Tables + CDN Media + H3 Radius Ready" },
  { title: "Gemini Write-Time", sub: "Multilingual JSON Cards + Detour Matcher" },
  { title: "Leaflet + OSM", sub: "Vendor Pins + Verified Alert Zones" },
];

export function ImpactModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const insets = useSafeAreaInsets();

  return (
    <AnimatedBottomSheet
      open={open}
      onClose={onClose}
      sheetStyle={{ paddingBottom: Math.max(insets.bottom, 16) + 12 }}
    >
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <View style={styles.pill}>
            <Layers size={13} color={COLORS.turmeric} />
            <Text style={styles.pillText}>Anti-Overtourism Impact & Stack</Text>
          </View>
          <Text style={styles.title}>
            Digital Discovery Layer for Swadesh Darshan 2.0 & CBDD
          </Text>
        </View>
        <TactilePressable onPress={onClose} style={styles.closeBtn} accessibilityLabel="Close">
          <XIcon size={18} color={COLORS.muted} />
        </TactilePressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.body}>
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <Text style={[styles.metricValue, { color: COLORS.wine }]}>67.4%</Text>
            <Text style={styles.metricSub}>
              Of India&rsquo;s 428.55 crore domestic tourist visits (2025) concentrated in just 5 states.
            </Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>60%</Text>
            <Text style={styles.metricSub}>
              Foreign air arrivals funneled through Delhi & Mumbai while regional gems stay invisible.
            </Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>₹2,207 cr</Text>
            <Text style={styles.metricSub}>
              Swadesh Darshan 2.0 & Challenge-Based Destination Development circuits ready to amplify.
            </Text>
          </View>
        </View>

        <Text style={styles.sectionLabel}>4-BOX ARCHITECTURE</Text>
        <View style={styles.archGrid}>
          {ARCH_BOXES.map((box) => (
            <View key={box.title} style={styles.archCard}>
              <Text style={styles.archTitle}>{box.title}</Text>
              <Text style={styles.archSub}>{box.sub}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </AnimatedBottomSheet>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 12,
  },
  pill: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.turmericBorder,
    backgroundColor: COLORS.turmericTint,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  pillText: {
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.ink,
  },
  title: {
    marginTop: 8,
    fontFamily: FONTS.rozha,
    fontSize: 22,
    lineHeight: 27,
    color: COLORS.ink,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 99,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.well,
  },
  body: {
    gap: 14,
    paddingBottom: 12,
  },
  metricsGrid: {
    gap: 10,
  },
  metricCard: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    padding: 14,
  },
  metricValue: {
    fontSize: 22,
    fontWeight: "800",
    color: COLORS.ink,
  },
  metricSub: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 17,
    color: COLORS.muted,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    color: COLORS.muted,
    marginTop: 4,
  },
  archGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  archCard: {
    width: "48%",
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    padding: 12,
  },
  archTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.ink,
  },
  archSub: {
    marginTop: 4,
    fontSize: 11,
    lineHeight: 15,
    color: COLORS.muted,
  },
});
