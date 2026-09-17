import { LostItem, FoundItem, ItemMatch, User } from '../types';
import { compute7FactorMatch } from '../services/aiMatching';

export const DEFAULT_OWNER_USER: User = {
  id: 'user-owner-demo',
  name: 'Sarah Jenkins',
  email: 'sarah.jenkins@campus.edu',
  username: 'sarah_j',
  role: 'owner',
};

export const DEFAULT_FINDER_USER: User = {
  id: 'user-finder-demo',
  name: 'Alex Rivera',
  email: 'alex.rivera@campus.edu',
  username: 'alex_r',
  role: 'finder',
  rewardPoints: 350,
  successfulReturns: 3,
  badge: 'Helpful Finder ⭐',
};

export const DEMO_LOST_ITEMS: LostItem[] = [
  {
    id: 'demo-lost-1',
    title: 'Black Nike Water Bottle',
    category: 'Bottle',
    brand: 'Nike',
    color: 'Black',
    description: 'Black water bottle with blue mountain sticker.',
    imageUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=600&q=80',
    location: 'University Library',
    dateLost: '2026-09-16',
    timeLost: '14:30',
    privateFeatures: {
      feature1: 'Blue mountain vinyl sticker on upper side',
      feature2: '750ml capacity vacuum insulated',
      feature3: 'Small dent on bottom rim and initials SJ in marker underneath',
    },
    status: 'Searching for Match',
    isDemo: true,
    ownerId: 'user-owner-demo',
    ownerName: 'Sarah Jenkins (Demo)',
    createdAt: '2026-09-16T14:30:00Z',
    preferredHandoff: {
      locationName: 'College Library Main Entrance',
      landmark: 'Near the front turnstiles',
      instructions: 'Available weekdays after 2 PM',
    }
  },
  {
    id: 'demo-lost-2',
    title: 'Space Gray Apple Laptop',
    category: 'Electronics',
    brand: 'Apple',
    color: 'Space Gray',
    description: 'Space gray laptop with an outdoor sticker on the lid and a small scratch near the USB-C port.',
    imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80',
    location: 'Science Library',
    dateLost: '2026-09-16',
    timeLost: '11:15',
    privateFeatures: {
      feature1: 'Yosemite outdoor sticker on lid corner',
      feature2: '13-inch M2 model, 512GB SSD',
      feature3: 'Small hairline scratch near the left USB-C charging port',
    },
    status: 'Searching for Match',
    isDemo: true,
    ownerId: 'user-owner-demo',
    ownerName: 'Sarah Jenkins (Demo)',
    createdAt: '2026-09-16T11:15:00Z',
    preferredHandoff: {
      locationName: 'Science Library Information Desk',
      landmark: 'Ground Floor Lobby',
      instructions: 'Meet inside near the elevators',
    }
  },
  {
    id: 'demo-lost-3',
    title: 'Blue Leather Wallet',
    category: 'Wallet',
    brand: 'Generic',
    color: 'Dark Blue',
    description: 'Dark blue slim bifold leather wallet with contrast stitching.',
    imageUrl: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=600&q=80',
    location: 'Student Union',
    dateLost: '2026-09-15',
    timeLost: '18:00',
    privateFeatures: {
      feature1: 'Metro student ID in internal pocket',
      feature2: 'Slim bifold with 6 card slots',
      feature3: 'Tiny bronze spare key hidden in lining',
    },
    status: 'Searching for Match',
    isDemo: true,
    ownerId: 'user-owner-demo',
    ownerName: 'Sarah Jenkins (Demo)',
    createdAt: '2026-09-15T18:00:00Z',
  },
];

