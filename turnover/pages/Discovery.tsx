import React, { useEffect, useState } from 'react';
import { MASTER_CATALOG } from '../services/mockData';
import { Shoe, UserProfile, UserShoe } from '../types';
import { getShoeRecommendationReason } from '../services/geminiService';
import { Sparkles, X, Heart, Info, Check } from 'lucide-react';

interface DiscoveryProps {
  userProfile: UserProfile;
  currentRotation: UserShoe[];
}

export const Discovery: React.FC<DiscoveryProps> = ({ userProfile, currentRotation }) => {
  const [candidates, setCandidates] = useState<Array<{ shoe: Shoe, reason: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lastDirection, setLastDirection] = useState<'left' | 'right' | null>(null);

  // In a real app, this would query Supabase pgvector to find similar shoes
  // that are NOT in the currentRotation.
  useEffect(() => {
    const fetchCandidates = async () => {
      setLoading(true);
      const ownedIds = new Set(currentRotation.map(s => s.id));
      const available = MASTER_CATALOG.filter(s => !ownedIds.has(s.id));
      
      const enriched = await Promise.all(
        available.map(async (shoe) => {
          const reason = await getShoeRecommendationReason(shoe, userProfile, currentRotation);
          return { shoe, reason };
        })
      );
      
      setCandidates(enriched);
      setLoading(false);
    };

    fetchCandidates();
  }, [userProfile, currentRotation]);

  const handleSwipe = (direction: 'left' | 'right') => {
    setLastDirection(direction);
    // Animate out
    setTimeout(() => {
        setCurrentIndex(prev => prev + 1);
        setLastDirection(null);
    }, 200);

    if (direction === 'right') {
        // Logic to add to "Liked" or update vector preferences would go here
        console.log("User liked:", candidates[currentIndex].shoe.model);
    }
  };

  if (loading) {
     return (
        <div className="h-full flex items-center justify-center p-6 flex-col">
            <Sparkles className="animate-spin text-pacer-orange mb-4" size={32} />
            <p className="text-gray-500 text-sm">Curating from the Master Catalog...</p>
        </div>
     );
  }

  if (currentIndex >= candidates.length) {
      return (
          <div className="h-full flex flex-col items-center justify-center p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Check className="text-green-500" size={32} />
              </div>
              <h2 className="text-xl font-bold text-pacer-black mb-2">All Caught Up!</h2>
              <p className="text-gray-500">We've updated your preference profile based on your swipes.</p>
          </div>
      );
  }

  const currentCard = candidates[currentIndex];

  return (
    <div className="h-full flex flex-col pt-6 pb-24 px-4 relative overflow-hidden bg-gray-50">
       <div className="text-center mb-4">
          <h2 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Discover</h2>
       </div>

       <div className="flex-1 relative card-stack w-full max-w-sm mx-auto">
            {/* Background Card (Decoration) */}
            {currentIndex + 1 < candidates.length && (
                <div className="absolute top-4 left-0 right-0 bottom-4 bg-white rounded-3xl shadow-sm border border-gray-100 scale-95 opacity-50 z-0"></div>
            )}

            {/* Main Active Card */}
            <div 
                className={`absolute inset-0 bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden flex flex-col z-10 swipe-card ${
                    lastDirection === 'left' ? '-translate-x-full rotate-[-15deg] opacity-0' : 
                    lastDirection === 'right' ? 'translate-x-full rotate-[15deg] opacity-0' : ''
                }`}
            >
                {/* Image Area */}
                <div className="h-3/5 relative bg-gray-100">
                    <img 
                        src={currentCard.shoe.imageUrl} 
                        alt={currentCard.shoe.model} 
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 left-4 flex gap-2">
                        <span className="bg-black/70 backdrop-blur text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                            {currentCard.shoe.category}
                        </span>
                    </div>
                    <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-white to-transparent"></div>
                </div>

                {/* Content Area */}
                <div className="flex-1 p-6 relative">
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 leading-tight">{currentCard.shoe.model}</h2>
                            <p className="text-gray-500 font-medium">{currentCard.shoe.brand}</p>
                        </div>
                        <div className="text-right">
                            <span className="block text-xl font-bold">{currentCard.shoe.weight}</span>
                            <span className="text-xs text-gray-400 uppercase">Weight</span>
                        </div>
                    </div>

                    <div className="flex gap-2 my-3">
                         {currentCard.shoe.tags.map(t => (
                             <span key={t} className="px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-xs font-medium">{t}</span>
                         ))}
                    </div>

                    <div className="bg-orange-50 p-3 rounded-xl border border-orange-100 mt-2">
                         <div className="flex items-center gap-1.5 text-pacer-orange font-bold text-[10px] uppercase mb-1">
                             <Sparkles size={10} /> AI Match
                         </div>
                         <p className="text-xs text-gray-700 italic leading-snug">
                             "{currentCard.reason}"
                         </p>
                    </div>
                </div>
            </div>
       </div>

       {/* Controls */}
       <div className="h-20 flex items-center justify-center gap-6 mt-6 z-20">
            <button 
                onClick={() => handleSwipe('left')}
                className="w-14 h-14 bg-white rounded-full shadow-lg border border-gray-100 text-gray-400 flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
            >
                <X size={28} />
            </button>
            <button 
                className="w-10 h-10 bg-gray-100 rounded-full text-gray-400 flex items-center justify-center hover:bg-gray-200 transition-colors"
            >
                <Info size={20} />
            </button>
            <button 
                onClick={() => handleSwipe('right')}
                className="w-14 h-14 bg-pacer-orange rounded-full shadow-lg shadow-orange-200 text-white flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
            >
                <Heart size={26} fill="white" />
            </button>
       </div>
    </div>
  );
};