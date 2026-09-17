import React, { useState } from 'react';
import { 
  QrCode, X, CheckCircle2, ShieldCheck, MapPin, DollarSign, 
  ArrowRight, Award, Lock, Sparkles, Copy, Check
} from 'lucide-react';
import { ItemMatch } from '../types';

interface HandoffModalProps {
  match: ItemMatch;
  isOpen: boolean;
  onClose: () => void;
  onCompleteHandoff: (matchId: string) => void;
}

export const HandoffModal: React.FC<HandoffModalProps> = ({
  match,
  isOpen,
  onClose,
  onCompleteHandoff
}) => {
  if (!isOpen) return null;

  const { lostItem, foundItem, handoffDetails } = match;
  const pin = handoffDetails?.pin || '849201';
  const safeSpot = handoffDetails?.safeSpot || foundItem.custodyLocation;
  const reward = lostItem.rewardAmount || 0;

  const [enteredPin, setEnteredPin] = useState('');
  const [copied, setCopied] = useState(false);
  const [isCompleted, setIsCompleted] = useState(match.status === 'completed');

  const handleCopyPin = () => {
    navigator.clipboard.writeText(pin);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConfirmHandover = () => {
    setIsCompleted(true);
    onCompleteHandoff(match.id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
        
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Safe Handoff & Escrow Reward</h3>
              <p className="text-xs text-slate-400">
                Final physical recovery exchange & automated escrow disbursement.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isCompleted ? (
          /* Completion State */
          <div className="py-6 text-center space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <h4 className="text-2xl font-bold text-white">Item Successfully Recovered!</h4>
              <p className="text-sm text-slate-300 mt-1 max-w-sm mx-auto">
                The handoff has been verified and logged to the recovery ledger.
              </p>
            </div>

            {/* Escrow Release Certificate */}
            <div className="p-5 rounded-xl bg-slate-950/80 border border-emerald-500/30 text-left space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <span className="text-xs font-semibold text-emerald-400 flex items-center space-x-1.5">
                  <Award className="w-4 h-4" />
                  <span>Escrow Reward Disbursed</span>
                </span>
                <span className="text-lg font-black text-emerald-400">${reward} USD</span>
              </div>

              <div className="text-xs space-y-1 text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">Item:</span>
                  <span className="text-white font-medium">{lostItem.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Owner:</span>
                  <span className="text-white">{lostItem.ownerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Finder / Custodian:</span>
                  <span className="text-white">{foundItem.finderName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Settlement Status:</span>
                  <span className="text-emerald-400 font-semibold">Immediate Transfer Completed</span>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs rounded-xl"
            >
              Done & Return to Dashboard
            </button>
          </div>
        ) : (
          /* Active Handoff State */
          <div className="space-y-6">
            
            {/* Safe Location Box */}
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
                <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                <span>Designated Monitored Safe Exchange Location</span>
              </span>
              <p className="text-sm font-semibold text-white">{safeSpot}</p>
              <p className="text-xs text-slate-400">
                Meet at the verified public desk or security post for verified handover.
              </p>
            </div>

            {/* QR Code & PIN Presentation */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-6 rounded-2xl bg-slate-950 border border-cyan-500/20 text-center sm:text-left">
              
              {/* Dynamic Mock SVG QR Code */}
              <div className="w-36 h-36 bg-white p-2.5 rounded-xl shadow-lg shrink-0 flex items-center justify-center">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  {/* Outer corner squares */}
                  <rect x="5" y="5" width="28" height="28" fill="#0f172a" rx="2" />
                  <rect x="9" y="9" width="20" height="20" fill="white" rx="1" />
                  <rect x="13" y="13" width="12" height="12" fill="#0f172a" rx="1" />

                  <rect x="67" y="5" width="28" height="28" fill="#0f172a" rx="2" />
                  <rect x="71" y="9" width="20" height="20" fill="white" rx="1" />
                  <rect x="75" y="13" width="12" height="12" fill="#0f172a" rx="1" />

                  <rect x="5" y="67" width="28" height="28" fill="#0f172a" rx="2" />
                  <rect x="9" y="71" width="20" height="20" fill="white" rx="1" />
                  <rect x="13" y="75" width="12" height="12" fill="#0f172a" rx="1" />

                  {/* QR Data Matrix Bits */}
                  <rect x="38" y="8" width="6" height="6" fill="#0f172a" />
                  <rect x="48" y="14" width="8" height="6" fill="#0f172a" />
                  <rect x="38" y="24" width="6" height="6" fill="#0f172a" />
                  <rect x="48" y="30" width="8" height="6" fill="#0f172a" />
                  <rect x="10" y="40" width="14" height="6" fill="#0f172a" />
                  <rect x="30" y="40" width="40" height="6" fill="#0f172a" />
                  <rect x="75" y="40" width="15" height="6" fill="#0f172a" />
                  <rect x="10" y="52" width="20" height="6" fill="#0f172a" />
                  <rect x="36" y="52" width="12" height="6" fill="#0f172a" />
                  <rect x="54" y="52" width="20" height="6" fill="#0f172a" />
                  <rect x="80" y="52" width="10" height="6" fill="#0f172a" />
                  <rect x="38" y="67" width="8" height="8" fill="#0f172a" />
                  <rect x="52" y="67" width="12" height="6" fill="#0f172a" />
                  <rect x="70" y="67" width="8" height="8" fill="#0f172a" />
                  <rect x="38" y="80" width="16" height="6" fill="#0f172a" />
                  <rect x="60" y="80" width="14" height="6" fill="#0f172a" />
                  <rect x="80" y="80" width="10" height="6" fill="#0f172a" />
                </svg>
              </div>

              {/* Secret 6-Digit PIN Display */}
              <div className="space-y-2">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Encrypted One-Time Handoff PIN
                </span>
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-3xl font-black text-cyan-400 tracking-wider">
                    {pin}
                  </span>
                  <button
                    onClick={handleCopyPin}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-xs flex items-center space-x-1"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  The owner presents this QR code or 6-digit PIN to the custodian or finder at the desk to complete retrieval.
                </p>
              </div>

            </div>

            {/* Escrow Reward Release Card */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/40 to-slate-900 border border-emerald-500/30 flex items-center justify-between">
              <div>
                <span className="text-xs text-emerald-400 font-semibold flex items-center space-x-1">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Escrow Reward Locked</span>
                </span>
                <p className="text-xl font-bold text-white mt-0.5">${reward} USD</p>
                <p className="text-[11px] text-slate-400">Transfers instantly upon confirmed physical receipt</p>
              </div>
              
              <button
                onClick={handleConfirmHandover}
                className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/20 active:scale-95 transition-all"
              >
                Confirm Handoff & Release Escrow
              </button>
            </div>

            {/* Footer buttons */}
            <div className="flex justify-end pt-2">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl"
              >
                Cancel / Close
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
