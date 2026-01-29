import React, { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { UserShoe } from '../types';
import { ShoeCard } from '../components/ShoeCard';
import { getRotationAnalysis } from '../services/geminiService';

interface RotationProps {
  shoes: UserShoe[];
  onShoeClick: (id: string) => void;
  onAddShoe: () => void;
}

export const Rotation: React.FC<RotationProps> = ({ shoes, onShoeClick, onAddShoe }) => {
  const [insight, setInsight] = useState<string>("Analyzing your weekly progress...");
  const [loading, setLoading] = useState(true);

  // Filter active shoes only
  const activeShoes = shoes.filter(s => s.isActive);
  const retiredShoes = shoes.filter(s => !s.isActive);

  useEffect(() => {
    // Simulate fetching insight on mount
    const fetchInsight = async () => {
      setLoading(true);
      const text = await getRotationAnalysis(activeShoes);
      setInsight(text);
      setLoading(false);
    };
    fetchInsight();
  }, [activeShoes.length]); // Re-run if shoe count changes

  return (
    <div className="h-full flex flex-col">
      <div className="px-6 pt-10 pb-4 flex justify-between items-end">
        <div>
          <h2 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Active Rotation</h2>
          <h1 className="text-3xl font-bold text-pacer-black">Your Shoes</h1>
        </div>
        <button 
          onClick={onAddShoe}
          className="bg-pacer-black text-white p-3 rounded-full hover:bg-black/90 transition-transform active:scale-90"
        >
          <Plus size={24} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-24 no-scrollbar">
        {activeShoes.map(shoe => (
          <ShoeCard 
            key={shoe.userShoeId} 
            shoe={shoe} 
            onClick={() => onShoeClick(shoe.userShoeId)} 
          />
        ))}

        {retiredShoes.length > 0 && (
          <div className="mt-8">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Retired</h3>
            {retiredShoes.map(shoe => (
              <div key={shoe.userShoeId} className="opacity-60 grayscale">
                <ShoeCard 
                    shoe={shoe} 
                    onClick={() => onShoeClick(shoe.userShoeId)} 
                />
              </div>
            ))}
          </div>
        )}

        {/* AI Insight Section */}
        <div className="mt-6 p-6 bg-gray-50 rounded-2xl border border-gray-100">
          <h3 className="text-sm font-bold text-pacer-black mb-2 flex items-center gap-2">
            Weekly Insight 
            {loading && <span className="animate-pulse w-2 h-2 rounded-full bg-pacer-orange"></span>}
          </h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            {insight}
          </p>
        </div>
      </div>
    </div>
  );
};