import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, CheckCircle2, Info, Mail, ShieldCheck } from "../components/Icons";
import { VOLUNTEER_GUIDE_DISCLAIMERS } from "../lib/domain";
import { StaggerReveal, TactilePressable, triggerHaptic } from "../theme/motion";
import { COLORS, FONTS } from "../theme/tokens";

const TOPICS = [
  "General Question",
  "Fix Pin / Safety Update",
  "Volunteer Guide Inquiry",
  "Artisan / Homestay Listing",
] as const;

const SUPPORT_EMAIL = "community@avishkaar.travel";

export default function ContactScreen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [topic, setTopic] = useState<string>(TOPICS[0]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sentNotice, setSentNotice] = useState(false);

  const handleCompose = async () => {
    setError(null);
    if (!name.trim() || !email.trim() || message.trim().length < 10) {
      triggerHaptic("warning");
      setError("Enter your name, email, and a message of at least 10 characters.");
      return;
    }

    const subject = `[Avishkaar] ${topic} — ${name.trim()}`;
    const body = `From: ${name.trim()} (${email.trim()})\nTopic: ${topic}\n\n${message.trim()}`;
    const url = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    triggerHaptic("success");
    setSentNotice(true);
    try {
      await Linking.openURL(url);
    } catch {
      // Simulator without configured mail app still shows direct email address above
    }
  };

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <View style={styles.topHeader}>
        <TactilePressable onPress={() => router.back()} style={styles.backLink}>
          <ArrowLeft size={16} color={COLORS.wine} />
          <Text style={styles.backText}>Back</Text>
        </TactilePressable>
        <Text style={styles.headerTitle}>Contact Us</Text>
        <View style={{ width: 52 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <StaggerReveal index={0}>
            <View style={styles.heroCard}>
              <View style={styles.badge}>
                <Mail size={13} color={COLORS.wine} />
                <Text style={styles.badgeText}>Community Support</Text>
              </View>
              <Text style={styles.heroTitle}>Reach the Avishkaar stewards</Text>
              <Text style={styles.heroSub}>
                Flag an inaccurate trail coordinate, submit a safety update, or suggest a local
                kitchen or artisan cooperative.
              </Text>
              <TactilePressable
                onPress={() => void Linking.openURL(`mailto:${SUPPORT_EMAIL}`)}
                style={styles.emailPill}
              >
                <Mail size={14} color={COLORS.wine} />
                <Text style={styles.emailPillText}>{SUPPORT_EMAIL}</Text>
              </TactilePressable>
            </View>
          </StaggerReveal>

          <StaggerReveal index={1}>
            <View style={styles.card}>
              <Text style={styles.sectionHeading}>Send a Message</Text>

              <Text style={styles.label}>Topic</Text>
              <View style={styles.topicWrap}>
                {TOPICS.map((t) => {
                  const active = topic === t;
                  return (
                    <TactilePressable
                      key={t}
                      onPress={() => {
                        triggerHaptic("selection");
                        setTopic(t);
                      }}
                      style={[styles.topicChip, active && styles.topicChipActive]}
                    >
                      <Text style={[styles.topicText, active && styles.topicTextActive]}>{t}</Text>
                    </TactilePressable>
                  );
                })}
              </View>

              <Text style={styles.label}>Your Name</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Aarav Sharma"
                placeholderTextColor={COLORS.muted}
                style={styles.input}
              />

              <Text style={styles.label}>Email Address</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholder="you@example.com"
                placeholderTextColor={COLORS.muted}
                style={styles.input}
              />

              <Text style={styles.label}>Message</Text>
              <TextInput
                value={message}
                onChangeText={setMessage}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                placeholder="Share destination details, map pin fixes, or questions..."
                placeholderTextColor={COLORS.muted}
                style={[styles.input, { minHeight: 96 }]}
              />

              {error && <Text style={styles.errorText}>{error}</Text>}
              {sentNotice && (
                <View style={styles.successBox}>
                  <CheckCircle2 size={15} color={COLORS.emeraldDark} />
                  <Text style={styles.successText}>
                    Email draft opened for {SUPPORT_EMAIL}.
                  </Text>
                </View>
              )}

              <TactilePressable onPress={() => void handleCompose()} style={styles.submitBtn}>
                <Mail size={15} color={COLORS.parchment} />
                <Text style={styles.submitBtnText}>Compose Email</Text>
              </TactilePressable>
            </View>
          </StaggerReveal>

          <StaggerReveal index={2}>
            <View style={styles.disclaimerCard}>
              <View style={styles.disclaimerHead}>
                <ShieldCheck size={16} color={COLORS.wine} />
                <Text style={styles.disclaimerTitle}>Volunteer Guide Note</Text>
              </View>
              <Text style={styles.disclaimerText}>
                {VOLUNTEER_GUIDE_DISCLAIMERS.points[0]} {VOLUNTEER_GUIDE_DISCLAIMERS.points[1]}
              </Text>
              <TactilePressable
                onPress={() => router.push("/about")}
                style={styles.aboutInlineLink}
              >
                <Info size={13} color={COLORS.wine} />
                <Text style={styles.aboutInlineText}>Read Full About &amp; Disclaimers</Text>
              </TactilePressable>
            </View>
          </StaggerReveal>
        </ScrollView>
      </KeyboardAvoidingView>
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
    gap: 14,
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
    lineHeight: 19,
    color: COLORS.muted,
  },
  emailPill: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  emailPillText: {
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
    gap: 8,
  },
  sectionHeading: {
    fontFamily: FONTS.display,
    fontSize: 20,
    color: COLORS.wine,
  },
  label: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.wine,
  },
  topicWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  topicChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  topicChipActive: {
    backgroundColor: COLORS.wine,
    borderColor: COLORS.wine,
  },
  topicText: {
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.ink,
  },
  topicTextActive: {
    color: COLORS.parchment,
  },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.ink,
  },
  errorText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.brick,
  },
  successBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.emeraldBorder,
    backgroundColor: COLORS.emeraldTint,
    padding: 10,
  },
  successText: {
    flex: 1,
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.emeraldDark,
  },
  submitBtn: {
    marginTop: 4,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 12,
    backgroundColor: COLORS.wine,
    paddingVertical: 13,
  },
  submitBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.parchment,
  },
  disclaimerCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.turmericBorder,
    backgroundColor: "#FFFBEB",
    padding: 15,
    gap: 6,
  },
  disclaimerHead: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  disclaimerTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.wine,
  },
  disclaimerText: {
    fontSize: 12,
    lineHeight: 18,
    color: "#78350F",
  },
  aboutInlineLink: {
    marginTop: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  aboutInlineText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.wine,
    textDecorationLine: "underline",
  },
});
