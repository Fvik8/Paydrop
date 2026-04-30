export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  role: 'creator' | 'member';
}

export interface CreatorProfile {
  bio: string;
  bannerImage: string;
  links: string[];
}

export interface Tier {
  id: string;
  creatorId: string;
  name: string;
  price: number;
  description: string;
  features: string[];
}

export interface Drop {
  id: string;
  creatorId: string;
  tierId: string;
  title: string;
  description: string;
  type: 'pdf' | 'figma' | 'link' | 'video';
  url: string;
  releasedAt: any; // Firestore Timestamp
}

export interface Subscription {
  id: string;
  memberId: string;
  creatorId: string;
  tierId: string;
  status: 'active' | 'cancelled';
  startedAt: any;
}
