import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Animated, { FadeInDown, useAnimatedScrollHandler } from "react-native-reanimated";
import { useApp } from "../../components/AppProvider";
import {
  AlertTriangle,
  FileCheck2,
  MapPin,
  UploadCloud,
} from "../../components/Icons";
import { getPlaceSlug, PLACE_CATEGORIES, REGIONS } from "../../lib/domain";
import {
  createPlace,
  structurePlaceNotes,
  uploadMediaAsset,
} from "../../lib/store";
import { validatePlaceInput } from "../../lib/validation";
import { TactilePressable, triggerHaptic } from "../../theme/motion";
import { COLORS, FONTS } from "../../theme/tokens";
import type {
  LocalVendor,
  MediaItem,
  PlaceCategory,
  SafetyAlert,
  StructuredCards,
} from "../../types/domain";

const DEFAULT_PHOTO_URL =
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=900&q=80";

export default function SubmitGemScreen() {
  const router = useRouter();
  const { activeUser, mode, openAuthModal, refreshProfiles, bumpFeedVersion, scrollProgress } =
    useApp();

  const [title, setTitle] = useState("");
  const [region, setRegion] = useState<string>(REGIONS[0]);
  const [category, setCategory] = useState<PlaceCategory>("Hidden Village");
  const [lat, setLat] = useState("31.1048");
  const [lng, setLng] = useState("77.1734");
  const [mediaUrl, setMediaUrl] = useState(DEFAULT_PHOTO_URL);
  const [mediaType, setMediaType] = useState<"image" | "video">("image");
  const [localAssetMeta, setLocalAssetMeta] = useState<{
    mimeType?: string | null;
    fileSize?: number;
  } | null>(null);
  const [rawDescription, setRawDescription] = useState("");

  const [vendorName, setVendorName] = useState("");
  const [vendorSpecialty, setVendorSpecialty] = useState("");
  const [vendorContact, setVendorContact] = useState("");

  const [structured, setStructured] = useState<StructuredCards | null>(null);
  const [safetyAlerts, setSafetyAlerts] = useState<SafetyAlert[]>([]);
  const [aiSource, setAiSource] = useState<"gemini" | "fallback" | null>(null);

  const [locating, setLocating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [structuring, setStructuring] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      const maxScroll = Math.max(1, event.contentSize.height - event.layoutMeasurement.height);
      scrollProgress.value = Math.min(1, Math.max(0, event.contentOffset.y / maxScroll));
    },
  });

  async function handleFillGps() {
    setLocating(true);
    setError(null);
    try {
      const perm = await Location.requestForegroundPermissionsAsync();
      if (perm.status !== "granted") {
        setError("Location permission denied — enter coordinates manually.");
        return;
      }
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setLat(pos.coords.latitude.toFixed(5));
      setLng(pos.coords.longitude.toFixed(5));
      triggerHaptic("success");
    } catch {
      setError("Could not read GPS coordinates right now.");
    } finally {
      setLocating(false);
    }
  }

  async function handlePickMedia(fromCamera: boolean) {
    setError(null);
    setUploading(true);
    try {
      if (fromCamera) {
        const perm = await ImagePicker.requestCameraPermissionsAsync();
        if (!perm.granted) {
          setError("Camera permission is needed to capture trail media.");
          return;
        }
      } else {
        const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!perm.granted) {
          setError("Photo library permission is needed to pick media.");
          return;
        }
      }

      const result = fromCamera
        ? await ImagePicker.launchCameraAsync({
            mediaTypes: ["images", "videos"],
            quality: 0.85,
            videoMaxDuration: 25,
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images", "videos"],
            quality: 0.85,
          });

      if (result.canceled || !result.assets?.[0]) return;
      const asset = result.assets[0];
      const kind: "image" | "video" = asset.type === "video" ? "video" : "image";
      if (kind === "video" && asset.fileSize && asset.fileSize > 8 * 1024 * 1024) {
        setError("Short video clip exceeds the 8 MB limit (or paste a YouTube Shorts URL).");
        return;
      }

      if (activeUser) {
        const uploaded = await uploadMediaAsset({
          uri: asset.uri,
          mimeType: asset.mimeType,
          fileSize: asset.fileSize,
          kind,
          userId: activeUser.id,
          demoMode: mode === "demo",
        });
        setMediaUrl(uploaded.url);
        setMediaType(uploaded.type);
        setLocalAssetMeta(null);
      } else {
        setMediaUrl(asset.uri);
        setMediaType(kind);
        setLocalAssetMeta({ mimeType: asset.mimeType, fileSize: asset.fileSize });
      }
      triggerHaptic("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Media upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function runStructuring() {
    if (!rawDescription.trim()) return null;
    setStructuring(true);
    setError(null);
    try {
      const res = await structurePlaceNotes(
        rawDescription.trim(),
        title.trim() || "Hidden Gem",
        region,
      );
      setStructured(res.structuredCards);
      setSafetyAlerts(res.safetyAlerts);
      setAiSource(res.source);
      triggerHaptic("success");
      return { structuredCards: res.structuredCards, safetyAlerts: res.safetyAlerts };
    } catch (err) {
      setError(err instanceof Error ? err.message : "AI structuring failed");
      return null;
    } finally {
      setStructuring(false);
    }
  }

  async function handlePublish() {
    if (!activeUser) {
      openAuthModal();
      setError("Sign in first to publish a hidden gem.");
      return;
    }

    if (title.trim().length < 3) {
      triggerHaptic("warning");
      setError("Title is required (3-120 chars).");
      return;
    }
    if (!rawDescription.trim()) {
      triggerHaptic("warning");
      setError("Field notes are required (max 4000 chars).");
      return;
    }

    setError(null);
    setPublishing(true);
    try {
      let resolvedUrl = mediaUrl.trim();
      let resolvedType = mediaType;

      if (/^(file:|content:|ph:)/i.test(resolvedUrl)) {
        const uploaded = await uploadMediaAsset({
          uri: resolvedUrl,
          mimeType: localAssetMeta?.mimeType,
          fileSize: localAssetMeta?.fileSize,
          kind: mediaType,
          userId: activeUser.id,
          demoMode: mode === "demo",
        });
        resolvedUrl = uploaded.url;
        resolvedType = uploaded.type;
      }

      const extracted = structured
        ? { structuredCards: structured, safetyAlerts }
        : await runStructuring();
      if (!extracted) {
        setPublishing(false);
        return;
      }

      const media: MediaItem[] = [
        {
          type: resolvedType,
          url: resolvedUrl || DEFAULT_PHOTO_URL,
          aspect: "portrait",
          caption: title.trim(),
        },
      ];

      const localVendors: LocalVendor[] = vendorName.trim()
        ? [
            {
              id: `v-${Date.now()}`,
              name: vendorName.trim(),
              category: "Food Vendor",
              specialty: vendorSpecialty.trim() || "Local specialty",
              lat: Number(lat) + 0.001,
              lng: Number(lng) + 0.001,
              contact: vendorContact.trim() || "Ask at village square",
            },
          ]
        : [];

      const validation = validatePlaceInput({
        title,
        region,
        category,
        rawDescription,
        lat,
        lng,
        media,
        structuredCards: extracted.structuredCards,
        localVendors,
        safetyAlerts: extracted.safetyAlerts,
      });

      if (!validation.ok) {
        setError(validation.error);
        setPublishing(false);
        return;
      }

      const result = await createPlace(
        {
          authorId: activeUser.id,
          title: title.trim(),
          region: validation.region,
          category: validation.category,
          rawDescription: rawDescription.trim(),
          lat: validation.lat,
          lng: validation.lng,
          media,
          structuredCards: extracted.structuredCards,
          localVendors,
          safetyAlerts: extracted.safetyAlerts,
        },
        { demoMode: mode === "demo" },
      );

      triggerHaptic("success");
      bumpFeedVersion();
      await refreshProfiles();
      setTitle("");
      setRawDescription("");
      setMediaUrl(DEFAULT_PHOTO_URL);
      setMediaType("image");
      setLocalAssetMeta(null);
      setStructured(null);
      setSafetyAlerts([]);
      setAiSource(null);
      setVendorName("");
      setVendorSpecialty("");
      setVendorContact("");
      router.push(`/place/${getPlaceSlug(result.place)}`);
    } catch (err) {
      triggerHaptic("warning");
      setError(err instanceof Error ? err.message : "Could not publish hidden gem");
    } finally {
      setPublishing(false);
    }
  }

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
      >
        <View>
          <Text style={styles.pageTitle}>Post a Hidden Gem</Text>
          <Text style={styles.pageSub}>
            Image, &lt;8 MB MP4, or YouTube Short · Auto-extracts Commute, Food, Activity, Heritage & Safety
          </Text>
        </View>

        {error && (
          <View style={styles.errorBanner}>
            <AlertTriangle size={16} color={COLORS.redAlertBorder} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.formCard}>
          {/* Title */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>DESTINATION TITLE</Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="e.g. Chitkul Stone Mill & Buckwheat Kitchens"
              placeholderTextColor={COLORS.muted}
              style={styles.input}
            />
          </View>

          {/* Region Chips */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>REGION</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.pillRow}
            >
              {REGIONS.map((r) => {
                const active = region === r;
                return (
                  <TactilePressable
                    key={r}
                    haptic="selection"
                    onPress={() => setRegion(r)}
                    style={[styles.choicePill, active && styles.choicePillActive]}
                  >
                    <Text style={[styles.choicePillText, active && styles.choicePillTextActive]}>
                      {r}
                    </Text>
                  </TactilePressable>
                );
              })}
            </ScrollView>
          </View>

          {/* Category Chips */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>CATEGORY</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.pillRow}
            >
              {PLACE_CATEGORIES.map((c) => {
                const active = category === c;
                return (
                  <TactilePressable
                    key={c}
                    haptic="selection"
                    onPress={() => setCategory(c)}
                    style={[styles.choicePill, active && styles.choicePillActive]}
                  >
                    <Text style={[styles.choicePillText, active && styles.choicePillTextActive]}>
                      {c}
                    </Text>
                  </TactilePressable>
                );
              })}
            </ScrollView>
          </View>

          {/* Coordinates + GPS Autofill */}
          <View style={styles.coordsHeader}>
            <Text style={styles.label}>COORDINATES</Text>
            <TactilePressable
              disabled={locating}
              onPress={() => void handleFillGps()}
              style={styles.gpsBtn}
            >
              <MapPin size={12} color={COLORS.wine} />
              <Text style={styles.gpsBtnText}>
                {locating ? "Reading GPS..." : "Use Current GPS"}
              </Text>
            </TactilePressable>
          </View>

          <View style={styles.twoCol}>
            <View style={{ flex: 1 }}>
              <Text style={styles.subLabel}>Latitude</Text>
              <TextInput
                value={lat}
                onChangeText={setLat}
                keyboardType="numbers-and-punctuation"
                style={styles.input}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.subLabel}>Longitude</Text>
              <TextInput
                value={lng}
                onChangeText={setLng}
                keyboardType="numbers-and-punctuation"
                style={styles.input}
              />
            </View>
          </View>

          {/* Media Upload */}
          <View style={styles.subBox}>
            <Text style={styles.label}>PHOTO, SHORT CLIP (&lt;8 MB), OR YOUTUBE SHORT</Text>
            <View style={styles.mediaBtns}>
              <TactilePressable
                disabled={uploading}
                onPress={() => void handlePickMedia(false)}
                style={styles.uploadBtn}
              >
                <UploadCloud size={14} color="#FFFFFF" />
                <Text style={styles.uploadBtnText}>
                  {uploading ? "Uploading..." : "Choose File"}
                </Text>
              </TactilePressable>
              <TactilePressable
                disabled={uploading}
                onPress={() => void handlePickMedia(true)}
                style={styles.cameraBtn}
              >
                <Text style={styles.cameraBtnText}>Camera</Text>
              </TactilePressable>
            </View>

            <View style={styles.twoCol}>
              <TactilePressable
                onPress={() => setMediaType("image")}
                style={[styles.typePill, mediaType === "image" && styles.choicePillActive]}
              >
                <Text
                  style={[
                    styles.choicePillText,
                    mediaType === "image" && styles.choicePillTextActive,
                  ]}
                >
                  Photo
                </Text>
              </TactilePressable>
              <TactilePressable
                onPress={() => setMediaType("video")}
                style={[styles.typePill, mediaType === "video" && styles.choicePillActive]}
              >
                <Text
                  style={[
                    styles.choicePillText,
                    mediaType === "video" && styles.choicePillTextActive,
                  ]}
                >
                  Short Clip / YouTube Short
                </Text>
              </TactilePressable>
            </View>

            <TextInput
              value={mediaUrl}
              onChangeText={setMediaUrl}
              autoCapitalize="none"
              autoCorrect={false}
              placeholder="Paste image, <8 MB MP4, or youtube.com/shorts/... URL"
              placeholderTextColor={COLORS.muted}
              style={styles.input}
            />
          </View>

          {/* Multilingual Notes + Auto-Structure */}
          <View style={styles.fieldGroup}>
            <View style={styles.notesTopRow}>
              <Text style={[styles.label, { flex: 1 }]}>
                MULTILINGUAL FIELD NOTES (EN / HI / TE / TA / HINGLISH)
              </Text>
              <TactilePressable
                disabled={structuring || !rawDescription.trim()}
                onPress={() => void runStructuring()}
                style={[
                  styles.aiBtn,
                  (structuring || !rawDescription.trim()) && { opacity: 0.5 },
                ]}
              >
                {structuring ? (
                  <ActivityIndicator size="small" color="#78350F" />
                ) : (
                  <FileCheck2 size={14} color="#78350F" />
                )}
                <Text style={styles.aiBtnText}>Auto-Structure</Text>
              </TactilePressable>
            </View>

            <TextInput
              value={rawDescription}
              onChangeText={setRawDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              placeholder="Example: Subah 6 AM local bus lo Reckong Peo se Sangla, phir 3km walk to wooden bridge. Try buckwheat chilta aur apricot chai. Raat ko cliff path avoid karo, network zero hai."
              placeholderTextColor={COLORS.muted}
              style={[styles.input, { minHeight: 110 }]}
            />
          </View>

          {structured && (
            <Animated.View entering={FadeInDown.duration(180)} style={styles.subBox}>
              <View style={styles.coordsHeader}>
                <Text style={styles.previewTitle}>
                  Structured Preview ({aiSource === "gemini" ? "Gemini JSON" : "Fallback Extractor"})
                </Text>
                <Text style={styles.previewSub}>Editable before publish</Text>
              </View>

              <Text style={styles.subLabel}>Last-Mile Commute</Text>
              <TextInput
                multiline
                textAlignVertical="top"
                value={structured.commute.join("\n")}
                onChangeText={(txt) =>
                  setStructured({ ...structured, commute: txt.split("\n").filter(Boolean) })
                }
                style={[styles.input, { minHeight: 62 }]}
              />

              <Text style={styles.subLabel}>Must-Try Food</Text>
              <TextInput
                multiline
                textAlignVertical="top"
                value={structured.food
                  .map((f) => `${f.name} — ${f.detail}${f.priceHint ? ` (${f.priceHint})` : ""}`)
                  .join("\n")}
                onChangeText={(txt) =>
                  setStructured({
                    ...structured,
                    food: txt
                      .split("\n")
                      .map((line) => line.trim())
                      .filter(Boolean)
                      .map((line) => {
                        const [namePart, ...rest] = line.split("—");
                        return {
                          name: (namePart || "Local Dish").trim().slice(0, 80),
                          detail: (rest.join("—") || namePart).trim().slice(0, 500),
                        };
                      }),
                  })
                }
                style={[styles.input, { minHeight: 58 }]}
              />

              <Text style={styles.subLabel}>Local Activities</Text>
              <TextInput
                multiline
                textAlignVertical="top"
                value={structured.activities.join("\n")}
                onChangeText={(txt) =>
                  setStructured({ ...structured, activities: txt.split("\n").filter(Boolean) })
                }
                style={[styles.input, { minHeight: 58 }]}
              />

              <Text style={styles.subLabel}>Living Heritage & Etiquette</Text>
              <TextInput
                multiline
                textAlignVertical="top"
                value={(structured.livingHeritage ?? []).join("\n")}
                onChangeText={(txt) =>
                  setStructured({
                    ...structured,
                    livingHeritage: txt.split("\n").filter(Boolean),
                  })
                }
                style={[styles.input, { minHeight: 62 }]}
              />

              <Text style={styles.subLabel}>Safety Tags</Text>
              <View style={styles.safetyTagWrap}>
                {safetyAlerts.map((a, idx) => (
                  <View key={idx} style={styles.safetyPill}>
                    <Text style={styles.safetyPillText}>
                      {a.tag}: {a.message}
                    </Text>
                  </View>
                ))}
              </View>
            </Animated.View>
          )}

          {/* Support Local Spotlight */}
          <View style={styles.subBox}>
            <Text style={styles.label}>SUPPORT LOCAL SPOTLIGHT (OPTIONAL)</Text>
            <TextInput
              value={vendorName}
              onChangeText={setVendorName}
              placeholder="Vendor / Homestay Name"
              placeholderTextColor={COLORS.muted}
              style={styles.input}
            />
            <TextInput
              value={vendorSpecialty}
              onChangeText={setVendorSpecialty}
              placeholder="Specialty (e.g. Buckwheat thali)"
              placeholderTextColor={COLORS.muted}
              style={styles.input}
            />
            <TextInput
              value={vendorContact}
              onChangeText={setVendorContact}
              placeholder="Contact / Village Landmark"
              placeholderTextColor={COLORS.muted}
              style={styles.input}
            />
          </View>

          <TactilePressable
            disabled={publishing}
            onPress={() => void handlePublish()}
            haptic="medium"
            style={[styles.publishBtn, publishing && { opacity: 0.6 }]}
          >
            <Text style={styles.publishBtnText}>
              {publishing ? "Structuring & Publishing..." : "Publish Hidden Gem"}
            </Text>
          </TactilePressable>
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
  pageTitle: {
    fontFamily: FONTS.display,
    fontSize: 30,
    color: COLORS.wine,
  },
  pageSub: {
    marginTop: 2,
    fontSize: 13,
    lineHeight: 18,
    color: COLORS.muted,
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#FCA5A5",
    backgroundColor: COLORS.redAlertBg,
    padding: 12,
  },
  errorText: {
    flex: 1,
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.redAlertText,
  },
  formCard: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    padding: 16,
    gap: 16,
  },
  fieldGroup: {
    gap: 6,
  },
  label: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
    color: COLORS.wine,
  },
  subLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.muted,
    marginBottom: 4,
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
  pillRow: {
    flexDirection: "row",
    gap: 8,
    paddingVertical: 2,
  },
  choicePill: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  choicePillActive: {
    backgroundColor: COLORS.wine,
    borderColor: COLORS.wine,
  },
  choicePillText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.ink,
  },
  choicePillTextActive: {
    color: COLORS.parchment,
  },
  coordsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  gpsBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.wineBorder,
    backgroundColor: COLORS.wineTint,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  gpsBtnText: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.wine,
  },
  twoCol: {
    flexDirection: "row",
    gap: 10,
  },
  subBox: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    padding: 14,
    gap: 10,
  },
  mediaBtns: {
    flexDirection: "row",
    gap: 8,
  },
  uploadBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderRadius: 999,
    backgroundColor: COLORS.wine,
    paddingVertical: 9,
  },
  uploadBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  cameraBtn: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingVertical: 9,
    justifyContent: "center",
  },
  cameraBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.wine,
  },
  typePill: {
    flex: 1,
    alignItems: "center",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    paddingVertical: 8,
  },
  notesTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  aiBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderRadius: 999,
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  aiBtnText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#78350F",
  },
  previewTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.wine,
  },
  previewSub: {
    fontSize: 11,
    color: COLORS.muted,
  },
  safetyTagWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  safetyPill: {
    borderRadius: 999,
    backgroundColor: COLORS.redAlertBorder,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  safetyPillText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  publishBtn: {
    borderRadius: 14,
    backgroundColor: COLORS.terracotta,
    paddingVertical: 14,
    alignItems: "center",
  },
  publishBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
