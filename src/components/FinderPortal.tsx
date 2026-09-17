import React, { useState } from 'react';
import { 
  User, LostItem, FoundItem, ItemMatch, FinderNavTab, 
  HandoffLocationPreference, UserRole 
} from '../types';
import { 
  Compass, PlusCircle, CheckCircle2, Award, ShieldCheck, 
  MapPin, Calendar, Clock, LogOut, ArrowRight, Eye, 
  Tag, Sparkles, Layers, Check, XCircle, Send, MessageSquare, 
  Gift, HeartHandshake, Shield, Lock, ChevronRight, HelpCircle, ThumbsUp, AlertTriangle
} from 'lucide-react';

interface FinderPortalProps {
  user: User;
  foundItems: FoundItem[];
  lostItems: LostItem[];
  matches: ItemMatch[];
  onAddFoundItem: (item: FoundItem) => void;
  onUpdateMatch: (match: ItemMatch) => void;
  onAcceptReturn: (matchId: string) => void;
  onDeclineReturn: (matchId: string) => void;
  onSendMessage: (matchId: string, text: string, senderId: string, senderName: string, senderRole: UserRole) => void;
  onProposeLocation: (matchId: string, role: UserRole, loc: HandoffLocationPreference) => void;
  onConfirmLocation: (matchId: string, agreedLoc: HandoffLocationPreference) => void;
  onFinderHandedOver: (matchId: string) => void;
  onLogout: () => void;
}

