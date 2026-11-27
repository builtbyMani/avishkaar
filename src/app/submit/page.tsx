"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AlertTriangle, FileCheck2, Loader2, UploadCloud } from "lucide-react";
import { useApp } from "@/components/AppProvider";
import { PLACE_CATEGORIES, REGIONS } from "@/lib/domain";
import { getAuthHeaders } from "@/lib/supabase";
import type {
  LocalVendor,
  MediaItem,
  PlaceCategory,
  SafetyAlert,
  SafetyTag,
  StructuredCards,
} from "@/types/domain";

export default function SubmitGemPage() {
  const router = useRouter();
  const { activeUser, refreshProfiles } = useApp();

  const [title, setTitle] = useState("");
  const [region, setRegion] = useState<string>(REGIONS[0]);
  const [category, setCategory] = useState<PlaceCategory>("Hidden Village");
  const [lat, setLat] = useState("31.1048");
  const [lng, setLng] = useState("77.1734");
  const [rawDescription, setRawDescription] = useState("");
  const [mediaUrl, setMediaUrl] = useState(
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=900&q=80",
  );
  const [mediaType, setMediaType] = useState<"image" | "video">("image");
  const [uploading, setUploading] = useState(false);

  const [vendorName, setVendorName] = useState("");
  const [vendorSpecialty, setVendorSpecialty] = useState("");
  const [vendorContact, setVendorContact] = useState("");

  const [structured, setStructured] = useState<StructuredCards | null>(null);
  const [safetyAlerts, setSafetyAlerts] = useState<SafetyAlert[]>([]);
  const [aiSource, setAiSource] = useState<"gemini" | "fallback" | null>(null);
  const [structuring, setStructuring] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = (await res.json()) as { url?: string; type?: "image" | "video"; error?: string };
      if (!res.ok || !data.url) throw new Error(data.error || "Upload failed");
      setMediaUrl(data.url);
      setMediaType(data.type ?? "image");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function runGeminiStructuring(): Promise<{
    structuredCards: StructuredCards;
    safetyAlerts: SafetyAlert[];
  }> {
    setStructuring(true);
    setError(null);
    try {
      const res = await fetch("/api/structure-place", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title || "Hidden Gem", region, rawDescription }),
      });
      const data = (await res.json()) as {
        structuredCards: StructuredCards;
        safetyAlerts: SafetyAlert[];
        source: "gemini" | "fallback";
        error?: string;
      };
      if (!res.ok) throw new Error(data.error || "AI extraction failed");
      setStructured(data.structuredCards);
      setSafetyAlerts(data.safetyAlerts);
      setAiSource(data.source);
      return { structuredCards: data.structuredCards, safetyAlerts: data.safetyAlerts };
    } finally {
      setStructuring(false);
    }
  }

  async function handlePublish(e: React.FormEvent) {
    e.preventDefault();
    if (!activeUser) return;
    setPublishing(true);
    setError(null);
    try {
      const extracted = structured
        ? { structuredCards: structured, safetyAlerts }
        : await runGeminiStructuring();

      const media: MediaItem[] = [
        {
          type: mediaType,
          url: mediaUrl,
          aspect: "portrait",
          caption: title,
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

      const res = await fetch("/api/places", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(await getAuthHeaders()),
        },
        body: JSON.stringify({
          authorId: activeUser.id,
          title,
          region,
          category,
          rawDescription,
          lat: Number(lat),
          lng: Number(lng),
          media,
          structuredCards: extracted.structuredCards,
          localVendors,
          safetyAlerts: extracted.safetyAlerts,
        }),
      });
      const data = (await res.json()) as { place?: { id: string }; error?: string };
      if (!res.ok || !data.place) throw new Error(data.error || "Failed to publish");

      await refreshProfiles();
      router.push(`/place/${data.place.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not publish hidden gem");
    } finally {
      setPublishing(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-[#1B3B36]">Post a Hidden Gem</h1>
        <p className="mt-1 text-sm text-[#52635F]">
          Image, &lt;8 MB MP4, or YouTube Short · Auto-extracts Commute, Food, Activity, Heritage &amp; Safety
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm font-medium text-red-900">
          <AlertTriangle className="h-4 w-4 shrink-0 text-red-600" strokeWidth={2} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handlePublish} className="space-y-6 rounded-2xl border border-black/12 bg-white p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#1B3B36]">
              Destination Title
            </label>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Chitkul Stone Mill & Buckwheat Kitchens"
              className="mt-1.5 w-full rounded-xl border border-[#E8E0D4] px-3.5 py-2.5 text-sm outline-none focus:border-[#C85A32]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#1B3B36]">
              Region
            </label>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-[#E8E0D4] bg-white px-3.5 py-2.5 text-sm"
            >
              {REGIONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#1B3B36]">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as PlaceCategory)}
              className="mt-1.5 w-full rounded-xl border border-[#E8E0D4] bg-white px-3.5 py-2.5 text-sm"
            >
              {PLACE_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#1B3B36]">
              Latitude
            </label>
            <input
              type="number"
              step="any"
              required
              value={lat}
              onChange={(e) => setLat(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-[#E8E0D4] px-3.5 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#1B3B36]">
              Longitude
            </label>
            <input
              type="number"
              step="any"
              required
              value={lng}
              onChange={(e) => setLng(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-[#E8E0D4] px-3.5 py-2 text-sm"
            />
          </div>
        </div>

        {/* Media upload */}
        <div className="space-y-3 rounded-2xl border border-[#E8E0D4] bg-[#FAF7F2] p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#1B3B36]">
              Photo, Short Clip (&lt;8 MB Hover-Play), or YouTube Short URL
            </span>
            <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-[#1B3B36] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-[#C85A32]">
              <UploadCloud className="h-3.5 w-3.5" />
              {uploading ? "Uploading..." : "Upload File"}
              <input
                type="file"
                accept="image/*,video/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
          <div className="grid gap-3 sm:grid-cols-4">
            <select
              value={mediaType}
              onChange={(e) => setMediaType(e.target.value as "image" | "video")}
              className="rounded-xl border border-[#E8E0D4] bg-white px-3 py-2 text-xs font-semibold"
            >
              <option value="image">Photo</option>
              <option value="video">Short Clip / YouTube Short</option>
            </select>
            <input
              value={mediaUrl}
              onChange={(e) => setMediaUrl(e.target.value)}
              placeholder="Paste image, <8 MB MP4, or YouTube Shorts URL (youtube.com/shorts/...)"
              className="rounded-xl border border-[#E8E0D4] bg-white px-3 py-2 text-xs sm:col-span-3"
            />
          </div>
        </div>

        {/* Raw Field Notes + Gemini Extraction */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label className="text-xs font-bold uppercase tracking-wider text-[#1B3B36]">
              Multilingual Field Notes (English, Hindi, Telugu, Tamil, or Hinglish)
            </label>
            <button
              type="button"
              disabled={structuring || !rawDescription.trim()}
              onClick={() => void runGeminiStructuring()}
              className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3.5 py-1.5 text-xs font-bold text-amber-950 hover:bg-amber-200 disabled:opacity-50"
            >
              {structuring ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileCheck2 className="h-3.5 w-3.5" strokeWidth={2} />}
              Auto-Structure Notes
            </button>
          </div>
          <textarea
            required
            rows={4}
            value={rawDescription}
            onChange={(e) => setRawDescription(e.target.value)}
            placeholder="Example (Hinglish/English): Subah 6 AM local bus lo Reckong Peo se Sangla, phir 3km walk to wooden bridge. Try buckwheat chilta aur apricot chai. Raat ko cliff path avoid karo, network zero hai, temple me chappal bahar utaro."
            className="w-full rounded-xl border border-black/12 p-3.5 text-sm outline-none focus:border-[#C85A32]"
          />
        </div>

        {structured && (
          <div className="animate-panel-in space-y-3 rounded-2xl border border-black/12 bg-[#FAF7F2] p-4 text-xs">
            <div className="flex items-center justify-between">
              <strong className="text-[#1B3B36]">
                Structured Preview ({aiSource === "gemini" ? "Gemini JSON" : "Fallback Extractor"})
              </strong>
              <span className="text-[#52635F]">Editable before publish</span>
            </div>
            <div>
              <span className="font-bold text-[#1B3B36]">Last-Mile Commute:</span>
              <textarea
                rows={2}
                value={structured.commute.join("\n")}
                onChange={(e) =>
                  setStructured({ ...structured, commute: e.target.value.split("\n").filter(Boolean) })
                }
                className="mt-1 w-full rounded-lg border border-black/12 bg-white p-2"
              />
            </div>
            <div>
              <span className="font-bold text-[#1B3B36]">Living Heritage &amp; Etiquette:</span>
              <textarea
                rows={2}
                value={(structured.livingHeritage ?? []).join("\n")}
                onChange={(e) =>
                  setStructured({
                    ...structured,
                    livingHeritage: e.target.value.split("\n").filter(Boolean),
                  })
                }
                className="mt-1 w-full rounded-lg border border-black/12 bg-white p-2"
              />
            </div>
            <div>
              <span className="font-bold text-[#1B3B36]">Safety Tags:</span>
              <div className="mt-1 flex flex-wrap gap-2">
                {safetyAlerts.map((a, idx) => (
                  <span key={idx} className="rounded-full bg-red-600 px-2.5 py-0.5 text-[10px] font-bold text-white">
                    {a.tag as SafetyTag}: {a.message}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Support Local Tagging */}
        <div className="space-y-3 rounded-2xl border border-[#E8E0D4] bg-[#FAF7F2] p-4">
          <span className="block text-xs font-bold uppercase tracking-wider text-[#1B3B36]">
            Support Local Spotlight (Optional Vendor / Artisan / Homestay)
          </span>
          <div className="grid gap-3 sm:grid-cols-3">
            <input
              value={vendorName}
              onChange={(e) => setVendorName(e.target.value)}
              placeholder="Vendor / Homestay Name"
              className="rounded-xl border border-[#E8E0D4] bg-white px-3 py-2 text-xs"
            />
            <input
              value={vendorSpecialty}
              onChange={(e) => setVendorSpecialty(e.target.value)}
              placeholder="Specialty (e.g. Buckwheat thali)"
              className="rounded-xl border border-[#E8E0D4] bg-white px-3 py-2 text-xs"
            />
            <input
              value={vendorContact}
              onChange={(e) => setVendorContact(e.target.value)}
              placeholder="Contact / Village Landmark"
              className="rounded-xl border border-[#E8E0D4] bg-white px-3 py-2 text-xs"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={publishing}
          className="tactile-press min-h-11 w-full rounded-xl bg-[#C85A32] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#b24d28] disabled:opacity-60"
        >
          {publishing ? "Structuring & Publishing..." : "Publish Hidden Gem"}
        </button>
      </form>
    </div>
  );
}
