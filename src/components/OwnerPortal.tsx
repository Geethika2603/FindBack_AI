import React, { useState } from 'react';
import { 
  User, LostItem, FoundItem, ItemMatch, OwnerNavTab, 
  HandoffLocationPreference, UserRole 
} from '../types';
import { 
  Search, PlusCircle, CheckCircle2, AlertTriangle, ShieldCheck, 
  MapPin, Calendar, Clock, LogOut, ArrowRight, Eye, EyeOff, 
  Tag, Sparkles, Layers, Check, XCircle, Send, MessageSquare, 
  HelpCircle, ThumbsUp, Shield, Lock, ChevronRight, CornerDownRight, ArrowLeft
} from 'lucide-react';

interface OwnerPortalProps {
  user: User;
  lostItems: LostItem[];
  foundItems: FoundItem[];
  matches: ItemMatch[];
  onAddLostItem: (item: LostItem) => void;
  onUpdateMatch: (match: ItemMatch) => void;
  onRequestReturn: (matchId: string) => void;
  onSendMessage: (matchId: string, text: string, senderId: string, senderName: string, senderRole: UserRole) => void;
  onProposeLocation: (matchId: string, role: UserRole, loc: HandoffLocationPreference) => void;
  onConfirmLocation: (matchId: string, agreedLoc: HandoffLocationPreference) => void;
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
  onRequestReturn,
  onSendMessage,
  onProposeLocation,
  onConfirmLocation,
  onConfirmRecovery,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<OwnerNavTab>('dashboard');
  const [selectedMatchId, setSelectedMatchId] = useState<string>(matches[0]?.id || '');
  const [showDemoItemsTab, setShowDemoItemsTab] = useState<boolean>(false);

  // Form states for Report Lost Item (Clean manual entry, no autofill)
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Bottle');
  const [brand, setBrand] = useState('');
  const [color, setColor] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [location, setLocation] = useState('');
  const [dateLost, setDateLost] = useState(new Date().toISOString().split('T')[0]);
  const [timeLost, setTimeLost] = useState('14:00');
  
  // 3 Private identifying details
  const [feature1, setFeature1] = useState('');
  const [feature2, setFeature2] = useState('');
  const [feature3, setFeature3] = useState('');

  // Preferred handoff location
  const [handoffLocName, setHandoffLocName] = useState('University Library Main Entrance');
  const [handoffLandmark, setHandoffLandmark] = useState('Near the front turnstiles');
  const [handoffInstructions, setHandoffInstructions] = useState('Available weekdays after 2 PM');
  
  const [formSuccess, setFormSuccess] = useState(false);
  const [revealedPrivateId, setRevealedPrivateId] = useState<string | null>(null);

  // Chat input state
  const [messageInput, setMessageInput] = useState('');

  // Location edit modal/form inside Handoff tab
  const [editLocationMode, setEditLocationMode] = useState(false);
  const [customLocName, setCustomLocName] = useState('');
  const [customLandmark, setCustomLandmark] = useState('');
  const [customInstructions, setCustomInstructions] = useState('');

  // Real items vs demo items
  const userLostItems = lostItems.filter((item) => !item.isDemo && (item.ownerId === user.id || !item.ownerId));
  const demoLostItems = lostItems.filter((item) => item.isDemo);

  // Active match selection
  const currentMatch = matches.find((m) => m.id === selectedMatchId) || matches[0];

