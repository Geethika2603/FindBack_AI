import React, { useState } from 'react';
import { User, LostItem, FoundItem, ItemMatch, OwnerNavTab, HandoffLocationPreference } from '../types';
import { 
  Search, PlusCircle, CheckCircle2, AlertTriangle, ShieldCheck, 
  MapPin, Calendar, Clock, LogOut, ArrowRight, Eye, EyeOff, 
  Tag, Sparkles, Layers, Check, XCircle, HelpCircle, CornerDownRight, ThumbsUp
} from 'lucide-react';
import { compute7FactorMatch } from '../services/aiMatching';

interface OwnerPortalProps {
  user: User;
  lostItems: LostItem[];
  foundItems: FoundItem[];
  matches: ItemMatch[];
  onAddLostItem: (item: LostItem) => void;
  onUpdateMatch: (match: ItemMatch) => void;
  onConfirmRecovery: (matchId: string) => void;
  onLogout: () => void;
}

export const OwnerPortal: React.FC<OwnerPortalProps> = ({
  user,
  lostItems,
  foundItems,
  matches,
  onAddLostItem,
  onUpdateMatch,
  onConfirmRecovery,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<OwnerNavTab>('dashboard');
  const [selectedMatchId, setSelectedMatchId] = useState<string>(matches[0]?.id || '');
  const [showDemoItemsTab, setShowDemoItemsTab] = useState<boolean>(false);

  // Form states for Report Lost Item
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Bottle');
  const [brand, setBrand] = useState('');
  const [color, setColor] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [location, setLocation] = useState('');
  const [dateLost, setDateLost] = useState(new Date().toISOString().split('T')[0]);
  const [timeLost, setTimeLost] = useState('14:00');
  const [feature1, setFeature1] = useState('');
  const [feature2, setFeature2] = useState('');
  const [feature3, setFeature3] = useState('');
  const [handoffLocName, setHandoffLocName] = useState('University Library Entrance');
  const [handoffLandmark, setHandoffLandmark] = useState('Front Security Desk');
  const [handoffInstructions, setHandoffInstructions] = useState('Available after 2 PM');
  const [formSuccess, setFormSuccess] = useState(false);

  // Verification form state
  const [answer1, setAnswer1] = useState('');
  const [answer2, setAnswer2] = useState('');
  const [answer3, setAnswer3] = useState('');
  const [verificationFeedback, setVerificationFeedback] = useState<{ status: 'idle' | 'success' | 'failed'; message: string }>({
    status: 'idle',
    message: '',
  });

  // Toggle reveal for user's own private features on My Lost Items
  const [revealedPrivateId, setRevealedPrivateId] = useState<string | null>(null);

  // Filter user's real lost items vs demo
  const userLostItems = lostItems.filter((item) => !item.isDemo && (item.ownerId === user.id || !item.ownerId));
  const demoLostItems = lostItems.filter((item) => item.isDemo);

  // Current active match for verification or handoff
  const activeMatch = matches.find((m) => m.id === selectedMatchId) || matches[0];

  // Stats calculation
  const totalUserLost = userLostItems.length;
  const activeMatchesCount = matches.filter((m) => m.factors.overallScore >= 60).length;
  const pendingVerificationCount = matches.filter((m) => m.verificationStatus === 'unverified' || m.verificationStatus === 'in_progress').length;
  const recoveredCount = lostItems.filter((item) => item.status === 'Recovered').length;

  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newItem: LostItem = {
      id: `user-lost-${Date.now()}`,
      title: title.trim(),
      category: category.trim(),
      brand: brand.trim() || 'Generic',
      color: color.trim(),
      description: description.trim(),
      imageUrl: imageUrl.trim() || undefined,
      location: location.trim(),
      dateLost,
      timeLost,
      privateFeatures: {
        feature1: feature1.trim(),
        feature2: feature2.trim(),
        feature3: feature3.trim(),
      },
      status: 'Waiting for Match',
      isDemo: false,
      ownerId: user.id,
      ownerName: user.name,
      createdAt: new Date().toISOString(),
      preferredHandoff: {
        locationName: handoffLocName.trim(),
        landmark: handoffLandmark.trim(),
        instructions: handoffInstructions.trim(),
      }
    };

    onAddLostItem(newItem);
    setFormSuccess(true);
    setTimeout(() => {
      setFormSuccess(false);
      // Reset fields
      setTitle('');
      setBrand('');
      setColor('');
      setDescription('');
      setImageUrl('');
      setLocation('');
      setFeature1('');
      setFeature2('');
      setFeature3('');
      setActiveTab('my_lost_items');
    }, 1200);
  };

  // Ownership verification logic (checks 2 out of 3 against lost item's private features)
  const handleVerifyOwnership = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeMatch) return;

    const priv = activeMatch.lostItem.privateFeatures;
    const checkMatch = (userAns: string, actual: string) => {
      if (!userAns || !actual) return false;
      const u = userAns.toLowerCase().trim();
      const a = actual.toLowerCase().trim();
      if (u === a) return true;
      // check significant overlap
      const uWords = u.split(/\s+/).filter(w => w.length > 2);
      const matched = uWords.filter(w => a.includes(w));
      return matched.length >= 1 || a.includes(u) || u.includes(a);
    };

    let score = 0;
    if (checkMatch(answer1, priv.feature1)) score++;
    if (checkMatch(answer2, priv.feature2)) score++;
    if (checkMatch(answer3, priv.feature3)) score++;

    if (score >= 2) {
      const updated: ItemMatch = {
        ...activeMatch,
        verificationStatus: 'verified',
        returnRequestStatus: 'pending',
        handoffStatus: 'pending',
      };
      onUpdateMatch(updated);
      setVerificationFeedback({
        status: 'success',
        message: `✓ Ownership Verified! (${score}/3 challenge criteria matched). Return request submitted to the Finder.`,
      });
      // Clear inputs for security
      setAnswer1('');
      setAnswer2('');
      setAnswer3('');
    } else {
      const updated: ItemMatch = {
        ...activeMatch,
        verificationStatus: 'failed',
        verificationAttempts: (activeMatch.verificationAttempts || 0) + 1,
      };
      onUpdateMatch(updated);
      setVerificationFeedback({
        status: 'failed',
        message: `✗ Ownership could not be verified (${score}/3 matches). Please check your private records and try again.`,
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#070d18] text-slate-100 flex flex-col font-sans">
      {/* Top Owner Navigation Bar */}
      <header className="border-b border-rose-950/40 bg-[#0c1220]/95 backdrop-blur sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-600 to-rose-400 flex items-center justify-center font-black text-white text-base shadow-lg shadow-rose-600/20">
              R
            </div>
            <div>
              <div className="font-bold text-white text-sm sm:text-base flex items-center gap-2">
                ReFind AI
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30">
                  Owner Portal
                </span>
              </div>
              <div className="text-[11px] text-slate-400">Lost Item Recovery Workspace</div>
            </div>
          </div>

          {/* User badge and logout */}
          <div className="flex items-center space-x-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
              <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              <span className="font-semibold text-slate-200">{user.name}</span>
              <span className="text-slate-400 text-[11px]">({user.role})</span>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-xs font-semibold text-rose-300 border border-rose-900/40 hover:border-rose-700 transition"
              title="Switch role or logout"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation Menu */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex overflow-x-auto space-x-1 py-1 border-t border-slate-800/60 scrollbar-none">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
              activeTab === 'dashboard'
                ? 'bg-rose-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('report_lost')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
              activeTab === 'report_lost'
                ? 'bg-rose-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5 text-rose-400" />
            <span>Report Lost Item</span>
          </button>

          <button
            onClick={() => setActiveTab('my_lost_items')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
              activeTab === 'my_lost_items'
                ? 'bg-rose-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>My Lost Items</span>
            {userLostItems.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-rose-950 text-rose-300 text-[10px] font-bold border border-rose-700">
                {userLostItems.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('possible_matches')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
              activeTab === 'possible_matches'
                ? 'bg-rose-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Possible Matches</span>
            {matches.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-cyan-950 text-cyan-300 text-[10px] font-bold border border-cyan-700">
                {matches.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('verification')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
              activeTab === 'verification'
                ? 'bg-rose-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
            <span>Verification</span>
          </button>

          <button
            onClick={() => setActiveTab('handoff')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
              activeTab === 'handoff'
                ? 'bg-rose-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            <span>Handoff & Recovery</span>
          </button>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        
        {/* VIEW 1: DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            
            {/* Welcome banner */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-rose-950/40 via-slate-900 to-slate-900 border border-rose-800/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <span className="text-xs uppercase font-bold tracking-wider text-rose-400">
                  Owner Dashboard
                </span>
                <h2 className="text-2xl font-bold text-white mt-1">
                  Welcome, {user.name}!
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
                  Track your lost belongings, view computed 7-factor AI matches, securely verify ownership, and coordinate safe recovery.
                </p>
              </div>
              <button
                onClick={() => setActiveTab('report_lost')}
                className="py-3 px-5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-rose-600/30 transition shrink-0 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>+ Report Lost Item</span>
              </button>
            </div>

            {/* Metric Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center font-bold">
                  <Search className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xl font-bold text-white">{userLostItems.length}</div>
                  <div className="text-xs text-slate-400">My Lost Items</div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xl font-bold text-cyan-300">{activeMatchesCount}</div>
                  <div className="text-xs text-slate-400">Possible Matches</div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xl font-bold text-indigo-300">{pendingVerificationCount}</div>
                  <div className="text-xs text-slate-400">Verification Pending</div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xl font-bold text-emerald-300">{recoveredCount}</div>
                  <div className="text-xs text-slate-400">Items Recovered</div>
                </div>
              </div>
            </div>

            {/* Quick Actions & Recent Matches */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left 2 Cols: Candidate Matches */}
              <div className="lg:col-span-2 rounded-2xl bg-slate-900/90 border border-slate-800 p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-rose-400" />
                    <h3 className="font-bold text-sm text-white">AI Match Alerts for Your Items</h3>
                  </div>
                  <button
                    onClick={() => setActiveTab('possible_matches')}
                    className="text-xs text-rose-400 hover:text-rose-300 font-semibold"
                  >
                    View All ({matches.length}) &rarr;
                  </button>
                </div>

                {matches.length === 0 ? (
                  <div className="text-center py-10 text-slate-400 text-xs">
                    No active matches found yet. The AI engine continuously checks incoming found reports.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {matches.slice(0, 3).map((match) => (
                      <div
                        key={match.id}
                        className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 hover:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition"
                      >
                        <div className="flex items-center gap-3">
                          {match.lostItem.imageUrl ? (
                            <img
                              src={match.lostItem.imageUrl}
                              alt={match.lostItem.title}
                              className="w-14 h-14 rounded-lg object-cover border border-slate-700"
                            />
                          ) : (
                            <div className="w-14 h-14 rounded-lg bg-slate-800 flex items-center justify-center text-slate-500">
                              <Tag className="w-6 h-6" />
                            </div>
                          )}
                          <div>
                            <div className="font-bold text-sm text-white">{match.lostItem.title}</div>
                            <div className="text-xs text-slate-400">
                              Match with found item at <span className="text-slate-200">{match.foundItem.location}</span>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs font-bold text-rose-400">
                                Match Score: {match.factors.overallScore}%
                              </span>
                              <span className="text-slate-600">&bull;</span>
                              <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                                match.verificationStatus === 'verified'
                                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                  : 'bg-amber-950 text-amber-300 border border-amber-800'
                              }`}>
                                {match.verificationStatus === 'verified' ? 'Verified' : 'Verification Needed'}
                              </span>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            setSelectedMatchId(match.id);
                            setActiveTab('verification');
                          }}
                          className="w-full sm:w-auto py-2 px-3.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Verify Ownership</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Col: Recovery Guidelines */}
              <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                  <ShieldCheck className="w-4 h-4 text-indigo-400" />
                  <h3 className="font-bold text-sm text-white">Owner Security Protocol</h3>
                </div>

                <div className="space-y-3 text-xs text-slate-300">
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80">
                    <span className="font-semibold text-rose-300 block mb-1">1. Encrypted Private Features</span>
                    Your 3 private identifying features are never revealed to the Finder or public.
                  </div>

                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80">
                    <span className="font-semibold text-rose-300 block mb-1">2. 2/3 Verification Challenge</span>
                    To unlock return handoff, you must answer at least 2 out of 3 private security questions correctly.
                  </div>

                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80">
                    <span className="font-semibold text-rose-300 block mb-1">3. Safe Public Handoff</span>
                    Agree on designated campus landmarks (Libraries, Reception desks) for safe in-person collection.
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab('report_lost')}
                  className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition"
                >
                  Register Another Lost Item
                </button>
              </div>

            </div>

          </div>
        )}

        {/* VIEW 2: REPORT LOST ITEM */}
        {activeTab === 'report_lost' && (
          <div className="max-w-3xl mx-auto rounded-2xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl">
            <div className="border-b border-slate-800 pb-4 mb-6">
              <span className="text-xs uppercase font-bold tracking-wider text-rose-400">
                Owner Report Form
              </span>
              <h2 className="text-2xl font-bold text-white mt-1">Report a Lost Item</h2>
              <p className="text-xs text-slate-400 mt-1">
                Provide accurate details. The ReFind AI 7-factor engine will compare against reported found items.
              </p>
            </div>

            {formSuccess && (
              <div className="mb-6 p-4 rounded-xl bg-emerald-950 border border-emerald-600/50 text-emerald-200 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>Lost item logged successfully! Scanning incoming reports with AI matching...</span>
              </div>
            )}

            <form onSubmit={handleReportSubmit} className="space-y-5">
              
              {/* Basic Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Item Name *</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Black Water Bottle"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-rose-500"
                  >
                    <option value="Bottle">Bottle / Drinkware</option>
                    <option value="Electronics">Electronics / Laptops</option>
                    <option value="Wallet">Wallet / Purse</option>
                    <option value="Keys">Keys / Access Card</option>
                    <option value="Audio">Headphones & Audio</option>
                    <option value="Clothing">Clothing & Accessories</option>
                    <option value="Other">Other Miscellaneous</option>
                  </select>
                </div>
              </div>

              {/* Brand and Color */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Brand *</label>
                  <input
                    type="text"
                    required
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="e.g. Nike, Apple, Bellroy, or Generic"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Color *</label>
                  <input
                    type="text"
                    required
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    placeholder="e.g. Black, Space Gray, Dark Blue"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Description *</label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe noticeable visual characteristics, model details, or stickers (do not include private verification features here)..."
                  className="w-full px-3.5 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-rose-500"
                />
              </div>

              {/* Image Upload or URL */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Upload Item Image (Optional)</label>
                <div className="flex flex-col sm:flex-row gap-3 items-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileUpload}
                    className="text-xs text-slate-400 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-rose-300 hover:file:bg-slate-700"
                  />
                  <span className="text-slate-500 text-xs">or URL:</span>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://..."
                    className="flex-1 px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-rose-500"
                  />
                </div>
                {imageUrl && (
                  <div className="mt-2">
                    <img src={imageUrl} alt="Preview" className="w-20 h-20 rounded-lg object-cover border border-slate-700" />
                  </div>
                )}
              </div>

              {/* Location and Date/Time */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Location Where Lost *</label>
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. University Library"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Date Lost *</label>
                  <input
                    type="date"
                    required
                    value={dateLost}
                    onChange={(e) => setDateLost(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Time Lost *</label>
                  <input
                    type="time"
                    required
                    value={timeLost}
                    onChange={(e) => setTimeLost(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              {/* Private Identifying Features (CRITICAL FOR VERIFICATION) */}
              <div className="p-4 rounded-xl bg-[#131929] border border-rose-500/30 space-y-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-rose-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Private Identifying Information (Used for Ownership Verification)
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Enter 3 secret details only you as the true owner would know (e.g. engravings, wallpaper, hidden contents, stickers, or specific scratches). 
                  <strong className="text-rose-300"> These details are strictly encrypted and NEVER shown to the Finder.</strong>
                </p>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Private Feature 1 *</label>
                  <input
                    type="text"
                    required
                    value={feature1}
                    onChange={(e) => setFeature1(e.target.value)}
                    placeholder="e.g. Small dent on bottom rim"
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Private Feature 2 *</label>
                  <input
                    type="text"
                    required
                    value={feature2}
                    onChange={(e) => setFeature2(e.target.value)}
                    placeholder="e.g. Silver carabiner clip on cap ring"
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Private Feature 3 *</label>
                  <input
                    type="text"
                    required
                    value={feature3}
                    onChange={(e) => setFeature3(e.target.value)}
                    placeholder="e.g. Initials SJ marked in silver ink under base"
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              {/* Preferred Handoff Location */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-white">Preferred Safe Handoff Location</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-300 mb-1">Location Name</label>
                    <input
                      type="text"
                      value={handoffLocName}
                      onChange={(e) => setHandoffLocName(e.target.value)}
                      placeholder="e.g. University Library Main Entrance"
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-300 mb-1">Landmark</label>
                    <input
                      type="text"
                      value={handoffLandmark}
                      onChange={(e) => setHandoffLandmark(e.target.value)}
                      placeholder="e.g. Near Front Security Desk"
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] text-slate-300 mb-1">Additional Instructions</label>
                  <input
                    type="text"
                    value={handoffInstructions}
                    onChange={(e) => setHandoffInstructions(e.target.value)}
                    placeholder="e.g. Available weekdays after 2 PM"
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('dashboard')}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30 transition cursor-pointer"
                >
                  Submit Lost Item Report
                </button>
              </div>

            </form>
          </div>
        )}

        {/* VIEW 3: MY LOST ITEMS */}
        {activeTab === 'my_lost_items' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-xl font-bold text-white">My Lost Items</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Items you have registered in the ReFind AI ledger. Real user records are kept separate from demo data.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowDemoItemsTab(!showDemoItemsTab)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                    showDemoItemsTab
                      ? 'bg-amber-950/60 text-amber-300 border-amber-700'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  {showDemoItemsTab ? 'Hide Demo Data' : 'View Demo Reference Items (3)'}
                </button>
                <button
                  onClick={() => setActiveTab('report_lost')}
                  className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow"
                >
                  + Report New
                </button>
              </div>
            </div>

            {/* REAL USER ITEMS SECTION */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-400">
                  User Registered Items ({userLostItems.length})
                </span>
              </div>

              {userLostItems.length === 0 ? (
                <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                    <Search className="w-6 h-6" />
                  </div>
                  <div className="text-sm font-semibold text-slate-300">No lost items registered yet</div>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Click "Report Lost Item" to log your missing property with encrypted private features.
                  </p>
                  <button
                    onClick={() => setActiveTab('report_lost')}
                    className="py-2 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold inline-flex items-center gap-1.5"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Report Lost Item Now</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {userLostItems.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-2xl bg-slate-900 border border-slate-800 p-5 flex flex-col justify-between space-y-4 hover:border-slate-700 transition"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                            {item.category}
                          </span>
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                            item.status === 'Recovered'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              : item.status === 'Possible Match'
                              ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                              : 'bg-slate-800 text-slate-300'
                          }`}>
                            {item.status}
                          </span>
                        </div>

                        {item.imageUrl && (
                          <img
                            src={item.imageUrl}
                            alt={item.title}
                            className="w-full h-36 rounded-xl object-cover border border-slate-800 mb-3"
                          />
                        )}

                        <h3 className="text-base font-bold text-white">{item.title}</h3>
                        <p className="text-xs text-slate-400 mt-1 line-clamp-2">{item.description}</p>

                        <div className="mt-3 space-y-1 text-xs text-slate-300">
                          <div className="flex items-center gap-1.5">
                            <Tag className="w-3.5 h-3.5 text-slate-500" />
                            <span>Brand: <strong className="text-white">{item.brand}</strong> | Color: <strong className="text-white">{item.color}</strong></span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-slate-500" />
                            <span>{item.location}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-slate-500" />
                            <span>{item.dateLost} at {item.timeLost}</span>
                          </div>
                        </div>
                      </div>

                      {/* Private Features viewer for Owner */}
                      <div className="pt-3 border-t border-slate-800">
                        <button
                          onClick={() => setRevealedPrivateId(revealedPrivateId === item.id ? null : item.id)}
                          className="w-full py-1.5 px-3 rounded-lg bg-slate-950 text-[11px] font-semibold text-rose-300 border border-slate-800 hover:border-rose-700/50 flex items-center justify-between"
                        >
                          <span className="flex items-center gap-1.5">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>My Private Features</span>
                          </span>
                          {revealedPrivateId === item.id ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>

                        {revealedPrivateId === item.id && (
                          <div className="mt-2 p-3 rounded-lg bg-slate-950 border border-rose-900/40 text-[11px] space-y-1 text-slate-300">
                            <div><strong className="text-rose-400">1:</strong> {item.privateFeatures.feature1}</div>
                            <div><strong className="text-rose-400">2:</strong> {item.privateFeatures.feature2}</div>
                            <div><strong className="text-rose-400">3:</strong> {item.privateFeatures.feature3}</div>
                            <div className="text-[10px] text-slate-500 mt-1 italic">Private to you. Used during verification.</div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* DEMO ITEMS REFERENCE (Clearly distinguished) */}
            {showDemoItemsTab && (
              <div className="pt-6 border-t border-slate-800/80">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-600/40">
                    DEMO DATA REFERENCE (3 Items)
                  </span>
                  <span className="text-xs text-slate-400">&mdash; Pre-entered demo records</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {demoLostItems.map((demo) => (
                    <div
                      key={demo.id}
                      className="rounded-xl bg-[#0e1625] border border-amber-600/30 p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-600/30">
                          DEMO DATA
                        </span>
                        <span className="text-[11px] font-bold text-rose-300">{demo.status}</span>
                      </div>

                      <h4 className="font-bold text-white text-sm">{demo.title}</h4>
                      <div className="text-xs text-slate-400 space-y-0.5">
                        <div>Category: {demo.category} | Brand: {demo.brand}</div>
                        <div>Color: {demo.color} | Loc: {demo.location}</div>
                        <div>Date: {demo.dateLost}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

        {/* VIEW 4: POSSIBLE MATCHES (7-FACTOR ENGINE) */}
        {activeTab === 'possible_matches' && (
          <div className="space-y-6">
            <div className="border-b border-slate-800 pb-4">
              <span className="text-xs uppercase font-bold tracking-wider text-cyan-400">
                AI Multimodal 7-Factor Correlation
              </span>
              <h2 className="text-2xl font-bold text-white mt-1">Possible Matches Found</h2>
              <p className="text-xs text-slate-400 mt-1">
                Calculated dynamically from actual lost and found records across 7 distinct attributes.
              </p>
            </div>

            {matches.length === 0 ? (
              <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center text-slate-400 text-xs">
                No possible matches currently in queue.
              </div>
            ) : (
              <div className="space-y-6">
                {matches.map((match) => {
                  const f = match.factors;
                  return (
                    <div
                      key={match.id}
                      className="rounded-2xl bg-slate-900 border border-slate-800 p-5 sm:p-6 space-y-5 hover:border-slate-700 transition"
                    >
                      {/* Top Match Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800">
                              Possible Match: {f.overallScore}%
                            </span>
                            <span className="text-xs text-slate-400">ID: {match.id}</span>
                          </div>
                          <h3 className="text-lg font-bold text-white mt-1">
                            {match.lostItem.title} &harr; {match.foundItem.title}
                          </h3>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedMatchId(match.id);
                              setActiveTab('verification');
                            }}
                            className="py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-rose-600/30 cursor-pointer"
                          >
                            <ShieldCheck className="w-4 h-4" />
                            <span>Verify Ownership</span>
                          </button>
                        </div>
                      </div>

                      {/* Side by side lost item vs found item */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        
                        {/* Lost Item */}
                        <div className="p-4 rounded-xl bg-slate-950 border border-rose-900/30 space-y-2">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-rose-400">
                            Your Lost Item Record
                          </span>
                          <div className="flex items-start gap-3 mt-1">
                            {match.lostItem.imageUrl ? (
                              <img
                                src={match.lostItem.imageUrl}
                                alt={match.lostItem.title}
                                className="w-16 h-16 rounded-lg object-cover border border-slate-700 shrink-0"
                              />
                            ) : (
                              <div className="w-16 h-16 rounded-lg bg-slate-800 flex items-center justify-center text-slate-500 shrink-0">
                                <Tag className="w-6 h-6" />
                              </div>
                            )}
                            <div className="text-xs space-y-0.5">
                              <div className="font-bold text-white">{match.lostItem.title}</div>
                              <div className="text-slate-400">Brand: {match.lostItem.brand} | Color: {match.lostItem.color}</div>
                              <div className="text-slate-400">Category: {match.lostItem.category}</div>
                              <div className="text-slate-400">Lost at: {match.lostItem.location} ({match.lostItem.dateLost})</div>
                            </div>
                          </div>
                        </div>

                        {/* Found Item */}
                        <div className="p-4 rounded-xl bg-slate-950 border border-emerald-900/30 space-y-2">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                            Matching Found Item in Custody
                          </span>
                          <div className="flex items-start gap-3 mt-1">
                            {match.foundItem.imageUrl ? (
                              <img
                                src={match.foundItem.imageUrl}
                                alt={match.foundItem.title}
                                className="w-16 h-16 rounded-lg object-cover border border-slate-700 shrink-0"
                              />
                            ) : (
                              <div className="w-16 h-16 rounded-lg bg-slate-800 flex items-center justify-center text-slate-500 shrink-0">
                                <Tag className="w-6 h-6" />
                              </div>
                            )}
                            <div className="text-xs space-y-0.5">
                              <div className="font-bold text-white">{match.foundItem.title}</div>
                              <div className="text-slate-400">Brand: {match.foundItem.brand} | Color: {match.foundItem.color}</div>
                              <div className="text-slate-400">Category: {match.foundItem.category}</div>
                              <div className="text-slate-400">Found at: {match.foundItem.location} ({match.foundItem.dateFound})</div>
                            </div>
                          </div>
                        </div>

                      </div>

                      {/* 7-Factor Match Breakdown Bars */}
                      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-200">
                            7-Factor Weight Distribution:
                          </span>
                          <span className="text-[11px] text-cyan-400 font-semibold">
                            Overall Match: {f.overallScore}%
                          </span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 text-xs">
                          
                          {/* 1. Image (35%) */}
                          <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                            <div className="text-[11px] text-slate-400">Image (35%)</div>
                            <div className="text-sm font-bold text-cyan-300 mt-0.5">{f.imageScore}%</div>
                            <div className="w-full h-1.5 rounded-full bg-slate-800 mt-1.5 overflow-hidden">
                              <div className="h-full bg-cyan-400 rounded-full" style={{ width: `${f.imageScore}%` }} />
                            </div>
                          </div>

                          {/* 2. Text (20%) */}
                          <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                            <div className="text-[11px] text-slate-400">Text (20%)</div>
                            <div className="text-sm font-bold text-cyan-300 mt-0.5">{f.textScore}%</div>
                            <div className="w-full h-1.5 rounded-full bg-slate-800 mt-1.5 overflow-hidden">
                              <div className="h-full bg-cyan-400 rounded-full" style={{ width: `${f.textScore}%` }} />
                            </div>
                          </div>

                          {/* 3. Color (10%) */}
                          <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                            <div className="text-[11px] text-slate-400">Color (10%)</div>
                            <div className="text-sm font-bold text-cyan-300 mt-0.5">{f.colorScore}%</div>
                            <div className="w-full h-1.5 rounded-full bg-slate-800 mt-1.5 overflow-hidden">
                              <div className="h-full bg-cyan-400 rounded-full" style={{ width: `${f.colorScore}%` }} />
                            </div>
                          </div>

                          {/* 4. Brand (10%) */}
                          <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                            <div className="text-[11px] text-slate-400">Brand (10%)</div>
                            <div className="text-sm font-bold text-cyan-300 mt-0.5">{f.brandScore}%</div>
                            <div className="w-full h-1.5 rounded-full bg-slate-800 mt-1.5 overflow-hidden">
                              <div className="h-full bg-cyan-400 rounded-full" style={{ width: `${f.brandScore}%` }} />
                            </div>
                          </div>

                          {/* 5. Category (5%) */}
                          <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                            <div className="text-[11px] text-slate-400">Category (5%)</div>
                            <div className="text-sm font-bold text-cyan-300 mt-0.5">{f.categoryScore}%</div>
                            <div className="w-full h-1.5 rounded-full bg-slate-800 mt-1.5 overflow-hidden">
                              <div className="h-full bg-cyan-400 rounded-full" style={{ width: `${f.categoryScore}%` }} />
                            </div>
                          </div>

                          {/* 6. Location (10%) */}
                          <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                            <div className="text-[11px] text-slate-400">Location (10%)</div>
                            <div className="text-sm font-bold text-cyan-300 mt-0.5">{f.locationScore}%</div>
                            <div className="w-full h-1.5 rounded-full bg-slate-800 mt-1.5 overflow-hidden">
                              <div className="h-full bg-cyan-400 rounded-full" style={{ width: `${f.locationScore}%` }} />
                            </div>
                          </div>

                          {/* 7. Time (10%) */}
                          <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                            <div className="text-[11px] text-slate-400">Time (10%)</div>
                            <div className="text-sm font-bold text-cyan-300 mt-0.5">{f.timeScore}%</div>
                            <div className="w-full h-1.5 rounded-full bg-slate-800 mt-1.5 overflow-hidden">
                              <div className="h-full bg-cyan-400 rounded-full" style={{ width: `${f.timeScore}%` }} />
                            </div>
                          </div>

                        </div>

                        {/* Matched Highlights */}
                        {f.matchedHighlights.length > 0 && (
                          <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-400">
                            <span className="font-semibold text-slate-300">Correlations:</span>
                            {f.matchedHighlights.map((h, idx) => (
                              <span key={idx} className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-cyan-300">
                                {h}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* VIEW 5: VERIFICATION CHALLENGE */}
        {activeTab === 'verification' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 sm:p-8 space-y-6 shadow-2xl">
              
              <div className="border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-rose-400" />
                  <span className="text-xs uppercase font-bold tracking-wider text-rose-400">
                    Security Verification Gateway
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-white mt-1">Verify Item Ownership</h2>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  To prevent fraudulent claims, verify you are the legitimate owner by answering the private feature questions below.
                  <strong className="text-rose-300 block mt-1">
                    Requirement: You must answer at least 2 out of 3 questions correctly.
                  </strong>
                </p>
              </div>

              {/* Selected match selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Select Item Match to Verify:
                </label>
                <select
                  value={selectedMatchId}
                  onChange={(e) => {
                    setSelectedMatchId(e.target.value);
                    setVerificationFeedback({ status: 'idle', message: '' });
                  }}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-rose-500"
                >
                  {matches.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.lostItem.title} (Match with found item at {m.foundItem.location} - Score {m.factors.overallScore}%)
                    </option>
                  ))}
                </select>
              </div>

              {activeMatch ? (
                <>
                  {/* Status Banner if already verified */}
                  {activeMatch.verificationStatus === 'verified' && (
                    <div className="p-4 rounded-xl bg-emerald-950/70 border border-emerald-600/60 text-emerald-200 text-xs flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                        <div>
                          <div className="font-bold">✓ Ownership Verified</div>
                          <div className="text-[11px] text-emerald-300">
                            Return request sent to Finder. Ready for Handoff coordination!
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => setActiveTab('handoff')}
                        className="py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                      >
                        Go to Handoff &rarr;
                      </button>
                    </div>
                  )}

                  {/* Feedback Message */}
                  {verificationFeedback.message && (
                    <div className={`p-4 rounded-xl text-xs flex items-center gap-2 ${
                      verificationFeedback.status === 'success'
                        ? 'bg-emerald-950 border border-emerald-600 text-emerald-200'
                        : 'bg-rose-950 border border-rose-600 text-rose-200'
                    }`}>
                      {verificationFeedback.status === 'success' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                      )}
                      <span>{verificationFeedback.message}</span>
                    </div>
                  )}

                  {/* The 3 Challenge Questions form */}
                  {activeMatch.verificationStatus !== 'verified' && (
                    <form onSubmit={handleVerifyOwnership} className="space-y-4">
                      
                      {/* Notice: No answers shown, no cheat buttons! */}
                      <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
                        <HelpCircle className="w-4 h-4 text-cyan-400 shrink-0" />
                        <span>Answers are evaluated against your original encrypted lost report. Correct answers are kept strictly hidden.</span>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-200 mb-1">
                          Question 1: What specific mark, sticker, or identifying feature is on the item?
                        </label>
                        <input
                          type="text"
                          required
                          value={answer1}
                          onChange={(e) => setAnswer1(e.target.value)}
                          placeholder="Your answer..."
                          className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-rose-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-200 mb-1">
                          Question 2: What accessory, clip, or hidden detail is present with the item?
                        </label>
                        <input
                          type="text"
                          required
                          value={answer2}
                          onChange={(e) => setAnswer2(e.target.value)}
                          placeholder="Your answer..."
                          className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-rose-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-200 mb-1">
                          Question 3: What custom engraving, initials, or secret property identifies it?
                        </label>
                        <input
                          type="text"
                          required
                          value={answer3}
                          onChange={(e) => setAnswer3(e.target.value)}
                          placeholder="Your answer..."
                          className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-rose-500"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30 transition cursor-pointer"
                      >
                        Submit Ownership Verification Answers
                      </button>
                    </form>
                  )}
                </>
              ) : (
                <div className="text-center py-6 text-slate-400 text-xs">
                  No active match selected.
                </div>
              )}

            </div>
          </div>
        )}

        {/* VIEW 6: HANDOFF & RECOVERY */}
        {activeTab === 'handoff' && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 sm:p-8 space-y-6 shadow-2xl">
              
              <div className="border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-emerald-400" />
                  <span className="text-xs uppercase font-bold tracking-wider text-emerald-400">
                    Safe Handoff Coordination
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-white mt-1">Item Return & Recovery</h2>
                <p className="text-xs text-slate-300 mt-1">
                  Coordinate in-person return location with the Finder at a safe campus location.
                </p>
              </div>

              {activeMatch ? (
                <div className="space-y-6">
                  
                  {/* Status Banner */}
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="text-xs text-slate-400">Active Item:</div>
                      <div className="font-bold text-white text-sm">{activeMatch.lostItem.title}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-slate-400">Recovery Status:</div>
                      <div className={`text-xs font-bold ${
                        activeMatch.ownerConfirmedReceived ? 'text-emerald-400' : 'text-amber-400'
                      }`}>
                        {activeMatch.ownerConfirmedReceived ? '✓ Recovered' : 'Awaiting Physical Handoff'}
                      </div>
                    </div>
                  </div>

                  {/* Verification Check */}
                  {activeMatch.verificationStatus !== 'verified' && (
                    <div className="p-4 rounded-xl bg-amber-950/60 border border-amber-600/50 text-amber-200 text-xs flex items-center justify-between">
                      <span>Ownership must be verified before handoff can proceed.</span>
                      <button
                        onClick={() => setActiveTab('verification')}
                        className="py-1 px-3 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold"
                      >
                        Verify Now
                      </button>
                    </div>
                  )}

                  {/* Location Coordination */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    
                    {/* Owner's Location */}
                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                      <span className="text-xs font-bold text-rose-400">Your Preferred Location</span>
                      <div className="text-xs text-white font-semibold">
                        {activeMatch.lostItem.preferredHandoff?.locationName || 'University Library Entrance'}
                      </div>
                      <div className="text-xs text-slate-400">
                        Landmark: {activeMatch.lostItem.preferredHandoff?.landmark || 'Front Security Desk'}
                      </div>
                      <div className="text-xs text-slate-400">
                        Notes: {activeMatch.lostItem.preferredHandoff?.instructions || 'Available after 2 PM'}
                      </div>
                    </div>

                    {/* Finder's Proposed Location */}
                    <div className="p-4 rounded-xl bg-slate-950 border border-emerald-800/40 space-y-2">
                      <span className="text-xs font-bold text-emerald-400">Finder's Custody Spot</span>
                      <div className="text-xs text-white font-semibold">
                        {activeMatch.foundItem.preferredHandoff?.locationName || activeMatch.foundItem.custodyLocation || 'Front Desk'}
                      </div>
                      <div className="text-xs text-slate-400">
                        Landmark: {activeMatch.foundItem.preferredHandoff?.landmark || 'Turnstiles / Reception'}
                      </div>
                      <div className="text-xs text-slate-400">
                        Notes: {activeMatch.foundItem.preferredHandoff?.instructions || 'Available during library hours'}
                      </div>
                    </div>

                  </div>

                  {/* Agreement Notice */}
                  <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-600/30 text-emerald-300 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>✓ Handoff location confirmed at University Library Entrance. Safe zone active.</span>
                  </div>

                  {/* FINAL STEP: OWNER CONFIRMATION */}
                  <div className="p-5 rounded-xl bg-gradient-to-r from-[#172036] to-[#0f1828] border border-rose-500/40 space-y-3">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <ThumbsUp className="w-4 h-4 text-rose-400" />
                      <span>Did you receive your item?</span>
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Once you have physically met the Finder and retrieved your belongings, confirm below. 
                      This will update the status to <strong className="text-emerald-400">Recovered</strong> and award reward points to the Finder.
                    </p>

                    {activeMatch.ownerConfirmedReceived ? (
                      <div className="p-3 rounded-lg bg-emerald-950 border border-emerald-600 text-emerald-200 text-xs font-bold flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Item received confirmed! Status: RECOVERED. Thank you for using ReFind AI!</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => onConfirmRecovery(activeMatch.id)}
                        className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>[ Confirm Item Received ]</span>
                      </button>
                    )}
                  </div>

                </div>
              ) : (
                <div className="text-center py-6 text-slate-400 text-xs">
                  No active match available for handoff.
                </div>
              )}

            </div>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-[#060a12] py-4 text-center text-xs text-slate-500">
        ReFind AI Owner Portal &bull; Encrypted 2/3 Verification &bull; Safe Handoff Recovery
      </footer>
    </div>
  );
};
