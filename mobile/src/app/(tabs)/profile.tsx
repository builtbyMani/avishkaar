import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import Animated, {
  FadeIn,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useApp } from "../../components/AppProvider";
import {
  AlertTriangle,
  ArrowRight,
  Award,
  Check,
  CheckCircle2,
  Info,
  Lock,
  Mail,
  ShieldCheck,
  Trophy,
  UserCheck,
} from "../../components/Icons";
import { MemojiAvatar } from "../../components/MemojiAvatar";
import {
  canVolunteerAsGuide,
  getPlaceSlug,
  getTierDisplayLabel,
  REGIONS,
  VOLUNTEER_GUIDE_DISCLAIMERS,
} from "../../lib/domain";
import {
  acceptGuideRequest,
  getUserProfileOverview,
  updateGuideProfile,
} from "../../lib/store";
import { TactilePressable, triggerHaptic, UI_SPRING } from "../../theme/motion";
import {
  COLORS,
  FEEDBACK_TONE_STYLES,
  FONTS,
  TRAILBLAZER_TIER_STYLES,
  type FeedbackMessage,
} from "../../theme/tokens";
import type {
  EnrichedPlace,
  GuideRequest,
  Profile,
  UserBadge,
} from "../../types/domain";

const TROPHY_SLOTS = [
  {
    key: "first_discovery",
    name: "First Discovery",
    desc: "Publish your first hidden gem.",
    fullWidth: false,
  },
  {
    key: "foodie_scout",
    name: "Foodie Scout",
    desc: "Vouch for 2+ regional food spots.",
    fullWidth: false,
  },
  {
    key: "local_legend",
    name: "Regional Steward",
    desc: "Reach 300+ community points for priority regional curation.",
    fullWidth: true,
  },
] as const;

