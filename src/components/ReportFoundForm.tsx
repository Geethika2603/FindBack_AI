import React, { useState } from 'react';
import { Upload, MapPin, Calendar, Check, Sparkles, Building, UserCheck } from 'lucide-react';
import { FoundItem, ItemCategory } from '../types';

interface ReportFoundFormProps {
  onSubmit: (item: Omit<FoundItem, 'id' | 'createdAt' | 'status'>) => void;
  onCancel: () => void;
}

const SAMPLE_IMAGES = [
  { label: 'MacBook / Laptop', url: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=600&q=80' },
  { label: 'Leather Wallet', url: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=600&q=80' },
  { label: 'Keys on Lanyard', url: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=600&q=80' },
  { label: 'Headphones', url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80' },
  { label: 'Water Bottle', url: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=600&q=80' },
];

export const ReportFoundForm: React.FC<ReportFoundFormProps> = ({ onSubmit, onCancel }) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ItemCategory>('Electronics');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [landmark, setLandmark] = useState('Science Library');
  const [roomOrArea, setRoomOrArea] = useState('2nd Floor Desk Area');
  const [city, setCity] = useState('Metro Campus');
  const [foundDate, setFoundDate] = useState(new Date().toISOString().slice(0, 16));
  const [finderName, setFinderName] = useState('Alex Rivera (Staff)');
  const [finderContact, setFinderContact] = useState('alex.r@campus.edu');
  const [custodyLocation, setCustodyLocation] = useState('Science Library Front Desk Locker #4');

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
    if (!title.trim() || !description.trim() || !custodyLocation.trim()) {
      alert('Please fill out all required fields.');
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
        latitude: 37.7748 + (Math.random() - 0.5) * 0.005,
        longitude: -122.4192 + (Math.random() - 0.5) * 0.005,
      },
      foundDate: new Date(foundDate).toISOString(),
      finderName,
      finderContact,
      custodyLocation,
    });
  };

  return (
    <div className="max-w-4xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-8">
      
      {/* Form Header */}
      <div className="border-b border-slate-800 pb-5 flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">
            Finder Registration Protocol
          </span>
          <h2 className="text-2xl font-bold text-white mt-2">Report a Found Item</h2>
          <p className="text-sm text-slate-400">
            Log an item you discovered. ReFind AI will automatically match it with owners seeking their belongings.
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
                placeholder="e.g., Space Gray Laptop with Stickers"
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
                Observed Physical Characteristics *
              </label>
              <textarea
                rows={4}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe visible color, condition, any visible brand/logos, scratches or accessories..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Image Upload & Reference */}
          <div className="space-y-4">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Photo of Found Item (High Resolution)
            </label>

            <div className="border-2 border-dashed border-slate-700 hover:border-emerald-500/50 rounded-2xl p-4 text-center bg-slate-800/40 transition-all flex flex-col items-center justify-center min-h-[160px]">
              {imageUrl ? (
                <div className="relative group w-full flex flex-col items-center">
                  <img
                    src={imageUrl}
                    alt="Found Item Preview"
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
                  <Upload className="w-8 h-8 text-emerald-400 mb-2" />
                  <p className="text-xs text-slate-300 font-medium">Upload photo of found item</p>
                  <p className="text-[11px] text-slate-500 mt-1">Clear photos accelerate AI visual matching</p>
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
            <MapPin className="w-4 h-4 text-emerald-400" />
            <span>Discovery Location & Timing</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Found At (Landmark / Building) *</label>
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
              <label className="block text-xs text-slate-400 mb-1">Exact Area / Spot</label>
              <input
                type="text"
                value={roomOrArea}
                onChange={(e) => setRoomOrArea(e.target.value)}
                placeholder="e.g. Quiet study carrel #14"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Found Date & Time *</label>
              <input
                type="datetime-local"
                required
                value={foundDate}
                onChange={(e) => setFoundDate(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>
        </div>

        {/* Custody Location & Safe Storage */}
        <div className="border-t border-slate-800 pt-6 bg-slate-950/40 -mx-6 sm:-mx-8 px-6 sm:px-8 py-6 rounded-xl border border-emerald-500/20">
          <h3 className="text-sm font-bold text-emerald-300 flex items-center space-x-2 mb-2">
            <Building className="w-4 h-4 text-emerald-400" />
            <span>Current Safe Custody / Storage Location *</span>
          </h3>
          <p className="text-xs text-slate-400 mb-4">
            Where is the item currently secured? (e.g. Campus Security Office, Library Circulation Desk, with Finder)
          </p>

          <input
            type="text"
            required
            value={custodyLocation}
            onChange={(e) => setCustodyLocation(e.target.value)}
            placeholder="e.g. Science Library Front Circulation Desk, Secure Locker #4"
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Finder Contact Details */}
        <div className="border-t border-slate-800 pt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Finder Name *
            </label>
            <input
              type="text"
              required
              value={finderName}
              onChange={(e) => setFinderName(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Finder Contact Email / Phone *
            </label>
            <input
              type="text"
              required
              value={finderContact}
              onChange={(e) => setFinderContact(e.target.value)}
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
            className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white text-sm font-bold rounded-xl shadow-lg shadow-emerald-600/20 transition-all active:scale-95"
          >
            Submit Found Item & Run AI Matcher
          </button>
        </div>

      </form>
    </div>
  );
};
