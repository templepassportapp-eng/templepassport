export interface Temple {
  id: string;
  name: string;
  deity?: string;
  city?: string;
  district?: string;
  state?: string;
  category?: string;
  latitude: number;
  longitude: number;
  verificationRadius?: number | null;
  imageUrl?: string | null;
  thumbnailUrl?: string | null;
  description?: string | null;
}

export type VerificationType = 'VERIFIED' | 'SELF_REPORTED';

export interface CheckIn {
  id: string;
  userId: string;
  templeId: string;
  visitDate: string;
  verificationType: VerificationType;
  latitude?: number | null;
  longitude?: number | null;
  notes?: string | null;
  photoUrl?: string | null;
}

export interface CheckInDetail {
  id: string;
  userId: string;
  templeId: string;
  templeName: string;
  templeState?: string;
  templeCity?: string;
  templeLatitude: number;
  templeLongitude: number;
  templeImageUrl?: string | null;
  visitDate: string;
  verificationType: VerificationType;
  notes?: string | null;
  photoUrl?: string | null;
}

export interface CheckInRequest {
  userId: string;
  templeId: string;
  visitDate?: string;
  latitude?: number;
  longitude?: number;
  notes?: string;
  photoUrl?: string;
}

export interface UserStats {
  userId: string;
  name: string;
  email: string;
  templesVisited: number;
  verifiedVisits: number;
  statesCovered: number;
  totalStates: number;
  collections: CollectionProgress[];
  achievements: Achievement[];
}

export interface CollectionProgress {
  id: string;
  name: string;
  type: string;
  visited: number;
  total: number;
}

export interface Achievement {
  code: string;
  name: string;
  description: string;
  iconName: string;
  earned: boolean;
  earnedAt?: string | null;
}

export interface CollectionDetail {
  id: string;
  name: string;
  description: string;
  type: string;
  visited: number;
  total: number;
  temples: CollectionTemple[];
}

export interface CollectionTemple {
  id: string;
  name: string;
  state: string;
  imageUrl?: string | null;
  visited: boolean;
}

export interface JourneyEntry {
  id: string;
  templeId: string;
  templeName: string;
  templeState?: string;
  templeCity?: string;
  templeCategory?: string;
  templeImageUrl?: string | null;
  visitDate: string; // YYYY-MM-DD
  verificationType: VerificationType;
  accuracyMeters?: number | null;
  notes?: string | null;
}
