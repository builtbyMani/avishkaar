import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Keyboard,
  Linking,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import Animated, {
  FadeInDown,
  FadeOutUp,
  useAnimatedScrollHandler,
} from "react-native-reanimated";
import { useApp } from "../../components/AppProvider";
import {
  AlertTriangle,
  CheckCircle2,
  HandHeart,
  Info,
  LayoutGrid,
  MapIcon,
  MapPin,
  PlusCircle,
  ScoreFlameIcon,
  Search,
  ShieldCheck,
  Store,
  XIcon,
} from "../../components/Icons";
import { MediaCardPlayer } from "../../components/MediaCardPlayer";
import { MemojiAvatar } from "../../components/MemojiAvatar";
import { OsmMapView } from "../../components/OsmMapView";
import {
  buildGoogleMapsUrl,
  filterPlaces,
  getGemScoreBreakdown,
  getPlaceSlug,
  isSafetyAlertPublic,
  PLACE_CATEGORIES,
} from "../../lib/domain";
import type { DetourResult } from "../../lib/detour";
import { findDetourAlternatives, listPlaces, performVouch } from "../../lib/store";
import {
  LIST_LAYOUT_TRANSITION,
  StaggerReveal,
  TactilePressable,
  triggerHaptic,
} from "../../theme/motion";
import {
  COLORS,
  FEEDBACK_TONE_STYLES,
  FONTS,
  getRegionStyle,
  type FeedbackMessage,
} from "../../theme/tokens";
import type { EnrichedPlace, PlaceCategory } from "../../types/domain";

const QUICK_DETOURS = ["Ooty", "Goa", "Hampi"];
const CATEGORIES: Array<"All" | PlaceCategory> = ["All", ...PLACE_CATEGORIES];

function estimateCardWeight(place: EnrichedPlace): number {
  const aspect = place.media[0]?.aspect;
  const mediaScore = aspect === "portrait" ? 1.33 : aspect === "square" ? 1.0 : 0.78;
  const titleLines = Math.ceil(place.title.length / 24);
  return mediaScore + titleLines * 0.18 + 0.45;
}

