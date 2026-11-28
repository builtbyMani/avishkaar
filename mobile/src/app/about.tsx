import { useRouter } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ArrowLeft,
  Compass,
  HandHeart,
  Info,
  Mail,
  MapPin,
  ShieldCheck,
} from "../components/Icons";
import { VOLUNTEER_GUIDE_DISCLAIMERS } from "../lib/domain";
import { StaggerReveal, TactilePressable } from "../theme/motion";
import { COLORS, FONTS } from "../theme/tokens";

const PILLARS = [
  {
    key: "gem",
    title: "Hidden Gem Ranking",
    desc: "Mainstream hubs decay logarithmically in score while lesser-known villages, trails, and regional kitchens climb through real traveler vouches and GPS check-ins.",
  },
  {
    key: "safety",
    title: "Community Safety Ground Truth",
    desc: "Scam alerts and road notices require verification votes before appearing publicly so travelers get signal instead of noise.",
  },
  {
    key: "local",
    title: "Direct Local Economy",
    desc: "Independent weavers, homestays, and kitchens share Google Maps pins and direct WhatsApp/phone contacts with zero platform commissions.",
  },
];

export default function AboutScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <View style={styles.topHeader}>
        <TactilePressable onPress={() => router.back()} style={styles.backLink}>
          <ArrowLeft size={16} color={COLORS.wine} />
          <Text style={styles.backText}>Back</Text>
        </TactilePressable>
        <Text style={styles.headerTitle}>About Avishkaar</Text>
        <View style={{ width: 52 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <StaggerReveal index={0}>
          <View style={styles.heroCard}>
            <View style={styles.badge}>
              <Info size={13} color={COLORS.wine} />
              <Text style={styles.badgeText}>About Avishkaar</Text>
            </View>
            <Text style={styles.heroTitle}>
              Travel slower. Trust locals. Leave tourist traps behind.
            </Text>
            <Text style={styles.heroSub}>
              Avishkaar pairs visual offbeat storytelling with Google Maps navigation, crowd-decay
              scoring, and trust-gated local guides across India.
            </Text>
            <View style={styles.ctaRow}>
              <TactilePressable
                onPress={() => router.replace("/(tabs)")}
                style={styles.primaryBtn}
              >
                <MapPin size={14} color={COLORS.parchment} />
                <Text style={styles.primaryBtnText}>Explore Gems</Text>
              </TactilePressable>
              <TactilePressable
                onPress={() => router.push("/contact")}
                style={styles.secondaryBtn}
              >
                <Mail size={14} color={COLORS.wine} />
                <Text style={styles.secondaryBtnText}>Contact Us</Text>
              </TactilePressable>
            </View>
          </View>
        </StaggerReveal>

        {PILLARS.map((pillar, idx) => (
          <StaggerReveal key={pillar.key} index={idx + 1}>
            <View style={styles.card}>
              <View style={styles.pillarHeader}>
                {pillar.key === "gem" ? (
                  <Compass size={17} color={COLORS.wine} />
                ) : pillar.key === "safety" ? (
                  <ShieldCheck size={17} color={COLORS.wine} />
                ) : (
                  <HandHeart size={17} color={COLORS.wine} />
                )}
                <Text style={styles.cardTitle}>{pillar.title}</Text>
              </View>
              <Text style={styles.cardDesc}>{pillar.desc}</Text>
            </View>
          </StaggerReveal>
        ))}

        <StaggerReveal index={4}>
          <View style={styles.disclaimerCard}>
            <View style={styles.pillarHeader}>
              <ShieldCheck size={17} color={COLORS.wine} />
              <Text style={styles.cardTitle}>{VOLUNTEER_GUIDE_DISCLAIMERS.title}</Text>
            </View>
            {VOLUNTEER_GUIDE_DISCLAIMERS.points.map((line) => (
              <Text key={line} style={styles.disclaimerLine}>
                • {line}
              </Text>
            ))}
          </View>
        </StaggerReveal>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.parchment,
  },
  topHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.parchment,
  },
  backLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    width: 52,
  },
  backText: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.wine,
  },
  headerTitle: {
    fontFamily: FONTS.display,
    fontSize: 19,
    color: COLORS.ink,
  },
  content: {
    padding: 16,
    gap: 12,
    paddingBottom: 32,
  },
  heroCard: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    padding: 18,
    gap: 10,
  },
  badge: {
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
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.ink,
  },
  heroTitle: {
    fontFamily: FONTS.rozha,
    fontSize: 27,
    lineHeight: 33,
    color: COLORS.wine,
  },
  heroSub: {
    fontSize: 13,
    lineHeight: 20,
    color: COLORS.muted,
  },
  ctaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 4,
  },
  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    borderRadius: 999,
    backgroundColor: COLORS.wine,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  primaryBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.parchment,
  },
  secondaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  secondaryBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.wine,
  },
  card: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    padding: 16,
    gap: 6,
  },
  pillarHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  cardTitle: {
    fontFamily: FONTS.display,
    fontSize: 18,
    color: COLORS.wine,
  },
  cardDesc: {
    fontSize: 13,
    lineHeight: 19,
    color: COLORS.muted,
  },
  disclaimerCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.turmericBorder,
    backgroundColor: "#FFFBEB",
    padding: 16,
    gap: 8,
  },
  disclaimerLine: {
    fontSize: 12,
    lineHeight: 18,
    color: "#78350F",
  },
});
