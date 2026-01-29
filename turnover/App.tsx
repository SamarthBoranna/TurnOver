import React, { useState } from 'react';
import { Onboarding } from './pages/Onboarding';
import { Rotation } from './pages/Rotation';
import { ShoeDetail } from './pages/ShoeDetail';
import { Discovery } from './pages/Discovery';
import { Insights } from './pages/Insights';
import { Navigation } from './components/Navigation';
import { MOCK_USER_SHOES } from './services/mockData';
import { UserProfile, UserShoe } from './types';
import { Button } from './components/Button';

const App: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [currentTab, setCurrentTab] = useState('rotation');
  const [userShoes, setUserShoes] = useState<UserShoe[]>(MOCK_USER_SHOES);
  const [selectedShoeId, setSelectedShoeId] = useState<string | null>(null);

  // Add dummy retired shoes to mock data for demonstration if none exist
  React.useEffect(() => {
    if (!userShoes.some(s => !s.isActive)) {
        const dummyRetired: UserShoe = {
            id: 'old1',
            userShoeId: 'us_retired_1',
            brand: 'Brooks',
            model: 'Ghost 14',
            category: 'Daily Trainer' as any,
            imageUrl: 'https://picsum.photos/400/400?grayscale',
            stackHeight: 32,
            drop: 12,
            weight: '280g',
            tags: ['Reliable', 'Heavy'],
            currentMileage: 650,
            maxMileage: 600,
            isActive: false,
            status: 'retired',
            notes: "Served me well for my first marathon training block. Midsole felt dead after 600km."
        };
        setUserShoes(prev => [...prev, dummyRetired]);
    }
  }, []);

  const handleOnboardingComplete = (newProfile: UserProfile) => {
    setProfile(newProfile);
  };

  const handleShoeClick = (id: string) => {
    setSelectedShoeId(id);
  };

  const handleUpdateMileage = (id: string, amount: number) => {
    setUserShoes(prev => prev.map(s => {
      if (s.userShoeId === id) {
        return { ...s, currentMileage: s.currentMileage + amount };
      }
      return s;
    }));
  };

  // Onboarding Flow
  if (!profile || !profile.onboardingComplete) {
    return (
      <div className="h-full w-full bg-white sm:rounded-3xl overflow-hidden">
        <Onboarding onComplete={handleOnboardingComplete} />
      </div>
    );
  }

  // Shoe Detail View (Overlay)
  if (selectedShoeId) {
    const shoe = userShoes.find(s => s.userShoeId === selectedShoeId);
    if (shoe) {
      return (
        <div className="h-full w-full bg-white sm:rounded-3xl overflow-hidden animate-slide-in">
          <ShoeDetail 
            shoe={shoe} 
            onBack={() => setSelectedShoeId(null)}
            onUpdateMileage={(amt) => handleUpdateMileage(selectedShoeId, amt)}
          />
        </div>
      );
    }
  }

  // Main Tab Views
  const renderTabContent = () => {
    switch (currentTab) {
      case 'rotation':
        return (
          <Rotation 
            shoes={userShoes} 
            onShoeClick={handleShoeClick}
            onAddShoe={() => setCurrentTab('discover')}
          />
        );
      case 'discover':
        return (
          <Discovery userProfile={profile} currentRotation={userShoes} />
        );
      case 'insights':
        return (
           <Insights userProfile={profile} rotation={userShoes} />
        );
      case 'profile':
         return (
           <div className="h-full pt-12 px-6">
              <h1 className="text-3xl font-bold mb-6">Profile</h1>
              <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-xl">
                      <p className="text-xs text-gray-400 uppercase mb-1">Weekly Mileage</p>
                      <div className="flex justify-between items-center">
                          <p className="font-medium text-lg">{profile.weeklyMileage} km</p>
                          <div className="flex gap-2">
                             <button 
                                onClick={() => setProfile({...profile, weeklyMileage: Math.max(0, profile.weeklyMileage - 5)})}
                                className="w-8 h-8 rounded-full bg-white border flex items-center justify-center font-bold"
                             >-</button>
                             <button 
                                onClick={() => setProfile({...profile, weeklyMileage: profile.weeklyMileage + 5})}
                                className="w-8 h-8 rounded-full bg-white border flex items-center justify-center font-bold"
                             >+</button>
                          </div>
                      </div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                      <p className="text-xs text-gray-400 uppercase mb-1">Preference</p>
                      <p className="font-medium">{profile.preference}</p>
                  </div>
              </div>
              
              <div className="mt-8 pt-8 border-t border-gray-100">
                  <Button variant="outline" fullWidth>Log Out</Button>
              </div>
           </div>
         );
      default:
        return null;
    }
  };

  return (
    <div className="h-full w-full bg-white sm:rounded-3xl overflow-hidden relative shadow-2xl">
      {renderTabContent()}
      <Navigation currentTab={currentTab} onTabChange={setCurrentTab} />
    </div>
  );
};

export default App;