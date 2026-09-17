import React, { useState } from 'react';
import { Upload, Plus, Trash2, ShieldCheck, DollarSign, MapPin, Calendar, Check, AlertCircle } from 'lucide-react';
import { LostItem, ItemCategory, VerificationQuestion } from '../types';

interface ReportLostFormProps {
  onSubmit: (item: Omit<LostItem, 'id' | 'createdAt' | 'status'>) => void;
  onCancel: () => void;
}

const SAMPLE_IMAGES = [
  { label: 'Laptop', url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80' },
  { label: 'Leather Wallet', url: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=600&q=80' },
  { label: 'Headphones', url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80' },
  { label: 'Keychain', url: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=600&q=80' },
  { label: 'Smartwatch', url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80' },
];

export const ReportLostForm: React.FC<ReportLostFormProps> = ({ onSubmit, onCancel }) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ItemCategory>('Electronics');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [landmark, setLandmark] = useState('Library Science Building');
  const [roomOrArea, setRoomOrArea] = useState('Study Floor 2');
  const [city, setCity] = useState('Metro Campus');
  const [lostDate, setLostDate] = useState(new Date().toISOString().slice(0, 16));
  const [ownerName, setOwnerName] = useState('Sarah Jenkins');
  const [ownerContact, setOwnerContact] = useState('sarah.j@campus.edu');
  const [rewardAmount, setRewardAmount] = useState<number>(50);
  const [rewardEscrowed, setRewardEscrowed] = useState(true);

  // Secret Verification Questions (answers are kept confidential to the owner)
  const [verificationQuestions, setVerificationQuestions] = useState<VerificationQuestion[]>([
    {
      id: 'vq-new-1',
      question: 'What distinctive sticker, engraving, or mark is on the item?',
      expectedSecretAnswer: 'Holographic solar system sticker on bottom left',
    },
    {
      id: 'vq-new-2',
      question: 'What is the color of the case or inner lining?',
      expectedSecretAnswer: 'Emerald green felt lining',
    }
  ]);

  const handleAddQuestion = () => {
    setVerificationQuestions([
      ...verificationQuestions,
      {
        id: `vq-new-${Date.now()}`,
        question: '',
        expectedSecretAnswer: '',
      }
    ]);
  };

  const handleRemoveQuestion = (id: string) => {
    setVerificationQuestions(verificationQuestions.filter(q => q.id !== id));
  };

  const handleQuestionChange = (id: string, field: 'question' | 'expectedSecretAnswer', val: string) => {
    setVerificationQuestions(verificationQuestions.map(q => q.id === id ? { ...q, [field]: val } : q));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      alert('Please fill out the item title and description.');
      return;
    }

    onSubmit({
      title,
      category,
      description,
      imageUrl: imageUrl || undefined,
      location: {
        landmark,
        roomOrArea,
        city,
        latitude: 37.7749 + (Math.random() - 0.5) * 0.005,
        longitude: -122.4194 + (Math.random() - 0.5) * 0.005,
      },
      lostDate: new Date(lostDate).toISOString(),
      ownerName,
      ownerContact,
      rewardAmount,
      rewardEscrowed,
      verificationQuestions: verificationQuestions.filter(q => q.question.trim().length > 0),
    });
  };

  return (
    <div className="max-w-4xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-8">
      
      {/* Form Header */}
      <div className="border-b border-slate-800 pb-5 flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 uppercase tracking-wider">
            Owner Submission Protocol
          </span>
          <h2 className="text-2xl font-bold text-white mt-2">Report a Lost Item</h2>
          <p className="text-sm text-slate-400">
            Provide details, upload an image reference, and define private verification challenges to prevent fraud.
          </p>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg border border-slate-700"
        >
          Cancel
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Basic Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Item Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Space Gray iPad Pro 11-inch with Apple Pencil"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ItemCategory)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="Electronics">Electronics (Laptops, Phones, Tablets)</option>
                <option value="Wallets & Bags">Wallets & Bags (Backpacks, Purses)</option>
                <option value="Keys & Access">Keys & Access Cards</option>
                <option value="Audio & Headphones">Audio & Headphones</option>
                <option value="Jewelry & Watches">Jewelry & Watches</option>
                <option value="IDs & Documents">IDs & Documents</option>
                <option value="Clothing & Accessories">Clothing & Accessories</option>
                <option value="Other">Other Miscellaneous Item</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Detailed Visual & Physical Description *
              </label>
              <textarea
                rows={4}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe color, materials, brand, cosmetic wear, contents, and any unique distinguishing features..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Image Upload & Reference */}
          <div className="space-y-4">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Reference Photo / Image
            </label>

            <div className="border-2 border-dashed border-slate-700 hover:border-cyan-500/50 rounded-2xl p-4 text-center bg-slate-800/40 transition-all flex flex-col items-center justify-center min-h-[160px]">
              {imageUrl ? (
                <div className="relative group w-full flex flex-col items-center">
                  <img
                    src={imageUrl}
                    alt="Preview"
                    className="max-h-40 object-contain rounded-lg border border-slate-700"
                  />
                  <button
                    type="button"
                    onClick={() => setImageUrl('')}
                    className="mt-2 text-xs text-rose-400 hover:text-rose-300 font-medium"
                  >
                    Remove Photo
                  </button>
                </div>
              ) : (
                <>
                  <Upload className="w-8 h-8 text-cyan-400 mb-2" />
                  <p className="text-xs text-slate-300 font-medium">Drag & drop photo or browse</p>
                  <p className="text-[11px] text-slate-500 mt-1">PNG, JPG, WebP supported</p>
                  <label className="mt-3 inline-block px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-xs font-semibold text-white rounded-lg cursor-pointer">
                    Browse File
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </>
              )}
            </div>

            {/* Quick sample pickers */}
            <div>
              <span className="text-[11px] text-slate-400 block mb-1.5">Or choose a quick demo image:</span>
              <div className="flex flex-wrap gap-1.5">
                {SAMPLE_IMAGES.map((sample) => (
                  <button
                    key={sample.label}
                    type="button"
                    onClick={() => setImageUrl(sample.url)}
                    className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-md text-slate-300"
                  >
                    {sample.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Location & Time */}
        <div className="border-t border-slate-800 pt-6">
          <h3 className="text-sm font-bold text-white flex items-center space-x-2 mb-4">
            <MapPin className="w-4 h-4 text-cyan-400" />
            <span>Last Known Location & Time</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Landmark / Building *</label>
              <input
                type="text"
                required
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                placeholder="e.g. Science Library"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Room or Specific Area</label>
              <input
                type="text"
                value={roomOrArea}
                onChange={(e) => setRoomOrArea(e.target.value)}
                placeholder="e.g. 2nd Floor Study Room #12"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Date & Approximate Time *</label>
              <input
                type="datetime-local"
                required
                value={lostDate}
                onChange={(e) => setLostDate(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>
        </div>

        {/* Secret Verification Challenges */}
        <div className="border-t border-slate-800 pt-6 bg-slate-950/40 -mx-6 sm:-mx-8 px-6 sm:px-8 py-6 rounded-xl border border-cyan-500/20">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-cyan-300 flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                <span>Private Ownership Verification Questions</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Answers are kept strictly private. When a matching item is found, the claimant must answer these questions to prove ownership.
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddQuestion}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-semibold rounded-lg border border-slate-700 flex items-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Question</span>
            </button>
          </div>

          <div className="space-y-3">
            {verificationQuestions.map((q, idx) => (
              <div key={q.id} className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300">Challenge #{idx + 1}</span>
                  {verificationQuestions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveQuestion(q.id)}
                      className="text-slate-500 hover:text-rose-400 text-xs"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Question (Asked to claimant)</label>
                    <input
                      type="text"
                      value={q.question}
                      onChange={(e) => handleQuestionChange(q.id, 'question', e.target.value)}
                      placeholder="e.g. What is the keychain or engraving?"
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-emerald-400 mb-1">Expected Secret Answer (Confidential)</label>
                    <input
                      type="text"
                      value={q.expectedSecretAnswer || ''}
                      onChange={(e) => handleQuestionChange(q.id, 'expectedSecretAnswer', e.target.value)}
                      placeholder="e.g. Red carabiner with broken gate"
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Reward & Contact Details */}
        <div className="border-t border-slate-800 pt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Reward Offer ($ USD)
            </label>
            <div className="relative">
              <DollarSign className="w-4 h-4 text-emerald-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="number"
                min="0"
                step="5"
                value={rewardAmount}
                onChange={(e) => setRewardAmount(Number(e.target.value))}
                className="w-full pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500 font-bold"
              />
            </div>
            <label className="flex items-center space-x-2 mt-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rewardEscrowed}
                onChange={(e) => setRewardEscrowed(e.target.checked)}
                className="rounded border-slate-700 text-cyan-500 focus:ring-0 bg-slate-800"
              />
              <span className="text-xs text-slate-400">Lock reward in smart escrow</span>
            </label>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Owner Name *
            </label>
            <input
              type="text"
              required
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Contact Email / Phone *
            </label>
            <input
              type="text"
              required
              value={ownerContact}
              onChange={(e) => setOwnerContact(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="border-t border-slate-800 pt-6 flex items-center justify-end space-x-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold rounded-xl border border-slate-700 transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white text-sm font-bold rounded-xl shadow-lg shadow-rose-600/20 transition-all active:scale-95"
          >
            Submit Lost Item & Activate AI Matcher
          </button>
        </div>

      </form>
    </div>
  );
};
