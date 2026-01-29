import React, { useState } from 'react';
import { ArrowRight, Check } from 'lucide-react';
import { Button } from '../components/Button';
import { FeelPreference, UserProfile } from '../types';

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState<Partial<UserProfile>>({
    name: '',
    weeklyMileage: 30, // Default start value
    preference: undefined,
  });

  const nextStep = () => setStep(s => s + 1);

  const handleFinish = () => {
    if (profile.preference) {
      onComplete({
        name: 'Runner',
        weeklyMileage: profile.weeklyMileage || 30,
        preference: profile.preference,
        onboardingComplete: true
      });
    }
  };

  // Step 0: Welcome
  if (step === 0) {
    return (
      <div className="h-full flex flex-col p-6 animate-fade-in">
        <div className="flex-1 flex flex-col justify-center">
          <h1 className="text-4xl font-bold text-pacer-black mb-4 tracking-tight">
            Welcome to <br/> TurnOver
          </h1>
          <p className="text-gray-500 text-lg leading-relaxed mb-8">
            Your intelligent shoe rotation manager. Track wear, analyze your gait preferences, and find the perfect next pair.
          </p>
          <div className="w-full aspect-square bg-gray-100 rounded-3xl overflow-hidden mb-8 shadow-inner relative group">
             <img src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800" alt="Running Shoe" className="w-full h-full object-cover mix-blend-multiply opacity-90 transition-transform duration-700 group-hover:scale-105"/>
          </div>
        </div>
        <Button onClick={nextStep} fullWidth>
          Start Setup <ArrowRight size={18} className="inline ml-1" />
        </Button>
      </div>
    );
  }

  // Step 1: Weekly Mileage
  if (step === 1) {
    return (
      <div className="h-full flex flex-col p-6 pt-12 animate-fade-in">
        <h2 className="text-2xl font-bold mb-2">Weekly Mileage?</h2>
        <p className="text-gray-500 mb-12">How many kilometers do you run in an average week?</p>
        
        <div className="flex-1 flex flex-col items-center justify-center">
            <div className="text-6xl font-black text-pacer-black mb-2 font-mono">
                {profile.weeklyMileage}
                <span className="text-xl text-gray-400 font-medium ml-2">km</span>
            </div>
            
            <input 
                type="range" 
                min="0" 
                max="150" 
                step="5"
                value={profile.weeklyMileage}
                onChange={(e) => setProfile({...profile, weeklyMileage: parseInt(e.target.value)})}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-pacer-black"
            />
            <div className="w-full flex justify-between text-xs text-gray-400 mt-4 font-medium uppercase tracking-wide">
                <span>Beginner</span>
                <span>Elite</span>
            </div>
        </div>

        <Button 
          onClick={nextStep} 
          fullWidth
        >
          Continue
        </Button>
      </div>
    );
  }

  // Step 2: Preference
  if (step === 2) {
    return (
      <div className="h-full flex flex-col p-6 pt-12 animate-fade-in">
        <h2 className="text-2xl font-bold mb-8">Preferred shoe feel?</h2>
        <div className="flex-1 space-y-3">
          {Object.values(FeelPreference).map((pref) => (
            <button
              key={pref}
              onClick={() => setProfile({ ...profile, preference: pref })}
              className={`w-full p-4 rounded-xl border-2 text-left transition-all flex justify-between items-center ${
                profile.preference === pref 
                  ? 'border-pacer-black bg-gray-50 shadow-sm' 
                  : 'border-gray-100 hover:border-gray-200'
              }`}
            >
              <span className="font-medium text-lg">{pref}</span>
              {profile.preference === pref && <Check size={20} />}
            </button>
          ))}
        </div>
        <Button 
          onClick={handleFinish} 
          disabled={!profile.preference}
          className={!profile.preference ? 'opacity-50' : ''}
          fullWidth
        >
          Start Tracking <ArrowRight size={18} className="inline ml-1" />
        </Button>
      </div>
    );
  }

  return null;
};