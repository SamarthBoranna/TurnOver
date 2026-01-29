import React from 'react';
import { Home, Search, BarChart2, User } from 'lucide-react';

interface NavigationProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ currentTab, onTabChange }) => {
  const tabs = [
    { id: 'rotation', label: 'Rotation', icon: Home },
    { id: 'discover', label: 'Discover', icon: Search },
    { id: 'insights', label: 'Insights', icon: BarChart2 },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-4 pb-8 flex justify-between items-center z-50">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = currentTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex flex-col items-center gap-1 transition-colors ${
              isActive ? 'text-pacer-black' : 'text-gray-400'
            }`}
          >
            <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
            <span className="text-[10px] font-semibold uppercase tracking-wide">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};