import React, { useState } from 'react';
import { 
  Sparkles, ArrowLeftRight, CheckCircle2, AlertTriangle, ShieldCheck, 
  MapPin, Calendar, QrCode, RefreshCw, ChevronRight, Eye, Info, Check
} from 'lucide-react';
import { ItemMatch } from '../types';

interface MatchingHubProps {
  matches: ItemMatch[];
  onVerify: (match: ItemMatch) => void;
  onHandoff: (match: ItemMatch) => void;
  onRecomputeAll: () => void;
}

export const MatchingHub: React.FC<MatchingHubProps> = ({
  matches,
  onVerify,
  onHandoff,
  onRecomputeAll
}) => {
  const [selectedMatchId, setSelectedMatchId] = useState<string>(matches[0]?.id || '');
  const selectedMatch = matches.find(m => m.id === selectedMatchId) || matches[0];

  if (!selectedMatch) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center space-y-4">
        <Sparkles className="w-12 h-12 text-cyan-400 mx-auto opacity-70" />
        <h3 className="text-xl font-bold text-white">No Matches Found Yet</h3>
        <p className="text-sm text-slate-400 max-w-md mx-auto">
          Submit lost items and found items to activate the multimodal AI matching engine.
        </p>
        <button
          onClick={onRecomputeAll}
          className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold rounded-xl text-sm"
        >
          Run AI Match Matrix
        </button>
      </div>
    );
  }

  const { lostItem, foundItem, scores } = selectedMatch;

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              Multimodal Scoring Engine
            </span>
            <span className="text-xs text-slate-400">
              {matches.length} Total Candidate Pairs Analyzed
            </span>
          </div>
          <h2 className="text-2xl font-bold text-white mt-1">AI Match Matrix & Verification Hub</h2>
          <p className="text-xs text-slate-400">
            Compare candidate matches across visual contours, semantic text, GPS coordinates, and timestamp delta.
          </p>
        </div>

        <button
          onClick={onRecomputeAll}
          className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all"
        >
          <RefreshCw className="w-4 h-4 text-cyan-400" />
          <span>Re-compute AI Matrices</span>
        </button>
      </div>

      {/* Match Selector Strip */}
      <div className="flex overflow-x-auto space-x-3 pb-2 scrollbar-none">
        {matches.map((m) => {
          const isSelected = m.id === selectedMatchId;
          return (
            <button
              key={m.id}
              onClick={() => setSelectedMatchId(m.id)}
              className={`flex-shrink-0 w-72 text-left p-3.5 rounded-xl border transition-all ${
                isSelected
                  ? 'bg-slate-800 border-cyan-500 shadow-md shadow-cyan-500/10'
                  : 'bg-slate-900/90 border-slate-800 hover:border-slate-700 text-slate-400'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  m.scores.overallScore >= 80 ? 'bg-cyan-500/20 text-cyan-300' :
                  m.scores.overallScore >= 60 ? 'bg-amber-500/20 text-amber-300' :
                  'bg-slate-700 text-slate-300'
                }`}>
                  {m.scores.overallScore}% Match
                </span>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider">
                  {m.status.replace('_', ' ')}
                </span>
              </div>
              <p className="text-sm font-semibold text-white mt-2 truncate">{m.lostItem.title}</p>
              <p className="text-xs text-slate-400 truncate">vs: {m.foundItem.title}</p>
            </button>
          );
        })}
      </div>

      {/* Selected Match Main View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 7 Cols: Side-by-Side Comparison */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center justify-between border-b border-slate-800 pb-3">
              <span>Candidate Item Comparison</span>
              <span className="text-xs font-semibold text-slate-400">Match ID: {selectedMatch.id}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Lost Item Column */}
              <div className="bg-slate-950/60 border border-rose-500/20 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                    REPORTED LOST (OWNER)
                  </span>
                  {lostItem.rewardEscrowed && (
                    <span className="text-xs font-bold text-emerald-400">${lostItem.rewardAmount} Reward</span>
                  )}
                </div>

                {lostItem.imageUrl ? (
                  <img
                    src={lostItem.imageUrl}
                    alt={lostItem.title}
                    className="w-full h-44 object-cover rounded-lg border border-slate-800"
                  />
                ) : (
                  <div className="w-full h-44 bg-slate-800/60 rounded-lg flex items-center justify-center text-slate-500">
                    <Eye className="w-8 h-8" />
                  </div>
                )}

                <div>
                  <h4 className="font-bold text-white text-base">{lostItem.title}</h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{lostItem.description}</p>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-slate-800 text-xs text-slate-300">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    <span className="truncate">{lostItem.location.landmark} ({lostItem.location.roomOrArea})</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Lost: {new Date(lostItem.lostDate).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 pt-1">
                    Owner: <span className="text-slate-200">{lostItem.ownerName}</span> ({lostItem.ownerContact})
                  </div>
                </div>
              </div>

              {/* Found Item Column */}
              <div className="bg-slate-950/60 border border-emerald-500/20 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    ITEM IN CUSTODY (FINDER)
                  </span>
                  <span className="text-[11px] text-slate-400">Verified Item</span>
                </div>

                {foundItem.imageUrl ? (
                  <img
                    src={foundItem.imageUrl}
                    alt={foundItem.title}
                    className="w-full h-44 object-cover rounded-lg border border-slate-800"
                  />
                ) : (
                  <div className="w-full h-44 bg-slate-800/60 rounded-lg flex items-center justify-center text-slate-500">
                    <Eye className="w-8 h-8" />
                  </div>
                )}

                <div>
                  <h4 className="font-bold text-white text-base">{foundItem.title}</h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{foundItem.description}</p>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-slate-800 text-xs text-slate-300">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="truncate">{foundItem.location.landmark} ({foundItem.location.roomOrArea})</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Found: {new Date(foundItem.foundDate).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 pt-1">
                    Holding: <span className="text-emerald-300 font-medium">{foundItem.custodyLocation}</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Right 5 Cols: Multimodal Scores & Actions */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
            
            {/* Overall Score Badge */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs text-slate-400">ReFind Multimodal Score</span>
                <div className="flex items-baseline space-x-2 mt-0.5">
                  <span className="text-3xl font-black text-cyan-400">{scores.overallScore}%</span>
                  <span className="text-sm font-semibold text-slate-300">({scores.confidenceLevel} Confidence)</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-cyan-400" />
              </div>
            </div>

            {/* Modality Score Bars */}
            <div className="space-y-3.5">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-300">Visual Similarity (35% Weight)</span>
                  <span className="text-cyan-400">{scores.visualScore}%</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-cyan-500 rounded-full transition-all duration-500" 
                    style={{ width: `${scores.visualScore}%` }} 
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-300">Semantic / Description Match (30% Weight)</span>
                  <span className="text-blue-400">{scores.semanticScore}%</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 rounded-full transition-all duration-500" 
                    style={{ width: `${scores.semanticScore}%` }} 
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-300">Spatial Proximity (20% Weight)</span>
                  <span className="text-emerald-400">{scores.spatialScore}%</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500" 
                    style={{ width: `${scores.spatialScore}%` }} 
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-300">Temporal Compatibility (15% Weight)</span>
                  <span className="text-amber-400">{scores.temporalScore}%</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-amber-500 rounded-full transition-all duration-500" 
                    style={{ width: `${scores.temporalScore}%` }} 
                  />
                </div>
              </div>
            </div>

            {/* Matched Features & Discrepancies */}
            <div className="space-y-3 pt-4 border-t border-slate-800">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Evidence Highlights
              </span>
              
              <div className="space-y-1.5">
                {scores.matchedFeatures.map((feat, idx) => (
                  <div key={idx} className="flex items-center space-x-2 text-xs text-emerald-400">
                    <Check className="w-3.5 h-3.5 shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
                {scores.discrepancies.map((disc, idx) => (
                  <div key={idx} className="flex items-center space-x-2 text-xs text-amber-400">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>{disc}</span>
                  </div>
                ))}
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300 leading-relaxed italic mt-3">
                "{scores.aiReasoning}"
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-slate-800 space-y-2.5">
              {selectedMatch.status === 'completed' ? (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center text-xs font-semibold text-emerald-400 flex items-center justify-center space-x-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Item Handed Off & Reward Released</span>
                </div>
              ) : selectedMatch.status === 'verification_in_progress' ? (
                <div className="space-y-2">
                  <button
                    onClick={() => onHandoff(selectedMatch)}
                    className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm rounded-xl shadow-lg flex items-center justify-center space-x-2 active:scale-95 transition-all"
                  >
                    <QrCode className="w-4 h-4" />
                    <span>Proceed to Safe Handoff & Release Reward</span>
                  </button>
                  <button
                    onClick={() => onVerify(selectedMatch)}
                    className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-xl border border-slate-700"
                  >
                    Review Verification Answers
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => onVerify(selectedMatch)}
                  className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm rounded-xl shadow-lg shadow-cyan-500/20 flex items-center justify-center space-x-2 active:scale-95 transition-all"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Initiate Ownership Verification Challenge</span>
                </button>
              )}
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};