export default function DiscoverScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const {
    activeUser,
    mode,
    refreshProfiles,
    openAuthModal,
    scrollProgress,
    feedVersion,
  } = useApp();

  const [places, setPlaces] = useState<EnrichedPlace[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isScreenFocused, setIsScreenFocused] = useState(true);
  const [category, setCategory] = useState<"All" | PlaceCategory>("All");
  const [region, setRegion] = useState<string>("All");
  const [viewMode, setViewMode] = useState<"masonry" | "map">("masonry");
  const [toast, setToast] = useState<FeedbackMessage | null>(null);
  const [vouchingId, setVouchingId] = useState<string | null>(null);
  const [detourQuery, setDetourQuery] = useState("");
  const [detourLoading, setDetourLoading] = useState(false);
  const [detourResult, setDetourResult] = useState<DetourResult | null>(null);
  const [openScoreId, setOpenScoreId] = useState<string | null>(null);

  const numColumns = width >= 768 ? 3 : 2;

  useFocusEffect(
    useCallback(() => {
      setIsScreenFocused(true);
      return () => setIsScreenFocused(false);
    }, []),
  );

  const loadFeed = useCallback(
    async (isRefresh = false, silent = false) => {
      if (isRefresh) setRefreshing(true);
      else if (!silent) setLoading(true);
      try {
        const res = await listPlaces(activeUser?.id, { demoMode: mode === "demo" });
        setPlaces(res.places);
        if (res.fromCache) {
          setToast({ kind: "info", text: "Offline mode — showing cached hidden gems." });
        }
      } catch {
        setToast({
          kind: "error",
          text: "Could not load discovery feed — check connection and retry.",
        });
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [activeUser?.id, mode],
  );

  useEffect(() => {
    void loadFeed(false, places.length > 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadFeed, feedVersion]);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      const maxScroll = Math.max(1, event.contentSize.height - event.layoutMeasurement.height);
      scrollProgress.value = Math.min(1, Math.max(0, event.contentOffset.y / maxScroll));
    },
  });

  const regions = useMemo(() => {
    const set = new Set(places.map((p) => p.region));
    return ["All", ...Array.from(set)];
  }, [places]);

  const filtered = useMemo(() => {
    const directMatches = filterPlaces(places, {
      category,
      region,
      query: detourQuery,
    });
    if (directMatches.length === 0 && detourResult) {
      return filterPlaces(places, { category, region });
    }
    return directMatches;
  }, [places, category, region, detourQuery, detourResult]);

  const columns = useMemo(() => {
    const cols: EnrichedPlace[][] = Array.from({ length: numColumns }, () => []);
    const heights = Array(numColumns).fill(0);
    for (const item of filtered) {
      let minIdx = 0;
      for (let i = 1; i < numColumns; i++) {
        if (heights[i] < heights[minIdx]) minIdx = i;
      }
      cols[minIdx].push(item);
      heights[minIdx] += estimateCardWeight(item);
    }
    return cols;
  }, [filtered, numColumns]);

  async function handleVouch(placeId: string) {
    if (!activeUser) {
      openAuthModal();
      setToast({ kind: "info", text: "Sign in to vouch and award Trailblazer points." });
      return;
    }
    setVouchingId(placeId);
    try {
      const data = await performVouch(placeId, activeUser.id, { demoMode: mode === "demo" });
      triggerHaptic("success");
      const badgeMsg =
        data.unlockedBadges.length > 0
          ? ` Unlocked badge: ${data.unlockedBadges.map((b) => b.badgeName).join(", ")}!`
          : "";
      setToast(
        data.pointsAwarded > 0
          ? {
              kind: "success",
              text: `Vouched! Author earned +${data.pointsAwarded} Trailblazer pts.${badgeMsg}`,
            }
          : { kind: "info", text: "Already vouched for this hidden gem." },
      );
      await Promise.all([loadFeed(false, true), refreshProfiles()]);
    } catch (err) {
      triggerHaptic("warning");
      setToast({
        kind: "error",
        text: err instanceof Error ? err.message : "Could not record vouch",
      });
    } finally {
      setVouchingId(null);
    }
  }

  async function handleDetourSearch(queryText: string) {
    const cleaned = queryText.trim();
    Keyboard.dismiss();
    if (!cleaned) {
      setDetourResult(null);
      return;
    }
    setDetourQuery(cleaned);
    setDetourLoading(true);
    try {
      const result = await findDetourAlternatives(cleaned, places, activeUser?.id);
      setDetourResult(result);
      triggerHaptic("light");
    } catch {
      setToast({ kind: "error", text: "Detour lookup failed — verify hotspot name and retry." });
    } finally {
      setDetourLoading(false);
    }
  }

  return (
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
          onRefresh={() => void loadFeed(true)}
          tintColor={COLORS.wine}
          colors={[COLORS.wine]}
        />
      }
    >
      {/* Top Detour Search Bar */}
      <View style={styles.searchCard}>
        <Search size={16} color={COLORS.muted} strokeWidth={1.75} />
        <TextInput
          value={detourQuery}
          onChangeText={setDetourQuery}
          onSubmitEditing={() => void handleDetourSearch(detourQuery)}
          returnKeyType="search"
          placeholder="Search places, regions, cuisines, or skip Ooty/Goa..."
          placeholderTextColor={COLORS.muted}
          style={styles.searchInput}
        />
        {detourQuery.length > 0 && (
          <TactilePressable
            onPress={() => {
              setDetourQuery("");
              setDetourResult(null);
            }}
            style={styles.clearBtn}
            accessibilityLabel="Clear search"
          >
            <XIcon size={14} color={COLORS.muted} />
          </TactilePressable>
        )}
        <TactilePressable
          disabled={detourLoading || !detourQuery.trim()}
          onPress={() => void handleDetourSearch(detourQuery)}
          style={[
            styles.detourBtn,
            (detourLoading || !detourQuery.trim()) && { opacity: 0.45 },
          ]}
        >
          <Text style={styles.detourBtnText}>{detourLoading ? "Finding..." : "Detour"}</Text>
        </TactilePressable>
      </View>

      {/* Primary Actions + Telemetry */}
      <View style={styles.actionRow}>
        <View style={styles.actionButtons}>
          <TactilePressable
            onPress={() => router.push("/(tabs)/submit")}
            style={styles.postGemBtn}
          >
            <PlusCircle size={15} color={COLORS.parchment} />
            <Text style={styles.postGemText}>Post Gem</Text>
          </TactilePressable>

          <TactilePressable
            onPress={() => setViewMode((m) => (m === "masonry" ? "map" : "masonry"))}
            style={styles.mapToggleBtn}
          >
            {viewMode === "masonry" ? (
              <>
                <MapIcon size={15} color={COLORS.ink} />
                <Text style={styles.mapToggleText}>Map</Text>
              </>
            ) : (
              <>
                <LayoutGrid size={15} color={COLORS.ink} />
                <Text style={styles.mapToggleText}>Grid</Text>
              </>
            )}
          </TactilePressable>
        </View>

        <Text style={styles.countTelemetry}>
          {filtered.length} {filtered.length === 1 ? "gem" : "gems"} · {regions.length - 1} regions
        </Text>
      </View>

      {/* Unified Horizontal Filter Strip */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterStrip}
      >
        {CATEGORIES.map((cat) => {
          const active = category === cat;
          return (
            <TactilePressable
              key={cat}
              haptic="selection"
              onPress={() => setCategory(cat)}
              style={[styles.filterPill, active && styles.filterPillActive]}
            >
              <Text style={[styles.filterPillText, active && styles.filterPillTextActive]}>
                {cat}
              </Text>
            </TactilePressable>
          );
        })}

        <View style={styles.stripDivider} />

        {regions.map((reg) => {
          const active = region === reg;
          return (
            <TactilePressable
              key={reg}
              haptic="selection"
              onPress={() => setRegion(reg)}
              style={[styles.filterPill, active && styles.filterPillActive]}
            >
              <Text style={[styles.filterPillText, active && styles.filterPillTextActive]}>
                {reg === "All" ? "All Regions" : reg}
              </Text>
            </TactilePressable>
          );
        })}

        <View style={styles.stripDivider} />

        {QUICK_DETOURS.map((hub) => (
          <TactilePressable
            key={hub}
            onPress={() => void handleDetourSearch(hub)}
            style={styles.quickSkipPill}
          >
            <Text style={styles.quickSkipText}>Skip {hub}</Text>
          </TactilePressable>
        ))}
      </ScrollView>

      {/* Feedback Toast */}
      {toast && (
        <Animated.View
          layout={LIST_LAYOUT_TRANSITION}
          entering={FadeInDown.duration(180)}
          exiting={FadeOutUp.duration(140)}
          style={[
            styles.toastBanner,
            {
              backgroundColor: FEEDBACK_TONE_STYLES[toast.kind].bg,
              borderColor: FEEDBACK_TONE_STYLES[toast.kind].border,
            },
          ]}
        >
          <View style={styles.toastLeft}>
            {toast.kind === "error" ? (
              <AlertTriangle size={16} color={COLORS.brick} />
            ) : toast.kind === "info" ? (
              <Info size={16} color={COLORS.muted} />
            ) : (
              <CheckCircle2 size={16} color={COLORS.wine} />
            )}
            <Text style={[styles.toastText, { color: FEEDBACK_TONE_STYLES[toast.kind].text }]}>
              {toast.text}
            </Text>
          </View>
          <TactilePressable onPress={() => setToast(null)}>
            <Text style={styles.dismissText}>Dismiss</Text>
          </TactilePressable>
        </Animated.View>
      )}

      {/* Expandable Detour Alternatives Panel */}
      {detourResult && (
        <Animated.View
          layout={LIST_LAYOUT_TRANSITION}
          entering={FadeInDown.springify().damping(24).stiffness(280)}
          exiting={FadeOutUp.duration(160)}
          style={styles.detourPanel}
        >
          <View style={styles.detourHeader}>
            <Text style={styles.detourHeading}>
              Top 3 Offbeat Detours for &ldquo;{detourResult.hotspot}&rdquo; (Crowd Index{" "}
              {detourResult.hotspotCrowdIndex})
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <View style={styles.detourBadge}>
                <Text style={styles.detourBadgeText}>
                  {detourResult.source === "gemini" ? "Gemini Vibe Match" : "Crowd + Vibe Engine"}
                </Text>
              </View>
              <TactilePressable
                onPress={() => setDetourResult(null)}
                style={styles.clearBtn}
                accessibilityLabel="Close detour results"
              >
                <XIcon size={14} color={COLORS.muted} />
              </TactilePressable>
            </View>
          </View>

          <View style={styles.detourList}>
            {detourResult.alternatives.map((alt) => (
              <TactilePressable
                key={alt.place.id}
                onPress={() => router.push(`/place/${getPlaceSlug(alt.place)}`)}
                style={styles.detourItemCard}
              >
                <View style={styles.detourItemTop}>
                  <View style={styles.crowdDropPill}>
                    <Text style={styles.crowdDropText}>
                      {alt.crowdReductionPercent}% Less Crowded
                    </Text>
                  </View>
                  <View style={styles.scoreInline}>
                    <ScoreFlameIcon size={12} color={COLORS.turmeric} />
                    <Text style={styles.scoreInlineText}>{alt.place.hiddenGemScore}</Text>
                  </View>
                </View>
                <Text style={styles.detourItemTitle}>{alt.place.title}</Text>
                <Text style={styles.detourItemReason}>{alt.matchReason}</Text>
                <Text style={styles.detourCommute}>Commute: {alt.commuteSummary}</Text>
              </TactilePressable>
            ))}
          </View>
        </Animated.View>
      )}

      {/* Main Discovery Content */}
      {loading ? (
        <View style={styles.masonryRow}>
          {Array.from({ length: numColumns }).map((_, colIdx) => (
            <View key={colIdx} style={styles.masonryCol}>
              {[0, 1, 2].map((rowIdx) => (
                <View key={rowIdx} style={styles.skeletonCard}>
                  <View
                    style={[
                      styles.skeletonImg,
                      { aspectRatio: (colIdx + rowIdx) % 2 === 0 ? 3 / 4 : 1 },
                    ]}
                  />
                  <View style={styles.skeletonBody}>
                    <View style={[styles.skeletonLine, { width: "75%" }]} />
                    <View style={[styles.skeletonLine, { width: "48%" }]} />
                  </View>
                </View>
              ))}
            </View>
          ))}
        </View>
      ) : viewMode === "map" ? (
        <OsmMapView places={filtered} height={500} />
      ) : filtered.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyTitle}>No hidden gems match those filters yet.</Text>
          <Text style={styles.emptySub}>
            Clear active filters or post a verified offbeat spot to seed this region.
          </Text>
          <View style={styles.emptyActions}>
            {(category !== "All" || region !== "All" || detourQuery.trim().length > 0) && (
              <TactilePressable
                onPress={() => {
                  setCategory("All");
                  setRegion("All");
                  setDetourQuery("");
                  setDetourResult(null);
                }}
                style={styles.clearFiltersBtn}
              >
                <Text style={styles.clearFiltersText}>Clear Filters</Text>
              </TactilePressable>
            )}
            <TactilePressable
              onPress={() => router.push("/(tabs)/submit")}
              style={styles.postGemBtn}
            >
              <Text style={styles.postGemText}>Post a Hidden Gem</Text>
            </TactilePressable>
          </View>
        </View>
      ) : (
        <View style={styles.masonryRow}>
          {columns.map((colPlaces, colIdx) => (
            <View key={colIdx} style={styles.masonryCol}>
              {colPlaces.map((place, itemIdx) => {
                const publicAlertCount = place.safetyAlerts.filter(isSafetyAlertPublic).length;
                const gemBreakdown = getGemScoreBreakdown(place);
                const regionStyle = getRegionStyle(place.region);
                const isScoreOpen = openScoreId === place.id;

                return (
                  <StaggerReveal key={place.id} index={colIdx + itemIdx * 2}>
                    <Animated.View
                      layout={LIST_LAYOUT_TRANSITION}
                      style={[
                        styles.gemCard,
                        {
                          backgroundColor: regionStyle.cardBg,
                          borderColor: regionStyle.border,
                        },
                      ]}
                    >
                      {/* Media Container */}
                      <View style={styles.mediaWrap}>
                        <TactilePressable
                          scaleTo={0.985}
                          onPress={() => router.push(`/place/${getPlaceSlug(place)}`)}
                        >
                          <MediaCardPlayer
                            media={place.media[0]}
                            title={place.title}
                            compact
                            isFocused={isScreenFocused}
                          />
                        </TactilePressable>

                        {/* Top-Right Quick Vouch Pill */}
                        <TactilePressable
                          disabled={vouchingId === place.id}
                          onPress={() => void handleVouch(place.id)}
                          style={[
                            styles.vouchFloatPill,
                            place.userHasVouched && styles.vouchFloatPillActive,
                          ]}
                          accessibilityLabel={`Vouch for ${place.title}`}
                        >
                          <HandHeart size={13} color={COLORS.parchment} strokeWidth={1.9} />
                          <Text style={styles.vouchFloatText}>{place.vouchesCount}</Text>
                        </TactilePressable>

                        {/* Bottom-Left Public Safety Advisory Indicator */}
                        {publicAlertCount > 0 && (
                          <View style={styles.advisoryFloatPill} pointerEvents="none">
                            <AlertTriangle size={11} color={COLORS.parchment} strokeWidth={2} />
                            <Text style={styles.advisoryFloatText}>
                              {publicAlertCount} advisory
                            </Text>
                          </View>
                        )}
                      </View>

                      {/* Region-Tinted Card Body */}
                      <View style={styles.cardBody}>
                        <View style={styles.cardMetaTop}>
                          <View
                            style={[styles.regionPill, { backgroundColor: regionStyle.pillBg }]}
                          >
                            <View
                              style={[styles.regionDot, { backgroundColor: regionStyle.dot }]}
                            />
                            <Text style={styles.regionText} numberOfLines={1}>
                              {place.region}
                            </Text>
                          </View>

                          <TactilePressable
                            onPress={() =>
                              setOpenScoreId((prev) => (prev === place.id ? null : place.id))
                            }
                            style={styles.scoreBadge}
                            accessibilityLabel="Gem Score breakdown"
                          >
                            <ScoreFlameIcon size={12} color={COLORS.turmeric} />
                            <Text style={styles.scoreBadgeText}>{place.hiddenGemScore}</Text>
                          </TactilePressable>
                        </View>

                        <TactilePressable
                          scaleTo={0.985}
                          onPress={() => router.push(`/place/${getPlaceSlug(place)}`)}
                        >
                          <Text style={styles.cardTitle}>{place.title}</Text>
                        </TactilePressable>

                        <View style={styles.cardAuthorRow}>
                          <View style={styles.authorLeft}>
                            <MemojiAvatar
                              id={place.author.id}
                              name={place.author.displayName}
                              size={20}
                            />
                            <Text style={styles.authorName} numberOfLines={1}>
                              {place.author.displayName}
                            </Text>
                            {place.author.tier === "Local Legend" && (
                              <ShieldCheck size={13} color={COLORS.turmeric} />
                            )}
                          </View>

                          <View style={styles.cardFooterRight}>
                            {place.localVendors.length > 0 && (
                              <View style={styles.vendorCount}>
                                <Store size={12} color={COLORS.wine} />
                                <Text style={styles.vendorCountText}>
                                  {place.localVendors.length}
                                </Text>
                              </View>
                            )}
                            <TactilePressable
                              onPress={() =>
                                void Linking.openURL(buildGoogleMapsUrl(place.lat, place.lng))
                              }
                              style={styles.cardMapsPill}
                              accessibilityLabel={`Open ${place.title} in Google Maps`}
                            >
                              <MapPin size={10} color={COLORS.wine} />
                              <Text style={styles.cardMapsText}>Maps</Text>
                            </TactilePressable>
                          </View>
                        </View>

                        {isScoreOpen && (
                          <Animated.View
                            layout={LIST_LAYOUT_TRANSITION}
                            entering={FadeInDown.duration(170)}
                            exiting={FadeOutUp.duration(120)}
                            style={styles.breakdownBox}
                          >
                            <View style={styles.breakdownHeader}>
                              <Text style={styles.breakdownTitle}>Gem Score Formula</Text>
                              <TactilePressable onPress={() => setOpenScoreId(null)}>
                                <Text style={styles.breakdownClose}>Close</Text>
                              </TactilePressable>
                            </View>
                            <View style={styles.breakdownRow}>
                              <Text style={styles.breakdownLabel}>
                                Vouches ({place.vouchesCount} × 2)
                              </Text>
                              <Text style={styles.breakdownVal}>+{gemBreakdown.vouchesPoints}</Text>
                            </View>
                            <View style={styles.breakdownRow}>
                              <Text style={styles.breakdownLabel}>
                                Check-ins ({place.verifiedCheckinsCount} × 5)
                              </Text>
                              <Text style={styles.breakdownVal}>
                                +{gemBreakdown.checkinsPoints}
                              </Text>
                            </View>
                            <View style={styles.breakdownRow}>
                              <Text style={styles.breakdownLabel}>
                                Crowd log10({place.mainstreamPopularityIndex} + 10)
                              </Text>
                              <Text style={styles.breakdownVal}>
                                ÷ {gemBreakdown.crowdPenalty.toFixed(2)}
                              </Text>
                            </View>
                            <View style={styles.breakdownTotal}>
                              <Text style={styles.breakdownTotalLabel}>Score</Text>
                              <Text style={styles.breakdownTotalLabel}>{gemBreakdown.score}</Text>
                            </View>
                          </Animated.View>
                        )}
                      </View>
                    </Animated.View>
                  </StaggerReveal>
                );
              })}
            </View>
          ))}
        </View>
      )}

      <View style={styles.discoverFooter}>
        <TactilePressable onPress={() => router.push("/about")}>
          <Text style={styles.discoverFooterLink}>About Us</Text>
        </TactilePressable>
        <Text style={styles.discoverFooterDot}>·</Text>
        <TactilePressable onPress={() => router.push("/contact")}>
          <Text style={styles.discoverFooterLink}>Contact Us</Text>
        </TactilePressable>
      </View>
    </Animated.ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.parchment,
  },
  content: {
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 24,
    gap: 12,
  },
  searchCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 999,
    paddingLeft: 14,
    paddingRight: 6,
    paddingVertical: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: COLORS.ink,
    paddingVertical: 5,
  },
  clearBtn: {
    padding: 4,
    borderRadius: 99,
  },
  detourBtn: {
    backgroundColor: COLORS.turmeric,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  detourBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.ink,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  actionButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  postGemBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: COLORS.wine,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  postGemText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.parchment,
  },
  mapToggleBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  mapToggleText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.ink,
  },
  countTelemetry: {
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.muted,
    fontVariant: ["tabular-nums"],
  },
  filterStrip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 2,
  },
  filterPill: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    paddingHorizontal: 13,
    paddingVertical: 7,
  },
  filterPillActive: {
    backgroundColor: COLORS.wine,
    borderColor: COLORS.wine,
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.ink,
  },
  filterPillTextActive: {
    color: COLORS.parchment,
  },
  stripDivider: {
    width: 1,
    height: 18,
    backgroundColor: COLORS.borderStrong,
    marginHorizontal: 2,
  },
  quickSkipPill: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    paddingHorizontal: 13,
    paddingVertical: 7,
  },
  quickSkipText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.muted,
  },
  toastBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  toastLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  toastText: {
    flex: 1,
    fontSize: 12,
    fontWeight: "600",
  },
  dismissText: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.ink,
    textDecorationLine: "underline",
  },
  detourPanel: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 18,
    padding: 14,
    gap: 10,
  },
  detourHeader: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 6,
  },
  detourHeading: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.ink,
    flexShrink: 1,
  },
  detourBadge: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.turmericBorder,
    backgroundColor: COLORS.turmericTint,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  detourBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: COLORS.ink,
  },
  detourList: {
    gap: 8,
  },
  detourItemCard: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    padding: 12,
    gap: 4,
  },
  detourItemTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  crowdDropPill: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.wineBorder,
    backgroundColor: COLORS.wineTint,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  crowdDropText: {
    fontSize: 10,
    fontWeight: "700",
    color: COLORS.wine,
  },
  scoreInline: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  scoreInlineText: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.ink,
    fontVariant: ["tabular-nums"],
  },
  detourItemTitle: {
    marginTop: 4,
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.ink,
  },
  detourItemReason: {
    fontSize: 12,
    color: COLORS.muted,
    lineHeight: 16,
  },
  detourCommute: {
    marginTop: 4,
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.wine,
  },
  masonryRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  masonryCol: {
    flex: 1,
    gap: 10,
  },
  skeletonCard: {
    overflow: "hidden",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  skeletonImg: {
    width: "100%",
    backgroundColor: COLORS.well,
  },
  skeletonBody: {
    padding: 10,
    gap: 6,
  },
  skeletonLine: {
    height: 11,
    borderRadius: 6,
    backgroundColor: COLORS.well,
  },
  emptyBox: {
    borderRadius: 18,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: COLORS.borderStrong,
    backgroundColor: COLORS.surface,
    padding: 28,
    alignItems: "center",
    gap: 8,
  },
  emptyTitle: {
    fontFamily: FONTS.rozha,
    fontSize: 21,
    color: COLORS.ink,
    textAlign: "center",
  },
  emptySub: {
    fontSize: 13,
    color: COLORS.muted,
    textAlign: "center",
  },
  emptyActions: {
    marginTop: 8,
    flexDirection: "row",
    gap: 8,
  },
  clearFiltersBtn: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.parchment,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  clearFiltersText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.ink,
  },
  gemCard: {
    overflow: "hidden",
    borderRadius: 18,
    borderWidth: 1,
  },
  mediaWrap: {
    position: "relative",
    overflow: "hidden",
  },
  vouchFloatPill: {
    position: "absolute",
    top: 8,
    right: 8,
    zIndex: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(43, 20, 26, 0.86)",
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  vouchFloatPillActive: {
    backgroundColor: COLORS.wine,
  },
  vouchFloatText: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.parchment,
    fontVariant: ["tabular-nums"],
  },
  advisoryFloatPill: {
    position: "absolute",
    bottom: 8,
    left: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: COLORS.brick,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  advisoryFloatText: {
    fontSize: 10,
    fontWeight: "700",
    color: COLORS.parchment,
  },
  cardBody: {
    padding: 11,
    gap: 8,
  },
  cardMetaTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 6,
  },
  regionPill: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  regionDot: {
    width: 6,
    height: 6,
    borderRadius: 99,
  },
  regionText: {
    flex: 1,
    fontSize: 10,
    fontWeight: "600",
    color: COLORS.ink,
  },
  scoreBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.turmericBorder,
    backgroundColor: COLORS.turmericTint,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  scoreBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.ink,
    fontVariant: ["tabular-nums"],
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    lineHeight: 20,
    letterSpacing: -0.25,
    color: COLORS.ink,
  },
  cardAuthorRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 6,
  },
  authorLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  authorName: {
    flexShrink: 1,
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.ink,
  },
  vendorCount: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  vendorCountText: {
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.muted,
  },
  breakdownBox: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: "#F4F5ED",
    padding: 9,
    gap: 4,
  },
  breakdownHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  breakdownTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: "#1F271C",
  },
  breakdownClose: {
    fontSize: 11,
    fontWeight: "700",
    color: "#3D5236",
  },
  breakdownRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 6,
  },
  breakdownLabel: {
    flex: 1,
    fontSize: 10,
    color: "#566151",
  },
  breakdownVal: {
    fontSize: 10,
    fontWeight: "700",
    color: "#1F271C",
    fontVariant: ["tabular-nums"],
  },
  breakdownTotal: {
    marginTop: 2,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.1)",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  breakdownTotalLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: "#1F271C",
    fontVariant: ["tabular-nums"],
  },
  cardFooterRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  cardMapsPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  cardMapsText: {
    fontSize: 10,
    fontWeight: "700",
    color: COLORS.wine,
  },
  discoverFooter: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  discoverFooterLink: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.wine,
  },
  discoverFooterDot: {
    fontSize: 12,
    color: COLORS.muted,
  },
});