export const DEMO_FOUND_ITEMS: FoundItem[] = [
  {
    id: 'demo-found-1',
    title: 'Black Nike Water Bottle',
    category: 'Bottle',
    brand: 'Nike',
    color: 'Black',
    description: 'Black bottle with blue sticker found near library table.',
    imageUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=600&q=80',
    location: 'University Library',
    dateFound: '2026-09-16',
    timeFound: '16:45',
    custodyLocation: 'University Library Front Help Desk (Storage Box 4)',
    status: 'In Custody / Searching for Owner',
    isDemo: true,
    finderId: 'user-finder-demo',
    finderName: 'Alex Rivera (Demo)',
    createdAt: '2026-09-16T16:45:00Z',
    preferredHandoff: {
      locationName: 'Library Help Desk',
      landmark: 'Main floor reception desk',
      instructions: 'Available between 10 AM and 5 PM',
    }
  },
  {
    id: 'demo-found-2',
    title: 'Apple Laptop',
    category: 'Electronics',
    brand: 'Apple',
    color: 'Space Gray',
    description: 'Dark gray laptop with an outdoor sticker found on a library desk.',
    imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80',
    location: 'Science Library',
    dateFound: '2026-09-16',
    timeFound: '12:30',
    custodyLocation: 'Science Library Security Desk',
    status: 'In Custody / Searching for Owner',
    isDemo: true,
    finderId: 'user-finder-demo',
    finderName: 'Alex Rivera (Demo)',
    createdAt: '2026-09-16T12:30:00Z',
    preferredHandoff: {
      locationName: 'Science Library Reception',
      landmark: 'Front lobby check-in counter',
      instructions: 'Item is safely checked into library storage',
    }
  },
  {
    id: 'demo-found-3',
    title: 'Dark Blue Leather Wallet',
    category: 'Wallet',
    brand: 'Generic',
    color: 'Dark Blue',
    description: 'Dark blue leather wallet discovered under dining booth table in cafeteria area.',
    imageUrl: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=600&q=80',
    location: 'Student Union',
    dateFound: '2026-09-16',
    timeFound: '19:20',
    custodyLocation: 'Campus Security Center',
    status: 'In Custody / Searching for Owner',
    isDemo: true,
    finderId: 'user-finder-demo',
    finderName: 'Alex Rivera (Demo)',
    createdAt: '2026-09-16T19:20:00Z',
    preferredHandoff: {
      locationName: 'Student Union Info Desk',
      landmark: 'Ground Floor Atrium',
      instructions: 'Can hand over directly during lunchtime',
    }
  },
];

export const INITIAL_LOST_ITEMS = DEMO_LOST_ITEMS;
export const INITIAL_FOUND_ITEMS = DEMO_FOUND_ITEMS;

export const DEMO_USERS = {
  owner: DEFAULT_OWNER_USER,
  finder: DEFAULT_FINDER_USER,
};

export function generateInitialMatches(lostList: LostItem[] = DEMO_LOST_ITEMS, foundList: FoundItem[] = DEMO_FOUND_ITEMS): ItemMatch[] {
  const matches: ItemMatch[] = [];

  // Match: Black Nike Water Bottle (Lost 1 <-> Found 1)
  const l1 = lostList.find((l) => l.id === 'demo-lost-1');
  const f1 = foundList.find((f) => f.id === 'demo-found-1');
  if (l1 && f1) {
    const factors = compute7FactorMatch(l1, f1);
    matches.push({
      id: 'match-101',
      lostItemId: l1.id,
      foundItemId: f1.id,
      lostItem: l1,
      foundItem: f1,
      factors,
      workflowStatus: 'none',
      verificationStatus: 'unverified',
      verificationAttempts: 0,
      returnRequestStatus: 'none',
      handoffStatus: 'pending',
      ownerConfirmedReceived: false,
      finderConfirmedHandoff: false,
      finderPointsAwarded: false,
      ownerProposedLocation: {
        locationName: 'College Library Main Entrance',
        landmark: 'Near the front turnstiles',
        instructions: 'Available after 2 PM',
      },
      finderProposedLocation: {
        locationName: 'Library Help Desk',
        landmark: 'Main floor reception desk',
        instructions: 'Available between 10 AM and 5 PM',
      },
      messages: [],
      createdAt: '2026-09-16T17:00:00Z',
    });
  }

  // Match: Space Gray Apple Laptop (Lost 2 <-> Found 2)
  const l2 = lostList.find((l) => l.id === 'demo-lost-2');
  const f2 = foundList.find((f) => f.id === 'demo-found-2');
  if (l2 && f2) {
    const factors = compute7FactorMatch(l2, f2);
    matches.push({
      id: 'match-102',
      lostItemId: l2.id,
      foundItemId: f2.id,
      lostItem: l2,
      foundItem: f2,
      factors,
      workflowStatus: 'none',
      verificationStatus: 'unverified',
      verificationAttempts: 0,
      returnRequestStatus: 'none',
      handoffStatus: 'pending',
      ownerConfirmedReceived: false,
      finderConfirmedHandoff: false,
      finderPointsAwarded: false,
      ownerProposedLocation: {
        locationName: 'Science Library Information Desk',
        landmark: 'Ground Floor Lobby',
        instructions: 'Available after classes',
      },
      finderProposedLocation: {
        locationName: 'Science Library Reception',
        landmark: 'Front lobby check-in counter',
        instructions: 'Item is in security storage',
      },
      messages: [],
      createdAt: '2026-09-16T13:00:00Z',
    });
  }

  return matches;
}

