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
  feature1: string; // e.g. What unique sticker/mark was on the item?
  feature2: string; // e.g. What was the approximate capacity/size?
  feature3: string; // e.g. Was there any scratch, damage or unique feature?
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
  status: 'Searching for Match' | 'Possible Match' | 'Matched' | 'Waiting for Match' | 'Recovered' | 'Open';
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
  status: 'In Custody / Searching for Owner' | 'Possible Match' | 'Matched' | 'Open' | 'Recovered';
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

export interface ChatMessage {
  id: string;
  matchId: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  text: string;
  timestamp: string;
}

export type HandoffWorkflowStatus = 
  | 'none'
  | 'return_requested'
  | 'return_accepted'
  | 'return_declined'
  | 'location_confirmed'
  | 'item_handed_over'
  | 'completed';

export interface ItemMatch {
  id: string;
  lostItemId: string;
  foundItemId: string;
  lostItem: LostItem;
  foundItem: FoundItem;
  factors: MatchFactors;
  workflowStatus: HandoffWorkflowStatus;
  verificationStatus: 'unverified' | 'in_progress' | 'verified' | 'failed';
  verificationAttempts?: number;
  returnRequestStatus?: 'none' | 'pending' | 'accepted' | 'declined';
  handoffStatus?: 'pending' | 'agreed' | 'completed';
  ownerConfirmedReceived?: boolean;
  finderConfirmedHandoff?: boolean;
  finderPointsAwarded?: boolean;
  ownerProposedLocation?: HandoffLocationPreference;
  finderProposedLocation?: HandoffLocationPreference;
  agreedLocation?: HandoffLocationPreference;
  ownerConfirmedLocation?: boolean;
  finderConfirmedLocation?: boolean;
  requestDate?: string;
  messages: ChatMessage[];
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
  | 'messages'
  | 'handoff';

export type FinderNavTab = 
  | 'dashboard'
  | 'report_found'
  | 'my_found_items'
  | 'possible_matches'
  | 'messages'
  | 'handoff'
  | 'rewards';


