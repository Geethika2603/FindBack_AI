import React, { useState } from 'react';
import { User, LostItem, FoundItem, ItemMatch, FinderNavTab, HandoffLocationPreference } from '../types';
import { 
  Compass, PlusCircle, CheckCircle2, Award, ShieldCheck, 
  MapPin, Calendar, Clock, LogOut, ArrowRight, Eye, 
  Tag, Sparkles, Layers, Check, XCircle, CheckSquare, Gift, HeartHandshake
} from 'lucide-react';

interface FinderPortalProps {
  user: User;
  foundItems: FoundItem[];
  lostItems: LostItem[];
  matches: ItemMatch[];
  onAddFoundItem: (item: FoundItem) => void;
  onUpdateMatch: (match: ItemMatch) => void;
  onLogout: () => void;
}

export const FinderPortal: React.FC<FinderPortalProps> = ({
  user,
  foundItems,
  lostItems,
  matches,
  onAddFoundItem,
  onUpdateMatch,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<FinderNavTab>('dashboard');
  const [showDemoItemsTab, setShowDemoItemsTab] = useState<boolean>(false);

  // Form state for Report Found Item
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
  const [handoffLocName, setHandoffLocName] = useState('University Library Entrance');
  const [handoffLandmark, setHandoffLandmark] = useState('Near Front Security Turnstiles');
  const [handoffInstructions, setHandoffInstructions] = useState('Available daily 2 PM - 6 PM');
  const [formSuccess, setFormSuccess] = useState(false);

  // Filter user's found items vs demo found items
  const userFoundItems = foundItems.filter((item) => !item.isDemo && (item.finderId === user.id || !item.finderId));
  const demoFoundItems = foundItems.filter((item) => item.isDemo);

  // Return requests are matches where the Owner has verified ownership
  const returnRequests = matches.filter((m) => m.verificationStatus === 'verified');
  const successfulReturnsCount = user.successfulReturns || matches.filter((m) => m.ownerConfirmedReceived).length;
  const rewardPointsTotal = (user.rewardPoints || 0) + (successfulReturnsCount * 100);

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
      status: 'Open',
      isDemo: false,
      finderId: user.id,
      finderName: user.name,
      createdAt: new Date().toISOString(),
      preferredHandoff: {
        locationName: handoffLocName.trim(),
        landmark: handoffLandmark.trim(),
        instructions: handoffInstructions.trim(),
      }
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
    }, 1200);
  };

  const handleAcceptReturn = (match: ItemMatch) => {
    const updated: ItemMatch = {
      ...match,
      returnRequestStatus: 'accepted',
      handoffStatus: 'agreed',
    };
    onUpdateMatch(updated);
  };

  const handleDeclineReturn = (match: ItemMatch) => {
    const updated: ItemMatch = {
      ...match,
      returnRequestStatus: 'declined',
    };
    onUpdateMatch(updated);
  };

  return (
    <div className="min-h-screen bg-[#070d18] text-slate-100 flex flex-col font-sans">
      {/* Top Finder Navigation Bar */}
      <header className="border-b border-emerald-950/40 bg-[#0c1619]/95 backdrop-blur sticky top-0 z-30">
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
              <div className="text-[11px] text-slate-400">Found Item Registration & Rewards</div>
            </div>
          </div>

          {/* User badge and logout */}
          <div className="flex items-center space-x-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-semibold text-slate-200">{user.name}</span>
              <span className="text-emerald-400 font-bold">({rewardPointsTotal} pts)</span>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-xs font-semibold text-emerald-300 border border-emerald-900/40 hover:border-emerald-700 transition"
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
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('report_found')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
              activeTab === 'report_found'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>Report Found Item</span>
          </button>

          <button
            onClick={() => setActiveTab('my_found_items')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
              activeTab === 'my_found_items'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>My Found Items</span>
            {userFoundItems.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-emerald-950 text-emerald-300 text-[10px] font-bold border border-emerald-700">
                {userFoundItems.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('possible_matches')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
              activeTab === 'possible_matches'
                ? 'bg-emerald-600 text-white shadow'
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
            onClick={() => setActiveTab('return_requests')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
              activeTab === 'return_requests'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5 text-indigo-400" />
            <span>Return Requests</span>
            {returnRequests.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-indigo-950 text-indigo-300 text-[10px] font-bold border border-indigo-700">
                {returnRequests.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('handoff')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
              activeTab === 'handoff'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <MapPin className="w-3.5 h-3.5 text-amber-400" />
            <span>Handoff</span>
          </button>

          <button
            onClick={() => setActiveTab('rewards')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
              activeTab === 'rewards'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Gift className="w-3.5 h-3.5 text-yellow-400" />
            <span>Rewards ({rewardPointsTotal} pts)</span>
          </button>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        
        {/* VIEW 1: DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            
            {/* Welcome banner */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-800/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <span className="text-xs uppercase font-bold tracking-wider text-emerald-400">
                  Finder Workspace
                </span>
                <h2 className="text-2xl font-bold text-white mt-1">
                  Welcome, {user.name}!
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
                  Thank you for helping lost items find their way home. Log items in secure custody, review verified return requests, and earn recognition rewards.
                </p>
              </div>
              <button
                onClick={() => setActiveTab('report_found')}
                className="py-3 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition shrink-0 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>+ Report Found Item</span>
              </button>
            </div>

            {/* Metric Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
                  <Compass className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xl font-bold text-white">{userFoundItems.length}</div>
                  <div className="text-xs text-slate-400">Items Found</div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xl font-bold text-cyan-300">{matches.length}</div>
                  <div className="text-xs text-slate-400">Possible Matches</div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold">
                  <CheckSquare className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xl font-bold text-indigo-300">{returnRequests.length}</div>
                  <div className="text-xs text-slate-400">Return Requests</div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-teal-500/10 text-teal-400 flex items-center justify-center font-bold">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xl font-bold text-teal-300">{successfulReturnsCount}</div>
                  <div className="text-xs text-slate-400">Successful Returns</div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-yellow-500/10 text-yellow-400 flex items-center justify-center font-bold">
                  <Gift className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xl font-bold text-yellow-400">{rewardPointsTotal}</div>
                  <div className="text-xs text-slate-400">Reward Points</div>
                </div>
              </div>
            </div>

            {/* Pending Return Requests Alert */}
            {returnRequests.length > 0 && (
              <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-950/60 to-slate-900 border border-indigo-600/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="font-bold text-white text-sm">
                      {returnRequests.length} Verified Owner Return Request(s) Pending!
                    </div>
                    <div className="text-xs text-slate-300 mt-0.5">
                      The owner has successfully verified identity via the 2/3 private challenge questions.
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('return_requests')}
                  className="py-2 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow cursor-pointer shrink-0"
                >
                  Review Requests &rarr;
                </button>
              </div>
            )}

            {/* Recent Found Items */}
            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Compass className="w-4 h-4 text-emerald-400" />
                  <h3 className="font-bold text-sm text-white">Your Reported Found Items</h3>
                </div>
                <button
                  onClick={() => setActiveTab('my_found_items')}
                  className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold"
                >
                  View All &rarr;
                </button>
              </div>

              {userFoundItems.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  You haven't reported any found items yet. If you picked up an unattended item, log it above!
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {userFoundItems.slice(0, 3).map((item) => (
                    <div key={item.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                          {item.category}
                        </span>
                        <span className="text-[11px] font-bold text-emerald-400">{item.status}</span>
                      </div>
                      <div className="font-bold text-sm text-white">{item.title}</div>
                      <div className="text-xs text-slate-400">Found at: {item.location}</div>
                      <div className="text-xs text-slate-400">Custody: {item.custodyLocation}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* VIEW 2: REPORT FOUND ITEM */}
        {activeTab === 'report_found' && (
          <div className="max-w-3xl mx-auto rounded-2xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl">
            <div className="border-b border-slate-800 pb-4 mb-6">
              <span className="text-xs uppercase font-bold tracking-wider text-emerald-400">
                Finder Submission Form
              </span>
              <h2 className="text-2xl font-bold text-white mt-1">Report a Found Item</h2>
              <p className="text-xs text-slate-400 mt-1">
                Enter the details of the item found. The AI matching system will compare with registered lost items.
              </p>
            </div>

            {formSuccess && (
              <div className="mb-6 p-4 rounded-xl bg-emerald-950 border border-emerald-600/50 text-emerald-200 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>Found item registered! Computing AI correlations against lost items...</span>
              </div>
            )}

            <form onSubmit={handleReportSubmit} className="space-y-5">
              
              {/* Title and Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Item Name *</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Black Nike Water Bottle"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
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
                    className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
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
                    className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
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
                  placeholder="Describe where and in what condition the item was found..."
                  className="w-full px-3.5 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
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
                    className="text-xs text-slate-400 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-emerald-300 hover:file:bg-slate-700"
                  />
                  <span className="text-slate-500 text-xs">or URL:</span>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://..."
                    className="flex-1 px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
                {imageUrl && (
                  <div className="mt-2">
                    <img src={imageUrl} alt="Preview" className="w-20 h-20 rounded-lg object-cover border border-slate-700" />
                  </div>
                )}
              </div>

              {/* Location, Date, Time */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Location Where Found *</label>
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. University Library"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Date Found *</label>
                  <input
                    type="date"
                    required
                    value={dateFound}
                    onChange={(e) => setDateFound(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Time Found *</label>
                  <input
                    type="time"
                    required
                    value={timeFound}
                    onChange={(e) => setTimeFound(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Custody Location */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Current Physical Custody / Storage Location *</label>
                <input
                  type="text"
                  required
                  value={custodyLocation}
                  onChange={(e) => setCustodyLocation(e.target.value)}
                  placeholder="e.g. University Library Front Help Desk (Box 4) or With me"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Preferred Handoff */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-white">Preferred Handoff Location</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-300 mb-1">Location Name</label>
                    <input
                      type="text"
                      value={handoffLocName}
                      onChange={(e) => setHandoffLocName(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-300 mb-1">Landmark</label>
                    <input
                      type="text"
                      value={handoffLandmark}
                      onChange={(e) => setHandoffLandmark(e.target.value)}
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
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition cursor-pointer"
                >
                  Submit Found Item Report
                </button>
              </div>

            </form>
          </div>
        )}

        {/* VIEW 3: MY FOUND ITEMS */}
        {activeTab === 'my_found_items' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-xl font-bold text-white">My Found Items</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Items you have found and registered in the ReFind AI system.
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
                  onClick={() => setActiveTab('report_found')}
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow"
                >
                  + Report Found Item
                </button>
              </div>
            </div>

            {/* User Found Items */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  User Registered Found Items ({userFoundItems.length})
                </span>
              </div>

              {userFoundItems.length === 0 ? (
                <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                    <Compass className="w-6 h-6" />
                  </div>
                  <div className="text-sm font-semibold text-slate-300">No found items registered yet</div>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Found property on campus? Log it so the rightful owner can be matched and recover it safely.
                  </p>
                  <button
                    onClick={() => setActiveTab('report_found')}
                    className="py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold inline-flex items-center gap-1.5"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Report Found Item</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {userFoundItems.map((item) => (
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
                              : 'bg-teal-950 text-teal-300 border border-teal-800'
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
                            <span>Found at: {item.location}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-slate-500" />
                            <span>{item.dateFound} at {item.timeFound}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-emerald-400">
                            <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                            <span>Custody: {item.custodyLocation}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Demo Found Items Reference */}
            {showDemoItemsTab && (
              <div className="pt-6 border-t border-slate-800/80">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-600/40">
                    DEMO DATA REFERENCE (3 Items)
                  </span>
                  <span className="text-xs text-slate-400">&mdash; Pre-entered demo found records</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {demoFoundItems.map((demo) => (
                    <div
                      key={demo.id}
                      className="rounded-xl bg-[#0e1625] border border-amber-600/30 p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-600/30">
                          DEMO DATA
                        </span>
                        <span className="text-[11px] font-bold text-emerald-300">{demo.status}</span>
                      </div>

                      <h4 className="font-bold text-white text-sm">{demo.title}</h4>
                      <div className="text-xs text-slate-400 space-y-0.5">
                        <div>Category: {demo.category} | Brand: {demo.brand}</div>
                        <div>Color: {demo.color} | Loc: {demo.location}</div>
                        <div>Custody: {demo.custodyLocation}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

        {/* VIEW 4: POSSIBLE MATCHES (FINDER PERSPECTIVE) */}
        {activeTab === 'possible_matches' && (
          <div className="space-y-6">
            <div className="border-b border-slate-800 pb-4">
              <span className="text-xs uppercase font-bold tracking-wider text-cyan-400">
                AI Multimodal 7-Factor Correlation
              </span>
              <h2 className="text-2xl font-bold text-white mt-1">Possible Owner Matches</h2>
              <p className="text-xs text-slate-400 mt-1">
                Candidate lost reports matching found property. Owner's private identifying details remain strictly protected.
              </p>
            </div>

            <div className="space-y-6">
              {matches.map((match) => (
                <div
                  key={match.id}
                  className="rounded-2xl bg-slate-900 border border-slate-800 p-5 space-y-4 hover:border-slate-700 transition"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800">
                          Match Score: {match.factors.overallScore}%
                        </span>
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                          match.verificationStatus === 'verified'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : 'bg-slate-800 text-slate-400'
                        }`}>
                          {match.verificationStatus === 'verified' ? '✓ Owner Verified' : 'Awaiting Owner Verification'}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-white mt-1">
                        {match.foundItem.title} &harr; {match.lostItem.title}
                      </h3>
                    </div>

                    {match.verificationStatus === 'verified' && (
                      <button
                        onClick={() => setActiveTab('return_requests')}
                        className="py-2 px-3.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold"
                      >
                        View Return Request &rarr;
                      </button>
                    )}
                  </div>

                  {/* Side by side overview */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="font-bold text-emerald-400 block mb-1">Found Item (In Your Record):</span>
                      <div className="text-white font-semibold">{match.foundItem.title}</div>
                      <div className="text-slate-400">Found: {match.foundItem.location} on {match.foundItem.dateFound}</div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="font-bold text-rose-400 block mb-1">Reported Lost Item:</span>
                      <div className="text-white font-semibold">{match.lostItem.title}</div>
                      <div className="text-slate-400">Lost: {match.lostItem.location} on {match.lostItem.dateLost}</div>
                      <div className="text-[10px] text-slate-500 mt-1 italic">
                        Owner's private security details are hidden for privacy protection.
                      </div>
                    </div>
                  </div>

                  {/* 7-Factor scores */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 text-center text-xs">
                    <div className="p-2 rounded bg-slate-950 border border-slate-800">
                      <div className="text-[10px] text-slate-400">Image (35%)</div>
                      <div className="font-bold text-cyan-300">{match.factors.imageScore}%</div>
                    </div>
                    <div className="p-2 rounded bg-slate-950 border border-slate-800">
                      <div className="text-[10px] text-slate-400">Text (20%)</div>
                      <div className="font-bold text-cyan-300">{match.factors.textScore}%</div>
                    </div>
                    <div className="p-2 rounded bg-slate-950 border border-slate-800">
                      <div className="text-[10px] text-slate-400">Color (10%)</div>
                      <div className="font-bold text-cyan-300">{match.factors.colorScore}%</div>
                    </div>
                    <div className="p-2 rounded bg-slate-950 border border-slate-800">
                      <div className="text-[10px] text-slate-400">Brand (10%)</div>
                      <div className="font-bold text-cyan-300">{match.factors.brandScore}%</div>
                    </div>
                    <div className="p-2 rounded bg-slate-950 border border-slate-800">
                      <div className="text-[10px] text-slate-400">Category (5%)</div>
                      <div className="font-bold text-cyan-300">{match.factors.categoryScore}%</div>
                    </div>
                    <div className="p-2 rounded bg-slate-950 border border-slate-800">
                      <div className="text-[10px] text-slate-400">Location (10%)</div>
                      <div className="font-bold text-cyan-300">{match.factors.locationScore}%</div>
                    </div>
                    <div className="p-2 rounded bg-slate-950 border border-slate-800">
                      <div className="text-[10px] text-slate-400">Time (10%)</div>
                      <div className="font-bold text-cyan-300">{match.factors.timeScore}%</div>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW 5: RETURN REQUESTS (SECTION 14) */}
        {activeTab === 'return_requests' && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="border-b border-slate-800 pb-4">
              <span className="text-xs uppercase font-bold tracking-wider text-indigo-400">
                Verified Owner Requests
              </span>
              <h2 className="text-2xl font-bold text-white mt-1">Return Requests</h2>
              <p className="text-xs text-slate-300 mt-1">
                Owners who successfully passed the 2/3 private verification challenge request safe handoff.
              </p>
            </div>

            {returnRequests.length === 0 ? (
              <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center text-slate-400 text-xs">
                No active return requests pending at this time.
              </div>
            ) : (
              <div className="space-y-4">
                {returnRequests.map((match) => (
                  <div
                    key={match.id}
                    className="p-6 rounded-2xl bg-slate-900 border border-indigo-700/40 space-y-4 shadow-xl"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                          Verified Owner Request
                        </span>
                        <h3 className="text-lg font-bold text-white mt-1">
                          {match.lostItem.title}
                        </h3>
                      </div>

                      <span className="text-xs font-semibold text-emerald-400 bg-emerald-950 px-2.5 py-1 rounded-full border border-emerald-800 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Ownership 2/3 Challenge Passed</span>
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300">
                      <div>
                        <span className="text-slate-400">Owner Name:</span> <strong className="text-white">{match.lostItem.ownerName || 'Verified Student'}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400">AI Match Score:</span> <strong className="text-cyan-400">{match.factors.overallScore}%</strong>
                      </div>
                      <div>
                        <span className="text-slate-400">Found Property:</span> <strong className="text-white">{match.foundItem.title}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400">Custody Spot:</span> <strong className="text-white">{match.foundItem.custodyLocation}</strong>
                      </div>
                    </div>

                    {/* Action buttons (Section 14: Accept Return / Decline Return) */}
                    <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-3">
                      <div>
                        {match.returnRequestStatus === 'accepted' ? (
                          <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Return Request Accepted &bull; Proceed to Handoff</span>
                          </span>
                        ) : match.returnRequestStatus === 'declined' ? (
                          <span className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                            <XCircle className="w-4 h-4" />
                            <span>Return Request Declined</span>
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">
                            Please confirm whether you accept to return this item.
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {match.returnRequestStatus !== 'accepted' && (
                          <button
                            onClick={() => handleDeclineReturn(match)}
                            className="py-2 px-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
                          >
                            Decline Return
                          </button>
                        )}
                        <button
                          onClick={() => {
                            handleAcceptReturn(match);
                            setActiveTab('handoff');
                          }}
                          className="py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow cursor-pointer"
                        >
                          Accept Return & Proceed
                        </button>
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* VIEW 6: HANDOFF */}
        {activeTab === 'handoff' && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 sm:p-8 space-y-6 shadow-2xl">
              <div className="border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-emerald-400" />
                  <span className="text-xs uppercase font-bold tracking-wider text-emerald-400">
                    Handoff Coordination
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-white mt-1">Designate Safe Campus Handoff</h2>
                <p className="text-xs text-slate-300 mt-1">
                  Confirm physical meeting location at an official campus help desk or library reception.
                </p>
              </div>

              {/* Handoff location proposal form for Finder */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Finder Preferred Location Name
                    </label>
                    <input
                      type="text"
                      value={handoffLocName}
                      onChange={(e) => setHandoffLocName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Landmark
                    </label>
                    <input
                      type="text"
                      value={handoffLandmark}
                      onChange={(e) => setHandoffLandmark(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Meeting Instructions / Availability
                  </label>
                  <input
                    type="text"
                    value={handoffInstructions}
                    onChange={(e) => setHandoffInstructions(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs"
                  />
                </div>

                {/* Status Notice */}
                <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-600/50 text-emerald-200 text-xs flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <div className="font-bold">✓ Handoff Location Confirmed</div>
                    <div className="text-[11px] text-emerald-300 mt-0.5">
                      Both Owner and Finder are coordinated at <span className="font-semibold text-white">{handoffLocName}</span> ({handoffLandmark}).
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 space-y-1">
                  <div className="font-semibold text-white">Next Step:</div>
                  <div>
                    Meet the owner in person at the safe campus spot to hand over the item. Once the Owner taps <strong>[ Confirm Item Received ]</strong>, your account will be awarded <strong>+100 Finder Reward Points</strong>!
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* VIEW 7: REWARDS & GAMIFICATION */}
        {activeTab === 'rewards' && (
          <div className="max-w-3xl mx-auto space-y-6">
            
            {/* Top Points Card */}
            <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-emerald-950/70 via-slate-900 to-[#0c1a1f] border border-emerald-600/40 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="space-y-2 text-center sm:text-left">
                <span className="text-xs uppercase font-bold tracking-wider text-emerald-400">
                  Finder Reward Program
                </span>
                <h2 className="text-3xl font-extrabold text-white">
                  {rewardPointsTotal} Points
                </h2>
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <span className="px-2.5 py-1 rounded-full bg-yellow-500/20 text-yellow-300 text-xs font-bold border border-yellow-500/30 flex items-center gap-1">
                    <Award className="w-3.5 h-3.5" />
                    <span>{user.badge || 'Helpful Finder ⭐'}</span>
                  </span>
                  <span className="text-xs text-slate-400">
                    &bull; {successfulReturnsCount} Confirmed Returns
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-center sm:text-right shrink-0">
                <div className="text-xs text-slate-400">Next Tier Bonus</div>
                <div className="text-sm font-bold text-emerald-400 mt-0.5">Top Campus Guardian</div>
                <div className="text-[11px] text-slate-500 mt-1">150 pts until next milestone</div>
              </div>
            </div>

            {/* How Points are Earned */}
            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4">
              <h3 className="font-bold text-sm text-white">How Reward Points Work</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <div className="font-bold text-emerald-400">+100 Points</div>
                  <div className="text-white font-semibold">Confirmed Item Return</div>
                  <div className="text-slate-400 text-[11px]">Awarded immediately when the owner confirms receipt.</div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <div className="font-bold text-cyan-400">+25 Points</div>
                  <div className="text-white font-semibold">Detailed Found Report</div>
                  <div className="text-slate-400 text-[11px]">Awarded for clear photo uploads & custody details.</div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <div className="font-bold text-yellow-400">Campus Badges</div>
                  <div className="text-white font-semibold">Helpful Finder Rank</div>
                  <div className="text-slate-400 text-[11px]">Showcased on your profile across campus channels.</div>
                </div>
              </div>
            </div>

            {/* Return History */}
            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-3">
              <h3 className="font-bold text-sm text-white">Recent Return History</h3>
              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <div>
                      <div className="font-semibold text-white">Apple MacBook Air Laptop</div>
                      <div className="text-slate-400 text-[11px]">Recovered at Science Library Front Desk</div>
                    </div>
                  </div>
                  <span className="font-bold text-emerald-400">+100 pts</span>
                </div>

                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <div>
                      <div className="font-semibold text-white">Black Nike Water Bottle</div>
                      <div className="text-slate-400 text-[11px]">Recovered at University Library</div>
                    </div>
                  </div>
                  <span className="font-bold text-emerald-400">+100 pts</span>
                </div>
              </div>
            </div>

          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-[#060a12] py-4 text-center text-xs text-slate-500">
        ReFind AI Finder Portal &bull; Secure Custody &bull; Verified Returns &bull; Reward Points
      </footer>
    </div>
  );
};
