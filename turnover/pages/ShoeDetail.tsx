import React, { useState } from 'react';
import { ArrowLeft, Archive, Heart, PenLine } from 'lucide-react';
import { UserShoe } from '../types';
import { Button } from '../components/Button';

interface ShoeDetailProps {
  shoe: UserShoe;
  onBack: () => void;
  onUpdateMileage: (amount: number) => void;
}

export const ShoeDetail: React.FC<ShoeDetailProps> = ({ shoe, onBack, onUpdateMileage }) => {
  const [feedbackMode, setFeedbackMode] = useState(false);
  const [rating, setRating] = useState<number>(0);
  const [note, setNote] = useState<string>("");
  
  const handleLogRun = () => {
    onUpdateMileage(5);
    setFeedbackMode(true);
  };

  const submitFeedback = () => {
    // Ideally this saves the note to the shoe object in state
    setFeedbackMode(false);
  };

  if (feedbackMode) {
    return (
      <div className="h-full flex flex-col p-6 pt-8 animate-fade-in bg-white z-20 absolute inset-0">
         <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-bold">Post-Run Log</h2>
            <button onClick={() => setFeedbackMode(false)} className="text-gray-400">Cancel</button>
         </div>
         
         <div className="flex-1 flex flex-col space-y-8">
             <div className="text-center">
                 <p className="text-gray-500 mb-4">How did it feel?</p>
                 <div className="flex gap-2 justify-center">
                     {[1,2,3,4,5].map(n => (
                         <button 
                            key={n}
                            onClick={() => setRating(n)}
                            className={`w-12 h-12 rounded-full border-2 flex items-center justify-center font-bold text-lg transition-all ${
                                rating === n 
                                ? 'bg-pacer-black text-white border-pacer-black scale-110' 
                                : 'border-gray-200 text-gray-400 hover:border-gray-300'
                            }`}
                         >
                             {n}
                         </button>
                     ))}
                 </div>
             </div>

             <div>
                <p className="text-gray-500 mb-2 text-sm">Add a note</p>
                <textarea 
                    className="w-full h-32 p-4 bg-gray-50 rounded-xl border border-gray-100 focus:outline-none focus:border-pacer-black"
                    placeholder="Felt snappy at 5k pace..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                />
             </div>
         </div>

         <Button onClick={submitFeedback} fullWidth disabled={rating === 0}>
             Save Entry
         </Button>
      </div>
    );
  }

  const isRetired = shoe.status === 'retired' || !shoe.isActive;

  return (
    <div className="h-full flex flex-col bg-white overflow-y-auto no-scrollbar">
      {/* Header Image */}
      <div className="relative h-64 w-full bg-gray-100">
        <img src={shoe.imageUrl} alt={shoe.model} className={`w-full h-full object-cover ${isRetired ? 'grayscale' : ''}`} />
        <button 
            onClick={onBack}
            className="absolute top-8 left-6 w-10 h-10 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center shadow-sm text-gray-800"
        >
            <ArrowLeft size={20} />
        </button>
        {isRetired && (
            <div className="absolute top-8 right-6 px-4 py-2 bg-black/80 backdrop-blur-md rounded-full text-white text-xs font-bold uppercase tracking-wide">
                Retired
            </div>
        )}
      </div>

      <div className="flex-1 p-6 -mt-6 bg-white rounded-t-3xl relative">
        <div className="flex justify-between items-start mb-2">
            <div>
                <span className="text-xs font-bold text-pacer-orange uppercase tracking-wider">{shoe.category}</span>
                <h1 className="text-2xl font-bold text-gray-900 mt-1">{shoe.model}</h1>
                <p className="text-gray-500 font-medium">{shoe.brand}</p>
            </div>
            <div className="text-right">
                <div className="text-2xl font-bold font-mono">{shoe.currentMileage}</div>
                <div className="text-xs text-gray-400 uppercase">Kilometers</div>
            </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4 mb-8">
            <div className="flex justify-between text-xs text-gray-400 mb-2">
                <span>Wear Progress</span>
                <span>{Math.round((shoe.currentMileage / shoe.maxMileage) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                <div 
                    className={`h-full rounded-full transition-all duration-500 ${isRetired ? 'bg-gray-400' : 'bg-pacer-black'}`}
                    style={{ width: `${Math.min((shoe.currentMileage / shoe.maxMileage) * 100, 100)}%`}}
                ></div>
            </div>
        </div>

        {/* Tech Specs Grid */}
        <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="p-4 bg-gray-50 rounded-2xl">
                <div className="text-gray-400 text-xs uppercase mb-1">Stack Height</div>
                <div className="font-bold text-lg">{shoe.stackHeight}mm</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-2xl">
                <div className="text-gray-400 text-xs uppercase mb-1">Drop</div>
                <div className="font-bold text-lg">{shoe.drop}mm</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-2xl">
                <div className="text-gray-400 text-xs uppercase mb-1">Weight</div>
                <div className="font-bold text-lg">{shoe.weight}</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-2xl">
                <div className="text-gray-400 text-xs uppercase mb-1">Tags</div>
                <div className="font-medium text-sm text-gray-600 truncate">{shoe.tags.join(', ')}</div>
            </div>
        </div>

        {/* Notes Section - especially important for retired shoes */}
        {(shoe.notes || isRetired) && (
            <div className="mb-8">
                <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <PenLine size={16} /> User Notes
                </h3>
                <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-100 text-sm text-gray-800 italic">
                    "{shoe.notes || "No final notes added for this shoe."}"
                </div>
            </div>
        )}

        {!isRetired ? (
            <div className="space-y-3 pb-24">
                <Button onClick={handleLogRun} fullWidth>
                    Log a Run (+5km)
                </Button>
                <Button variant="outline" fullWidth className="text-gray-500 border-gray-100">
                    <Archive size={16} className="mr-2 inline" /> Retire Shoe
                </Button>
            </div>
        ) : (
            <div className="pb-24 text-center">
                <p className="text-sm text-gray-400">This shoe is currently in your archive.</p>
            </div>
        )}
      </div>
    </div>
  );
};