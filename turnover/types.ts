export enum ShoeCategory {
  DAILY = 'Daily Trainer',
  WORKOUT = 'Speed/Workout',
  RACE = 'Race Day',
  RECOVERY = 'Recovery',
  TRAIL = 'Trail'
}

export enum FeelPreference {
  NEUTRAL = 'Neutral',
  STABILITY = 'Stability',
  MAX_CUSHION = 'Max Cushion'
}

export interface Shoe {
  id: string;
  brand: string;
  model: string;
  category: ShoeCategory;
  imageUrl: string;
  stackHeight: number;
  drop: number;
  weight: string; // e.g. "250g"
  tags: string[];
}

export interface UserShoe extends Shoe {
  userShoeId: string;
  currentMileage: number;
  maxMileage: number;
  isActive: boolean;
  status: 'good' | 'warning' | 'retired';
  notes?: string;
  retirementReason?: string;
}

export interface Feedback {
  id: string;
  userShoeId: string;
  date: string;
  comfort: number; // 1-5
  responsiveness: number; // 1-5
  pain: boolean;
  text?: string;
}

export interface UserProfile {
  name: string;
  weeklyMileage: number; // km per week
  preference: FeelPreference;
  onboardingComplete: boolean;
}