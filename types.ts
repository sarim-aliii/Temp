export interface LoginCredentials {
    email: string;
    password: string;
}

export interface SignupCredentials {
    email: string;
    password: string;
}

export interface User {
  _id?: string;
  name?: string; 
  email: string;
  avatar?: string;
  pairedWithUserId?: string | null;
  inviteCode?: string;
  isVerified?: boolean;
}

export interface ChatRecipient {
  id: string | null | undefined;
  name: string;
  handle: string;
  avatar: string;
  email: string;
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

export type NotificationType = 'error' | 'success' | 'info';

export interface Notification {
  id: number;
  message: string;
  type: NotificationType;
}