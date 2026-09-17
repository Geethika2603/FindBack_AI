import React, { useState } from 'react';
import { UserRole, User } from '../types';
import { Search, Compass, ShieldCheck, ArrowRight, UserCheck, Key, Lock, Sparkles, CheckCircle, Info } from 'lucide-react';
import { DEFAULT_OWNER_USER, DEFAULT_FINDER_USER } from '../data/mockData';

interface LandingPageProps {
  onLogin: (user: User) => void;
  onOpenArchitecture?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLogin, onOpenArchitecture }) => {
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [selectedRole, setSelectedRole] = useState<UserRole>('owner');
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleOpenAuth = (role: UserRole, mode: 'login' | 'register' = 'login') => {
    setSelectedRole(role);
    setAuthMode(mode);
    setErrorMessage('');
    setShowAuthModal(true);
  };

  const handleQuickDemoLogin = (role: UserRole) => {
    if (role === 'owner') {
      onLogin(DEFAULT_OWNER_USER);
    } else {
      onLogin(DEFAULT_FINDER_USER);
    }
  };

  const handleSubmitAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (authMode === 'register') {
      if (!name.trim()) {
        setErrorMessage('Please enter your full name.');
        return;
      }
      if (!email.trim() || !email.includes('@')) {
        setErrorMessage('Please enter a valid email address.');
        return;
      }
      if (!username.trim()) {
        setErrorMessage('Please enter a username.');
        return;
      }
      if (password.length < 4) {
        setErrorMessage('Password must be at least 4 characters.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage('Passwords do not match.');
        return;
      }

      const newUser: User = {
        id: `user-${Date.now()}`,
        name: name.trim(),
        email: email.trim(),
        username: username.trim(),
        role: selectedRole,
        rewardPoints: selectedRole === 'finder' ? 50 : undefined,
        successfulReturns: 0,
        badge: selectedRole === 'finder' ? 'New Finder' : undefined,
      };

      onLogin(newUser);
    } else {
      // Login mode
      if (!username.trim()) {
        setErrorMessage('Please enter your username or email.');
        return;
      }
      if (!password.trim()) {
        setErrorMessage('Please enter your password.');
        return;
      }

      // Allow logging in as chosen role with provided credentials
      const loggedUser: User = {
        id: `user-${Date.now()}`,
        name: username.includes('@') ? username.split('@')[0] : username,
        email: username.includes('@') ? username : `${username}@refind.ai`,
        username: username.trim(),
        role: selectedRole,
        rewardPoints: selectedRole === 'finder' ? 100 : undefined,
        successfulReturns: selectedRole === 'finder' ? 1 : 0,
        badge: selectedRole === 'finder' ? 'Helpful Finder ⭐' : undefined,
      };

      onLogin(loggedUser);
    }
  };

  return (
    <div className="min-h-screen bg-[#070d18] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Top minimal header */}
      <header className="border-b border-slate-800/80 bg-[#0b1220]/90 backdrop-blur sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 text-white font-black text-xl">
              R
            </div>
            <div>
              <div className="font-bold tracking-tight text-lg text-white flex items-center gap-1.5">
                ReFind AI
                <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-700/50">
                  Role-Separated
                </span>
              </div>
              <div className="text-[11px] text-slate-400 -mt-0.5">Secure Item Recovery</div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {onOpenArchitecture && (
              <button
                onClick={onOpenArchitecture}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/60 hover:bg-slate-800 rounded-lg border border-slate-700 transition"
              >
                <Info className="w-3.5 h-3.5 text-cyan-400" />
                <span>Specs & Architecture</span>
              </button>
            )}
            <button
              onClick={() => handleOpenAuth('owner', 'login')}
              className="px-3.5 py-1.5 text-xs font-medium text-slate-200 hover:text-white transition"
            >
              Sign In
            </button>
            <button
              onClick={() => handleOpenAuth('owner', 'register')}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-md transition"
            >
              Register
            </button>
          </div>
        </div>
      </header>

      {/* Hero section */}
      <main className="flex-1 flex flex-col justify-center max-w-6xl w-full mx-auto px-4 sm:px-6 py-10 sm:py-16">
        
        {/* Title and Tagline */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-700/40 text-cyan-300 text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>AI Multimodal Matching &bull; 7-Factor Verification Engine</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            ReFind AI
          </h1>

          <p className="text-lg sm:text-xl font-medium text-slate-300">
            AI Lost & Found Matching and Secure Item Recovery
          </p>

          <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto">
            "Find what you lost. Return what you found."
          </p>
        </div>

        {/* The Two Main Dedicated Role Portals */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-4xl mx-auto w-full mb-10">
          
          {/* OWNER / LOSER CARD */}
          <div 
            id="owner-card"
            className="group relative rounded-2xl bg-gradient-to-b from-[#141b2d] to-[#0d1424] border-2 border-rose-500/30 hover:border-rose-500/80 p-6 sm:p-8 transition-all duration-300 flex flex-col justify-between shadow-xl hover:shadow-rose-500/10"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-rose-500/15 text-rose-400 border border-rose-500/30">
                  Role: Owner / Loser
                </span>
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
                  <Search className="w-5 h-5" />
                </div>
              </div>

              <h2 className="text-2xl font-bold text-white mb-2">
                I LOST SOMETHING
              </h2>
              <p className="text-sm text-slate-300 mb-6 leading-relaxed">
                Report your missing item with photos, location, and encrypted private features. Get matched automatically and safely verify ownership.
              </p>

              <div className="space-y-2 mb-8 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>Report lost valuables with encrypted private identifiers</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>Real-time 7-factor AI matching scores</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>Secure 2/3 private question ownership challenge</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <button
                id="btn-owner-flow"
                onClick={() => handleOpenAuth('owner', 'login')}
                className="w-full py-3.5 px-5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm flex items-center justify-center gap-2 transition shadow-lg shadow-rose-600/25 cursor-pointer"
              >
                <span>ENTER AS OWNER</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => handleQuickDemoLogin('owner')}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-xs font-medium text-rose-200 border border-rose-500/20 hover:border-rose-500/40 transition flex items-center justify-center gap-1.5"
              >
                <UserCheck className="w-3.5 h-3.5 text-rose-400" />
                <span>Quick Demo Login: Sarah Jenkins (Owner)</span>
              </button>
            </div>
          </div>

          {/* FINDER CARD */}
          <div 
            id="finder-card"
            className="group relative rounded-2xl bg-gradient-to-b from-[#122227] to-[#0c191c] border-2 border-emerald-500/30 hover:border-emerald-500/80 p-6 sm:p-8 transition-all duration-300 flex flex-col justify-between shadow-xl hover:shadow-emerald-500/10"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  Role: Finder
                </span>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <Compass className="w-5 h-5" />
                </div>
              </div>

              <h2 className="text-2xl font-bold text-white mb-2">
                I FOUND SOMETHING
              </h2>
              <p className="text-sm text-slate-300 mb-6 leading-relaxed">
                Log a found item safely, specify custody storage, review verified return requests, and earn Finder Reward Points and community badges.
              </p>

              <div className="space-y-2 mb-8 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Log found items with photos & physical custody location</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Receive verified return requests with privacy protection</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Earn +100 Reward Points for each successful return</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <button
                id="btn-finder-flow"
                onClick={() => handleOpenAuth('finder', 'login')}
                className="w-full py-3.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-600/25 cursor-pointer"
              >
                <span>ENTER AS FINDER</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => handleQuickDemoLogin('finder')}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-xs font-medium text-emerald-200 border border-emerald-500/20 hover:border-emerald-500/40 transition flex items-center justify-center gap-1.5"
              >
                <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Quick Demo Login: Alex Rivera (Finder)</span>
              </button>
            </div>
          </div>

        </div>

        {/* Quick bottom auth triggers */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-400">
          <div>
            Already have an account?{' '}
            <button
              onClick={() => handleOpenAuth('owner', 'login')}
              className="font-semibold text-blue-400 hover:text-blue-300 underline underline-offset-4"
            >
              Sign In Here
            </button>
          </div>
          <span className="hidden sm:inline text-slate-600">&bull;</span>
          <div>
            New to ReFind AI?{' '}
            <button
              onClick={() => handleOpenAuth('owner', 'register')}
              className="font-semibold text-cyan-400 hover:text-cyan-300 underline underline-offset-4"
            >
              Create an Account
            </button>
          </div>
        </div>

      </main>

      {/* Auth Modal (Login / Register) */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#0e1626] border border-slate-700/80 rounded-2xl w-full max-w-md p-6 sm:p-7 shadow-2xl relative">
            
            {/* Close button */}
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white text-lg w-8 h-8 rounded-full hover:bg-slate-800 flex items-center justify-center"
            >
              &times;
            </button>

            {/* Modal Header */}
            <div className="mb-5">
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                  selectedRole === 'owner' ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'
                }`}>
                  {selectedRole === 'owner' ? 'Owner / Loser Portal' : 'Finder Portal'}
                </span>
              </div>
              <h3 className="text-xl font-bold text-white">
                {authMode === 'login' ? 'Sign In to Your Account' : 'Register New Account'}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {authMode === 'login' 
                  ? 'Access your items, matches, and recovery status' 
                  : 'Select your role and start recovering or returning items'}
              </p>
            </div>

            {/* Mode Toggle */}
            <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-900 mb-5 border border-slate-800">
              <button
                type="button"
                onClick={() => setAuthMode('login')}
                className={`py-2 text-xs font-semibold rounded-lg transition ${
                  authMode === 'login' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setAuthMode('register')}
                className={`py-2 text-xs font-semibold rounded-lg transition ${
                  authMode === 'register' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                Register
              </button>
            </div>

            {/* Role selector during registration */}
            {authMode === 'register' && (
              <div className="mb-4">
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Select Your Primary Role:
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <label className={`cursor-pointer p-3 rounded-xl border flex items-center gap-2.5 transition ${
                    selectedRole === 'owner' 
                      ? 'bg-rose-950/40 border-rose-500 text-rose-200' 
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}>
                    <input 
                      type="radio" 
                      name="role-radio" 
                      checked={selectedRole === 'owner'} 
                      onChange={() => setSelectedRole('owner')}
                      className="text-rose-600 focus:ring-rose-500"
                    />
                    <div>
                      <div className="text-xs font-bold text-white">Owner / Loser</div>
                      <div className="text-[10px] text-slate-400">Lost an item</div>
                    </div>
                  </label>

                  <label className={`cursor-pointer p-3 rounded-xl border flex items-center gap-2.5 transition ${
                    selectedRole === 'finder' 
                      ? 'bg-emerald-950/40 border-emerald-500 text-emerald-200' 
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}>
                    <input 
                      type="radio" 
                      name="role-radio" 
                      checked={selectedRole === 'finder'} 
                      onChange={() => setSelectedRole('finder')}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    <div>
                      <div className="text-xs font-bold text-white">Finder</div>
                      <div className="text-[10px] text-slate-400">Found an item</div>
                    </div>
                  </label>
                </div>
              </div>
            )}

            {/* Error Message */}
            {errorMessage && (
              <div className="mb-4 p-3 rounded-lg bg-rose-950/50 border border-rose-600/50 text-rose-200 text-xs">
                {errorMessage}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmitAuth} className="space-y-3.5">
              {authMode === 'register' && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Jordan Miller"
                      className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="jordan@campus.edu"
                      className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Username</label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={selectedRole === 'owner' ? 'sarah_j or your username' : 'alex_r or your username'}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>

              {authMode === 'register' && (
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Confirm Password</label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-500"
                  />
                </div>
              )}

              <button
                type="submit"
                className={`w-full py-3 rounded-xl font-bold text-xs text-white transition shadow-lg cursor-pointer ${
                  selectedRole === 'owner' 
                    ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/30' 
                    : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30'
                }`}
              >
                {authMode === 'login' ? `SIGN IN AS ${selectedRole.toUpperCase()}` : `COMPLETE ${selectedRole.toUpperCase()} REGISTRATION`}
              </button>

              <div className="pt-2 border-t border-slate-800 text-center">
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin(selectedRole)}
                  className="text-xs text-slate-400 hover:text-white underline underline-offset-2"
                >
                  Or click here to continue as Demo {selectedRole === 'owner' ? 'Owner (Sarah)' : 'Finder (Alex)'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* Minimal Footer */}
      <footer className="border-t border-slate-900 bg-[#060a12] py-6 text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <span className="font-bold text-slate-300">ReFind AI</span> &bull; AI Lost & Found Matching and Secure Item Recovery
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Dark Navy Base</span>
            <span>&bull;</span>
            <span className="text-rose-400">Coral (Owner)</span>
            <span>&bull;</span>
            <span className="text-emerald-400">Green (Finder)</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
