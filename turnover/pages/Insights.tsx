import React, { useEffect, useState } from 'react';
import { UserProfile, UserShoe } from '../types';
import { getPreferenceInsights } from '../services/geminiService';
import { Sparkles, TrendingUp, Activity, Award } from 'lucide-react';

interface InsightsProps {
  userProfile: UserProfile;
  rotation: UserShoe[];
}

export const Insights: React.FC<InsightsProps> = ({ userProfile, rotation }) => {
  const [insights, setInsights] = useState<Record<string, string> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const generate = async () => {
      setLoading(true);
      const rawJson = await getPreferenceInsights(userProfile, rotation);
      try {
          const parsed = JSON.parse(rawJson);
          setInsights(parsed);
      } catch (e) {
          console.error("Failed to parse insight JSON", e);
      }
      setLoading(false);
    };
    generate();
  }, [rotation.length, userProfile.weeklyMileage]);

  const cards = [
      { key: 'Daily', icon: Activity, title: 'Daily Training', color: 'bg-blue-50 text-blue-600' },
      { key: 'Race', icon: Award, title: 'Race Day', color: 'bg-purple-50 text-purple-600' },
      { key: 'Recovery', icon: TrendingUp, title: 'Recovery', color: 'bg-green-50 text-green-600' },
  ];

  return (
    <div className="h-full flex flex-col pt-10 px-6 pb-24 overflow-y-auto no-scrollbar">
      <div className="mb-6">
         <h2 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">TurnOver Intelligence</h2>
         <h1 className="text-3xl font-bold text-pacer-black">Feature Profile</h1>
         <p className="text-gray-500 text-sm mt-2">
            Based on your {userProfile.weeklyMileage}km weeks and {rotation.filter(r => !r.isActive).length} retired shoes, here is what you look for.
         </p>
      </div>

      <div className="space-y-4">
        {loading ? (
             [1,2,3].map(i => <div key={i} className="h-32 bg-gray-50 rounded-2xl animate-pulse"></div>)
        ) : (
            cards.map(card => {
                const Icon = card.icon;
                const text = insights?.[card.key] || "Gathering more data...";
                return (
                    <div key={card.key} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-center gap-3 mb-3">
                            <div className={`p-2 rounded-lg ${card.color}`}>
                                <Icon size={20} />
                            </div>
                            <h3 className="font-bold text-gray-900">{card.title}</h3>
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed pl-1 border-l-2 border-gray-100">
                            {text}
                        </p>
                    </div>
                );
            })
        )}
      </div>

      <div className="mt-8 p-6 bg-pacer-black rounded-3xl text-white relative overflow-hidden">
          <Sparkles className="absolute top-4 right-4 text-white/20" size={64} />
          <h3 className="text-lg font-bold mb-2 relative z-10">Vector Analysis</h3>
          <p className="text-sm text-gray-400 relative z-10">
              We update your embedding vector every time you swipe right in Discovery mode, refining recommendations in real-time.
          </p>
      </div>
    </div>
  );
};