export const FinderPortal: React.FC<FinderPortalProps> = ({
  user,
  foundItems,
  lostItems,
  matches,
  onAddFoundItem,
  onUpdateMatch,
  onAcceptReturn,
  onDeclineReturn,
  onSendMessage,
  onProposeLocation,
  onConfirmLocation,
  onFinderHandedOver,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<FinderNavTab>('dashboard');
  const [selectedMatchId, setSelectedMatchId] = useState<string>(matches[0]?.id || '');
  const [showDemoItemsTab, setShowDemoItemsTab] = useState<boolean>(false);

  // Form states for Report Found Item (Manual entry, no autofill)
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Bottle');
  const [brand, setBrand] = useState('');
  const [color, setColor] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [location, setLocation] = useState('');
  const [dateFound, setDateFound] = useState(new Date().toISOString().split('T')[0]);
  const [timeFound, setTimeFound] = useState('16:00');
  const [custodyLocation, setCustodyLocation] = useState('Campus Security Front Desk');
  
  // Preferred handoff location
  const [handoffLocName, setHandoffLocName] = useState('Library Help Desk');
  const [handoffLandmark, setHandoffLandmark] = useState('Main floor reference counter');
  const [handoffInstructions, setHandoffInstructions] = useState('Available weekdays 10 AM - 5 PM');
  
  const [formSuccess, setFormSuccess] = useState(false);
  const [messageInput, setMessageInput] = useState('');

  // Location edit inside Handoff tab
  const [editLocationMode, setEditLocationMode] = useState(false);
  const [customLocName, setCustomLocName] = useState('');
  const [customLandmark, setCustomLandmark] = useState('');
  const [customInstructions, setCustomInstructions] = useState('');

  // Real items vs demo items
  const userFoundItems = foundItems.filter((item) => !item.isDemo && (item.finderId === user.id || !item.finderId));
  const demoFoundItems = foundItems.filter((item) => item.isDemo);

  // Active match selection
  const currentMatch = matches.find((m) => m.id === selectedMatchId) || matches[0];

  // Stats calculation
  const totalFoundCount = userFoundItems.length;
  const activeMatchesCount = matches.length;
  const returnRequestsCount = matches.filter(
    (m) => m.workflowStatus === 'return_requested' || m.returnRequestStatus === 'pending'
  ).length;
  const activeConversationsCount = matches.filter((m) => m.messages && m.messages.length > 0).length;
  const completedReturnsCount = matches.filter((m) => m.workflowStatus === 'completed').length + (user.successfulReturns || 0);
  const totalCredits = (user.rewardPoints || 0) + (completedReturnsCount * 100);

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
    if (!title.trim()) return;

    const newItem: FoundItem = {
      id: `user-found-${Date.now()}`,
      title: title.trim(),
      category: category.trim(),
      brand: brand.trim() || 'Generic',
      color: color.trim(),
      description: description.trim(),
      imageUrl: imageUrl.trim() || undefined,
      location: location.trim(),
      dateFound,
      timeFound,
      custodyLocation: custodyLocation.trim(),
      status: 'In Custody / Searching for Owner',
      isDemo: false,
      finderId: user.id,
      finderName: user.name,
      createdAt: new Date().toISOString(),
      preferredHandoff: {
        locationName: handoffLocName.trim(),
        landmark: handoffLandmark.trim(),
        instructions: handoffInstructions.trim(),
      },
    };

    onAddFoundItem(newItem);
    setFormSuccess(true);
    setTimeout(() => {
      setFormSuccess(false);
      setTitle('');
      setBrand('');
      setColor('');
      setDescription('');
      setImageUrl('');
      setLocation('');
      setActiveTab('my_found_items');
    }, 1500);
  };

  const handleSendMessageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !currentMatch) return;
    onSendMessage(currentMatch.id, messageInput, user.id, user.name, 'finder');
    setMessageInput('');
  };

  const sendQuickPrompt = (text: string) => {
    if (!currentMatch) return;
    onSendMessage(currentMatch.id, text, user.id, user.name, 'finder');
  };

  const handleSaveCustomLocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentMatch || !customLocName.trim()) return;
    onProposeLocation(currentMatch.id, 'finder', {
      locationName: customLocName.trim(),
      landmark: customLandmark.trim(),
      instructions: customInstructions.trim(),
    });
    setEditLocationMode(false);
  };

  return (
    <div className="min-h-screen bg-[#070d18] text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Finder Navigation Header */}
      <header className="border-b border-emerald-950/40 bg-[#0a1617]/95 backdrop-blur sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center font-black text-white text-base shadow-lg shadow-emerald-600/20">
              R
            </div>
            <div>
              <div className="font-bold text-white text-sm sm:text-base flex items-center gap-2">
                ReFind AI
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  Finder Portal
                </span>
              </div>
              <div className="text-[11px] text-slate-400">Found Item Registration, Coordination & Rewards</div>
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="hidden md:flex items-center space-x-2 text-xs bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-slate-300 font-medium">{user.name}</span>
              <span className="text-slate-500">|</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <Award className="w-3.5 h-3.5" />
                {totalCredits} Credits
              </span>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-emerald-950/40 text-slate-300 hover:text-emerald-300 border border-slate-700/80 hover:border-emerald-700/40 text-xs font-semibold transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex space-x-1 sm:space-x-2 overflow-x-auto py-2 border-t border-slate-800/60 no-scrollbar">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: Layers },
            { id: 'report_found', label: 'Report Found Item', icon: PlusCircle },
            { id: 'my_found_items', label: 'My Found Items', count: userFoundItems.length, icon: Tag },
            { id: 'my_matches', label: 'My Matches', count: activeMatchesCount, icon: Sparkles },
            { id: 'messages', label: 'Messages', count: activeConversationsCount, icon: MessageSquare },
            { id: 'handoff', label: 'Handoff', icon: ShieldCheck },
            { id: 'rewards', label: 'Rewards', icon: Award },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as FinderNavTab)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-300 border border-slate-700'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
        {/* TAB 1: FINDER DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            <div className="bg-gradient-to-r from-emerald-950/40 via-slate-900 to-[#0c1a24] border border-emerald-900/30 rounded-2xl p-6 sm:p-8 relative overflow-hidden">
              <div className="relative z-10 space-y-2 max-w-2xl">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
                  Finder Overview
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                  Welcome, {user.name}
                </h2>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Thank you for keeping our community trustworthy. Register found items in safe custody, evaluate AI owner matches, coordinate safe returns, and earn community recognition credits.
                </p>
                <div className="pt-2 flex flex-wrap gap-3">
                  <button
                    onClick={() => setActiveTab('report_found')}
                    className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition cursor-pointer"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Report Found Item</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('my_matches')}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 border border-slate-700 transition cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <span>Check Owner Matches</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Dashboard Metrics (6 metrics) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="bg-[#0e1526] border border-slate-800 rounded-xl p-4 shadow-sm">
                <div className="text-slate-400 text-xs font-medium">Found Items</div>
                <div className="text-2xl font-bold text-white mt-1">{totalFoundCount}</div>
                <div className="text-[11px] text-emerald-400 mt-0.5">In custody</div>
              </div>

              <div className="bg-[#0e1526] border border-slate-800 rounded-xl p-4 shadow-sm">
                <div className="text-slate-400 text-xs font-medium">Possible Matches</div>
                <div className="text-2xl font-bold text-cyan-400 mt-1">{activeMatchesCount}</div>
                <div className="text-[11px] text-cyan-300 mt-0.5">7-factor score</div>
              </div>

              <div className="bg-[#0e1526] border border-slate-800 rounded-xl p-4 shadow-sm">
                <div className="text-slate-400 text-xs font-medium">Return Requests</div>
                <div className="text-2xl font-bold text-amber-400 mt-1">{returnRequestsCount}</div>
                <div className="text-[11px] text-amber-300 mt-0.5">Awaiting reply</div>
              </div>

              <div className="bg-[#0e1526] border border-slate-800 rounded-xl p-4 shadow-sm">
                <div className="text-slate-400 text-xs font-medium">Active Conversations</div>
                <div className="text-2xl font-bold text-teal-400 mt-1">{activeConversationsCount}</div>
                <div className="text-[11px] text-teal-300 mt-0.5">Direct chat</div>
              </div>

              <div className="bg-[#0e1526] border border-slate-800 rounded-xl p-4 shadow-sm">
                <div className="text-slate-400 text-xs font-medium">Completed Returns</div>
                <div className="text-2xl font-bold text-white mt-1">{completedReturnsCount}</div>
                <div className="text-[11px] text-emerald-400 mt-0.5">Handed over</div>
              </div>

              <div className="bg-[#0e1526] border border-slate-800 rounded-xl p-4 shadow-sm">
                <div className="text-slate-400 text-xs font-medium">Finder Credits</div>
                <div className="text-2xl font-bold text-amber-400 mt-1">{totalCredits}</div>
                <div className="text-[11px] text-amber-300 mt-0.5">Reward points</div>
              </div>
            </div>

            {/* Return Requests Requiring Finder Action */}
            {returnRequestsCount > 0 && (
              <div className="p-5 rounded-2xl bg-amber-950/40 border border-amber-500/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
                    <AlertTriangle className="w-5 h-5 text-amber-400" />
                    <span>You have {returnRequestsCount} pending return request(s) from owners!</span>
                  </div>
                  <button
                    onClick={() => setActiveTab('my_matches')}
                    className="px-3 py-1.5 rounded-lg bg-amber-500 text-black text-xs font-bold hover:bg-amber-400 transition"
                  >
                    Review & Accept
                  </button>
                </div>
                <p className="text-xs text-amber-200/80">
                  An owner has confirmed ownership of a found item matching your report. Accept the request to unlock direct communication and safe handoff (+20 Finder Credits).
                </p>
              </div>
            )}

            {/* Quick Matches Overview */}
            <div className="bg-[#0e1526] border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <span>High-Confidence Owner Matches</span>
                  </h3>
                  <p className="text-xs text-slate-400">Items you logged that closely resemble reported lost property</p>
                </div>
                <button
                  onClick={() => setActiveTab('my_matches')}
                  className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                >
                  <span>View all</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {matches.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-sm">
                  No active matches found.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {matches.slice(0, 2).map((m) => (
                    <div
                      key={m.id}
                      className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-emerald-500/40 transition space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="text-xs font-bold text-emerald-400">FOUND: {m.foundItem.title}</div>
                          <div className="text-xs text-slate-300 mt-0.5">OWNER REPORT: {m.lostItem.title}</div>
                        </div>
                        <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                          {m.factors.overallScore}% Match
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-400 flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-500" />
                          {m.lostItem.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-500" />
                          {m.lostItem.dateLost}
                        </span>
                      </div>

                      <div className="pt-2 flex items-center justify-between border-t border-slate-800/80">
                        <span className="text-[11px] text-slate-400">
                          Owner:{' '}
                          <strong className="text-slate-200">{m.lostItem.ownerName || 'Verified Student'}</strong>
                        </span>
                        <button
                          onClick={() => {
                            setSelectedMatchId(m.id);
                            setActiveTab('my_matches');
                          }}
                          className="px-3 py-1 rounded bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white text-xs font-semibold transition"
                        >
                          Review Match
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: REPORT FOUND ITEM */}
        {activeTab === 'report_found' && (
          <div className="max-w-3xl mx-auto">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <PlusCircle className="w-6 h-6 text-emerald-500" />
                <span>Report Found Item</span>
              </h2>
              <p className="text-sm text-slate-300 mt-1">
                Enter honest details about what you found. Clean manual inputs with no automatic pre-fills or mock photos.
              </p>
            </div>

            {formSuccess && (
              <div className="mb-6 p-4 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-sm flex items-center gap-3 shadow-lg">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <div className="font-bold">✓ Found item registered successfully.</div>
                  <div className="text-xs text-emerald-300/80">Saved in safe custody. Redirecting to My Found Items...</div>
                </div>
              </div>
            )}

            <form onSubmit={handleReportSubmit} className="space-y-6 bg-[#0e1526] border border-slate-800 rounded-2xl p-6 sm:p-8">
              <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-400 border-b border-slate-800 pb-2">
                  1. Found Item Characteristics
                </h3>

                <div>
                  <label className="block text-xs font-semibold text-slate-200 mb-1">
                    Item Name <span className="text-emerald-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Stainless Steel Water Bottle"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-200 mb-1">
                      Category <span className="text-emerald-400">*</span>
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="Bottle">Bottle / Tumbler</option>
                      <option value="Electronics">Electronics / Laptop / Phone</option>
                      <option value="Wallet">Wallet / Purse</option>
                      <option value="Keys">Keys / Keychain</option>
                      <option value="Audio">Headphones / Earbuds</option>
                      <option value="Clothing">Clothing / Jacket</option>
                      <option value="Bags">Backpack / Bag</option>
                      <option value="Documents">ID / Cards / Documents</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-200 mb-1">
                      Brand <span className="text-emerald-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Nike, Apple, Generic"
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-200 mb-1">
                      Color <span className="text-emerald-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Matte Black, Silver"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-200 mb-1">
                    Description <span className="text-emerald-400">*</span>
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Describe external visible condition, markings, or notable features..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-200 mb-1">
                      Date Found <span className="text-emerald-400">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={dateFound}
                      onChange={(e) => setDateFound(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-200 mb-1">
                      Time Found <span className="text-emerald-400">*</span>
                    </label>
                    <input
                      type="time"
                      required
                      value={timeFound}
                      onChange={(e) => setTimeFound(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-200 mb-1">
                      Location Where Found <span className="text-emerald-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. University Library Study Area"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Upload Real Found Item Image */}
                <div>
                  <label className="block text-xs font-semibold text-slate-200 mb-1">
                    Upload Found Item Image (JPG, JPEG, PNG, WEBP)
                  </label>
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                    onChange={handleImageFileUpload}
                    className="block w-full text-xs text-slate-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-600/20 file:text-emerald-300 hover:file:bg-emerald-600/30 file:cursor-pointer cursor-pointer bg-slate-900 p-2 rounded-xl border border-slate-700"
                  />
                  {imageUrl && (
                    <div className="mt-3 flex items-center gap-3 p-2 bg-slate-900 rounded-xl border border-slate-800">
                      <img
                        src={imageUrl}
                        alt="Preview"
                        className="w-20 h-20 object-cover rounded-lg border border-slate-700"
                      />
                      <div className="text-xs text-slate-300">
                        <div className="font-semibold text-emerald-400 flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Found photo uploaded
                        </div>
                        <div className="text-slate-500 text-[11px] mt-0.5">Used for AI visual feature extraction.</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Custody and Preferred Handoff Location */}
              <div className="space-y-4 pt-4 border-t border-slate-800">
                <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-400">
                  2. Custody & Safe Handoff Location
                </h3>

                <div>
                  <label className="block text-xs font-semibold text-slate-200 mb-1">
                    Where is the item currently kept? (Safe Custody) <span className="text-emerald-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. In my backpack / Campus Security Front Desk"
                    value={custodyLocation}
                    onChange={(e) => setCustodyLocation(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Suggested Meeting Point</label>
                    <input
                      type="text"
                      placeholder="e.g. Library Help Desk"
                      value={handoffLocName}
                      onChange={(e) => setHandoffLocName(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Landmark</label>
                    <input
                      type="text"
                      placeholder="e.g. Main reference counter"
                      value={handoffLandmark}
                      onChange={(e) => setHandoffLandmark(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Availability Instructions</label>
                  <input
                    type="text"
                    placeholder="e.g. Available weekdays 10 AM - 5 PM"
                    value={handoffInstructions}
                    onChange={(e) => setHandoffInstructions(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full py-3.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Check className="w-5 h-5" />
                  <span>SUBMIT FOUND ITEM</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 3: MY FOUND ITEMS */}
        {activeTab === 'my_found_items' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Tag className="w-6 h-6 text-emerald-500" />
                  <span>My Found Items</span>
                </h2>
                <p className="text-sm text-slate-400">Items you have registered as found and are keeping in custody.</p>
              </div>
              <button
                onClick={() => setActiveTab('report_found')}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 self-start transition"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Report Another Found Item</span>
              </button>
            </div>

            {userFoundItems.length === 0 ? (
              <div className="p-12 text-center bg-[#0e1526] border border-slate-800 rounded-2xl space-y-4">
                <div className="w-12 h-12 rounded-full bg-slate-800 text-slate-500 mx-auto flex items-center justify-center">
                  <Tag className="w-6 h-6" />
                </div>
                <div className="text-white font-bold text-lg">No found items registered yet</div>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Submit a found item report to help its real owner locate it and receive Finder Credits.
                </p>
                <button
                  onClick={() => setActiveTab('report_found')}
                  className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold"
                >
                  Report Found Item
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {userFoundItems.map((item) => (
                  <div
                    key={item.id}
                    className="bg-[#0e1526] border border-slate-800 rounded-2xl p-5 space-y-4 shadow-md"
                  >
                    <div className="flex items-start gap-4">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-24 h-24 object-cover rounded-xl border border-slate-700 shrink-0"
                        />
                      ) : (
                        <div className="w-24 h-24 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-500 text-xs shrink-0">
                          No photo
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            {item.category}
                          </span>
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                            {item.status}
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-white mt-1 truncate">{item.title}</h3>
                        <div className="text-xs text-slate-400 mt-0.5">
                          Brand: <strong className="text-slate-300">{item.brand}</strong> &bull; Color: <strong className="text-slate-300">{item.color}</strong>
                        </div>
                        <p className="text-xs text-slate-300 mt-2 line-clamp-2">{item.description}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-400 pt-2 border-t border-slate-800/80">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span className="truncate">{item.location}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span>{item.dateFound} at {item.timeFound}</span>
                      </div>
                    </div>

                    <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                      <span>Custody: <strong className="text-slate-200">{item.custodyLocation}</strong></span>
                      <span className="text-emerald-400 font-medium">Safe in storage</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Collapsible Demo Found Items */}
            <div className="pt-6 border-t border-slate-800">
              <button
                onClick={() => setShowDemoItemsTab(!showDemoItemsTab)}
                className="text-xs font-semibold text-slate-400 hover:text-slate-200 flex items-center gap-2"
              >
                <span>{showDemoItemsTab ? 'Hide' : 'View'} Reference Demo Found Items ({demoFoundItems.length})</span>
                <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 font-bold">
                  DEMO DATA
                </span>
              </button>

              {showDemoItemsTab && (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {demoFoundItems.map((demo) => (
                    <div
                      key={demo.id}
                      className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 text-xs space-y-2 opacity-80"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-300">{demo.title}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500/15 text-amber-300 border border-amber-500/30">
                          DEMO RECORD
                        </span>
                      </div>
                      <div className="text-slate-400">{demo.description}</div>
                      <div className="text-[11px] text-slate-500">Found: {demo.location}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: MY MATCHES & RETURN REQUESTS */}
        {activeTab === 'my_matches' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-cyan-400" />
                <span>My Owner Matches & Return Requests</span>
              </h2>
              <p className="text-sm text-slate-400">
                AI matching between your logged found items and lost reports submitted by owners.
              </p>
            </div>

            {matches.length === 0 ? (
              <div className="p-12 text-center bg-[#0e1526] border border-slate-800 rounded-2xl text-slate-400 text-sm">
                No matches currently found.
              </div>
            ) : (
              <div className="space-y-6">
                {matches.map((m) => {
                  const score = m.factors.overallScore;
                  const isReturnRequested = m.workflowStatus === 'return_requested' || m.returnRequestStatus === 'pending';
                  const isReturnAccepted = m.workflowStatus === 'return_accepted' || m.workflowStatus === 'location_confirmed' || m.workflowStatus === 'item_handed_over' || m.workflowStatus === 'completed';

                  return (
                    <div
                      key={m.id}
                      className={`bg-[#0e1526] border rounded-2xl p-6 space-y-6 shadow-xl transition ${
                        isReturnRequested ? 'border-amber-500/60 shadow-amber-500/10' : 'border-slate-800'
                      }`}
                    >
                      {/* Return Request Banner */}
                      {isReturnRequested && (
                        <div className="p-4 rounded-xl bg-amber-950/60 border border-amber-500/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5">
                            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
                            <div>
                              <div className="text-xs font-bold text-amber-300">
                                Return Request Received from {m.lostItem.ownerName || 'Verified Owner'}
                              </div>
                              <div className="text-[11px] text-amber-200/80">
                                The owner has verified their lost item details and requested to coordinate handoff.
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => onAcceptReturn(m.id)}
                              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition cursor-pointer flex items-center gap-1.5"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>ACCEPT RETURN (+20 Credits)</span>
                            </button>
                            <button
                              onClick={() => onDeclineReturn(m.id)}
                              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-rose-950/50 text-slate-300 hover:text-rose-300 text-xs font-semibold border border-slate-700 transition"
                            >
                              Decline
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Header with Score and Status */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-black px-3 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                              AI Match Confidence: {score}%
                            </span>
                            <span className="text-xs font-semibold text-slate-400">
                              {score >= 80 ? 'High Similarity' : 'Moderate Similarity'}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400 mt-1">
                            Owner report: <strong>{m.lostItem.title}</strong> by {m.lostItem.ownerName || 'Student'}
                          </div>
                        </div>

                        {/* Status / Chat button */}
                        <div>
                          {isReturnAccepted ? (
                            <div className="flex items-center gap-2">
                              <span className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5">
                                <Check className="w-3.5 h-3.5" /> Return Accepted
                              </span>
                              <button
                                onClick={() => {
                                  setSelectedMatchId(m.id);
                                  setActiveTab('messages');
                                }}
                                className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center gap-1.5 transition"
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                                <span>Message Owner</span>
                              </button>
                            </div>
                          ) : isReturnRequested ? null : (
                            <span className="text-xs text-slate-400 italic">
                              Awaiting Owner review
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Side by side comparison */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Found Item Column */}
                        <div className="p-4 rounded-xl bg-slate-900/90 border border-emerald-950/40 space-y-3">
                          <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                            Your Found Item
                          </div>
                          <div className="flex items-center gap-3">
                            {m.foundItem.imageUrl ? (
                              <img
                                src={m.foundItem.imageUrl}
                                alt={m.foundItem.title}
                                className="w-20 h-20 object-cover rounded-lg border border-slate-700 shrink-0"
                              />
                            ) : (
                              <div className="w-20 h-20 rounded-lg bg-slate-800 flex items-center justify-center text-[10px] text-slate-500 shrink-0">
                                No image
                              </div>
                            )}
                            <div className="min-w-0">
                              <h4 className="text-sm font-bold text-white truncate">{m.foundItem.title}</h4>
                              <div className="text-xs text-slate-400">Category: {m.foundItem.category}</div>
                              <div className="text-xs text-slate-400">Color: {m.foundItem.color} &bull; Brand: {m.foundItem.brand}</div>
                            </div>
                          </div>
                          <div className="text-xs text-slate-300 pt-1">{m.foundItem.description}</div>
                          <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800 flex items-center justify-between">
                            <span>Found at: {m.foundItem.location}</span>
                            <span>{m.foundItem.dateFound}</span>
                          </div>
                        </div>

                        {/* Owner Lost Item Column */}
                        <div className="p-4 rounded-xl bg-slate-900/90 border border-rose-950/40 space-y-3">
                          <div className="text-xs font-bold text-rose-400 uppercase tracking-wider">
                            Reported Lost Item
                          </div>
                          <div className="flex items-center gap-3">
                            {m.lostItem.imageUrl ? (
                              <img
                                src={m.lostItem.imageUrl}
                                alt={m.lostItem.title}
                                className="w-20 h-20 object-cover rounded-lg border border-slate-700 shrink-0"
                              />
                            ) : (
                              <div className="w-20 h-20 rounded-lg bg-slate-800 flex items-center justify-center text-[10px] text-slate-500 shrink-0">
                                No image
                              </div>
                            )}
                            <div className="min-w-0">
                              <h4 className="text-sm font-bold text-white truncate">{m.lostItem.title}</h4>
                              <div className="text-xs text-slate-400">Category: {m.lostItem.category}</div>
                              <div className="text-xs text-slate-400">Color: {m.lostItem.color} &bull; Brand: {m.lostItem.brand}</div>
                            </div>
                          </div>
                          <div className="text-xs text-slate-300 pt-1">{m.lostItem.description}</div>
                          <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800 flex items-center justify-between">
                            <span>Lost at: {m.lostItem.location}</span>
                            <span>{m.lostItem.dateLost}</span>
                          </div>
                        </div>
                      </div>

                      {/* 7-Factor Score Breakdown */}
                      <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
                        <div className="text-xs font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>AI Multimodal 7-Factor Engine</span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 text-center">
                          <div className="p-2 bg-slate-900 rounded-lg border border-slate-800">
                            <div className="text-[10px] text-slate-400">Image (35%)</div>
                            <div className="text-sm font-bold text-cyan-400 mt-0.5">{m.factors.imageScore}%</div>
                          </div>
                          <div className="p-2 bg-slate-900 rounded-lg border border-slate-800">
                            <div className="text-[10px] text-slate-400">Text (20%)</div>
                            <div className="text-sm font-bold text-cyan-400 mt-0.5">{m.factors.textScore}%</div>
                          </div>
                          <div className="p-2 bg-slate-900 rounded-lg border border-slate-800">
                            <div className="text-[10px] text-slate-400">Color (10%)</div>
                            <div className="text-sm font-bold text-cyan-400 mt-0.5">{m.factors.colorScore}%</div>
                          </div>
                          <div className="p-2 bg-slate-900 rounded-lg border border-slate-800">
                            <div className="text-[10px] text-slate-400">Brand (10%)</div>
                            <div className="text-sm font-bold text-cyan-400 mt-0.5">{m.factors.brandScore}%</div>
                          </div>
                          <div className="p-2 bg-slate-900 rounded-lg border border-slate-800">
                            <div className="text-[10px] text-slate-400">Category (5%)</div>
                            <div className="text-sm font-bold text-cyan-400 mt-0.5">{m.factors.categoryScore}%</div>
                          </div>
                          <div className="p-2 bg-slate-900 rounded-lg border border-slate-800">
                            <div className="text-[10px] text-slate-400">Location (10%)</div>
                            <div className="text-sm font-bold text-cyan-400 mt-0.5">{m.factors.locationScore}%</div>
                          </div>
                          <div className="p-2 bg-slate-900 rounded-lg border border-slate-800">
                            <div className="text-[10px] text-slate-400">Time (10%)</div>
                            <div className="text-sm font-bold text-cyan-400 mt-0.5">{m.factors.timeScore}%</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 5: MESSAGES */}
        {activeTab === 'messages' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <MessageSquare className="w-6 h-6 text-emerald-400" />
                <span>In-App Messages</span>
              </h2>
              <p className="text-sm text-slate-400">
                Coordinate handoff with verified owners securely without sharing your phone number or email.
              </p>
            </div>

            {/* Active Match Selector */}
            {matches.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {matches.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setSelectedMatchId(m.id)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition border ${
                      currentMatch?.id === m.id
                        ? 'bg-emerald-600 text-white border-emerald-500'
                        : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {m.foundItem.title} &harr; {m.lostItem.title}
                  </button>
                ))}
              </div>
            )}

            {currentMatch ? (
              <div className="bg-[#0e1526] border border-slate-800 rounded-2xl overflow-hidden shadow-xl flex flex-col h-[580px]">
                {/* Chat Header */}
                <div className="p-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="text-xs text-slate-400">Matched Item</div>
                    <div className="text-sm font-bold text-white">{currentMatch.foundItem.title}</div>
                  </div>
                  <div className="text-right text-xs">
                    <div className="text-slate-400">Owner</div>
                    <div className="font-bold text-rose-400">{currentMatch.lostItem.ownerName || 'Verified Owner'}</div>
                  </div>
                </div>

                {/* Message Feed */}
                <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#070d18]/60">
                  {currentMatch.messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-2">
                      <MessageSquare className="w-8 h-8 text-slate-600" />
                      <div className="text-sm font-medium">No messages yet</div>
                      <p className="text-xs max-w-sm text-slate-500">
                        Once you accept the return request, you can suggest a safe spot to return the item.
                      </p>
                    </div>
                  ) : (
                    currentMatch.messages.map((msg) => {
                      const isMe = msg.senderRole === 'finder';
                      return (
                        <div
                          key={msg.id}
                          className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                        >
                          <div className="text-[10px] text-slate-500 mb-0.5 px-1">
                            {msg.senderName} ({msg.senderRole})
                          </div>
                          <div
                            className={`max-w-md px-4 py-2.5 rounded-2xl text-xs leading-relaxed ${
                              isMe
                                ? 'bg-emerald-600 text-white rounded-br-xs'
                                : 'bg-slate-800 text-slate-200 rounded-bl-xs border border-slate-700'
                            }`}
                          >
                            {msg.text}
                          </div>
                          <div className="text-[9px] text-slate-500 mt-0.5 px-1">
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Quick Prompts */}
                <div className="p-2.5 bg-slate-900 border-t border-slate-800/80 flex flex-wrap gap-2">
                  <span className="text-[10px] text-slate-400 self-center">Quick prompt:</span>
                  {[
                    'I have your item safely with me.',
                    'I can meet at the library front desk at 2 PM.',
                    'Let me know when you arrive.',
                  ].map((prompt, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => sendQuickPrompt(prompt)}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] border border-slate-700 transition"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>

                {/* Message input */}
                <form onSubmit={handleSendMessageSubmit} className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Type a message to the Owner..."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="submit"
                    className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition shadow cursor-pointer shrink-0"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            ) : (
              <div className="p-8 text-center text-slate-400">No match selected.</div>
            )}
          </div>
        )}

        {/* TAB 6: SAFE HANDOFF */}
        {activeTab === 'handoff' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-emerald-400" />
                <span>Safe Handoff Coordination</span>
              </h2>
              <p className="text-sm text-slate-400">
                Agree on a safe campus meeting point and mark the item handed over to unlock full reward credits.
              </p>
            </div>

            {currentMatch ? (
              <div className="space-y-6">
                {/* 6-Step Visual Flow */}
                <div className="bg-[#0e1526] border border-slate-800 rounded-2xl p-5 space-y-4">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Recovery Workflow Status
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-center text-xs">
                    {[
                      { step: 1, label: 'Return Requested', done: currentMatch.workflowStatus !== 'none' },
                      { step: 2, label: 'Return Accepted', done: currentMatch.workflowStatus === 'return_accepted' || currentMatch.workflowStatus === 'location_confirmed' || currentMatch.workflowStatus === 'item_handed_over' || currentMatch.workflowStatus === 'completed' },
                      { step: 3, label: 'Communication', done: currentMatch.messages.length > 0 || currentMatch.workflowStatus === 'location_confirmed' || currentMatch.workflowStatus === 'item_handed_over' || currentMatch.workflowStatus === 'completed' },
                      { step: 4, label: 'Location Confirmed', done: currentMatch.workflowStatus === 'location_confirmed' || currentMatch.workflowStatus === 'item_handed_over' || currentMatch.workflowStatus === 'completed' },
                      { step: 5, label: 'Item Handed Over', done: currentMatch.workflowStatus === 'item_handed_over' || currentMatch.workflowStatus === 'completed' },
                      { step: 6, label: 'Owner Confirmed', done: currentMatch.workflowStatus === 'completed' },
                    ].map((st) => (
                      <div
                        key={st.step}
                        className={`p-2.5 rounded-xl border text-xs flex flex-col justify-center items-center ${
                          st.done
                            ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300 font-bold'
                            : 'bg-slate-900 border-slate-800 text-slate-500'
                        }`}
                      >
                        <div className="text-[10px] opacity-70">Step {st.step}</div>
                        <div className="text-[11px] mt-0.5">{st.label}</div>
                        {st.done && <Check className="w-3.5 h-3.5 text-emerald-400 mt-1" />}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Mark as Handed Over Button */}
                {currentMatch.workflowStatus !== 'item_handed_over' && currentMatch.workflowStatus !== 'completed' && (
                  <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950/60 to-slate-900 border border-emerald-500/50 space-y-3">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                      <HeartHandshake className="w-5 h-5" />
                      <span>Ready for In-Person Return?</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Once you have physically met the owner and handed over <strong>{currentMatch.foundItem.title}</strong>, click below. The owner will be prompted to confirm receipt, triggering your +100 Finder Credits.
                    </p>
                    <button
                      onClick={() => onFinderHandedOver(currentMatch.id)}
                      className="py-3 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 flex items-center gap-2 transition cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      <span>[ ITEM HANDED OVER ]</span>
                    </button>
                  </div>
                )}

                {/* Item Handed Over Notice */}
                {currentMatch.workflowStatus === 'item_handed_over' && (
                  <div className="p-5 rounded-2xl bg-amber-950/40 border border-amber-500/50 text-amber-200 text-xs space-y-1">
                    <div className="font-bold flex items-center gap-2 text-sm text-amber-300">
                      <Clock className="w-4 h-4" />
                      <span>Item Marked as Handed Over &bull; Awaiting Owner Confirmation</span>
                    </div>
                    <p>
                      The owner has been notified to verify physical receipt of the item. As soon as they confirm, your +100 Finder Credits will be credited to your balance!
                    </p>
                  </div>
                )}

                {/* Case Completed Banner */}
                {currentMatch.workflowStatus === 'completed' && (
                  <div className="p-6 rounded-2xl bg-emerald-950/40 border border-emerald-500/50 text-emerald-200 text-sm space-y-2">
                    <div className="font-bold flex items-center gap-2 text-base text-emerald-300">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      <span>Case Completed &bull; +100 Credits Awarded!</span>
                    </div>
                    <p className="text-xs text-emerald-300/80">
                      The owner confirmed safe recovery of their property. You have earned +100 Finder Credits! Thank you for being a responsible community member.
                    </p>
                  </div>
                )}

                {/* Location Suggestions Side by Side */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Finder Preferred Location */}
                  <div className="bg-[#0e1526] border border-slate-800 rounded-2xl p-5 space-y-3">
                    <div className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center justify-between">
                      <span>Your Suggested Location</span>
                      <button
                        onClick={() => {
                          setCustomLocName(currentMatch.finderProposedLocation?.locationName || '');
                          setCustomLandmark(currentMatch.finderProposedLocation?.landmark || '');
                          setCustomInstructions(currentMatch.finderProposedLocation?.instructions || '');
                          setEditLocationMode(true);
                        }}
                        className="text-[11px] text-emerald-300 hover:text-white underline"
                      >
                        Edit
                      </button>
                    </div>
                    <div className="text-sm font-bold text-white">
                      {currentMatch.finderProposedLocation?.locationName || 'Library Help Desk'}
                    </div>
                    <div className="text-xs text-slate-300">
                      Landmark: {currentMatch.finderProposedLocation?.landmark || 'Main reference counter'}
                    </div>
                    <div className="text-xs text-slate-400 italic">
                      Instructions: {currentMatch.finderProposedLocation?.instructions || 'Available weekdays 10 AM - 5 PM'}
                    </div>

                    <button
                      onClick={() =>
                        onConfirmLocation(
                          currentMatch.id,
                          currentMatch.finderProposedLocation || {
                            locationName: 'Library Help Desk',
                            landmark: 'Main reference counter',
                            instructions: 'Available weekdays 10 AM - 5 PM',
                          }
                        )
                      }
                      className="w-full mt-2 py-2 px-3 rounded-lg bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white text-xs font-bold transition flex items-center justify-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Confirm Finder Location</span>
                    </button>
                  </div>

                  {/* Owner Preferred Location */}
                  <div className="bg-[#0e1526] border border-slate-800 rounded-2xl p-5 space-y-3">
                    <div className="text-xs font-bold uppercase tracking-wider text-rose-400">
                      Owner Suggested Location
                    </div>
                    <div className="text-sm font-bold text-white">
                      {currentMatch.ownerProposedLocation?.locationName || 'University Library Entrance'}
                    </div>
                    <div className="text-xs text-slate-300">
                      Landmark: {currentMatch.ownerProposedLocation?.landmark || 'Near front turnstiles'}
                    </div>
                    <div className="text-xs text-slate-400 italic">
                      Instructions: {currentMatch.ownerProposedLocation?.instructions || 'Available weekdays after 2 PM'}
                    </div>

                    <button
                      onClick={() =>
                        onConfirmLocation(
                          currentMatch.id,
                          currentMatch.ownerProposedLocation || {
                            locationName: 'University Library Entrance',
                            landmark: 'Near front turnstiles',
                            instructions: 'Available weekdays after 2 PM',
                          }
                        )
                      }
                      className="w-full mt-2 py-2 px-3 rounded-lg bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white text-xs font-bold transition flex items-center justify-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Accept Owner Location</span>
                    </button>
                  </div>
                </div>

                {/* Edit Location Form */}
                {editLocationMode && (
                  <form
                    onSubmit={handleSaveCustomLocation}
                    className="p-5 bg-slate-900 border border-slate-700 rounded-xl space-y-3"
                  >
                    <div className="text-xs font-bold text-white">Update Your Suggested Location</div>
                    <input
                      type="text"
                      required
                      placeholder="Location name"
                      value={customLocName}
                      onChange={(e) => setCustomLocName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white"
                    />
                    <input
                      type="text"
                      placeholder="Landmark"
                      value={customLandmark}
                      onChange={(e) => setCustomLandmark(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white"
                    />
                    <input
                      type="text"
                      placeholder="Instructions"
                      value={customInstructions}
                      onChange={(e) => setCustomInstructions(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white"
                    />
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditLocationMode(false)}
                        className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg text-xs"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            ) : (
              <div className="p-8 text-center text-slate-400">No match selected.</div>
            )}
          </div>
        )}

        {/* TAB 7: REWARDS & CREDITS */}
        {activeTab === 'rewards' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Award className="w-6 h-6 text-amber-400" />
                <span>Finder Credits & Recognition</span>
              </h2>
              <p className="text-sm text-slate-400">
                Community reward credits earned for honest reporting and safe return coordination (no real money or escrow).
              </p>
            </div>

            {/* Total Balance Card */}
            <div className="bg-gradient-to-tr from-amber-950/40 via-slate-900 to-[#142328] border border-amber-500/30 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
              <div className="space-y-2 text-center sm:text-left">
                <div className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  Total Finder Balance
                </div>
                <div className="text-4xl sm:text-5xl font-extrabold text-white flex items-center justify-center sm:justify-start gap-3">
                  <span>{totalCredits}</span>
                  <span className="text-lg font-bold text-amber-400">Credits</span>
                </div>
                <div className="text-xs text-slate-300">
                  Earned across <strong className="text-emerald-400">{completedReturnsCount} successful verified recovery</strong> cases.
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-center space-y-1 shrink-0">
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Samaritan Tier
                </span>
                <div className="text-base font-bold text-white">Campus Guardian</div>
                <div className="text-[11px] text-slate-400">Top 5% Finder Badge</div>
              </div>
            </div>

            {/* Credit Earning Rules */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-[#0e1526] border border-slate-800 rounded-xl p-5 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Prompt Response (+20 Credits)</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Earned when you promptly accept an owner's return request and open communication.
                </p>
              </div>

              <div className="bg-[#0e1526] border border-slate-800 rounded-xl p-5 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                  <Award className="w-4 h-4" />
                  <span>Successful Handoff (+100 Credits)</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Earned when the owner confirms in-person receipt of their lost property.
                </p>
              </div>
            </div>

            {/* Campus Perks Redemption */}
            <div className="bg-[#0e1526] border border-slate-800 rounded-2xl p-6 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Gift className="w-4 h-4 text-emerald-400" />
                <span>Available Campus Recognitions</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="text-xs font-bold text-white">Campus Coffee Voucher</div>
                  <div className="text-[11px] text-slate-400">Free espresso or tea at the Student Union cafe.</div>
                  <div className="text-xs font-bold text-amber-400 pt-1">Cost: 100 Credits</div>
                </div>

                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="text-xs font-bold text-white">Library Study Room Priority</div>
                  <div className="text-[11px] text-slate-400">2-hour priority reservation for quiet group rooms.</div>
                  <div className="text-xs font-bold text-amber-400 pt-1">Cost: 150 Credits</div>
                </div>

                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="text-xs font-bold text-white">Bookstore 15% Discount</div>
                  <div className="text-[11px] text-slate-400">Valid on campus apparel and course stationery.</div>
                  <div className="text-xs font-bold text-amber-400 pt-1">Cost: 200 Credits</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