export default function ProfileScreen() {
  const router = useRouter();
  const { activeUser, mode, refreshProfiles, openAuthModal, scrollProgress, feedVersion } =
    useApp();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [badges, setBadges] = useState<UserBadge[]>([]);
  const [requests, setRequests] = useState<GuideRequest[]>([]);
  const [authoredPlaces, setAuthoredPlaces] = useState<EnrichedPlace[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [isGuide, setIsGuide] = useState(false);
  const [guideRegion, setGuideRegion] = useState<string>(REGIONS[0]);
  const [languagesText, setLanguagesText] = useState("English, Hindi");
  const [statusMsg, setStatusMsg] = useState<FeedbackMessage | null>(null);
  const progressAnim = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      const maxScroll = Math.max(1, event.contentSize.height - event.layoutMeasurement.height);
      scrollProgress.value = Math.min(1, Math.max(0, event.contentOffset.y / maxScroll));
    },
  });

  const loadProfile = useCallback(
    async (isRefresh = false, silent = false) => {
      if (!activeUser) {
        setProfile(null);
        setLoading(false);
        setRefreshing(false);
        return;
      }
      if (isRefresh) setRefreshing(true);
      else if (!silent) setLoading(true);
      try {
        const res = await getUserProfileOverview(activeUser.id, { demoMode: mode === "demo" });
        const resolvedProfile = res.profile ?? activeUser;
        setProfile(resolvedProfile);
        setBadges(res.badges);
        setRequests(res.guideRequests);
        setAuthoredPlaces(res.authoredPlaces);
        setIsGuide(resolvedProfile.isGuide);
        if (resolvedProfile.guideRegion) setGuideRegion(resolvedProfile.guideRegion);
        if (resolvedProfile.languages.length > 0) {
          setLanguagesText(resolvedProfile.languages.join(", "));
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [activeUser, mode],
  );

  useEffect(() => {
    setStatusMsg(null);
    void loadProfile(false, Boolean(profile && profile.id === activeUser?.id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadProfile, feedVersion]);

  useFocusEffect(
    useCallback(() => {
      if (activeUser) {
        void loadProfile(false, true);
      }
    }, [activeUser, loadProfile]),
  );

  useEffect(() => {
    const target = profile ? Math.min(1, Math.max(0, profile.trailblazerScore / 300)) : 0;
    progressAnim.value = withSpring(target, UI_SPRING);
  }, [profile, progressAnim]);

  const progressFillAnimStyle = useAnimatedStyle(() => ({
    width: `${Math.round(progressAnim.value * 100)}%`,
  }));

  async function handleSaveGuide() {
    if (!profile) return;
    setStatusMsg(null);
    try {
      await updateGuideProfile(
        {
          userId: profile.id,
          isGuide,
          guideRegion: isGuide ? guideRegion : null,
          languages: languagesText
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
        },
        { demoMode: mode === "demo" },
      );
      triggerHaptic("success");
      setStatusMsg({ kind: "success", text: "Volunteer Guide preferences saved!" });
      await Promise.all([loadProfile(false, true), refreshProfiles()]);
    } catch (err) {
      triggerHaptic("warning");
      setStatusMsg({
        kind: "error",
        text: err instanceof Error ? err.message : "Failed to update guide status",
      });
    }
  }

  async function handleAcceptRequest(requestId: string) {
    if (!profile) return;
    try {
      await acceptGuideRequest(requestId, profile.id, { demoMode: mode === "demo" });
      triggerHaptic("success");
      setStatusMsg({ kind: "success", text: "Guide request accepted!" });
      await loadProfile(false, true);
    } catch (err) {
      triggerHaptic("warning");
      setStatusMsg({
        kind: "error",
        text: err instanceof Error ? err.message : "Failed to accept request",
      });
    }
  }

  if (!activeUser && !loading) {
    return (
      <View style={[styles.screen, styles.signedOutBox]}>
        <MemojiAvatar name="Traveler" size={64} />
        <Text style={styles.signedOutTitle}>Sign in to view your Traveler Profile</Text>
        <Text style={styles.signedOutSub}>
          Track your Trailblazer score, unlock badges, volunteer as a local guide, and manage trip requests.
        </Text>
        <TactilePressable onPress={openAuthModal} style={styles.signInCta}>
          <Text style={styles.signInCtaText}>Account & Sign In</Text>
        </TactilePressable>
        <View style={styles.signedOutLinksRow}>
          <TactilePressable onPress={() => router.push("/about")} style={styles.signedOutLinkPill}>
            <Info size={13} color={COLORS.wine} />
            <Text style={styles.signedOutLinkText}>About Us</Text>
          </TactilePressable>
          <TactilePressable onPress={() => router.push("/contact")} style={styles.signedOutLinkPill}>
            <Mail size={13} color={COLORS.wine} />
            <Text style={styles.signedOutLinkText}>Contact Us</Text>
          </TactilePressable>
        </View>
      </View>
    );
  }

  if (loading || !profile) {
    return (
      <View style={[styles.screen, { padding: 16, gap: 14 }]}>
        <View style={styles.skelBox} />
        <View style={styles.skelBox} />
      </View>
    );
  }

  const guideEligible = canVolunteerAsGuide(profile);
  const tierStyle = TRAILBLAZER_TIER_STYLES[profile.tier];

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: COLORS.parchment }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 88 : 0}
    >
      <Animated.ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => void loadProfile(true)}
            tintColor={COLORS.wine}
          />
        }
      >
        {/* Header Card */}
        <View style={styles.card}>
          <View style={styles.profileTopRow}>
            <View style={styles.profileIdentity}>
              <MemojiAvatar id={profile.id} name={profile.displayName} size={56} />
              <View style={{ flex: 1 }}>
                <View
                  style={[
                    styles.tierPill,
                    { backgroundColor: tierStyle.bg, borderColor: tierStyle.border },
                  ]}
                >
                  <Award size={12} color={tierStyle.text} />
                  <Text style={[styles.tierPillText, { color: tierStyle.text }]}>
                    {getTierDisplayLabel(profile.tier)}
                  </Text>
                </View>
                <Text style={styles.displayName}>{profile.displayName}</Text>
                <Text style={styles.userHandle}>
                  @{profile.username} · {profile.trailblazerScore} Community Points
                </Text>
              </View>
            </View>

            <TactilePressable onPress={openAuthModal} style={styles.switchAcctBtn}>
              <Text style={styles.switchAcctText}>Account</Text>
            </TactilePressable>
          </View>

          <View style={styles.progressWrap}>
            <View style={styles.progressLabels}>
              <Text style={styles.progressLabel}>Explorer (0)</Text>
              <Text style={styles.progressLabel}>Field Scout (100)</Text>
              <Text style={styles.progressLabel}>Regional Steward (300+)</Text>
            </View>
            <View style={styles.progressTrack}>
              <Animated.View
                style={[
                  styles.progressFill,
                  { backgroundColor: tierStyle.progressFill },
                  progressFillAnimStyle,
                ]}
              />
            </View>
          </View>
        </View>

        {statusMsg && (
          <Animated.View
            entering={FadeIn.duration(180)}
            style={[
              styles.statusBanner,
              {
                backgroundColor: FEEDBACK_TONE_STYLES[statusMsg.kind].bg,
                borderColor: FEEDBACK_TONE_STYLES[statusMsg.kind].border,
              },
            ]}
          >
            {statusMsg.kind === "error" ? (
              <AlertTriangle size={16} color={COLORS.brick} />
            ) : statusMsg.kind === "info" ? (
              <Info size={16} color={COLORS.muted} />
            ) : (
              <CheckCircle2 size={16} color={COLORS.wine} />
            )}
            <Text
              style={[
                styles.statusBannerText,
                { color: FEEDBACK_TONE_STYLES[statusMsg.kind].text },
              ]}
            >
              {statusMsg.text}
            </Text>
          </Animated.View>
        )}

        {/* Asymmetric Trophy Shelf */}
        <View style={styles.card}>
          <View style={styles.sectionTitleRow}>
            <Trophy size={19} color="#D97706" />
            <Text style={styles.sectionTitle}>Trophy Shelf</Text>
          </View>

          <View style={styles.trophyGrid}>
            {TROPHY_SLOTS.map((b) => {
              const unlocked = badges.find((ub) => ub.badgeKey === b.key);
              return (
                <View
                  key={b.key}
                  style={[
                    styles.trophyCard,
                    b.fullWidth ? { width: "100%" } : { width: "48%" },
                    unlocked ? styles.trophyUnlocked : styles.trophyLocked,
                  ]}
                >
                  <View style={styles.trophyTop}>
                    <Text style={styles.trophyName}>{b.name}</Text>
                    {unlocked ? (
                      <ShieldCheck size={17} color="#D97706" />
                    ) : (
                      <Lock size={15} color={COLORS.muted} />
                    )}
                  </View>
                  <Text style={styles.trophyDesc}>{b.desc}</Text>
                  {unlocked ? (
                    <View style={styles.unlockedRow}>
                      <Check size={13} color={COLORS.emerald} strokeWidth={2.25} />
                      <Text style={styles.unlockedText}>Unlocked</Text>
                    </View>
                  ) : (
                    <Text style={styles.lockedText}>Locked</Text>
                  )}
                </View>
              );
            })}
          </View>
        </View>

        {/* Trust-Gated Volunteer Local Guide Toggle */}
        <View style={styles.card}>
          <View style={styles.sectionTitleRow}>
            <UserCheck size={19} color={COLORS.emerald} />
            <Text style={styles.sectionTitle}>Volunteer as a Local Guide</Text>
          </View>
          <Text style={styles.sectionSub}>
            To prevent spam, only Field Scouts (100+ pts), Regional Stewards (300+ pts), or verified locals can enable guide status.
          </Text>

          <View style={styles.disclaimerBox}>
            <View style={styles.disclaimerHeadingRow}>
              <Info size={14} color={COLORS.wine} />
              <Text style={styles.disclaimerHeading}>{VOLUNTEER_GUIDE_DISCLAIMERS.title}</Text>
            </View>
            {VOLUNTEER_GUIDE_DISCLAIMERS.points.map((line) => (
              <Text key={line} style={styles.disclaimerItem}>
                • {line}
              </Text>
            ))}
          </View>

          {!guideEligible ? (
            <View style={styles.gateWarnBox}>
              <Text style={styles.gateWarnText}>
                You currently have <Text style={{ fontWeight: "700" }}>{profile.trailblazerScore} pts</Text>{" "}
                ({getTierDisplayLabel(profile.tier)}). Earn{" "}
                <Text style={{ fontWeight: "700" }}>
                  {Math.max(1, 100 - profile.trailblazerScore)} more points
                </Text> via
                discoveries & vouches to unlock Guide mode.
              </Text>
            </View>
          ) : (
            <View style={styles.guideForm}>
              <View style={styles.guideToggleBox}>
                <Text style={styles.guideToggleLabel}>Volunteer as Guide</Text>
                <Switch
                  value={isGuide}
                  onValueChange={setIsGuide}
                  trackColor={{ false: "#D6CFC3", true: COLORS.wine }}
                  thumbColor={COLORS.white}
                />
              </View>

              <Text style={styles.inputLabel}>GUIDE REGION</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.regionChips}
              >
                {REGIONS.map((r) => {
                  const active = guideRegion === r;
                  return (
                    <TactilePressable
                      key={r}
                      onPress={() => setGuideRegion(r)}
                      style={[styles.regionChip, active && styles.regionChipActive]}
                    >
                      <Text style={[styles.regionChipText, active && { color: COLORS.parchment }]}>
                        {r}
                      </Text>
                    </TactilePressable>
                  );
                })}
              </ScrollView>

              <Text style={styles.inputLabel}>LANGUAGES SPOKEN</Text>
              <TextInput
                value={languagesText}
                onChangeText={setLanguagesText}
                placeholder="English, Hindi"
                placeholderTextColor={COLORS.muted}
                style={styles.input}
              />

              <TactilePressable onPress={() => void handleSaveGuide()} style={styles.saveGuideBtn}>
                <Text style={styles.saveGuideText}>Save Guide Preferences</Text>
              </TactilePressable>
            </View>
          )}
        </View>

        {/* Guide Requests */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Guide Requests ({requests.length})</Text>
          {requests.length === 0 ? (
            <Text style={styles.sectionSub}>No guide requests yet.</Text>
          ) : (
            <View style={{ gap: 10 }}>
              {requests.map((r) => (
                <View key={r.id} style={styles.reqCard}>
                  <View style={{ flex: 1, gap: 4 }}>
                    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
                      <Text style={styles.reqDate}>Date: {r.preferredDate || "Flexible"}</Text>
                      <TactilePressable onPress={() => router.push(`/place/${r.placeId}`)}>
                        <Text style={styles.reqPlaceLink}>View Place</Text>
                      </TactilePressable>
                    </View>
                    <Text style={styles.reqNotes}>{r.notes}</Text>
                  </View>

                  <View style={styles.reqRight}>
                    <View
                      style={[
                        styles.reqStatusPill,
                        {
                          backgroundColor:
                            r.status === "Accepted" ? COLORS.emeraldTint : "#FEF3C7",
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.reqStatusText,
                          { color: r.status === "Accepted" ? COLORS.emeraldDark : "#78350F" },
                        ]}
                      >
                        {r.status}
                      </Text>
                    </View>
                    {r.guideId === profile.id && r.status === "Pending" && (
                      <TactilePressable
                        onPress={() => void handleAcceptRequest(r.id)}
                        style={styles.acceptBtn}
                      >
                        <Text style={styles.acceptBtnText}>Accept</Text>
                      </TactilePressable>
                    )}
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Authored Destinations */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Your Discovered Spots ({authoredPlaces.length})</Text>
          {authoredPlaces.length === 0 ? (
            <Text style={styles.sectionSub}>No spots shared yet — post your first hidden gem!</Text>
          ) : (
            <View style={styles.spotsWrap}>
              {authoredPlaces.map((p) => (
                <TactilePressable
                  key={p.id}
                  onPress={() => router.push(`/place/${getPlaceSlug(p)}`)}
                  style={styles.spotChip}
                >
                  <Text style={styles.spotChipText}>
                    {p.title} · Gem {p.hiddenGemScore}
                  </Text>
                </TactilePressable>
              ))}
            </View>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>About &amp; Support</Text>
          <Text style={styles.sectionSub}>
            Learn how Avishkaar scores hidden gems, read volunteer guide disclaimers, or reach our stewards.
          </Text>
          <View style={styles.aboutContactRow}>
            <TactilePressable onPress={() => router.push("/about")} style={styles.aboutContactBtn}>
              <Info size={14} color={COLORS.wine} />
              <Text style={styles.aboutContactBtnText}>About Us</Text>
              <ArrowRight size={13} color={COLORS.wine} />
            </TactilePressable>
            <TactilePressable onPress={() => router.push("/contact")} style={styles.aboutContactBtn}>
              <Mail size={14} color={COLORS.wine} />
              <Text style={styles.aboutContactBtnText}>Contact Us</Text>
              <ArrowRight size={13} color={COLORS.wine} />
            </TactilePressable>
          </View>
        </View>
      </Animated.ScrollView>
    </KeyboardAvoidingView>
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
  skelBox: {
    height: 180,
    borderRadius: 20,
    backgroundColor: COLORS.well,
  },
  signedOutBox: {
    alignItems: "center",
    justifyContent: "center",
    padding: 28,
    gap: 12,
  },
  signedOutTitle: {
    fontFamily: FONTS.display,
    fontSize: 26,
    color: COLORS.wine,
    textAlign: "center",
  },
  signedOutSub: {
    fontSize: 13,
    lineHeight: 19,
    color: COLORS.muted,
    textAlign: "center",
  },
  signInCta: {
    marginTop: 6,
    borderRadius: 999,
    backgroundColor: COLORS.wine,
    paddingHorizontal: 22,
    paddingVertical: 12,
  },
  signInCtaText: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.parchment,
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    padding: 16,
    gap: 12,
  },
  profileTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 10,
  },
  profileIdentity: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  tierPill: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 3,
  },
  tierPillText: {
    fontSize: 11,
    fontWeight: "600",
  },
  displayName: {
    marginTop: 4,
    fontFamily: FONTS.display,
    fontSize: 28,
    lineHeight: 32,
    color: COLORS.ink,
  },
  userHandle: {
    fontSize: 12,
    color: COLORS.muted,
  },
  switchAcctBtn: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    paddingHorizontal: 13,
    paddingVertical: 8,
  },
  switchAcctText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.wine,
  },
  progressWrap: {
    gap: 6,
    marginTop: 4,
  },
  progressLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  progressLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: COLORS.muted,
  },
  progressTrack: {
    height: 10,
    borderRadius: 999,
    backgroundColor: COLORS.well,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
  },
  statusBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.emeraldBorder,
    backgroundColor: COLORS.emeraldTint,
    padding: 12,
  },
  statusBannerText: {
    flex: 1,
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.emeraldDark,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sectionTitle: {
    fontFamily: FONTS.display,
    fontSize: 23,
    color: COLORS.wine,
  },
  sectionSub: {
    fontSize: 13,
    lineHeight: 18,
    color: COLORS.muted,
  },
  trophyGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  trophyCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    justifyContent: "space-between",
    gap: 6,
  },
  trophyUnlocked: {
    borderColor: "#FCD34D",
    backgroundColor: "#FFFBEB",
  },
  trophyLocked: {
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    opacity: 0.72,
  },
  trophyTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 6,
  },
  trophyName: {
    flex: 1,
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.wine,
  },
  trophyDesc: {
    fontSize: 11,
    lineHeight: 16,
    color: COLORS.muted,
  },
  unlockedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  unlockedText: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.emerald,
  },
  lockedText: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.muted,
  },
  gateWarnBox: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#FDE68A",
    backgroundColor: "#FFFBEB",
    padding: 12,
  },
  gateWarnText: {
    fontSize: 12,
    lineHeight: 18,
    color: "#78350F",
  },
  guideForm: {
    gap: 10,
  },
  guideToggleBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  guideToggleLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.wine,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.7,
    color: COLORS.wine,
  },
  regionChips: {
    flexDirection: "row",
    gap: 8,
  },
  regionChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  regionChipActive: {
    backgroundColor: COLORS.wine,
    borderColor: COLORS.wine,
  },
  regionChipText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.ink,
  },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.ink,
  },
  saveGuideBtn: {
    alignSelf: "flex-start",
    borderRadius: 12,
    backgroundColor: COLORS.wine,
    paddingHorizontal: 18,
    paddingVertical: 11,
  },
  saveGuideText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  reqCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    padding: 12,
  },
  reqDate: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.wine,
  },
  reqPlaceLink: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.terracotta,
    textDecorationLine: "underline",
  },
  reqNotes: {
    fontSize: 12,
    color: COLORS.muted,
  },
  reqRight: {
    alignItems: "flex-end",
    gap: 6,
  },
  reqStatusPill: {
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  reqStatusText: {
    fontSize: 11,
    fontWeight: "700",
  },
  acceptBtn: {
    borderRadius: 8,
    backgroundColor: COLORS.wine,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  acceptBtnText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  spotsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  spotChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  spotChipText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.wine,
  },
  signedOutLinksRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 4,
  },
  signedOutLinkPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  signedOutLinkText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.wine,
  },
  disclaimerBox: {
    marginTop: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.turmericBorder,
    backgroundColor: "#FFFBEB",
    padding: 11,
    gap: 4,
  },
  disclaimerHeadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 2,
  },
  disclaimerHeading: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.wine,
  },
  disclaimerItem: {
    fontSize: 11,
    lineHeight: 16,
    color: "#78350F",
  },
  aboutContactRow: {
    marginTop: 10,
    flexDirection: "row",
    gap: 10,
  },
  aboutContactBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  aboutContactBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.wine,
  },
});
