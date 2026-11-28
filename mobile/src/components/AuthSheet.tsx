import { makeRedirectUri } from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";
import { getTierDisplayLabel } from "../lib/domain";
import { getSupabaseClient } from "../lib/supabase";
import { AnimatedBottomSheet, TactilePressable, triggerHaptic } from "../theme/motion";
import { COLORS, FONTS, TRAILBLAZER_TIER_STYLES } from "../theme/tokens";
import { useApp } from "./AppProvider";
import { Award, Check, LogOut, Mail, Shield, XIcon } from "./Icons";
import { MemojiAvatar } from "./MemojiAvatar";

WebBrowser.maybeCompleteAuthSession();

function parseAuthParams(url: string) {
  const [, hash = ""] = url.split("#");
  const [, queryPart = ""] = url.split("?");
  const query = queryPart.split("#")[0] || "";
  const hp = new URLSearchParams(hash);
  const qp = new URLSearchParams(query);
  return {
    accessToken: hp.get("access_token") ?? qp.get("access_token") ?? undefined,
    refreshToken: hp.get("refresh_token") ?? qp.get("refresh_token") ?? undefined,
    code: qp.get("code") ?? hp.get("code") ?? undefined,
  };
}

export function AuthSheet({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const insets = useSafeAreaInsets();
  const {
    activeUser,
    profiles,
    switchDemoUser,
    refreshProfiles,
    mode,
    supabaseConfigured,
    demoSandbox,
    enableDemoSandbox,
    disableDemoSandbox,
    bumpFeedVersion,
  } = useApp();

  const [email, setEmail] = useState("");
  const [otpToken, setOtpToken] = useState("");
  const [awaitingOtp, setAwaitingOtp] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open) {
      setMessage(null);
    }
  }, [open]);

  const redirectTo = makeRedirectUri({ scheme: "avishkaar", path: "auth/callback" });

  async function handleGoogleAuth() {
    const sb = getSupabaseClient();
    if (!sb) return;
    setBusy(true);
    setMessage(null);
    try {
      const { data, error } = await sb.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
          skipBrowserRedirect: true,
        },
      });
      if (error) throw error;
      if (!data?.url) throw new Error("Could not initiate Google sign-in.");

      const res = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
      if (res.type === "success" && res.url) {
        const { accessToken, refreshToken, code } = parseAuthParams(res.url);
        if (accessToken && refreshToken) {
          const { error: sessErr } = await sb.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (sessErr) throw sessErr;
        } else if (code) {
          const { error: codeErr } = await sb.auth.exchangeCodeForSession(code);
          if (codeErr) throw codeErr;
        }
        triggerHaptic("success");
        await refreshProfiles();
        bumpFeedVersion();
        onClose();
      }
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Google sign-in failed");
    } finally {
      setBusy(false);
    }
  }

  async function handleMagicLink() {
    const sb = getSupabaseClient();
    if (!sb || !email.trim()) return;
    setBusy(true);
    setMessage(null);
    try {
      const { error } = await sb.auth.signInWithOtp({
        email: email.trim(),
        options: { emailRedirectTo: redirectTo },
      });
      if (error) throw error;
      setAwaitingOtp(true);
      triggerHaptic("success");
      setMessage("Check your inbox for the magic link or 6-digit login code.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Could not send login link");
    } finally {
      setBusy(false);
    }
  }

  async function handleVerifyOtp() {
    const sb = getSupabaseClient();
    if (!sb || !email.trim() || !otpToken.trim()) return;
    setBusy(true);
    setMessage(null);
    try {
      const { error } = await sb.auth.verifyOtp({
        email: email.trim(),
        token: otpToken.trim(),
        type: "email",
      });
      if (error) throw error;
      triggerHaptic("success");
      await refreshProfiles();
      bumpFeedVersion();
      onClose();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Invalid or expired code");
    } finally {
      setBusy(false);
    }
  }

  async function handleSignOut() {
    const sb = getSupabaseClient();
    if (!sb) return;
    setBusy(true);
    try {
      await sb.auth.signOut();
      await refreshProfiles();
      bumpFeedVersion();
      onClose();
    } finally {
      setBusy(false);
    }
  }

  return (
    <AnimatedBottomSheet
      open={open}
      onClose={onClose}
      keyboardAvoid
      sheetStyle={{ paddingBottom: Math.max(insets.bottom, 16) + 12 }}
    >
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Account & Profiles</Text>
          <Text style={styles.subtitle}>
            {mode === "supabase"
              ? "Sign in with Google or an email magic link."
              : "Choose a traveler profile to browse, vouch, or guide."}
          </Text>
        </View>
        <TactilePressable onPress={onClose} style={styles.closeBtn} accessibilityLabel="Close">
          <XIcon size={18} color={COLORS.muted} />
        </TactilePressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollBody}
      >
        {supabaseConfigured && !demoSandbox && (
          <View style={styles.card}>
            <TactilePressable
              disabled={busy}
              onPress={handleGoogleAuth}
              style={[styles.googleBtn, busy && { opacity: 0.6 }]}
            >
              <Svg width={16} height={16} viewBox="0 0 24 24">
                <Path
                  fill={COLORS.parchment}
                  d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7.2-7.27 3.09 0 4.9 1.97 4.9 1.97L19 4.72S16.56 2 12.1 2C6.42 2 2.03 6.8 2.03 12c0 5.05 4.13 10 10.22 10 5.35 0 9.25-3.67 9.25-9.09 0-1.15-.15-1.81-.15-1.81Z"
                />
              </Svg>
              <Text style={styles.googleBtnText}>Continue with Google</Text>
            </TactilePressable>

            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerLabel}>OR EMAIL LINK</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.emailRow}>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="traveler@example.com"
                placeholderTextColor={COLORS.muted}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                style={styles.emailInput}
              />
              <TactilePressable
                disabled={busy || !email.trim()}
                onPress={handleMagicLink}
                style={[styles.sendBtn, (busy || !email.trim()) && { opacity: 0.5 }]}
              >
                <Mail size={14} color={COLORS.ink} />
                <Text style={styles.sendBtnText}>Send Link</Text>
              </TactilePressable>
            </View>

            {awaitingOtp && (
              <View style={styles.emailRow}>
                <TextInput
                  value={otpToken}
                  onChangeText={setOtpToken}
                  placeholder="6-digit OTP code"
                  placeholderTextColor={COLORS.muted}
                  keyboardType="number-pad"
                  style={styles.emailInput}
                />
                <TactilePressable
                  disabled={busy || otpToken.trim().length < 6}
                  onPress={handleVerifyOtp}
                  style={[
                    styles.verifyOtpBtn,
                    (busy || otpToken.trim().length < 6) && { opacity: 0.5 },
                  ]}
                >
                  <Text style={styles.verifyOtpText}>Verify</Text>
                </TactilePressable>
              </View>
            )}

            {activeUser && (
              <TactilePressable disabled={busy} onPress={handleSignOut} style={styles.signOutBtn}>
                <LogOut size={14} color={COLORS.muted} />
                <Text style={styles.signOutText}>Sign out ({activeUser.displayName})</Text>
              </TactilePressable>
            )}

            {message && <Text style={styles.feedbackText}>{message}</Text>}

            {!activeUser && (
              <TactilePressable
                onPress={() => {
                  enableDemoSandbox();
                  bumpFeedVersion();
                }}
                style={styles.sandboxLink}
              >
                <Text style={styles.sandboxLinkText}>
                  Offline or judging? Switch to Demo Sandbox
                </Text>
              </TactilePressable>
            )}
          </View>
        )}

        {mode === "demo" && (
          <View style={styles.demoSection}>
            <View style={styles.demoHeadingRow}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <Shield size={14} color={COLORS.turmeric} />
                <Text style={styles.demoHeading}>TRAVELER PROFILES</Text>
              </View>
              {supabaseConfigured && demoSandbox && (
                <TactilePressable
                  onPress={() => {
                    disableDemoSandbox();
                    bumpFeedVersion();
                  }}
                >
                  <Text style={styles.backToSupabase}>Use Supabase Auth</Text>
                </TactilePressable>
              )}
            </View>

            <View style={styles.profilesList}>
              {profiles.map((p) => {
                const selected = activeUser?.id === p.id;
                const tierStyle = TRAILBLAZER_TIER_STYLES[p.tier];
                return (
                  <TactilePressable
                    key={p.id}
                    onPress={() => {
                      switchDemoUser(p.id);
                      bumpFeedVersion();
                      onClose();
                    }}
                    style={[
                      styles.profileRow,
                      selected
                        ? { borderColor: tierStyle.cardRing, backgroundColor: COLORS.white }
                        : { borderColor: COLORS.border, backgroundColor: COLORS.surface },
                    ]}
                  >
                    <View style={styles.profileLeft}>
                      <MemojiAvatar id={p.id} name={p.displayName} size={36} />
                      <View style={{ flex: 1 }}>
                        <View style={styles.profileTitleRow}>
                          <Text style={styles.profileName} numberOfLines={1}>
                            {p.displayName}
                          </Text>
                          <View
                            style={[
                              styles.tierPill,
                              { backgroundColor: tierStyle.bg, borderColor: tierStyle.border },
                            ]}
                          >
                            <Text style={[styles.tierPillText, { color: tierStyle.text }]}>
                              {getTierDisplayLabel(p.tier)}
                            </Text>
                          </View>
                          {p.isGuide && (
                            <View style={styles.guidePill}>
                              <Text style={styles.guidePillText}>Local Guide</Text>
                            </View>
                          )}
                        </View>
                        <Text style={styles.profileMeta} numberOfLines={1}>
                          {getTierDisplayLabel(p.tier)} · {p.trailblazerScore} pts
                          {p.guideRegion ? ` · ${p.guideRegion}` : ""}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.profileRight}>
                      <Award size={16} color={COLORS.turmeric} />
                      {selected && <Check size={16} color={COLORS.wine} />}
                    </View>
                  </TactilePressable>
                );
              })}
            </View>
          </View>
        )}
      </ScrollView>
    </AnimatedBottomSheet>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 14,
  },
  title: {
    fontFamily: FONTS.rozha,
    fontSize: 24,
    color: COLORS.ink,
  },
  subtitle: {
    marginTop: 2,
    fontSize: 13,
    color: COLORS.muted,
    lineHeight: 18,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 99,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.well,
  },
  scrollBody: {
    gap: 14,
    paddingBottom: 12,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    padding: 14,
    gap: 12,
  },
  googleBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: COLORS.wine,
    borderRadius: 999,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  googleBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.parchment,
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerLabel: {
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 1,
    color: COLORS.muted,
  },
  emailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  emailInput: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 13,
    color: COLORS.ink,
  },
  sendBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  sendBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.ink,
  },
  verifyOtpBtn: {
    backgroundColor: COLORS.wine,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  verifyOtpText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.parchment,
  },
  signOutBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingTop: 2,
  },
  signOutText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.muted,
  },
  feedbackText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.wine,
  },
  sandboxLink: {
    alignSelf: "flex-start",
    paddingTop: 4,
  },
  sandboxLinkText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.wine,
    textDecorationLine: "underline",
  },
  demoSection: {
    gap: 10,
  },
  demoHeadingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  demoHeading: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    color: COLORS.muted,
  },
  backToSupabase: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.wine,
    textDecorationLine: "underline",
  },
  profilesList: {
    gap: 8,
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    gap: 8,
  },
  profileLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  profileTitleRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 6,
  },
  profileName: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.ink,
  },
  tierPill: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  tierPillText: {
    fontSize: 10,
    fontWeight: "600",
  },
  guidePill: {
    borderWidth: 1,
    borderColor: COLORS.wineBorder,
    backgroundColor: COLORS.wineTint,
    borderRadius: 999,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  guidePillText: {
    fontSize: 10,
    fontWeight: "600",
    color: COLORS.wine,
  },
  profileMeta: {
    marginTop: 2,
    fontSize: 12,
    color: COLORS.muted,
  },
  profileRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
});
