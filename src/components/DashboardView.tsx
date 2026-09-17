import React, { useState } from 'react';
import { 
  Search, ShieldAlert, Sparkles, MapPin, Calendar, DollarSign, 
  CheckCircle2, ArrowRight, ShieldCheck, QrCode, Filter, AlertCircle, 
  ExternalLink, Layers, Eye
} from 'lucide-react';
import { LostItem, FoundItem, ItemMatch, ActiveTab } from '../types';

interface DashboardViewProps {
  lostItems: LostItem[];
  foundItems: FoundItem[];
  matches: ItemMatch[];
  setActiveTab: (tab: ActiveTab) => void;
  onInitiateVerification: (match: ItemMatch) => void;
  onOpenHandoff: (match: ItemMatch) => void;
  onRunAIEngine: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  lostItems,
  foundItems,
  matches,
  setActiveTab,
  onInitiateVerification,
  onOpenHandoff,
  onRunAIEngine,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const pendingMatches = matches.filter(m => m.status === 'pending_review' || m.status === 'verification_in_progress');
  const recoveredMatches = matches.filter(m => m.status === 'completed');
  const totalEscrow = lostItems.reduce((acc, item) => acc + (item.rewardEscrowed ? item.rewardAmount : 0), 0);
  const totalDistributed = recoveredMatches.reduce((acc, m) => acc + (m.lostItem.rewardAmount || 0), 0);

  const filteredLost = lostItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.location.landmark.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const filteredFound = foundItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.location.landmark.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8 pb-12">
      {/* Hero / Workflow Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 border border-slate-700/60 p-6 sm:p-8 shadow-xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Full ReFind AI Recovery Loop Active</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Multimodal Lost & Found Platform
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Matching lost and found articles across visual geometry, semantic descriptions, geographic proximity, and temporal intervals with cryptographically verified handoffs.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setActiveTab('report_lost')}
              className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-rose-600/20 transition-all flex items-center space-x-2 active:scale-95"
            >
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              <span>Report Lost Item</span>
            </button>
            <button
              onClick={() => setActiveTab('report_found')}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-emerald-600/20 transition-all flex items-center space-x-2 active:scale-95"
            >
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              <span>Turn in Found Item</span>
            </button>
            <button
              onClick={onRunAIEngine}
              className="px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-cyan-300 border border-slate-600 text-sm font-semibold rounded-xl shadow transition-all flex items-center space-x-2"
            >
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Re-run AI Matching</span>
            </button>
          </div>
        </div>

        {/* 5-Step Workflow Pipeline Diagram */}
        <div className="mt-8 pt-6 border-t border-slate-700/60 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-center text-xs">
          <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60 text-slate-300">
            <div className="font-semibold text-rose-400 mb-1">1. Owner</div>
            <p className="text-slate-400 text-[11px]">Reports lost item & stakes escrow reward</p>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60 text-slate-300">
            <div className="font-semibold text-emerald-400 mb-1">2. Finder</div>
            <p className="text-slate-400 text-[11px]">Uploads found photo & custody location</p>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60 text-slate-300">
            <div className="font-semibold text-cyan-400 mb-1">3. AI Matching</div>
            <p className="text-slate-400 text-[11px]">Visual, text, GPS & time scoring</p>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60 text-slate-300">
            <div className="font-semibold text-amber-400 mb-1">4. Verification</div>
            <p className="text-slate-400 text-[11px]">Secret detail questions verify ownership</p>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60 text-slate-300">
            <div className="font-semibold text-blue-400 mb-1">5. Safe Handoff</div>
            <p className="text-slate-400 text-[11px]">QR code & PIN at monitored safe zone</p>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60 text-slate-300">
            <div className="font-semibold text-emerald-400 mb-1">6. Escrow Reward</div>
            <p className="text-slate-400 text-[11px]">Automated release to verified finder</p>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Lost Reported</span>
            <span className="w-2 h-2 rounded-full bg-rose-500" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-white">{lostItems.length}</span>
            <span className="text-xs text-rose-400">Active cases</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Found Turned In</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-white">{foundItems.length}</span>
            <span className="text-xs text-emerald-400">In custody</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">AI Matches</span>
            <Sparkles className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-cyan-400">{pendingMatches.length}</span>
            <span className="text-xs text-cyan-300">Pending review</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Recovered Items</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-white">{recoveredMatches.length}</span>
            <span className="text-xs text-emerald-400">Successful loops</span>
          </div>
        </div>

        <div className="col-span-2 sm:col-span-1 bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Escrow Total</span>
            <DollarSign className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-amber-400">${totalEscrow}</span>
            <span className="text-xs text-slate-400">Protected fund</span>
          </div>
        </div>
      </div>

