import React from 'react';
import { AlertCircle } from 'lucide-react';
import { UserShoe } from '../types';

interface ShoeCardProps {
  shoe: UserShoe;
  onClick: () => void;
}

export const ShoeCard: React.FC<ShoeCardProps> = ({ shoe, onClick }) => {
  const percentage = Math.min((shoe.currentMileage / shoe.maxMileage) * 100, 100);
  
  // Progress bar color logic
  let progressColor = "bg-pacer-black";
  if (percentage > 90) progressColor = "bg-red-500";
  else if (percentage > 75) progressColor = "bg-pacer-orange";

  return (
    <div 
      onClick={onClick}
      className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex gap-4 mb-4 active:bg-gray-50 transition-colors cursor-pointer"
    >
      <div className="w-24 h-24 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
        <img src={shoe.imageUrl} alt={shoe.model} className="w-full h-full object-cover" />
      </div>
      
      <div className="flex-1 flex flex-col justify-between py-1">
        <div className="flex justify-between items-start">
          <div>
            <span className="text-[10px] font-bold tracking-wider text-gray-500 uppercase">{shoe.category}</span>
            <h3 className="font-bold text-gray-900 leading-tight">{shoe.brand} {shoe.model}</h3>
          </div>
          {shoe.status === 'warning' && (
            <AlertCircle size={18} className="text-pacer-orange" />
          )}
        </div>

        <div className="flex gap-2 mt-2">
          {shoe.tags.slice(0, 2).map((tag, idx) => (
             <span key={idx} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md font-medium">
               {tag.toUpperCase()}
             </span>
          ))}
        </div>

        <div className="mt-3">
          <div className="flex justify-between text-xs text-gray-500 mb-1 font-medium">
            <span>{shoe.currentMileage}km</span>
            <span>{shoe.maxMileage}km</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
            <div 
              className={`h-full rounded-full ${progressColor}`} 
              style={{ width: `${percentage}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};