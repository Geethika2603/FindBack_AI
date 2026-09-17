export type UserRole = 'owner' | 'finder';

export interface User {
  id: string;
  name: string;
  email: string;
  username: string;
  role: UserRole;
  rewardPoints?: number;
  successfulReturns?: number;
  badge?: string;
}

export interface PrivateIdentifyingInfo {
  feature1: string;
  feature2: string;
  feature3: string;
}

export interface HandoffLocationPreference {
  locationName: string;
  landmark: string;
  instructions: string;
}

export interface LostItem {
  id: string;
  title: string;
  category: string;
  brand: string;
  color: string;
  description: string;
  imageUrl?: string;
  location: string;
  dateLost: string;
  timeLost: string;
  privateFeatures: PrivateIdentifyingInfo;
  status: 'Possible Match' | 'Matched' | 'Waiting for Match' | 'Recovered' | 'Open';
  isDemo?: boolean;
  ownerId?: string;
  ownerName?: string;
  preferredHandoff?: HandoffLocationPreference;
  createdAt: string;
}

export interface FoundItem {
  id: string;
  title: string;
  category: string;
  brand: string;
  color: string;
  description: string;
  imageUrl?: string;
  location: string;
  dateFound: string;
  timeFound: string;
  custodyLocation?: string;
  status: 'Possible Match' | 'Matched' | 'Open' | 'Recovered';
  isDemo?: boolean;
  finderId?: string;
  finderName?: string;
  preferredHandoff?: HandoffLocationPreference;
  createdAt: string;
}

export interface MatchFactors {
  imageScore: number;     // 35%
  textScore: number;      // 20%
  colorScore: number;     // 10%
  brandScore: number;     // 10%
  categoryScore: number;  // 5%
  locationScore: number;  // 10%
  timeScore: number;      // 10%
  overallScore: number;   // 100%
  matchedHighlights: string[];
}

export interface ItemMatch {
  id: string;
  lostItemId: string;
  foundItemId: string;
  lostItem: LostItem;
  foundItem: FoundItem;
  factors: MatchFactors;
  verificationStatus: 'unverified' | 'in_progress' | 'verified' | 'failed';
  verificationAttempts?: number;
  returnRequestStatus?: 'none' | 'pending' | 'accepted' | 'declined';
  handoffStatus?: 'pending' | 'agreed' | 'completed';
  ownerConfirmedReceived?: boolean;
  finderConfirmedHandoff?: boolean;
  finderPointsAwarded?: boolean;
  agreedLocation?: HandoffLocationPreference;
  createdAt: string;
}

export type ActiveTab = 'dashboard' | 'report_lost' | 'report_found' | 'matching_hub' | 'api_docs';
export type ItemCategory = 'electronics' | 'clothing' | 'keys' | 'wallets' | 'documents' | 'bags' | 'jewelry' | 'other';
export interface VerificationQuestion {
  id: string;
  question: string;
  answer: string;
}

export type OwnerNavTab = 
  | 'dashboard'
  | 'report_lost'
  | 'my_lost_items'
  | 'possible_matches'
  | 'verification'
  | 'handoff';

export type FinderNavTab = 
  | 'dashboard'
  | 'report_found'
  | 'my_found_items'
  | 'possible_matches'
  | 'return_requests'
  | 'handoff'
  | 'rewards';

