export interface User {
  id: string;
  name?: string; 
  email: string;
  avatar?: string;
  pairedWithUserId?: string | null;
  inviteCode?: string;
}

export interface Post {
  id: string;
  userId: string;
  content: string;
  image?: string;
  likes: number;
  timestamp: string;
  type: 'moment' | 'thought' | 'memory';
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: Date;
  isAiGenerated?: boolean;
}

export enum ViewState {
  LANDING = 'LANDING',
  FEED = 'FEED',
  CHAT = 'CHAT',
  PROFILE = 'PROFILE'
}

export interface ChatSession {
  recipientId: string;
  messages: Message[];
}