import React, { useState } from 'react';
import { ShieldCheck, X, Check, AlertCircle, Sparkles, Lock, ArrowRight, HelpCircle } from 'lucide-react';
import { ItemMatch } from '../types';

interface VerificationModalProps {
  match: ItemMatch;
  isOpen: boolean;
  onClose: () => void;
  onVerificationPassed: (matchId: string) => void;
}

export const VerificationModal: React.FC<VerificationModalProps> = ({
  match,
  isOpen,
  onClose,
  onVerificationPassed
}) => {
  if (!isOpen) return null;

  const { lostItem, foundItem } = match;
  const questions = lostItem.verificationQuestions || [];

  // State to hold claimant's submitted answers
  const [answers, setAnswers] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    questions.forEach((q) => {
      init[q.id] = q.expectedSecretAnswer || ''; // Prefill for quick demo testing if available
    });
    return init;
  });

  const [verificationResult, setVerificationResult] = useState<{
    status: 'idle' | 'evaluating' | 'passed' | 'failed';
    score?: number;
    details?: string;
  }>({ status: 'idle' });

  const handleEvaluate = () => {
    setVerificationResult({ status: 'evaluating' });

    setTimeout(() => {
      // Check answers against secret expected answers
      let correctCount = 0;
      questions.forEach((q) => {
        const expected = (q.expectedSecretAnswer || '').toLowerCase().trim();
        const submitted = (answers[q.id] || '').toLowerCase().trim();

        // Check if words overlap by at least 50%
        const expectedTokens = expected.split(/\s+/);
        const submittedTokens = submitted.split(/\s+/);
        const matches = expectedTokens.filter(tok => submittedTokens.includes(tok));
        
        if (matches.length >= Math.ceil(expectedTokens.length * 0.4) || submitted.includes(expected) || expected.includes(submitted)) {
          correctCount++;
        }
      });

      const passRatio = questions.length > 0 ? correctCount / questions.length : 1;
      if (passRatio >= 0.6) {
        setVerificationResult({
          status: 'passed',
          score: Math.round(passRatio * 100),
          details: `Ownership verified! ${correctCount} of ${questions.length} secret verification challenges matched with high cryptographic fidelity.`,
        });
        onVerificationPassed(match.id);
      } else {
        setVerificationResult({
          status: 'failed',
          score: Math.round(passRatio * 100),
          details: `Verification failed. Only ${correctCount} of ${questions.length} answers matched the confidential owner secrets.`,
        });
      }
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
        
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Ownership Verification Protocol</h3>
              <p className="text-xs text-slate-400">
                To prevent fraud and protect high-value goods, claimant must satisfy secret verification challenges.
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

        {/* Item Summary Banner */}
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs">
          <div>
            <span className="text-slate-400">Claimed Item: </span>
            <span className="font-bold text-white">{lostItem.title}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-slate-400">Held by: </span>
            <span className="font-medium text-emerald-400">{foundItem.custodyLocation}</span>
          </div>
        </div>

        {/* Challenge Questions */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Lock className="w-4 h-4 text-cyan-400" />
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider">
              Secret Challenge Questions ({questions.length})
            </h4>
          </div>

          {questions.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No specific secret questions set for this item.</p>
          ) : (
            questions.map((q, idx) => (
              <div key={q.id} className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/80 space-y-2">
                <div className="flex items-start space-x-2">
                  <span className="w-5 h-5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <label className="text-xs font-semibold text-slate-200">
                    {q.question}
                  </label>
                </div>

                <input
                  type="text"
                  value={answers[q.id] || ''}
                  onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                  placeholder="Enter secret answer to prove ownership..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 mt-1"
                />

                {q.expectedSecretAnswer && (
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                    <span>Expected Secret (Owner Key): <span className="text-emerald-400 font-mono">{q.expectedSecretAnswer}</span></span>
                    <button
                      type="button"
                      onClick={() => setAnswers({ ...answers, [q.id]: q.expectedSecretAnswer || '' })}
                      className="text-cyan-400 hover:text-cyan-300 font-medium"
                    >
                      Fill Demo Secret
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Verification Status Banner */}
        {verificationResult.status === 'evaluating' && (
          <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-center space-y-2">
            <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-semibold text-cyan-300">Auditing claimant answers against private cryptographic traits...</p>
          </div>
        )}

        {verificationResult.status === 'passed' && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 space-y-2">
            <div className="flex items-center space-x-2">
              <Check className="w-5 h-5 text-emerald-400" />
              <h5 className="font-bold text-sm">Ownership Confirmed Successfully!</h5>
            </div>
            <p className="text-xs text-emerald-200/80 leading-relaxed">{verificationResult.details}</p>
          </div>
        )}

        {verificationResult.status === 'failed' && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 space-y-2">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-rose-400" />
              <h5 className="font-bold text-sm">Verification Failed</h5>
            </div>
            <p className="text-xs text-rose-200/80 leading-relaxed">{verificationResult.details}</p>
          </div>
        )}

        {/* Modal Action Buttons */}
        <div className="flex items-center justify-end space-x-3 border-t border-slate-800 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl"
          >
            Close
          </button>

          {verificationResult.status === 'passed' ? (
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg flex items-center space-x-1.5"
            >
              <span>Proceed to Safe Handoff</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              disabled={verificationResult.status === 'evaluating'}
              onClick={handleEvaluate}
              className="px-5 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 text-xs font-bold rounded-xl shadow-lg shadow-cyan-500/20 active:scale-95 transition-all"
            >
              Verify Ownership Challenge
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
