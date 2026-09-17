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
    title: 'Black Water Bottle',
    category: 'Bottle',
    brand: 'Nike',
    color: 'Black',
    description: 'Black stainless steel Nike sport water bottle with white swoosh logo on the side.',
    imageUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=600&q=80',
    location: 'University Library',
    dateLost: '2026-09-16',
    timeLost: '14:30',
    privateFeatures: {
      feature1: 'Small dent on bottom rim',
      feature2: 'Silver carabiner clip on cap ring',
      feature3: 'Initials SJ marked in silver marker under base',
    },
    status: 'Possible Match',
    isDemo: true,
    ownerId: 'user-owner-demo',
    ownerName: 'Sarah Jenkins (Demo)',
    createdAt: '2026-09-16T14:30:00Z',
    preferredHandoff: {
      locationName: 'University Library Main Entrance',
      landmark: 'Near the turnstiles',
      instructions: 'Meet inside the lobby by the reception guard table',
    }
  },
  {
    id: 'demo-lost-2',
    title: 'Space Gray Laptop',
    category: 'Electronics',
    brand: 'Apple',
    color: 'Space Gray',
    description: '13-inch Apple MacBook Air in Space Gray with smooth aluminum body.',
    imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80',
    location: 'Science Library',
    dateLost: '2026-09-16',
    timeLost: '11:15',
    privateFeatures: {
      feature1: 'Yosemite National Park sticker on upper lid corner',
      feature2: 'Small hairline scratch near the left USB-C charging port',
      feature3: 'Aurora borealis wallpaper on lock screen',
    },
    status: 'Matched',
    isDemo: true,
    ownerId: 'user-owner-demo',
    ownerName: 'Sarah Jenkins (Demo)',
    createdAt: '2026-09-16T11:15:00Z',
    preferredHandoff: {
      locationName: 'Science Library Desk',
      landmark: '2nd Floor Quiet Zone Desk',
      instructions: 'Ask for Librarian check',
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
      feature1: 'Bronze small key hidden in internal fold flap',
      feature2: 'Metro student monthly pass in second card slot',
      feature3: 'Subtle monogram SJ pressed on interior corner',
    },
    status: 'Waiting for Match',
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
    description: 'Found black Nike insulated bottle left behind on 2nd floor study table near window.',
    imageUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=600&q=80',
    location: 'University Library',
    dateFound: '2026-09-16',
    timeFound: '16:45',
    custodyLocation: 'University Library Front Help Desk (Storage Box 4)',
    status: 'Possible Match',
    isDemo: true,
    finderId: 'user-finder-demo',
    finderName: 'Alex Rivera (Demo)',
    createdAt: '2026-09-16T16:45:00Z',
    preferredHandoff: {
      locationName: 'University Library Main Entrance',
      landmark: 'Near the turnstiles',
      instructions: 'I am available after 3 PM near the front security desk',
    }
  },
  {
    id: 'demo-found-2',
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
    status: 'Possible Match',
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
  {
    id: 'demo-found-3',
    title: 'Set of Brass Keys',
    category: 'Keys',
    brand: 'Generic',
    color: 'Brass',
    description: 'Set of 3 brass house & bicycle keys attached to a black fabric lanyard with gym tag.',
    imageUrl: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=600&q=80',
    location: 'Gym Reception',
    dateFound: '2026-09-17',
    timeFound: '09:10',
    custodyLocation: 'Gym Front Counter Lost Bin',
    status: 'Open',
    isDemo: true,
    finderId: 'user-finder-demo',
    finderName: 'Alex Rivera (Demo)',
    createdAt: '2026-09-17T09:10:00Z',
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

  // Match: Black Water Bottle (Lost 1 <-> Found 1)
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
      verificationStatus: 'unverified',
      verificationAttempts: 0,
      returnRequestStatus: 'none',
      handoffStatus: 'pending',
      ownerConfirmedReceived: false,
      finderPointsAwarded: false,
      createdAt: '2026-09-16T17:00:00Z',
    });
  }

  // Match: Dark Blue Leather Wallet (Lost 3 <-> Found 2)
  const l3 = lostList.find((l) => l.id === 'demo-lost-3');
  const f2 = foundList.find((f) => f.id === 'demo-found-2');
  if (l3 && f2) {
    const factors = compute7FactorMatch(l3, f2);
    matches.push({
      id: 'match-102',
      lostItemId: l3.id,
      foundItemId: f2.id,
      lostItem: l3,
      foundItem: f2,
      factors,
      verificationStatus: 'unverified',
      verificationAttempts: 0,
      returnRequestStatus: 'none',
      handoffStatus: 'pending',
      ownerConfirmedReceived: false,
      finderPointsAwarded: false,
      createdAt: '2026-09-16T19:40:00Z',
    });
  }

  return matches;
}

