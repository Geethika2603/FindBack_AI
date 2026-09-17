import React, { useState } from 'react';
import { User, LostItem, FoundItem, ItemMatch, ChatMessage, HandoffLocationPreference, UserRole } from './types';
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
import { Sparkles, X, CheckCircle } from 'lucide-react';

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
      if (factors.overallScore >= 35) {
        newMatches.push({
          id: `match-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          lostItemId: newItem.id,
          foundItemId: found.id,
          lostItem: newItem,
          foundItem: found,
          factors,
          workflowStatus: 'none',
          verificationStatus: 'unverified',
          returnRequestStatus: 'none',
          handoffStatus: 'pending',
          ownerConfirmedReceived: false,
          finderConfirmedHandoff: false,
          finderPointsAwarded: false,
          ownerProposedLocation: newItem.preferredHandoff,
          finderProposedLocation: found.preferredHandoff,
          messages: [],
          createdAt: new Date().toISOString(),
        });
      }
    });

    if (newMatches.length > 0) {
      setMatches((prev) => [...newMatches, ...prev]);
      showToast(`ReFind AI found ${newMatches.length} candidate match(es) for "${newItem.title}"!`);
    } else {
      showToast(`✓ "${newItem.title}" saved. ReFind AI is actively searching for matches.`);
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
      if (factors.overallScore >= 35) {
        newMatches.push({
          id: `match-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          lostItemId: lost.id,
          foundItemId: newItem.id,
          lostItem: lost,
          foundItem: newItem,
          factors,
          workflowStatus: 'none',
          verificationStatus: 'unverified',
          returnRequestStatus: 'none',
          handoffStatus: 'pending',
          ownerConfirmedReceived: false,
          finderConfirmedHandoff: false,
          finderPointsAwarded: false,
          ownerProposedLocation: lost.preferredHandoff,
          finderProposedLocation: newItem.preferredHandoff,
          messages: [],
          createdAt: new Date().toISOString(),
        });
      }
    });

    if (newMatches.length > 0) {
      setMatches((prev) => [...newMatches, ...prev]);
      showToast(`Found item logged in custody. ReFind AI detected ${newMatches.length} matching lost report(s)!`);
    } else {
      showToast(`✓ "${newItem.title}" registered in custody.`);
    }
  };

  // Update existing match
  const handleUpdateMatch = (updatedMatch: ItemMatch) => {
    setMatches((prev) =>
      prev.map((m) => (m.id === updatedMatch.id ? updatedMatch : m))
    );
  };

  // Owner requests return of an item from Finder
  const handleRequestReturn = (matchId: string) => {
    setMatches((prev) =>
      prev.map((m) => {
        if (m.id === matchId) {
          return {
            ...m,
            workflowStatus: 'return_requested',
            returnRequestStatus: 'pending',
            requestDate: new Date().toISOString(),
            messages: [
              ...m.messages,
              {
                id: `msg-${Date.now()}`,
                matchId: m.id,
                senderId: m.lostItem.ownerId || 'owner',
                senderName: m.lostItem.ownerName || 'Owner',
                senderRole: 'owner',
                text: `Hello! I have reviewed this match and requested the return of my item (${m.lostItem.title}). Please let me know when you can meet.`,
                timestamp: new Date().toISOString(),
              }
            ]
          };
        }
        return m;
      })
    );
    showToast('Return request sent to Finder! Status: Return Requested.');
  };

  // Finder accepts the return request
  const handleAcceptReturn = (matchId: string) => {
    setMatches((prev) =>
      prev.map((m) => {
        if (m.id === matchId) {
          return {
            ...m,
            workflowStatus: 'return_accepted',
            returnRequestStatus: 'accepted',
            messages: [
              ...m.messages,
              {
                id: `msg-${Date.now()}`,
                matchId: m.id,
                senderId: m.foundItem.finderId || 'finder',
                senderName: m.foundItem.finderName || 'Finder',
                senderRole: 'finder',
                text: `I have accepted your return request. Let's agree on the safe handoff location below!`,
                timestamp: new Date().toISOString(),
              }
            ]
          };
        }
        return m;
      })
    );

    // Award +20 points for accepted return
    if (currentUser && currentUser.role.toLowerCase() === 'finder') {
      setCurrentUser((prev) => prev ? { ...prev, rewardPoints: (prev.rewardPoints || 0) + 20 } : null);
    }
    showToast('Return request ACCEPTED! Communication & Safe Handoff unlocked. (+20 Finder Credits)');
  };

  // Finder declines the return request
  const handleDeclineReturn = (matchId: string) => {
    setMatches((prev) =>
      prev.map((m) =>
        m.id === matchId
          ? { ...m, workflowStatus: 'return_declined', returnRequestStatus: 'declined' }
          : m
      )
    );
    showToast('Return request declined.');
  };

  // In-app message exchange between matched Owner & Finder
  const handleSendMessage = (matchId: string, text: string, senderId: string, senderName: string, senderRole: UserRole) => {
    if (!text.trim()) return;
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      matchId,
      senderId,
      senderName,
      senderRole,
      text: text.trim(),
      timestamp: new Date().toISOString(),
    };

    setMatches((prev) =>
      prev.map((m) =>
        m.id === matchId ? { ...m, messages: [...m.messages, newMsg] } : m
      )
    );
  };

  // Propose handoff location
  const handleProposeLocation = (matchId: string, role: UserRole, loc: HandoffLocationPreference) => {
    setMatches((prev) =>
      prev.map((m) => {
        if (m.id === matchId) {
          if (role === 'owner') {
            return { ...m, ownerProposedLocation: loc };
          } else {
            return { ...m, finderProposedLocation: loc };
          }
        }
        return m;
      })
    );
    showToast('Handoff location suggestion updated.');
  };

  // Confirm agreed handoff location
  const handleConfirmLocation = (matchId: string, agreedLoc: HandoffLocationPreference) => {
    setMatches((prev) =>
      prev.map((m) => {
        if (m.id === matchId) {
          return {
            ...m,
            agreedLocation: agreedLoc,
            workflowStatus: 'location_confirmed',
            handoffStatus: 'agreed',
            messages: [
              ...m.messages,
              {
                id: `msg-${Date.now()}`,
                matchId: m.id,
                senderId: 'system',
                senderName: 'ReFind Safe Handoff',
                senderRole: 'finder',
                text: `Handoff location agreed: ${agreedLoc.locationName} (${agreedLoc.landmark}). Instructions: ${agreedLoc.instructions}`,
                timestamp: new Date().toISOString(),
              }
            ]
          };
        }
        return m;
      })
    );
    showToast('Handoff location confirmed! Status: Handoff Scheduled.');
  };

  // Finder marks item handed over
  const handleFinderHandedOver = (matchId: string) => {
    setMatches((prev) =>
      prev.map((m) =>
        m.id === matchId
          ? { ...m, finderConfirmedHandoff: true, workflowStatus: 'item_handed_over' }
          : m
      )
    );
    showToast('Item marked as HANDED OVER by Finder. Awaiting Owner receipt confirmation.');
  };

  // Owner confirms receipt of the physical item -> Completes case and awards Finder +100 Credits
  const handleConfirmRecovery = (matchId: string) => {
    const targetMatch = matches.find((m) => m.id === matchId);
    if (!targetMatch) return;

    const updatedMatch: ItemMatch = {
      ...targetMatch,
      ownerConfirmedReceived: true,
      finderPointsAwarded: true,
      workflowStatus: 'completed',
      handoffStatus: 'completed',
    };

    setMatches((prev) =>
      prev.map((m) => (m.id === matchId ? updatedMatch : m))
    );

    // Update lost and found item statuses
    setLostItems((prev) =>
      prev.map((l) =>
        l.id === targetMatch.lostItemId ? { ...l, status: 'Recovered' } : l
      )
    );
    setFoundItems((prev) =>
      prev.map((f) =>
        f.id === targetMatch.foundItemId ? { ...f, status: 'Recovered' } : f
      )
    );

    // If active user is finder, award points directly
    if (currentUser && currentUser.role.toLowerCase() === 'finder') {
      setCurrentUser((prev) =>
        prev
          ? {
              ...prev,
              rewardPoints: (prev.rewardPoints || 0) + 100,
              successfulReturns: (prev.successfulReturns || 0) + 1,
            }
          : null
      );
    }

    showToast('Success! Receipt confirmed. Item marked as RECOVERED and +100 Finder Credits awarded!');
  };

  const isOwner = currentUser?.role?.toLowerCase() === 'owner';

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
      ) : isOwner ? (
        <OwnerPortal
          user={currentUser}
          lostItems={lostItems}
          foundItems={foundItems}
          matches={matches}
          onAddLostItem={handleAddLostItem}
          onUpdateMatch={handleUpdateMatch}
          onRequestReturn={handleRequestReturn}
          onSendMessage={handleSendMessage}
          onProposeLocation={handleProposeLocation}
          onConfirmLocation={handleConfirmLocation}
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
          onAcceptReturn={handleAcceptReturn}
          onDeclineReturn={handleDeclineReturn}
          onSendMessage={handleSendMessage}
          onProposeLocation={handleProposeLocation}
          onConfirmLocation={handleConfirmLocation}
          onFinderHandedOver={handleFinderHandedOver}
          onLogout={() => setCurrentUser(null)}
        />
      )}
    </>
  );
}