      {/* Pending AI Matches Spotlight */}
      {pendingMatches.length > 0 && (
        <div className="bg-slate-900/90 border border-cyan-500/30 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Action Required: AI Multimodal Matches Awaiting Verification</h2>
                <p className="text-xs text-slate-400">High-confidence correlation detected between reported lost and found items</p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('matching_hub')}
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center space-x-1"
            >
              <span>Open Match Hub</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingMatches.map((match) => (
              <div
                key={match.id}
                className="bg-slate-800/80 border border-slate-700 rounded-xl p-5 hover:border-cyan-500/50 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 mb-2">
                        {match.scores.overallScore}% Match Confidence ({match.scores.confidenceLevel})
                      </span>
                      <h3 className="font-semibold text-white text-base">{match.lostItem.title}</h3>
                      <p className="text-xs text-slate-400 mt-1">Matched with: <span className="text-slate-200 font-medium">{match.foundItem.title}</span></p>
                    </div>
                    {match.lostItem.imageUrl && (
                      <img
                        src={match.lostItem.imageUrl}
                        alt="Item"
                        className="w-14 h-14 object-cover rounded-lg border border-slate-700 shrink-0"
                      />
                    )}
                  </div>

                  {/* Modality score pills */}
                  <div className="grid grid-cols-4 gap-2 mt-4 text-center text-xs">
                    <div className="p-1.5 rounded bg-slate-900/60 border border-slate-700/50">
                      <span className="block text-[10px] text-slate-400">Visual</span>
                      <span className="font-bold text-cyan-400">{match.scores.visualScore}%</span>
                    </div>
                    <div className="p-1.5 rounded bg-slate-900/60 border border-slate-700/50">
                      <span className="block text-[10px] text-slate-400">Semantic</span>
                      <span className="font-bold text-cyan-400">{match.scores.semanticScore}%</span>
                    </div>
                    <div className="p-1.5 rounded bg-slate-900/60 border border-slate-700/50">
                      <span className="block text-[10px] text-slate-400">Spatial</span>
                      <span className="font-bold text-cyan-400">{match.scores.spatialScore}%</span>
                    </div>
                    <div className="p-1.5 rounded bg-slate-900/60 border border-slate-700/50">
                      <span className="block text-[10px] text-slate-400">Temporal</span>
                      <span className="font-bold text-cyan-400">{match.scores.temporalScore}%</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 mt-3 line-clamp-2 italic">
                    "{match.scores.aiReasoning}"
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-700/70 flex items-center justify-between gap-2">
                  <div className="text-xs">
                    <span className="text-slate-400">Reward: </span>
                    <span className="font-bold text-emerald-400">${match.lostItem.rewardAmount}</span>
                  </div>

                  <div className="flex space-x-2">
                    {match.status === 'verification_in_progress' ? (
                      <button
                        onClick={() => onOpenHandoff(match)}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg flex items-center space-x-1.5 shadow"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        <span>Ready for Handoff</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => onInitiateVerification(match)}
                        className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-bold rounded-lg flex items-center space-x-1.5 shadow"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Verify Ownership</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900 p-4 rounded-xl border border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search items, locations, serials..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-sm text-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-cyan-500 w-full sm:w-auto"
          >
            <option value="All">All Categories</option>
            <option value="Electronics">Electronics</option>
            <option value="Wallets & Bags">Wallets & Bags</option>
            <option value="Keys & Access">Keys & Access</option>
            <option value="Audio & Headphones">Audio & Headphones</option>
            <option value="Jewelry & Watches">Jewelry & Watches</option>
          </select>
        </div>
      </div>

      {/* Two Column Layout: Lost Items & Found Items */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Column 1: Lost Items (Owner Side) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-rose-500" />
              <h2 className="text-lg font-bold text-white">Lost Items (Owner Reports)</h2>
            </div>
            <button
              onClick={() => setActiveTab('report_lost')}
              className="text-xs text-rose-400 hover:text-rose-300 font-medium"
            >
              + Submit Lost Item
            </button>
          </div>

          <div className="space-y-3">
            {filteredLost.length === 0 ? (
              <div className="p-8 text-center text-slate-400 bg-slate-900/50 rounded-xl border border-slate-800">
                No lost items matching filter criteria.
              </div>
            ) : (
              filteredLost.map((item) => (
                <div
                  key={item.id}
                  className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-4 transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex space-x-3">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-16 h-16 object-cover rounded-lg border border-slate-700 shrink-0"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 text-slate-500">
                          <Eye className="w-6 h-6" />
                        </div>
                      )}
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
                            {item.category}
                          </span>
                          {item.rewardEscrowed && (
                            <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center">
                              ${item.rewardAmount} Escrow
                            </span>
                          )}
                        </div>
                        <h3 className="font-semibold text-white text-sm mt-1">{item.title}</h3>
                        <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{item.description}</p>
                      </div>
                    </div>

                    <span className={`px-2 py-1 rounded text-[11px] font-medium shrink-0 ${
                      item.status === 'matched' ? 'bg-cyan-500/20 text-cyan-300' :
                      item.status === 'recovered' ? 'bg-emerald-500/20 text-emerald-300' :
                      'bg-slate-800 text-slate-400'
                    }`}>
                      {item.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                    <div className="flex items-center space-x-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />
                      <span>{item.location.landmark}</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      <span>{new Date(item.lostDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Column 2: Found Items (Finder Side) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500" />
              <h2 className="text-lg font-bold text-white">Found Items (Custody / Storage)</h2>
            </div>
            <button
              onClick={() => setActiveTab('report_found')}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-medium"
            >
              + Submit Found Item
            </button>
          </div>

          <div className="space-y-3">
            {filteredFound.length === 0 ? (
              <div className="p-8 text-center text-slate-400 bg-slate-900/50 rounded-xl border border-slate-800">
                No found items matching filter criteria.
              </div>
            ) : (
              filteredFound.map((item) => (
                <div
                  key={item.id}
                  className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-4 transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex space-x-3">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-16 h-16 object-cover rounded-lg border border-slate-700 shrink-0"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 text-slate-500">
                          <Eye className="w-6 h-6" />
                        </div>
                      )}
                      <div>
                        <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {item.category}
                        </span>
                        <h3 className="font-semibold text-white text-sm mt-1">{item.title}</h3>
                        <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{item.description}</p>
                      </div>
                    </div>

                    <span className={`px-2 py-1 rounded text-[11px] font-medium shrink-0 ${
                      item.status === 'matched' ? 'bg-cyan-500/20 text-cyan-300' :
                      item.status === 'recovered' ? 'bg-emerald-500/20 text-emerald-300' :
                      'bg-slate-800 text-slate-400'
                    }`}>
                      {item.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                    <div className="flex items-center space-x-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />
                      <span>{item.custodyLocation}</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      <span>{new Date(item.foundDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