  // Stats calculation
  const totalUserLost = userLostItems.length;
  const activeMatchesCount = matches.length;
  const returnRequestsCount = matches.filter(
    (m) => m.workflowStatus === 'return_requested' || m.workflowStatus === 'return_accepted'
  ).length;
  const activeConversationsCount = matches.filter((m) => m.messages && m.messages.length > 0).length;
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
    if (!title.trim()) return;

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
      status: 'Searching for Match',
      isDemo: false,
      ownerId: user.id,
      ownerName: user.name,
      createdAt: new Date().toISOString(),
      preferredHandoff: {
        locationName: handoffLocName.trim(),
        landmark: handoffLandmark.trim(),
        instructions: handoffInstructions.trim(),
      },
    };

    onAddLostItem(newItem);
    setFormSuccess(true);
    setTimeout(() => {
      setFormSuccess(false);
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
    }, 1500);
  };

  const handleSendMessageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !currentMatch) return;
    onSendMessage(currentMatch.id, messageInput, user.id, user.name, 'owner');
    setMessageInput('');
  };

  const sendQuickPrompt = (text: string) => {
    if (!currentMatch) return;
    onSendMessage(currentMatch.id, text, user.id, user.name, 'owner');
  };

  const handleSaveCustomLocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentMatch || !customLocName.trim()) return;
    onProposeLocation(currentMatch.id, 'owner', {
      locationName: customLocName.trim(),
      landmark: customLandmark.trim(),
      instructions: customInstructions.trim(),
    });
    setEditLocationMode(false);
  };

  return (
    <div className="min-h-screen bg-[#070d18] text-slate-100 flex flex-col font-sans selection:bg-rose-500 selection:text-white">
      {/* Navigation Header */}
      <header className="border-b border-rose-950/40 bg-[#0f1422]/95 backdrop-blur sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-600 to-red-500 flex items-center justify-center font-black text-white text-base shadow-lg shadow-rose-600/20">
              R
            </div>
            <div>
              <div className="font-bold text-white text-sm sm:text-base flex items-center gap-2">
                ReFind AI
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30">
                  Owner Portal
                </span>
              </div>
              <div className="text-[11px] text-slate-400">AI Lost & Found Matching and Secure Item Recovery</div>
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="hidden md:flex items-center space-x-2 text-xs bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800">
              <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse"></span>
              <span className="text-slate-300 font-medium">{user.name}</span>
              <span className="text-slate-500">|</span>
              <span className="text-slate-400 font-mono text-[11px]">{user.email}</span>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-rose-950/40 text-slate-300 hover:text-rose-300 border border-slate-700/80 hover:border-rose-700/40 text-xs font-semibold transition"
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
            { id: 'report_lost', label: 'Report Lost Item', icon: PlusCircle },
            { id: 'my_lost_items', label: 'My Lost Items', count: userLostItems.length, icon: Tag },
            { id: 'possible_matches', label: 'Possible Matches', count: activeMatchesCount, icon: Sparkles },
            { id: 'messages', label: 'Messages', count: activeConversationsCount, icon: MessageSquare },
            { id: 'handoff', label: 'Handoff', icon: ShieldCheck },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as OwnerNavTab)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-rose-600 text-white shadow-md shadow-rose-600/25'
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

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
        {/* TAB 1: OWNER DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            <div className="bg-gradient-to-r from-rose-950/40 via-slate-900 to-[#0e1628] border border-rose-900/30 rounded-2xl p-6 sm:p-8 relative overflow-hidden">
              <div className="relative z-10 space-y-2 max-w-2xl">
                <span className="text-[11px] font-bold uppercase tracking-wider text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-md border border-rose-500/20">
                  Owner Overview
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                  Welcome, {user.name}
                </h2>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Manage your reported lost items, review 7-factor AI matching scores with found property, coordinate secure handoffs, and confirm item returns safely.
                </p>
                <div className="pt-2 flex flex-wrap gap-3">
                  <button
                    onClick={() => setActiveTab('report_lost')}
                    className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-rose-600/20 transition cursor-pointer"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Report Lost Item</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('possible_matches')}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 border border-slate-700 transition cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <span>View Possible Matches</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Dashboard 5 Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              <div className="bg-[#0e1526] border border-slate-800 rounded-xl p-4 shadow-sm">
                <div className="text-slate-400 text-xs font-medium">Lost Items</div>
                <div className="text-2xl font-bold text-white mt-1">{totalUserLost}</div>
                <div className="text-[11px] text-rose-400 mt-0.5">Active reports</div>
              </div>

              <div className="bg-[#0e1526] border border-slate-800 rounded-xl p-4 shadow-sm">
                <div className="text-slate-400 text-xs font-medium">Possible Matches</div>
                <div className="text-2xl font-bold text-cyan-400 mt-1">{activeMatchesCount}</div>
                <div className="text-[11px] text-cyan-300 mt-0.5">7-factor computed</div>
              </div>

              <div className="bg-[#0e1526] border border-slate-800 rounded-xl p-4 shadow-sm">
                <div className="text-slate-400 text-xs font-medium">Return Requests</div>
                <div className="text-2xl font-bold text-amber-400 mt-1">{returnRequestsCount}</div>
                <div className="text-[11px] text-amber-300 mt-0.5">In progress</div>
              </div>

              <div className="bg-[#0e1526] border border-slate-800 rounded-xl p-4 shadow-sm">
                <div className="text-slate-400 text-xs font-medium">Active Conversations</div>
                <div className="text-2xl font-bold text-emerald-400 mt-1">{activeConversationsCount}</div>
                <div className="text-[11px] text-emerald-300 mt-0.5">Direct chat</div>
              </div>

              <div className="bg-[#0e1526] border border-slate-800 rounded-xl p-4 shadow-sm col-span-2 sm:col-span-1">
                <div className="text-slate-400 text-xs font-medium">Recovered Items</div>
                <div className="text-2xl font-bold text-white mt-1">{recoveredCount}</div>
                <div className="text-[11px] text-emerald-400 mt-0.5">Confirmed handoff</div>
              </div>
            </div>

            {/* Quick Status of Matches */}
            <div className="bg-[#0e1526] border border-slate-800/90 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <span>Top AI Matches for Your Lost Reports</span>
                  </h3>
                  <p className="text-xs text-slate-400">Calculated from actual multimodal parameters (no random numbers)</p>
                </div>
                <button
                  onClick={() => setActiveTab('possible_matches')}
                  className="text-xs font-semibold text-rose-400 hover:text-rose-300 flex items-center gap-1"
                >
                  <span>View all</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {matches.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-sm">
                  No matches detected yet. Report a lost item to start AI matching.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {matches.slice(0, 2).map((m) => (
                    <div
                      key={m.id}
                      className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-rose-500/40 transition space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="text-xs font-bold text-rose-400">LOST: {m.lostItem.title}</div>
                          <div className="text-xs text-slate-300 mt-0.5">FOUND: {m.foundItem.title}</div>
                        </div>
                        <span
                          className={`text-xs font-bold px-2.5 py-1 rounded-md ${
                            m.factors.overallScore >= 80
                              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}
                        >
                          {m.factors.overallScore}% Match
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-400 flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-500" />
                          {m.foundItem.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-500" />
                          {m.foundItem.dateFound}
                        </span>
                      </div>

                      <div className="pt-2 flex items-center justify-between border-t border-slate-800/80">
                        <span className="text-[11px] text-slate-400">
                          Status:{' '}
                          <strong className="text-slate-200">
                            {m.workflowStatus === 'return_requested'
                              ? 'Return Requested'
                              : m.workflowStatus === 'return_accepted'
                              ? 'Return Accepted'
                              : m.workflowStatus === 'completed'
                              ? 'Recovered'
                              : 'Match Available'}
                          </strong>
                        </span>
                        <button
                          onClick={() => {
                            setSelectedMatchId(m.id);
                            setActiveTab('possible_matches');
                          }}
                          className="px-3 py-1 rounded bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white text-xs font-semibold transition"
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

        {/* TAB 2: REPORT LOST ITEM */}
        {activeTab === 'report_lost' && (
          <div className="max-w-3xl mx-auto">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <PlusCircle className="w-6 h-6 text-rose-500" />
                <span>Report Lost Item</span>
              </h2>
              <p className="text-sm text-slate-300 mt-1">
                Enter the details of what you lost. All fields are manual — no fake details or automatic pre-filling.
              </p>
            </div>

            {formSuccess && (
              <div className="mb-6 p-4 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-sm flex items-center gap-3 shadow-lg">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <div className="font-bold">✓ Lost item reported successfully.</div>
                  <div className="text-xs text-emerald-300/80">Saved to database with status "Searching for Match". Redirecting to My Lost Items...</div>
                </div>
              </div>
            )}

            <form onSubmit={handleReportSubmit} className="space-y-6 bg-[#0e1526] border border-slate-800 rounded-2xl p-6 sm:p-8">
              {/* Basic Details Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-rose-400 border-b border-slate-800 pb-2">
                  1. Basic Item Details
                </h3>

                <div>
                  <label className="block text-xs font-semibold text-slate-200 mb-1">
                    Item Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Black Nike Water Bottle"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-200 mb-1">
                      Category <span className="text-rose-400">*</span>
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-rose-500"
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
                      Brand <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Nike, Apple, Generic"
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-rose-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-200 mb-1">
                      Color <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Black, Space Gray, Navy"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-rose-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-200 mb-1">
                    Description <span className="text-rose-400">*</span>
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Describe external visual features visible to anyone..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-200 mb-1">
                      Date Lost <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={dateLost}
                      onChange={(e) => setDateLost(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-rose-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-200 mb-1">
                      Time Lost <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="time"
                      required
                      value={timeLost}
                      onChange={(e) => setTimeLost(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-rose-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-200 mb-1">
                      Location Where Lost <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. University Library 2nd Floor"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-rose-500"
                    />
                  </div>
                </div>

                {/* Upload Image of Lost Item */}
                <div>
                  <label className="block text-xs font-semibold text-slate-200 mb-1">
                    Upload Image of Lost Item (JPG, JPEG, PNG, WEBP)
                  </label>
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                    onChange={handleImageFileUpload}
                    className="block w-full text-xs text-slate-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-rose-600/20 file:text-rose-300 hover:file:bg-rose-600/30 file:cursor-pointer cursor-pointer bg-slate-900 p-2 rounded-xl border border-slate-700"
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
                          <Check className="w-3.5 h-3.5" /> Image uploaded successfully
                        </div>
                        <div className="text-slate-500 text-[11px] mt-0.5">This authentic photo will be fed to the 7-factor image similarity engine.</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* SECTION 2: PRIVATE IDENTIFICATION DETAILS */}
              <div className="space-y-4 pt-4 border-t border-slate-800">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-purple-400" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-purple-300">
                    2. Private Ownership Details
                  </h3>
                </div>
                <div className="p-3.5 rounded-xl bg-purple-950/30 border border-purple-800/40 text-xs text-purple-200 leading-relaxed">
                  <strong>Explanation:</strong> These details are private and are used later to verify that you are the real owner. They are <span className="underline font-bold">not shown to the Finder</span>.
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Private Detail 1: What unique sticker/mark was on the item? <span className="text-purple-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Blue mountain vinyl sticker on upper side"
                      value={feature1}
                      onChange={(e) => setFeature1(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-900 border border-purple-800/50 rounded-xl text-sm text-white focus:outline-none focus:border-purple-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Private Detail 2: What was the approximate capacity/size? <span className="text-purple-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 750ml capacity vacuum insulated"
                      value={feature2}
                      onChange={(e) => setFeature2(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-900 border border-purple-800/50 rounded-xl text-sm text-white focus:outline-none focus:border-purple-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Private Detail 3: Was there any scratch, damage or unique feature? <span className="text-purple-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Small dent on bottom rim and initials SJ written under base"
                      value={feature3}
                      onChange={(e) => setFeature3(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-900 border border-purple-800/50 rounded-xl text-sm text-white focus:outline-none focus:border-purple-400"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 3: PREFERRED SAFE HANDOFF LOCATION */}
              <div className="space-y-4 pt-4 border-t border-slate-800">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-rose-400" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-rose-300">
                    3. Your Preferred Handoff Location (Optional)
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Location Name</label>
                    <input
                      type="text"
                      placeholder="e.g. College Library Main Entrance"
                      value={handoffLocName}
                      onChange={(e) => setHandoffLocName(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-rose-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Landmark</label>
                    <input
                      type="text"
                      placeholder="e.g. Near Front Security Turnstiles"
                      value={handoffLandmark}
                      onChange={(e) => setHandoffLandmark(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-rose-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Additional Instructions</label>
                  <input
                    type="text"
                    placeholder="e.g. Available weekdays after 2 PM"
                    value={handoffInstructions}
                    onChange={(e) => setHandoffInstructions(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full py-3.5 px-6 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm transition shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Check className="w-5 h-5" />
                  <span>SUBMIT LOST ITEM</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 3: MY LOST ITEMS */}
        {activeTab === 'my_lost_items' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Tag className="w-6 h-6 text-rose-500" />
                  <span>My Lost Items</span>
                </h2>
                <p className="text-sm text-slate-400">Items you have reported missing with their active search status.</p>
              </div>
              <button
                onClick={() => setActiveTab('report_lost')}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1.5 self-start transition"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Report Another Item</span>
              </button>
            </div>

            {userLostItems.length === 0 ? (
              <div className="p-12 text-center bg-[#0e1526] border border-slate-800 rounded-2xl space-y-4">
                <div className="w-12 h-12 rounded-full bg-slate-800 text-slate-500 mx-auto flex items-center justify-center">
                  <Tag className="w-6 h-6" />
                </div>
                <div className="text-white font-bold text-lg">No lost items reported yet</div>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Submit a report with manual details and your own image to let ReFind AI search existing found property.
                </p>
                <button
                  onClick={() => setActiveTab('report_lost')}
                  className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold"
                >
                  Report Lost Item
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {userLostItems.map((item) => (
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
                          <span className="text-xs font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                            {item.category}
                          </span>
                          <span
                            className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                              item.status === 'Recovered'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                            }`}
                          >
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
                        <span>{item.dateLost} at {item.timeLost}</span>
                      </div>
                    </div>

                    {/* Private Details Toggle */}
                    <div className="p-3 bg-slate-900/80 rounded-xl border border-purple-900/30 text-xs">
                      <div className="flex items-center justify-between text-purple-300 font-semibold mb-1">
                        <span className="flex items-center gap-1.5">
                          <Lock className="w-3.5 h-3.5" />
                          Encrypted Private Details
                        </span>
                        <button
                          onClick={() => setRevealedPrivateId(revealedPrivateId === item.id ? null : item.id)}
                          className="text-[11px] text-purple-400 hover:text-purple-200 underline"
                        >
                          {revealedPrivateId === item.id ? 'Hide' : 'Reveal'}
                        </button>
                      </div>

                      {revealedPrivateId === item.id ? (
                        <div className="space-y-1 text-slate-300 text-[11px] pt-1 border-t border-purple-900/40">
                          <div>1. {item.privateFeatures.feature1}</div>
                          <div>2. {item.privateFeatures.feature2}</div>
                          <div>3. {item.privateFeatures.feature3}</div>
                        </div>
                      ) : (
                        <div className="text-[11px] text-slate-500 italic">
                          Protected. Used exclusively to verify your genuine ownership.
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Collapsible Demo Lost Items */}
            <div className="pt-6 border-t border-slate-800">
              <button
                onClick={() => setShowDemoItemsTab(!showDemoItemsTab)}
                className="text-xs font-semibold text-slate-400 hover:text-slate-200 flex items-center gap-2"
              >
                <span>{showDemoItemsTab ? 'Hide' : 'View'} Reference Demo Lost Items ({demoLostItems.length})</span>
                <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 font-bold">
                  DEMO DATA
                </span>
              </button>

              {showDemoItemsTab && (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {demoLostItems.map((demo) => (
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
                      <div className="text-[11px] text-slate-500">Location: {demo.location}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: MY POSSIBLE MATCHES */}
        {activeTab === 'possible_matches' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-cyan-400" />
                <span>My Possible Matches</span>
              </h2>
              <p className="text-sm text-slate-400">
                Multimodal AI comparison between your lost report and items logged by Finders.
              </p>
            </div>

            {matches.length === 0 ? (
              <div className="p-12 text-center bg-[#0e1526] border border-slate-800 rounded-2xl text-slate-400 text-sm">
                No possible matches available at this moment.
              </div>
            ) : (
              <div className="space-y-6">
                {matches.map((m) => {
                  const score = m.factors.overallScore;
                  const matchLevel = score >= 80 ? 'High Match' : score >= 60 ? 'Medium Match' : 'Low Match';
                  const isReturnRequested = m.workflowStatus === 'return_requested';
                  const isReturnAccepted = m.workflowStatus === 'return_accepted' || m.workflowStatus === 'location_confirmed' || m.workflowStatus === 'completed';

                  return (
                    <div
                      key={m.id}
                      className="bg-[#0e1526] border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl"
                    >
                      {/* Top Header with Score and Disclaimer */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                        <div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-sm font-black px-3 py-1 rounded-lg ${
                                score >= 80
                                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              }`}
                            >
                              Possible Match: {score}%
                            </span>
                            <span className="text-xs font-bold text-slate-400">
                              ({matchLevel})
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400 mt-1 italic">
                            "AI-generated possible match. Ownership must be verified."
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-3">
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
                                <span>Open Messages</span>
                              </button>
                            </div>
                          ) : isReturnRequested ? (
                            <div className="px-3.5 py-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold">
                              Return Requested &bull; Awaiting Finder
                            </div>
                          ) : (
                            <button
                              onClick={() => onRequestReturn(m.id)}
                              className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/25 flex items-center gap-2 transition cursor-pointer"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              <span>REQUEST RETURN</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Side by Side Comparison: Lost Item vs Found Item */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Lost Item Column */}
                        <div className="p-4 rounded-xl bg-slate-900/90 border border-rose-950/40 space-y-3">
                          <div className="text-xs font-bold text-rose-400 uppercase tracking-wider">
                            Your Lost Item
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

                        {/* Found Item Column */}
                        <div className="p-4 rounded-xl bg-slate-900/90 border border-emerald-950/40 space-y-3">
                          <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                            Finder's Found Report
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
                      </div>

                      {/* Exact 7-Factor Breakdown */}
                      <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
                        <div className="text-xs font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Calculated 7-Factor Weighted Breakdown</span>
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

        {/* TAB 5: IN-APP MESSAGES */}
        {activeTab === 'messages' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <MessageSquare className="w-6 h-6 text-cyan-400" />
                <span>In-App Messages</span>
              </h2>
              <p className="text-sm text-slate-400">
                Communicate directly with the Finder to coordinate handoff without sharing personal contact information.
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
                        ? 'bg-rose-600 text-white border-rose-500'
                        : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {m.lostItem.title} &harr; {m.foundItem.title}
                  </button>
                ))}
              </div>
            )}

            {currentMatch ? (
              <div className="bg-[#0e1526] border border-slate-800 rounded-2xl overflow-hidden shadow-xl flex flex-col h-[580px]">
                {/* Chat Header */}
                <div className="p-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="text-xs text-slate-400">Item Conversation</div>
                    <div className="text-sm font-bold text-white">{currentMatch.lostItem.title}</div>
                  </div>
                  <div className="text-right text-xs">
                    <div className="text-slate-400">Finder</div>
                    <div className="font-bold text-emerald-400">{currentMatch.foundItem.finderName || 'Finder'}</div>
                  </div>
                </div>

                {/* Message Feed */}
                <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#070d18]/60">
                  {currentMatch.messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-2">
                      <MessageSquare className="w-8 h-8 text-slate-600" />
                      <div className="text-sm font-medium">No messages yet</div>
                      <p className="text-xs max-w-sm text-slate-500">
                        Say hello to the Finder, confirm availability, or suggest meeting near the library or campus center.
                      </p>
                    </div>
                  ) : (
                    currentMatch.messages.map((msg) => {
                      const isMe = msg.senderRole === 'owner';
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
                                ? 'bg-rose-600 text-white rounded-br-xs'
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

                {/* Quick meeting prompts */}
                <div className="p-2.5 bg-slate-900 border-t border-slate-800/80 flex flex-wrap gap-2">
                  <span className="text-[10px] text-slate-400 self-center">Quick prompt:</span>
                  {[
                    'Can we meet at the library help desk?',
                    'Yes, I can bring the item tomorrow at 3 PM.',
                    'Let me know when you are nearby.',
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
                    placeholder="Type a message to the Finder..."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
                  />
                  <button
                    type="submit"
                    className="p-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white transition shadow cursor-pointer shrink-0"
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
                <span>Safe Handoff & Item Recovery</span>
              </h2>
              <p className="text-sm text-slate-400">
                Agree on a safe campus location, verify handoff, and confirm physical recovery of your property.
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

                {/* Handover Notice & Owner Receipt Confirmation */}
                {currentMatch.workflowStatus === 'item_handed_over' && !currentMatch.ownerConfirmedReceived && (
                  <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950/60 to-slate-900 border-2 border-emerald-500/60 space-y-3">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                      <CheckCircle2 className="w-5 h-5" />
                      <span>Finder Has Marked Item as Handed Over!</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Did you physically receive your <strong>{currentMatch.lostItem.title}</strong>? Once you confirm receipt, the case will be completed and the Finder will be awarded +100 Finder Credits.
                    </p>
                    <button
                      onClick={() => onConfirmRecovery(currentMatch.id)}
                      className="py-3 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 flex items-center gap-2 transition cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      <span>I RECEIVED MY ITEM</span>
                    </button>
                  </div>
                )}

                {/* Case Completed Celebration Banner */}
                {currentMatch.workflowStatus === 'completed' && (
                  <div className="p-6 rounded-2xl bg-emerald-950/40 border border-emerald-500/50 text-emerald-200 text-sm space-y-2">
                    <div className="font-bold flex items-center gap-2 text-base text-emerald-300">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      <span>Case Completed &bull; Item Recovered</span>
                    </div>
                    <p className="text-xs text-emerald-300/80">
                      You have verified receipt of your item. +100 Finder Credits have been awarded to {currentMatch.foundItem.finderName || 'Finder'}. Thank you for using ReFind AI!
                    </p>
                  </div>
                )}

                {/* Location Suggestions Side by Side */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Owner Preferred Location */}
                  <div className="bg-[#0e1526] border border-slate-800 rounded-2xl p-5 space-y-3">
                    <div className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center justify-between">
                      <span>Owner Suggested Location</span>
                      <button
                        onClick={() => {
                          setCustomLocName(currentMatch.ownerProposedLocation?.locationName || '');
                          setCustomLandmark(currentMatch.ownerProposedLocation?.landmark || '');
                          setCustomInstructions(currentMatch.ownerProposedLocation?.instructions || '');
                          setEditLocationMode(true);
                        }}
                        className="text-[11px] text-rose-300 hover:text-white underline"
                      >
                        Edit
                      </button>
                    </div>
                    <div className="text-sm font-bold text-white">
                      {currentMatch.ownerProposedLocation?.locationName || 'College Library Main Entrance'}
                    </div>
                    <div className="text-xs text-slate-300">
                      Landmark: {currentMatch.ownerProposedLocation?.landmark || 'Near front turnstiles'}
                    </div>
                    <div className="text-xs text-slate-400 italic">
                      Instructions: {currentMatch.ownerProposedLocation?.instructions || 'Available after 2 PM'}
                    </div>

                    <button
                      onClick={() =>
                        onConfirmLocation(
                          currentMatch.id,
                          currentMatch.ownerProposedLocation || {
                            locationName: 'College Library Main Entrance',
                            landmark: 'Near front turnstiles',
                            instructions: 'Available after 2 PM',
                          }
                        )
                      }
                      className="w-full mt-2 py-2 px-3 rounded-lg bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white text-xs font-bold transition flex items-center justify-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Confirm Owner Location</span>
                    </button>
                  </div>

                  {/* Finder Preferred Location */}
                  <div className="bg-[#0e1526] border border-slate-800 rounded-2xl p-5 space-y-3">
                    <div className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                      Finder Suggested Location
                    </div>
                    <div className="text-sm font-bold text-white">
                      {currentMatch.finderProposedLocation?.locationName || 'Library Help Desk'}
                    </div>
                    <div className="text-xs text-slate-300">
                      Landmark: {currentMatch.finderProposedLocation?.landmark || 'Main floor desk'}
                    </div>
                    <div className="text-xs text-slate-400 italic">
                      Instructions: {currentMatch.finderProposedLocation?.instructions || 'Available 10 AM - 5 PM'}
                    </div>

                    <button
                      onClick={() =>
                        onConfirmLocation(
                          currentMatch.id,
                          currentMatch.finderProposedLocation || {
                            locationName: 'Library Help Desk',
                            landmark: 'Main floor desk',
                            instructions: 'Available 10 AM - 5 PM',
                          }
                        )
                      }
                      className="w-full mt-2 py-2 px-3 rounded-lg bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white text-xs font-bold transition flex items-center justify-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Accept Finder Location</span>
                    </button>
                  </div>
                </div>

                {/* Edit Location Form Modal */}
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
                        className="px-3 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-bold"
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

                {/* Agreed Location Summary */}
                {currentMatch.agreedLocation && (
                  <div className="p-5 rounded-2xl bg-slate-900 border border-cyan-500/40 space-y-2">
                    <div className="text-xs font-bold text-cyan-400 flex items-center gap-2">
                      <Check className="w-4 h-4" />
                      <span>Confirmed Meeting Point</span>
                    </div>
                    <div className="text-sm font-bold text-white">
                      {currentMatch.agreedLocation.locationName}
                    </div>
                    <div className="text-xs text-slate-300">
                      {currentMatch.agreedLocation.landmark} &bull; {currentMatch.agreedLocation.instructions}
                    </div>
                  </div>
                )}

                {/* Direct button if not yet completed */}
                {currentMatch.workflowStatus !== 'completed' && (
                  <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-white">Received your item in person?</div>
                      <div className="text-[11px] text-slate-400">Close the case and award Finder Credits.</div>
                    </div>
                    <button
                      onClick={() => onConfirmRecovery(currentMatch.id)}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow cursor-pointer"
                    >
                      [ I RECEIVED MY ITEM ]
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-8 text-center text-slate-400">No match selected.</div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};
