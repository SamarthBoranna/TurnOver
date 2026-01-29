import { Shoe, ShoeCategory, UserShoe } from '../types';

export const MASTER_CATALOG: Shoe[] = [
  {
    id: 's1',
    brand: 'Nike',
    model: 'Pegasus 40',
    category: ShoeCategory.DAILY,
    imageUrl: 'https://picsum.photos/400/400?random=1',
    stackHeight: 33,
    drop: 10,
    weight: '280g',
    tags: ['Responsive', 'Reliable']
  },
  {
    id: 's2',
    brand: 'New Balance',
    model: 'Fresh Foam 1080 v13',
    category: ShoeCategory.DAILY,
    imageUrl: 'https://picsum.photos/400/400?random=2',
    stackHeight: 38,
    drop: 6,
    weight: '260g',
    tags: ['Soft', 'Plush']
  },
  {
    id: 's3',
    brand: 'Adidas',
    model: 'Adizero Adios Pro 3',
    category: ShoeCategory.RACE,
    imageUrl: 'https://picsum.photos/400/400?random=3',
    stackHeight: 39.5,
    drop: 6.5,
    weight: '218g',
    tags: ['Aggressive', 'Carbon-Plated']
  },
  {
    id: 's4',
    brand: 'Saucony',
    model: 'Endorphin Speed 3',
    category: ShoeCategory.WORKOUT,
    imageUrl: 'https://picsum.photos/400/400?random=4',
    stackHeight: 36,
    drop: 8,
    weight: '229g',
    tags: ['Versatile', 'Fast']
  },
  {
    id: 's5',
    brand: 'Hoka',
    model: 'Clifton 9',
    category: ShoeCategory.DAILY,
    imageUrl: 'https://picsum.photos/400/400?random=5',
    stackHeight: 32,
    drop: 5,
    weight: '248g',
    tags: ['Stable', 'Cushioned']
  },
  {
    id: 's6',
    brand: 'Asics',
    model: 'Superblast',
    category: ShoeCategory.WORKOUT,
    imageUrl: 'https://picsum.photos/400/400?random=6',
    stackHeight: 45.5,
    drop: 8,
    weight: '239g',
    tags: ['Max Cushion', 'Bouncy']
  }
];

export const MOCK_USER_SHOES: UserShoe[] = [
  {
    ...MASTER_CATALOG[0],
    userShoeId: 'us1',
    currentMileage: 450,
    maxMileage: 500,
    isActive: true,
    status: 'warning'
  },
  {
    ...MASTER_CATALOG[1],
    userShoeId: 'us2',
    currentMileage: 120,
    maxMileage: 600,
    isActive: true,
    status: 'good'
  },
  {
    ...MASTER_CATALOG[2],
    userShoeId: 'us3',
    currentMileage: 45,
    maxMileage: 250,
    isActive: true,
    status: 'good'
  }
];