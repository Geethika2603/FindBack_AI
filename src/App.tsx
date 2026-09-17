import React, { useState } from 'react';
import { User, LostItem, FoundItem, ItemMatch } from './types';
import { 
  INITIAL_LOST_ITEMS, 
  INITIAL_FOUND_ITEMS, 
  generateInitialMatches,
  DEMO_USERS 
} from './data/mockData';
import { compute7FactorMatch } from './services/aiMatching';
import { LandingPage } from './components/LandingPage';
import { OwnerPortal } from './components/OwnerPortal';
import { FinderPortal } from './components/FinderPortal';
import { Sparkles, X } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [lostItems, setLostItems] = useState<LostItem[]>(INITIAL_LOST_ITEMS);
  const [foundItems, setFoundItems] = useState<FoundItem[]>(INITIAL_FOUND_ITEMS);
  const [matches, setMatches] = useState<ItemMatch[]>(generateInitialMatches());
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Add new Lost Item (from Owner Portal)
  const handleAddLostItem = (newItem: LostItem) => {
    const updatedLost = [newItem, ...lostItems];
    setLostItems(updatedLost);

    // Run 7-factor AI matching against existing found items
    const newMatches: ItemMatch[] = [];
    foundItems.forEach((found) => {
      const factors = compute7FactorMatch(newItem, found);
      if (factors.overallScore >= 40) {
        newMatches.push({
          id: `match-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          lostItemId: newItem.id,
          foundItemId: found.id,
          lostItem: newItem,
          foundItem: found,
          factors,
          verificationStatus: 'unverified',
          returnRequestStatus: 'none',
          handoffStatus: 'pending',
          ownerConfirmedReceived: false,
          finderConfirmedHandoff: false,
          createdAt: new Date().toISOString(),
        });
      }
    });

    if (newMatches.length > 0) {
      setMatches((prev) => [...newMatches, ...prev]);
      showToast(`ReFind AI found ${newMatches.length} candidate match(es) for "${newItem.title}"!`);
    } else {
      showToast(`"${newItem.title}" registered in ledger. AI engine active for incoming found reports.`);
    }
  };

  // Add new Found Item (from Finder Portal)
  const handleAddFoundItem = (newItem: FoundItem) => {
    const updatedFound = [newItem, ...foundItems];
    setFoundItems(updatedFound);

    // Run 7-factor AI matching against existing lost items
    const newMatches: ItemMatch[] = [];
    lostItems.forEach((lost) => {
      const factors = compute7FactorMatch(lost, newItem);
      if (factors.overallScore >= 40) {
        newMatches.push({
          id: `match-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          lostItemId: lost.id,
          foundItemId: newItem.id,
          lostItem: lost,
          foundItem: newItem,
          factors,
          verificationStatus: 'unverified',
          returnRequestStatus: 'none',
          handoffStatus: 'pending',
          ownerConfirmedReceived: false,
          finderConfirmedHandoff: false,
          createdAt: new Date().toISOString(),
        });
      }
    });

    if (newMatches.length > 0) {
      setMatches((prev) => [...newMatches, ...prev]);
      showToast(`Found item logged in custody. ReFind AI detected ${newMatches.length} matching lost report(s)!`);
    } else {
      showToast(`"${newItem.title}" safely registered in custody.`);
    }
  };

  // Update existing match (verification status, return acceptance, etc.)
  const handleUpdateMatch = (updatedMatch: ItemMatch) => {
    setMatches((prev) =>
      prev.map((m) => (m.id === updatedMatch.id ? updatedMatch : m))
    );
  };

  // Owner confirms receipt of the physical item
  const handleConfirmRecovery = (matchId: string) => {
    const targetMatch = matches.find((m) => m.id === matchId);
    if (!targetMatch) return;

    const updatedMatch: ItemMatch = {
      ...targetMatch,
      ownerConfirmedReceived: true,
      handoffStatus: 'completed',
    };

    setMatches((prev) =>
      prev.map((m) => (m.id === matchId ? updatedMatch : m))
    );

    // Update lost and found item statuses
    setLostItems((prev) =>
      prev.map((l) =>
        l.id === targetMatch.lostItem.id ? { ...l, status: 'Recovered' } : l
      )
    );
    setFoundItems((prev) =>
      prev.map((f) =>
        f.id === targetMatch.foundItem.id ? { ...f, status: 'Recovered' } : f
      )
    );

    showToast('Success! Item marked as RECOVERED. +100 Reward Points credited to the Finder.');
  };

  return (
    <>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md p-4 rounded-xl bg-slate-900 border border-cyan-500/40 shadow-2xl flex items-start space-x-3">
          <div className="p-1 rounded bg-cyan-500/20 text-cyan-400 mt-0.5">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="flex-1 text-xs text-slate-200 leading-relaxed font-medium">
            {toastMessage}
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Screen Routing */}
      {!currentUser ? (
        <LandingPage onLogin={setCurrentUser} />
      ) : currentUser.role === 'OWNER' ? (
        <OwnerPortal
          user={currentUser}
          lostItems={lostItems}
          foundItems={foundItems}
          matches={matches}
          onAddLostItem={handleAddLostItem}
          onUpdateMatch={handleUpdateMatch}
          onConfirmRecovery={handleConfirmRecovery}
          onLogout={() => setCurrentUser(null)}
        />
      ) : (
        <FinderPortal
          user={currentUser}
          foundItems={foundItems}
          lostItems={lostItems}
          matches={matches}
          onAddFoundItem={handleAddFoundItem}
          onUpdateMatch={handleUpdateMatch}
          onLogout={() => setCurrentUser(null)}
        />
      )}
    </>
  );
}

