import React from 'react';
import { Sparkles, Search, Compass, ShieldCheck, CheckCircle2, Code2, ArrowLeftRight } from 'lucide-react';
import { ActiveTab } from '../types';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  matchesCount: number;
  escrowTotal: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  matchesCount,
  escrowTotal
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40 text-slate-100 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-md shadow-cyan-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold tracking-tight text-white">ReFind<span className="text-cyan-400"> AI</span></span>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  Multimodal v2.4
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">AI Lost & Found Matching, Verification & Safe Recovery</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-3.5 py-2 text-sm font-medium rounded-lg transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-slate-800 text-cyan-400 shadow-sm border border-slate-700'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('report_lost')}
              className={`px-3.5 py-2 text-sm font-medium rounded-lg transition-all ${
                activeTab === 'report_lost'
                  ? 'bg-slate-800 text-rose-400 shadow-sm border border-slate-700'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              Report Lost (Owner)
            </button>
            <button
              onClick={() => setActiveTab('report_found')}
              className={`px-3.5 py-2 text-sm font-medium rounded-lg transition-all ${
                activeTab === 'report_found'
                  ? 'bg-slate-800 text-emerald-400 shadow-sm border border-slate-700'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              Report Found (Finder)
            </button>
            <button
              onClick={() => setActiveTab('matching_hub')}
              className={`relative px-3.5 py-2 text-sm font-medium rounded-lg transition-all ${
                activeTab === 'matching_hub'
                  ? 'bg-slate-800 text-cyan-400 shadow-sm border border-slate-700'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <span>AI Matching Hub</span>
              {matchesCount > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 text-xs font-bold rounded-full bg-cyan-500 text-slate-950">
                  {matchesCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('api_docs')}
              className={`flex items-center space-x-1 px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                activeTab === 'api_docs'
                  ? 'bg-slate-800 text-purple-400 shadow-sm border border-slate-700'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Code2 className="w-4 h-4 text-purple-400 mr-1" />
              <span>FastAPI & Streamlit Spec</span>
            </button>
          </nav>

          {/* Quick Metrics / Escrow status */}
          <div className="flex items-center space-x-3">
            <div className="hidden lg:flex flex-col text-right">
              <span className="text-xs text-slate-400">Escrow Protected</span>
              <span className="text-sm font-bold text-emerald-400">${escrowTotal} USD</span>
            </div>
            <button
              onClick={() => setActiveTab('matching_hub')}
              className="flex items-center space-x-2 px-3.5 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-semibold text-xs sm:text-sm rounded-lg shadow-md transition-all active:scale-95"
            >
              <ArrowLeftRight className="w-4 h-4" />
              <span className="hidden sm:inline">Run Matcher</span>
            </button>
          </div>

        </div>

        {/* Mobile Tab Bar */}
        <div className="flex md:hidden overflow-x-auto py-2 space-x-2 border-t border-slate-800/80 scrollbar-none text-xs">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3 py-1.5 rounded-md whitespace-nowrap ${activeTab === 'dashboard' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-medium' : 'text-slate-400'}`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('report_lost')}
            className={`px-3 py-1.5 rounded-md whitespace-nowrap ${activeTab === 'report_lost' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 font-medium' : 'text-slate-400'}`}
          >
            Report Lost
          </button>
          <button
            onClick={() => setActiveTab('report_found')}
            className={`px-3 py-1.5 rounded-md whitespace-nowrap ${activeTab === 'report_found' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-medium' : 'text-slate-400'}`}
          >
            Report Found
          </button>
          <button
            onClick={() => setActiveTab('matching_hub')}
            className={`px-3 py-1.5 rounded-md whitespace-nowrap ${activeTab === 'matching_hub' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-medium' : 'text-slate-400'}`}
          >
            AI Matches ({matchesCount})
          </button>
          <button
            onClick={() => setActiveTab('api_docs')}
            className={`px-3 py-1.5 rounded-md whitespace-nowrap ${activeTab === 'api_docs' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30 font-medium' : 'text-slate-400'}`}
          >
            API Docs
          </button>
        </div>

      </div>
    </header>
  );
};
