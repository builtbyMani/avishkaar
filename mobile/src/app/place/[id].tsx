import * as Location from "expo-location";
import * as Print from "expo-print";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import * as Sharing from "expo-sharing";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  FlatList,
  Linking,
  Platform,
  RefreshControl,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import Animated, {
  FadeIn,
  FadeInDown,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "../../components/AppProvider";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BookmarkCheck,
  BookmarkPlus,
  Bus,
  Check,
  CheckCircle2,
  Compass,
  Flag,
  HandHeart,
  Info,
  Landmark,
  MapPin,
  MessageCircle,
  Navigation,
  Phone,
  Printer,
  QrCodeIcon,
  ScoreFlameIcon,
  ShieldAlert,
  ShieldCheck,
  Store,
  UserCheck,
  Utensils,
  WifiOff,
  XIcon,
} from "../../components/Icons";
import { MediaCardPlayer } from "../../components/MediaCardPlayer";
import { OsmMapView } from "../../components/OsmMapView";
import { UpiQrModal } from "../../components/UpiQrModal";
import {
  escapeHtml,
  getGemScoreBreakdown,
  isSafetyAlertPublic,
} from "../../lib/domain";
import {
  createGuideRequest,
  getPlaceDetail,
  performCheckIn,
  performVouch,
  verifyOrFlagSafetyAlert,
} from "../../lib/store";
import {
  AnimatedBottomSheet,
  LIST_LAYOUT_TRANSITION,
  TactilePressable,
  triggerHaptic,
} from "../../theme/motion";
import {
  COLORS,
  FEEDBACK_TONE_STYLES,
  FONTS,
  GUIDE_MODULE_COLORS,
  PLACE_CATEGORY_BADGE,
  type FeedbackMessage,
} from "../../theme/tokens";
import type {
  EnrichedPlace,
  GuideRequest,
  LocalVendor,
  MediaItem,
  Profile,
} from "../../types/domain";

