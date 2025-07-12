export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  points: number;
  joinedAt: Date;
  isAdmin?: boolean;
}

export interface ClothingItem {
  id: string;
  title: string;
  description: string;
  category: string;
  size: string;
  condition: 'excellent' | 'good' | 'fair';
  images: string[];
  tags: string[];
  pointsRequired: number;
  ownerId: string;
  ownerName: string;
  createdAt: Date;
  status: 'available' | 'pending' | 'swapped';
  featured?: boolean;
}

export interface SwapRequest {
  id: string;
  itemId: string;
  requesterId: string;
  ownerId: string;
  status: 'pending' | 'accepted' | 'declined' | 'completed';
  message: string;
  createdAt: Date;
  completedAt?: Date;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  count: number;
}