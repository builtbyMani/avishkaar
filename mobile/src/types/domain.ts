export type TrailblazerTier = "Wanderer" | "Pathfinder" | "Local Legend";

export type SafetyTag =
  | "Cultural Etiquette"
  | "Avoid After Dark"
  | "Low Network"
  | "Scam Alert";

export type PlaceCategory =
  | "Hidden Village"
  | "Regional Cuisine"
  | "Living Heritage"
  | "Sacred & Craft"
  | "Nature & Trail";

export interface MediaItem {
  type: "image" | "video";
  url: string;
  thumbnail?: string;
  aspect?: "portrait" | "square" | "landscape";
  caption?: string;
  durationSec?: number;
}

export interface FoodCard {
  name: string;
  detail: string;
  priceHint?: string;
}

export interface StructuredCards {
  commute: string[];
  food: FoodCard[];
  activities: string[];
  livingHeritage?: string[];
}

export interface LocalVendor {
  id: string;
  name: string;
  category: "Food Vendor" | "Artisan" | "Homestay" | "Cultural Practitioner";
  specialty: string;
  lat: number;
  lng: number;
  contact: string;
  whatsapp?: string;
  upiId?: string;
}

export interface SafetyAlert {
  tag: SafetyTag;
  message: string;
  lat?: number;
  lng?: number;
  authorTier?: TrailblazerTier;
  verifiedBy?: string[];
  flaggedBy?: string[];
}

export interface Profile {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  trailblazerScore: number;
  tier: TrailblazerTier;
  isGuide: boolean;
  isVerifiedLocal: boolean;
  guideRegion: string | null;
  languages: string[];
}

export interface Place {
  id: string;
  authorId: string;
  title: string;
  region: string;
  category: PlaceCategory;
  rawDescription: string;
  lat: number;
  lng: number;
  media: MediaItem[];
  structuredCards: StructuredCards;
  localVendors: LocalVendor[];
  safetyAlerts: SafetyAlert[];
  mainstreamPopularityIndex: number;
  vouchesCount: number;
  verifiedCheckinsCount: number;
  createdAt: string;
}

export interface VouchRecord {
  id: string;
  placeId: string;
  userId: string;
  checkedInAt: string | null;
  vouchedAt: string | null;
  isVerifiedVisit: boolean;
  pointsAwarded: number;
}

export interface UserBadge {
  id: string;
  userId: string;
  badgeKey: "first_discovery" | "foodie_scout" | "local_legend";
  badgeName: string;
  description: string;
  awardedAt: string;
}

export interface GuideRequest {
  id: string;
  placeId: string;
  guideId: string;
  requesterId: string;
  preferredDate: string;
  notes: string;
  status: "Pending" | "Accepted";
  createdAt: string;
}

export interface EnrichedPlace extends Place {
  author: Profile;
  hiddenGemScore: number;
  userHasVouched?: boolean;
  userHasCheckedIn?: boolean;
  userVerifiedVisitVouch?: boolean;
}

export interface OfflinePocketCard {
  placeId: string;
  title: string;
  region: string;
  category: string;
  savedAt: string;
  commute: string[];
  food: FoodCard[];
  livingHeritage?: string[];
  safetyAlerts: SafetyAlert[];
  localVendors: LocalVendor[];
}