function buildPlacePdfHtml(place: EnrichedPlace): string {
  const commuteItems = place.structuredCards.commute
    .map((step, i) => `<li><strong>${i + 1}.</strong> ${escapeHtml(step)}</li>`)
    .join("");
  const foodItems = place.structuredCards.food
    .map(
      (f) =>
        `<li><strong>${escapeHtml(f.name)}</strong>${
          f.priceHint ? ` (${escapeHtml(f.priceHint)})` : ""
        }: ${escapeHtml(f.detail)}</li>`,
    )
    .join("");
  const heritageItems = (place.structuredCards.livingHeritage ?? [])
    .map((h) => `<li>${escapeHtml(h)}</li>`)
    .join("");
  const alerts = place.safetyAlerts
    .filter(isSafetyAlertPublic)
    .map((a) => `<li><strong>[${escapeHtml(a.tag)}]</strong> ${escapeHtml(a.message)}</li>`)
    .join("");
  const vendors = place.localVendors
    .map(
      (v) =>
        `<li><strong>${escapeHtml(v.name)}</strong> (${escapeHtml(v.category)}): ${escapeHtml(
          v.specialty,
        )} · ${escapeHtml(v.contact)}</li>`,
    )
    .join("");

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; padding: 24px; color: #2B141A; }
  h1 { color: #6B1D2F; margin-bottom: 4px; }
  .meta { color: #61454D; font-size: 13px; margin-bottom: 16px; }
  .box { border: 1px solid #E5DDD0; border-radius: 12px; padding: 14px; margin-bottom: 14px; }
  .alert { border: 2px solid #DC2626; background: #FEF2F2; }
  h2 { font-size: 15px; color: #6B1D2F; margin-top: 0; }
  ul { padding-left: 18px; margin: 6px 0 0; font-size: 13px; line-height: 1.5; }
</style>
</head>
<body>
  <h1>${escapeHtml(place.title)}</h1>
  <div class="meta">${escapeHtml(place.region)} · ${escapeHtml(place.category)} · Gem Score ${place.hiddenGemScore} · ${place.lat.toFixed(4)}, ${place.lng.toFixed(4)}</div>
  <p style="font-size:14px;line-height:1.5;">${escapeHtml(place.rawDescription)}</p>
  ${alerts ? `<div class="box alert"><h2>Safety & Do Not Do Advisories</h2><ul>${alerts}</ul></div>` : ""}
  <div class="box"><h2>Last-Mile Commute</h2><ul>${commuteItems}</ul></div>
  <div class="box"><h2>Must-Try Food</h2><ul>${foodItems}</ul></div>
  ${heritageItems ? `<div class="box"><h2>Living Heritage & Etiquette</h2><ul>${heritageItems}</ul></div>` : ""}
  ${vendors ? `<div class="box"><h2>Support Local (0% Commission)</h2><ul>${vendors}</ul></div>` : ""}
</body>
</html>`;
}

export default function PlaceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const {
    activeUser,
    mode,
    refreshProfiles,
    openAuthModal,
    saveOfflineCard,
    removeOfflineCard,
    isSavedOffline,
    bumpFeedVersion,
  } = useApp();

  const [place, setPlace] = useState<EnrichedPlace | null>(null);
  const [matchingGuides, setMatchingGuides] = useState<Profile[]>([]);
  const [guideRequests, setGuideRequests] = useState<GuideRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isScreenFocused, setIsScreenFocused] = useState(true);
  const [demoCheckInToggle, setDemoCheckInToggle] = useState(true);
  const [feedback, setFeedback] = useState<FeedbackMessage | null>(null);
  const [scoreExpanded, setScoreExpanded] = useState(false);
  const [activeMediaIdx, setActiveMediaIdx] = useState(0);
  const [upiVendor, setUpiVendor] = useState<LocalVendor | null>(null);

  const [selectedGuide, setSelectedGuide] = useState<Profile | null>(null);
  const [preferredDate, setPreferredDate] = useState("2026-12-10");
  const [requestNotes, setRequestNotes] = useState("");
  const [submittingGuide, setSubmittingGuide] = useState(false);
  const [vouchBusy, setVouchBusy] = useState(false);
  const [checkInBusy, setCheckInBusy] = useState(false);

  const flatListRef = useRef<FlatList<MediaItem> | null>(null);
  const detailScrollProgress = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      const maxScroll = Math.max(1, event.contentSize.height - event.layoutMeasurement.height);
      detailScrollProgress.value = Math.min(1, Math.max(0, event.contentOffset.y / maxScroll));
    },
  });

  const detailProgressStyle = useAnimatedStyle(() => ({
    transform: [{ scaleX: Math.max(0, Math.min(1, detailScrollProgress.value)) }],
  }));

  useFocusEffect(
    useCallback(() => {
      setIsScreenFocused(true);
      return () => setIsScreenFocused(false);
    }, []),
  );

  const loadPlace = useCallback(
    async (isRefresh = false, silent = false) => {
      if (!id) return;
      if (isRefresh) setRefreshing(true);
      else if (!silent) setLoading(true);
      try {
        const detail = await getPlaceDetail(id, activeUser?.id, { demoMode: mode === "demo" });
        setPlace(detail.place);
        setMatchingGuides(detail.matchingGuides);
        setGuideRequests(detail.guideRequests);
        if (!silent && !isRefresh) {
          setActiveMediaIdx(0);
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [activeUser?.id, id, mode],
  );

  useEffect(() => {
    void loadPlace();
  }, [loadPlace]);

  async function handleVouch() {
    if (!place || vouchBusy) return;
    if (!activeUser) {
      openAuthModal();
      setFeedback({ kind: "info", text: "Sign in to vouch for this hidden gem." });
      return;
    }
    setVouchBusy(true);
    try {
      const data = await performVouch(place.id, activeUser.id, { demoMode: mode === "demo" });
      triggerHaptic("success");
      const badgeInfo =
        data.unlockedBadges.length > 0
          ? ` New badge unlocked: ${data.unlockedBadges.map((b) => b.badgeName).join(", ")}!`
          : "";
      setFeedback(
        data.pointsAwarded
          ? {
              kind: "success",
              text: `${data.isVerifiedVisit ? "Verified Visit Vouch" : "Vouch"} recorded (+${
                data.pointsAwarded
              } Trailblazer pts to ${place.author.displayName}).${badgeInfo}`,
            }
          : { kind: "info", text: "Your vouch is already recorded." },
      );
      bumpFeedVersion();
      await Promise.all([loadPlace(false, true), refreshProfiles()]);
    } catch (err) {
      triggerHaptic("warning");
      setFeedback({ kind: "error", text: err instanceof Error ? err.message : "Vouch failed" });
    } finally {
      setVouchBusy(false);
    }
  }

  async function handleCheckIn() {
    if (!place || checkInBusy) return;
    if (!activeUser) {
      openAuthModal();
      setFeedback({ kind: "info", text: "Sign in to verify your visit check-in." });
      return;
    }
    setFeedback(null);
    setCheckInBusy(true);

    try {
      let coords: { lat?: number; lng?: number } = {};
      if (!demoCheckInToggle) {
        const perm = await Location.requestForegroundPermissionsAsync();
        if (perm.status !== "granted") {
          setFeedback({
            kind: "error",
            text: 'Location permission denied. Toggle "Simulate GPS Check-In" ON for live judging.',
          });
          return;
        }
        const pos = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      }

      const res = await performCheckIn(
        {
          placeId: place.id,
          placeTitle: place.title,
          placeLat: place.lat,
          placeLng: place.lng,
          userId: activeUser.id,
          demoCheckIn: demoCheckInToggle,
          lat: coords.lat,
          lng: coords.lng,
        },
        { demoMode: mode === "demo" },
      );

      triggerHaptic("success");
      setFeedback({
        kind: "success",
        text: demoCheckInToggle
          ? res.bonusDelta > 0
            ? `Demo Check-in verified! Previous Vouch upgraded (+${res.bonusDelta} bonus pts).`
            : "Demo Check-in verified! Your Vouch here now awards +25 Verified Visit points."
          : "GPS check-in verified! Verified Visit Vouch (+25 pts) unlocked.",
      });
      bumpFeedVersion();
      await Promise.all([loadPlace(false, true), refreshProfiles()]);
    } catch (err) {
      triggerHaptic("warning");
      setFeedback({ kind: "error", text: err instanceof Error ? err.message : "Check-in failed" });
    } finally {
      setCheckInBusy(false);
    }
  }

  function handleSaveOffline() {
    if (!place) return;
    if (isSavedOffline(place.id)) {
      removeOfflineCard(place.id);
      triggerHaptic("light");
      setFeedback({ kind: "info", text: "Removed from Offline Pocket Cards." });
      return;
    }
    saveOfflineCard({
      placeId: place.id,
      title: place.title,
      region: place.region,
      category: place.category,
      savedAt: new Date().toISOString(),
      commute: place.structuredCards.commute,
      food: place.structuredCards.food,
      livingHeritage: place.structuredCards.livingHeritage ?? [],
      safetyAlerts: place.safetyAlerts,
      localVendors: place.localVendors,
    });
    triggerHaptic("success");
    setFeedback({
      kind: "success",
      text: "Saved for Offline! Accessible anytime in Saved Pocket without signal.",
    });
  }

  async function handlePrintPdf() {
    if (!place) return;
    try {
      const html = buildPlacePdfHtml(place);
      if (Platform.OS === "ios") {
        await Print.printAsync({ html });
      } else {
        const { uri } = await Print.printToFileAsync({ html });
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(uri, {
            mimeType: "application/pdf",
            dialogTitle: `${place.title} Pocket Field Guide`,
          });
        } else {
          await Print.printAsync({ html });
        }
      }
    } catch {
      setFeedback({ kind: "error", text: "Could not generate PDF card on this device." });
    }
  }

  async function handleSafetyVote(alertIndex: number, action: "verify" | "flag") {
    if (!place) return;
    if (!activeUser) {
      openAuthModal();
      setFeedback({ kind: "info", text: "Sign in to verify or flag community safety advisories." });
      return;
    }
    try {
      const updated = await verifyOrFlagSafetyAlert(place.id, alertIndex, activeUser.id, action, {
        demoMode: mode === "demo",
      });
      triggerHaptic(action === "verify" ? "success" : "medium");
      setPlace({ ...place, safetyAlerts: updated });
      bumpFeedVersion();
      setFeedback({
        kind: action === "verify" ? "success" : "info",
        text:
          action === "verify"
            ? "Safety advisory verified! Pathfinder+ or 2+ votes publish advisories publicly."
            : "Safety advisory flagged for review.",
      });
    } catch (err) {
      setFeedback({
        kind: "error",
        text: err instanceof Error ? err.message : "Could not record safety vote",
      });
    }
  }

  async function handleGuideRequestSubmit() {
    if (!place || !selectedGuide || !requestNotes.trim()) return;
    if (!activeUser) {
      openAuthModal();
      return;
    }
    setSubmittingGuide(true);
    try {
      await createGuideRequest(
        {
          placeId: place.id,
          guideId: selectedGuide.id,
          requesterId: activeUser.id,
          preferredDate: preferredDate.trim(),
          notes: requestNotes.trim(),
        },
        { demoMode: mode === "demo" },
      );
      triggerHaptic("success");
      setFeedback({
        kind: "success",
        text: `Guide request sent to ${selectedGuide.displayName} (Status: Pending).`,
      });
      setSelectedGuide(null);
      setRequestNotes("");
      await loadPlace(false, true);
    } catch (err) {
      setFeedback({
        kind: "error",
        text: err instanceof Error ? err.message : "Could not send request",
      });
    } finally {
      setSubmittingGuide(false);
    }
  }

  const openDirections = (lat: number, lng: number, label: string) => {
    const q = encodeURIComponent(label);
    const url = Platform.select({
      ios: `https://maps.apple.com/?daddr=${lat},${lng}&q=${q}`,
      android: `geo:${lat},${lng}?q=${lat},${lng}(${q})`,
      default: `https://www.openstreetmap.org/directions?to=${lat},${lng}`,
    });
    if (url) void Linking.openURL(url);
  };

  if (loading) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top + 14, paddingHorizontal: 16, gap: 14 }]}>
        <View style={styles.skelHeader} />
        <View style={styles.skelHero} />
        <View style={styles.skelCard} />
        <View style={styles.skelCard} />
      </View>
    );
  }

  if (!place) {
    return (
      <View style={[styles.screen, styles.centerBox, { paddingTop: insets.top }]}>
        <Text style={styles.notFoundTitle}>Place not found</Text>
        <TactilePressable onPress={() => router.replace("/")} style={styles.backHomeBtn}>
          <Text style={styles.backHomeText}>Back to Discover</Text>
        </TactilePressable>
      </View>
    );
  }

  const savedOffline = isSavedOffline(place.id);
  const indexedAlerts = place.safetyAlerts.map((alert, idx) => ({ alert, idx }));
  const publicAlerts = indexedAlerts.filter(({ alert }) => isSafetyAlertPublic(alert));
  const pendingAlerts = indexedAlerts.filter(({ alert }) => !isSafetyAlertPublic(alert));
  const canModerateSafety =
    activeUser?.tier === "Pathfinder" ||
    activeUser?.tier === "Local Legend" ||
    activeUser?.id === place.authorId;
  const gemBreakdown = getGemScoreBreakdown(place);
  const categoryBadge = PLACE_CATEGORY_BADGE[place.category];
  const mediaGalleryWidth = Math.max(280, width - 34);

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {/* Sticky Top Action Bar + Scroll Progress */}
      <View style={styles.topBar}>
        <TactilePressable
          onPress={() => (router.canGoBack() ? router.back() : router.replace("/"))}
          style={styles.backLink}
        >
          <ArrowLeft size={16} color={COLORS.wine} />
          <Text style={styles.backLinkText}>Discovery Feed</Text>
        </TactilePressable>

        <View style={styles.topActions}>
          <TactilePressable
            onPress={handleSaveOffline}
            style={[styles.offlineBtn, savedOffline && styles.offlineBtnSaved]}
          >
            {savedOffline ? (
              <BookmarkCheck size={14} color="#FFFFFF" />
            ) : (
              <BookmarkPlus size={14} color={COLORS.wine} />
            )}
            <Text style={[styles.offlineBtnText, savedOffline && { color: "#FFFFFF" }]}>
              {savedOffline ? "Saved" : "Save Offline"}
            </Text>
          </TactilePressable>

          <TactilePressable onPress={() => void handlePrintPdf()} style={styles.printBtn}>
            <Printer size={14} color={COLORS.wine} />
            <Text style={styles.printBtnText}>PDF</Text>
          </TactilePressable>
        </View>
      </View>

      <View style={styles.progressTrack}>
        <Animated.View style={[styles.progressFill, detailProgressStyle]} />
      </View>

      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, 16) + 24 },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => void loadPlace(true)}
            tintColor={COLORS.wine}
          />
        }
      >
        {feedback && (
          <Animated.View
            layout={LIST_LAYOUT_TRANSITION}
            entering={FadeIn.duration(180)}
            style={[
              styles.feedbackBanner,
              {
                backgroundColor: FEEDBACK_TONE_STYLES[feedback.kind].bg,
                borderColor: FEEDBACK_TONE_STYLES[feedback.kind].border,
              },
            ]}
          >
            <View style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: 8 }}>
              {feedback.kind === "error" ? (
                <AlertTriangle size={16} color={COLORS.brick} />
              ) : feedback.kind === "info" ? (
                <Info size={16} color={COLORS.muted} />
              ) : (
                <CheckCircle2 size={16} color={COLORS.wine} />
              )}
              <Text
                style={[
                  styles.feedbackText,
                  { color: FEEDBACK_TONE_STYLES[feedback.kind].text },
                ]}
              >
                {feedback.text}
              </Text>
            </View>
            <TactilePressable onPress={() => setFeedback(null)}>
              <Text style={styles.feedbackClose}>Close</Text>
            </TactilePressable>
          </Animated.View>
        )}

        {/* Hero Media + Summary Card */}
        <View style={styles.heroCard}>
          <FlatList
            ref={flatListRef}
            data={place.media}
            keyExtractor={(item, idx) => `${item.url}-${idx}`}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            getItemLayout={(_, index) => ({
              length: mediaGalleryWidth,
              offset: mediaGalleryWidth * index,
              index,
            })}
            onMomentumScrollEnd={(e) => {
              const idx = Math.round(e.nativeEvent.contentOffset.x / mediaGalleryWidth);
              setActiveMediaIdx(Math.max(0, Math.min(place.media.length - 1, idx)));
            }}
            renderItem={({ item, index }) => (
              <View style={{ width: mediaGalleryWidth }}>
                <MediaCardPlayer
                  media={item}
                  title={place.title}
                  isFocused={isScreenFocused && index === activeMediaIdx}
                />
              </View>
            )}
          />

          {place.media.length > 1 && (
            <View style={styles.mediaStrip}>
              {place.media.map((item, idx) => {
                const active = idx === activeMediaIdx;
                return (
                  <TactilePressable
                    key={`${item.url}-${idx}`}
                    onPress={() => {
                      setActiveMediaIdx(idx);
                      flatListRef.current?.scrollToIndex({ index: idx, animated: true });
                    }}
                    style={[styles.mediaChip, active && styles.mediaChipActive]}
                  >
                    <Text style={[styles.mediaChipText, active && { color: "#FFFFFF" }]}>
                      {idx + 1}. {item.type === "video" ? "Clip" : "Photo"}
                    </Text>
                  </TactilePressable>
                );
              })}
            </View>
          )}

          <View style={styles.heroInfo}>
            <View style={styles.badgesRow}>
              <TactilePressable
                onPress={() => setScoreExpanded((s) => !s)}
                style={styles.gemScorePill}
              >
                <ScoreFlameIcon size={12} color={COLORS.turmeric} />
                <Text style={styles.gemScorePillText}>Gem Score {place.hiddenGemScore}</Text>
              </TactilePressable>

              <View
                style={[
                  styles.categoryPill,
                  { backgroundColor: categoryBadge.bg, borderColor: categoryBadge.border },
                ]}
              >
                <Text style={[styles.categoryPillText, { color: categoryBadge.text }]}>
                  {place.category}
                </Text>
              </View>

              <View style={styles.regionInline}>
                <MapPin size={13} color={COLORS.terracotta} />
                <Text style={styles.regionInlineText}>{place.region}</Text>
              </View>
            </View>

            {scoreExpanded && (
              <Animated.View
                layout={LIST_LAYOUT_TRANSITION}
                entering={FadeInDown.duration(160)}
                style={styles.breakdownBox}
              >
                <Text style={styles.breakdownHeader}>
                  Vouches ({place.vouchesCount}×2 = +{gemBreakdown.vouchesPoints}) + Check-ins (
                  {place.verifiedCheckinsCount}×5 = +{gemBreakdown.checkinsPoints}) ÷ log10(MPI{" "}
                  {place.mainstreamPopularityIndex}+10 = {gemBreakdown.crowdPenalty}) ={" "}
                  <Text style={{ fontWeight: "800" }}>{gemBreakdown.score}</Text>
                </Text>
              </Animated.View>
            )}

            <Text style={styles.placeTitle}>{place.title}</Text>
            <Text style={styles.placeDesc}>{place.rawDescription}</Text>

            <View style={styles.authorCard}>
              <Text style={styles.authorCardTitle}>
                Discovered by {place.author.displayName} ({place.author.tier} ·{" "}
                {place.author.trailblazerScore} pts)
              </Text>
              <Text style={styles.authorCardMeta}>
                {place.vouchesCount} Vouches · {place.verifiedCheckinsCount} Verified Check-ins
              </Text>
            </View>

            {/* Vouch & Check-In Controls */}
            <View style={styles.trustControls}>
              <View style={styles.trustButtonsRow}>
                <TactilePressable
                  disabled={vouchBusy}
                  onPress={() => void handleVouch()}
                  haptic="medium"
                  style={[
                    styles.vouchBtn,
                    place.userHasVouched && styles.vouchBtnActive,
                    vouchBusy && { opacity: 0.65 },
                  ]}
                >
                  <HandHeart size={16} color="#FFFFFF" />
                  <Text style={styles.vouchBtnText}>
                    {place.userHasVouched
                      ? place.userVerifiedVisitVouch
                        ? "Verified Visit Vouched (+25)"
                        : "Vouched (+10)"
                      : place.userHasCheckedIn
                        ? "Verified Visit Vouch (+25)"
                        : "Vouch (+10 pts)"}
                  </Text>
                </TactilePressable>

                <TactilePressable
                  disabled={checkInBusy}
                  onPress={() => void handleCheckIn()}
                  haptic="medium"
                  style={[
                    styles.checkInBtn,
                    place.userHasCheckedIn && styles.checkInBtnDone,
                    checkInBusy && { opacity: 0.65 },
                  ]}
                >
                  {place.userHasCheckedIn ? (
                    <>
                      <Check size={15} color="#065F46" strokeWidth={2.25} />
                      <Text style={[styles.checkInBtnText, { color: "#065F46" }]}>Checked In</Text>
                    </>
                  ) : (
                    <>
                      <Navigation size={15} color={COLORS.wine} />
                      <Text style={styles.checkInBtnText}>Check In</Text>
                    </>
                  )}
                </TactilePressable>
              </View>

              <View style={styles.demoToggleRow}>
                <Text style={styles.demoToggleText}>
                  Simulate GPS Check-In (Bypass radius for live judging)
                </Text>
                <Switch
                  value={demoCheckInToggle}
                  onValueChange={setDemoCheckInToggle}
                  trackColor={{ false: "#D6CFC3", true: COLORS.terracotta }}
                  thumbColor={COLORS.white}
                />
              </View>
            </View>
          </View>
        </View>

        {/* High-Contrast Verified Safety & Do Not Do Banner */}
        {(publicAlerts.length > 0 || (pendingAlerts.length > 0 && canModerateSafety)) && (
          <View style={styles.safetySection}>
            <View style={styles.safetyHeaderRow}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flex: 1 }}>
                <ShieldAlert size={22} color={COLORS.redAlertBorder} />
                <Text style={styles.safetyHeading}>Verified Safety & &ldquo;Do Not Do&rdquo;</Text>
              </View>
              <View style={styles.safetyRulePill}>
                <Text style={styles.safetyRuleText}>Pathfinder+ / 2+ Verified</Text>
              </View>
            </View>

            {publicAlerts.length > 0 ? (
              <View style={{ gap: 10 }}>
                {publicAlerts.map(({ alert, idx }) => (
                  <View key={idx} style={styles.safetyCard}>
                    <View style={styles.safetyCardTop}>
                      <View style={styles.safetyTagPill}>
                        {alert.tag === "Low Network" ? (
                          <WifiOff size={11} color="#FFFFFF" />
                        ) : (
                          <AlertTriangle size={11} color="#FFFFFF" />
                        )}
                        <Text style={styles.safetyTagText}>{alert.tag}</Text>
                      </View>
                      <Text style={styles.verifiedCountText}>
                        Verified ({alert.verifiedBy?.length ?? 0})
                      </Text>
                    </View>
                    <Text style={styles.safetyMsg}>{alert.message}</Text>
                    <View style={styles.safetyVoteRow}>
                      <TactilePressable
                        onPress={() => void handleSafetyVote(idx, "verify")}
                        style={styles.verifyBtn}
                      >
                        <ShieldCheck size={12} color={COLORS.emeraldDark} />
                        <Text style={styles.verifyBtnText}>
                          Verify ({alert.verifiedBy?.length ?? 0})
                        </Text>
                      </TactilePressable>
                      <TactilePressable
                        onPress={() => void handleSafetyVote(idx, "flag")}
                        style={styles.flagBtn}
                      >
                        <Flag size={12} color="#44403C" />
                        <Text style={styles.flagBtnText}>Flag ({alert.flaggedBy?.length ?? 0})</Text>
                      </TactilePressable>
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.safetyEmptyText}>
                No public safety alerts yet—pending alerts await Pathfinder+ or 2+ user verification.
              </Text>
            )}

            {pendingAlerts.length > 0 && canModerateSafety && (
              <View style={styles.pendingBox}>
                <Text style={styles.pendingLabel}>
                  PENDING VERIFICATION (PATHFINDER+ OR 2+ VERIFIES)
                </Text>
                {pendingAlerts.map(({ alert, idx }) => (
                  <View key={idx} style={styles.pendingItem}>
                    <Text style={styles.pendingMsg}>
                      <Text style={{ fontWeight: "700" }}>[{alert.tag}]</Text> {alert.message}
                    </Text>
                    <View style={styles.pendingActions}>
                      <TactilePressable
                        onPress={() => void handleSafetyVote(idx, "verify")}
                        style={styles.quickVerifyBtn}
                      >
                        <Text style={styles.quickVerifyText}>1-Click Verify</Text>
                      </TactilePressable>
                      <TactilePressable
                        onPress={() => void handleSafetyVote(idx, "flag")}
                        style={styles.quickFlagBtn}
                      >
                        <Text style={styles.quickFlagText}>Flag</Text>
                      </TactilePressable>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* 4 Structured Guide Modules */}
        <View style={{ gap: 12 }}>
          <View style={[styles.guideCard, { borderLeftColor: GUIDE_MODULE_COLORS.commute }]}>
            <View style={styles.guideHeader}>
              <Bus size={18} color={GUIDE_MODULE_COLORS.commute} />
              <Text style={styles.guideTitle}>Last-Mile Commute</Text>
            </View>
            {place.structuredCards.commute.map((step, i) => (
              <View key={i} style={styles.listItemRow}>
                <Text style={styles.stepNum}>{i + 1}.</Text>
                <Text style={styles.listItemText}>{step}</Text>
              </View>
            ))}
          </View>

          <View style={[styles.guideCard, { borderLeftColor: GUIDE_MODULE_COLORS.food }]}>
            <View style={styles.guideHeader}>
              <Utensils size={18} color={GUIDE_MODULE_COLORS.food} />
              <Text style={styles.guideTitle}>Must-Try Food</Text>
            </View>
            {place.structuredCards.food.map((item, i) => (
              <View key={i} style={styles.foodCard}>
                <View style={styles.foodTopRow}>
                  <Text style={styles.foodName}>{item.name}</Text>
                  {item.priceHint && (
                    <View style={styles.priceBadge}>
                      <Text style={styles.priceBadgeText}>{item.priceHint}</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.foodDetail}>{item.detail}</Text>
              </View>
            ))}
          </View>

          <View style={[styles.guideCard, { borderLeftColor: GUIDE_MODULE_COLORS.activities }]}>
            <View style={styles.guideHeader}>
              <Compass size={18} color={GUIDE_MODULE_COLORS.activities} />
              <Text style={styles.guideTitle}>Local Activities</Text>
            </View>
            {place.structuredCards.activities.map((act, i) => (
              <View key={i} style={styles.listItemRow}>
                <View style={[styles.bulletDot, { backgroundColor: COLORS.wine }]} />
                <Text style={styles.listItemText}>{act}</Text>
              </View>
            ))}
          </View>

          <View style={[styles.guideCard, { borderLeftColor: GUIDE_MODULE_COLORS.livingHeritage }]}>
            <View style={styles.guideHeader}>
              <Landmark size={18} color={GUIDE_MODULE_COLORS.livingHeritage} />
              <Text style={styles.guideTitle}>Living Heritage & Etiquette</Text>
            </View>
            {(place.structuredCards.livingHeritage?.length
              ? place.structuredCards.livingHeritage
              : [
                  `Support community craft studios directly in ${place.region}.`,
                  "Ask permission before taking close-up photos of artisans and elders.",
                ]
            ).map((tip, i) => (
              <View key={i} style={styles.listItemRow}>
                <View style={[styles.bulletDot, { backgroundColor: COLORS.terracotta }]} />
                <Text style={styles.listItemText}>{tip}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Zero-Commission Support Local Cards */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionTopRow}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flex: 1 }}>
              <Store size={19} color="#D97706" />
              <Text style={styles.sectionHeading}>Support Local</Text>
            </View>
            <View style={styles.zeroCommPill}>
              <Text style={styles.zeroCommText}>0% Platform Commission</Text>
            </View>
          </View>
          <Text style={styles.sectionSub}>
            Direct community spots verified by travelers so 100% of tourism revenue stays in local hands.
          </Text>

          {place.localVendors.length === 0 ? (
            <Text style={styles.mutedLine}>No local vendors tagged yet.</Text>
          ) : (
            <View style={{ gap: 10, marginTop: 10 }}>
              {place.localVendors.map((v) => {
                const phoneDigits = (v.whatsapp || v.contact).replace(/[^\d+]/g, "");
                const waDigits = phoneDigits.replace(/^\+/, "");
                return (
                  <View key={v.id} style={styles.vendorCard}>
                    <View style={styles.vendorTop}>
                      <Text style={styles.vendorName}>{v.name}</Text>
                      <View style={styles.vendorCatPill}>
                        <Text style={styles.vendorCatText}>{v.category}</Text>
                      </View>
                    </View>
                    <Text style={styles.vendorSpec}>{v.specialty}</Text>
                    <Text style={styles.vendorCoords}>
                      {v.contact} · {v.lat.toFixed(4)}, {v.lng.toFixed(4)}
                    </Text>

                    <View style={styles.vendorActions}>
                      <TactilePressable
                        onPress={() => openDirections(v.lat, v.lng, v.name)}
                        style={styles.vendorNavBtn}
                      >
                        <Navigation size={12} color="#FFFFFF" />
                        <Text style={styles.vendorNavText}>Navigate</Text>
                      </TactilePressable>

                      {waDigits.length >= 8 && (
                        <TactilePressable
                          onPress={() => void Linking.openURL(`https://wa.me/${waDigits}`)}
                          style={styles.vendorWaBtn}
                        >
                          <MessageCircle size={12} color={COLORS.emeraldDark} />
                          <Text style={styles.vendorWaText}>WhatsApp</Text>
                        </TactilePressable>
                      )}

                      {phoneDigits.length >= 6 && (
                        <TactilePressable
                          onPress={() => void Linking.openURL(`tel:${phoneDigits}`)}
                          style={styles.vendorCallBtn}
                        >
                          <Phone size={12} color={COLORS.wine} />
                          <Text style={styles.vendorCallText}>Call</Text>
                        </TactilePressable>
                      )}

                      <TactilePressable
                        onPress={() => setUpiVendor(v)}
                        style={styles.vendorUpiBtn}
                      >
                        <QrCodeIcon size={12} color={COLORS.ink} />
                        <Text style={styles.vendorUpiText}>Direct UPI QR</Text>
                      </TactilePressable>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {/* Interactive Area & Safety Map */}
        <View style={{ gap: 10 }}>
          <Text style={styles.sectionHeading}>Interactive Area & Safety Map</Text>
          <OsmMapView
            places={[{ ...place, safetyAlerts: publicAlerts.map((p) => p.alert) }]}
            vendors={place.localVendors}
            center={[place.lat, place.lng]}
            zoom={13}
            height={320}
          />
        </View>

        {/* Trust-Gated Volunteer Local Guides */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionTopRow}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flex: 1 }}>
              <UserCheck size={19} color={COLORS.emerald} />
              <Text style={styles.sectionHeading}>Volunteer Local Guides</Text>
            </View>
            <TactilePressable
              onPress={() => router.push("/(tabs)/profile")}
              style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
            >
              <Text style={styles.volunteerLink}>Volunteer</Text>
              <ArrowRight size={13} color={COLORS.terracotta} />
            </TactilePressable>
          </View>
          <Text style={styles.sectionSub}>
            Only Field Scouts (100+ pts), Regional Stewards (300+ pts), or verified locals can guide in {place.region}.
          </Text>

          {matchingGuides.length === 0 ? (
            <Text style={styles.mutedLine}>No active volunteer guides for {place.region} yet.</Text>
          ) : (
            <View style={{ gap: 10, marginTop: 10 }}>
              {matchingGuides.map((guide) => (
                <View key={guide.id} style={styles.guideProfileCard}>
                  <View style={styles.vendorTop}>
                    <Text style={styles.vendorName}>{guide.displayName}</Text>
                    <View style={styles.zeroCommPill}>
                      <Text style={styles.zeroCommText}>
                        {guide.tier} · {guide.trailblazerScore} pts
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.vendorSpec}>
                    Languages: {guide.languages.join(", ") || "English"}
                  </Text>
                  <TactilePressable
                    onPress={() => {
                      if (!activeUser) {
                        openAuthModal();
                        return;
                      }
                      setSelectedGuide(guide);
                    }}
                    style={styles.requestGuideBtn}
                  >
                    <Text style={styles.requestGuideBtnText}>Request Guide</Text>
                  </TactilePressable>
                </View>
              ))}
            </View>
          )}

          {guideRequests.length > 0 && (
            <View style={styles.recentRequestsWrap}>
              <Text style={styles.recentReqTitle}>RECENT GUIDE REQUESTS</Text>
              {guideRequests.map((req) => (
                <View key={req.id} style={styles.recentReqRow}>
                  <Text style={styles.recentReqText}>
                    <Text style={{ fontWeight: "700" }}>{req.preferredDate || "Flexible"}</Text> —{" "}
                    {req.notes}
                  </Text>
                  <View
                    style={[
                      styles.reqStatusPill,
                      {
                        backgroundColor:
                          req.status === "Accepted" ? COLORS.emeraldTint : COLORS.turmericTint,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.reqStatusText,
                        { color: req.status === "Accepted" ? COLORS.emeraldDark : COLORS.ink },
                      ]}
                    >
                      {req.status}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </Animated.ScrollView>

      {/* Request Guide Bottom Sheet Modal */}
      <AnimatedBottomSheet
        open={Boolean(selectedGuide)}
        onClose={() => setSelectedGuide(null)}
        keyboardAvoid
        sheetStyle={{
          backgroundColor: COLORS.surface,
          paddingBottom: Math.max(insets.bottom, 16) + 12,
        }}
      >
        {selectedGuide && (
          <View style={styles.modalContent}>
            <View style={styles.sectionTopRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalTitle}>Request Guide: {selectedGuide.displayName}</Text>
                <Text style={styles.modalSub}>
                  Speaks {selectedGuide.languages.join(", ")} · {place.title}
                </Text>
              </View>
              <TactilePressable
                onPress={() => setSelectedGuide(null)}
                style={styles.modalCloseBtn}
                accessibilityLabel="Close"
              >
                <XIcon size={17} color={COLORS.muted} />
              </TactilePressable>
            </View>

            <Text style={styles.inputLabel}>Preferred Date (YYYY-MM-DD)</Text>
            <TextInput
              value={preferredDate}
              onChangeText={setPreferredDate}
              placeholder="2026-12-10"
              style={styles.modalInput}
            />

            <Text style={styles.inputLabel}>Trip Notes</Text>
            <TextInput
              value={requestNotes}
              onChangeText={setRequestNotes}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              placeholder="Tell the guide what trails, local food, or crafts you'd love to explore..."
              placeholderTextColor={COLORS.muted}
              style={[styles.modalInput, { minHeight: 84 }]}
            />

            <View style={styles.modalActions}>
              <TactilePressable
                onPress={() => setSelectedGuide(null)}
                style={styles.modalCancelBtn}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TactilePressable>
              <TactilePressable
                disabled={submittingGuide || !requestNotes.trim()}
                onPress={() => void handleGuideRequestSubmit()}
                style={[
                  styles.modalSendBtn,
                  (submittingGuide || !requestNotes.trim()) && { opacity: 0.55 },
                ]}
              >
                <Text style={styles.modalSendText}>
                  {submittingGuide ? "Sending..." : "Send Request"}
                </Text>
              </TactilePressable>
            </View>
          </View>
        )}
      </AnimatedBottomSheet>

      <UpiQrModal vendor={upiVendor} onClose={() => setUpiVendor(null)} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.parchment,
  },
  centerBox: {
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 14,
  },
  notFoundTitle: {
    fontFamily: FONTS.display,
    fontSize: 28,
    color: COLORS.wine,
  },
  backHomeBtn: {
    backgroundColor: COLORS.wine,
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  backHomeText: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.parchment,
  },
  skelHeader: {
    height: 36,
    width: 170,
    borderRadius: 10,
    backgroundColor: COLORS.well,
  },
  skelHero: {
    height: 300,
    borderRadius: 18,
    backgroundColor: COLORS.well,
  },
  skelCard: {
    height: 140,
    borderRadius: 18,
    backgroundColor: COLORS.well,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.parchment,
  },
  progressTrack: {
    height: 2,
    width: "100%",
    backgroundColor: "transparent",
    overflow: "hidden",
  },
  progressFill: {
    height: 2,
    width: "100%",
    backgroundColor: COLORS.terracotta,
    transformOrigin: "0% 50%",
  },
  backLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  backLinkText: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.wine,
  },
  topActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  offlineBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  offlineBtnSaved: {
    backgroundColor: COLORS.emerald,
    borderColor: COLORS.emerald,
  },
  offlineBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.wine,
  },
  printBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    paddingHorizontal: 11,
    paddingVertical: 7,
  },
  printBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.wine,
  },
  scrollContent: {
    padding: 16,
    gap: 16,
  },
  feedbackBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.turmericBorder,
    backgroundColor: "#FFFBEB",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  feedbackText: {
    flex: 1,
    fontSize: 12,
    fontWeight: "600",
    color: "#78350F",
  },
  feedbackClose: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.ink,
    textDecorationLine: "underline",
  },
  heroCard: {
    overflow: "hidden",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  mediaStrip: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingHorizontal: 14,
    paddingTop: 10,
  },
  mediaChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    paddingHorizontal: 11,
    paddingVertical: 5,
  },
  mediaChipActive: {
    backgroundColor: COLORS.wine,
    borderColor: COLORS.wine,
  },
  mediaChipText: {
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.wine,
  },
  heroInfo: {
    padding: 16,
    gap: 12,
  },
  badgesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 8,
  },
  gemScorePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderRadius: 999,
    backgroundColor: COLORS.wine,
    paddingHorizontal: 11,
    paddingVertical: 5,
  },
  gemScorePillText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  categoryPill: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  categoryPillText: {
    fontSize: 11,
    fontWeight: "700",
  },
  regionInline: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  regionInlineText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.muted,
  },
  breakdownBox: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: "#F4F5ED",
    padding: 10,
  },
  breakdownHeader: {
    fontSize: 12,
    color: "#1F271C",
    lineHeight: 17,
  },
  placeTitle: {
    fontFamily: FONTS.display,
    fontSize: 30,
    lineHeight: 35,
    color: COLORS.wine,
  },
  placeDesc: {
    fontSize: 14,
    lineHeight: 21,
    color: COLORS.muted,
  },
  authorCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    padding: 12,
    gap: 3,
  },
  authorCardTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.wine,
  },
  authorCardMeta: {
    fontSize: 12,
    color: COLORS.muted,
  },
  trustControls: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 12,
    gap: 10,
  },
  trustButtonsRow: {
    flexDirection: "row",
    gap: 8,
  },
  vouchBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    backgroundColor: COLORS.terracotta,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  vouchBtnActive: {
    backgroundColor: COLORS.emerald,
  },
  vouchBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  checkInBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.wine,
    backgroundColor: COLORS.white,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  checkInBtnDone: {
    backgroundColor: COLORS.emeraldTint,
    borderColor: COLORS.emeraldBorder,
  },
  checkInBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.wine,
  },
  demoToggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  demoToggleText: {
    flex: 1,
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.wine,
  },
  safetySection: {
    borderRadius: 20,
    borderWidth: 2,
    borderColor: COLORS.redAlertBorder,
    backgroundColor: COLORS.redAlertBg,
    padding: 16,
    gap: 12,
  },
  safetyHeaderRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  safetyHeading: {
    fontFamily: FONTS.display,
    fontSize: 21,
    color: COLORS.redAlertText,
  },
  safetyRulePill: {
    backgroundColor: COLORS.white,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  safetyRuleText: {
    fontSize: 10,
    fontWeight: "700",
    color: COLORS.redAlertText,
  },
  safetyCard: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#FECACA",
    padding: 12,
    gap: 8,
  },
  safetyCardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  safetyTagPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: COLORS.redAlertBorder,
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 3,
  },
  safetyTagText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  verifiedCountText: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.emeraldDark,
  },
  safetyMsg: {
    fontSize: 13,
    lineHeight: 19,
    color: "#292524",
    fontWeight: "500",
  },
  safetyVoteRow: {
    flexDirection: "row",
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: "#FEE2E2",
    paddingTop: 8,
  },
  verifyBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderRadius: 10,
    backgroundColor: COLORS.emeraldTint,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  verifyBtnText: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.emeraldDark,
  },
  flagBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderRadius: 10,
    backgroundColor: "#F5F5F4",
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  flagBtnText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#44403C",
  },
  safetyEmptyText: {
    fontSize: 12,
    color: COLORS.redAlertText,
  },
  pendingBox: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#FCD34D",
    backgroundColor: "#FFFBEB",
    padding: 12,
    gap: 8,
  },
  pendingLabel: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.7,
    color: "#78350F",
  },
  pendingItem: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#FDE68A",
    padding: 10,
    gap: 8,
  },
  pendingMsg: {
    fontSize: 12,
    color: COLORS.ink,
  },
  pendingActions: {
    flexDirection: "row",
    gap: 8,
  },
  quickVerifyBtn: {
    borderRadius: 8,
    backgroundColor: COLORS.emerald,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  quickVerifyText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  quickFlagBtn: {
    borderRadius: 8,
    backgroundColor: "#FEE2E2",
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  quickFlagText: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.redAlertText,
  },
  guideCard: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderLeftWidth: 4,
    padding: 16,
    gap: 10,
  },
  guideHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  guideTitle: {
    fontFamily: FONTS.display,
    fontSize: 20,
    color: COLORS.wine,
  },
  listItemRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  stepNum: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.terracotta,
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 99,
    marginTop: 7,
  },
  listItemText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    color: COLORS.muted,
  },
  foodCard: {
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    padding: 12,
    gap: 4,
  },
  foodTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  foodName: {
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.wine,
  },
  priceBadge: {
    borderRadius: 999,
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  priceBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#78350F",
  },
  foodDetail: {
    fontSize: 12,
    lineHeight: 18,
    color: COLORS.muted,
  },
  sectionCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    gap: 8,
  },
  sectionTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  sectionHeading: {
    fontFamily: FONTS.display,
    fontSize: 23,
    color: COLORS.wine,
  },
  sectionSub: {
    fontSize: 13,
    lineHeight: 18,
    color: COLORS.muted,
  },
  mutedLine: {
    marginTop: 4,
    fontSize: 13,
    color: COLORS.muted,
  },
  zeroCommPill: {
    borderRadius: 999,
    backgroundColor: COLORS.emeraldTint,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  zeroCommText: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.emeraldDark,
  },
  vendorCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    padding: 14,
    gap: 6,
  },
  vendorTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  vendorName: {
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.wine,
  },
  vendorCatPill: {
    borderRadius: 999,
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 9,
    paddingVertical: 3,
  },
  vendorCatText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#78350F",
  },
  vendorSpec: {
    fontSize: 12,
    lineHeight: 17,
    color: COLORS.muted,
  },
  vendorCoords: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.wine,
  },
  vendorActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 10,
    marginTop: 4,
  },
  vendorNavBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderRadius: 10,
    backgroundColor: COLORS.wine,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  vendorNavText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  vendorWaBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.emeraldBorder,
    backgroundColor: COLORS.emeraldTint,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  vendorWaText: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.emeraldDark,
  },
  vendorCallBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  vendorCallText: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.wine,
  },
  vendorUpiBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.turmericBorder,
    backgroundColor: COLORS.turmericTint,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  vendorUpiText: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.ink,
  },
  volunteerLink: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.terracotta,
  },
  guideProfileCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    padding: 14,
    gap: 6,
  },
  requestGuideBtn: {
    marginTop: 6,
    borderRadius: 10,
    backgroundColor: COLORS.wine,
    paddingVertical: 10,
    alignItems: "center",
  },
  requestGuideBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  recentRequestsWrap: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 12,
    gap: 8,
  },
  recentReqTitle: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.7,
    color: COLORS.muted,
  },
  recentReqRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  recentReqText: {
    flex: 1,
    fontSize: 12,
    color: COLORS.wine,
  },
  reqStatusPill: {
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 3,
  },
  reqStatusText: {
    fontSize: 11,
    fontWeight: "700",
  },
  modalContent: {
    gap: 10,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 99,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.well,
  },
  modalTitle: {
    fontFamily: FONTS.display,
    fontSize: 24,
    color: COLORS.wine,
  },
  modalSub: {
    fontSize: 12,
    color: COLORS.muted,
  },
  inputLabel: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.wine,
  },
  modalInput: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.ink,
  },
  modalActions: {
    marginTop: 8,
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
  },
  modalCancelBtn: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingVertical: 11,
  },
  modalCancelText: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.wine,
  },
  modalSendBtn: {
    borderRadius: 12,
    backgroundColor: COLORS.terracotta,
    paddingHorizontal: 18,
    paddingVertical: 11,
  },
  modalSendText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
