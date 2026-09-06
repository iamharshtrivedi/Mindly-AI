export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export interface Message {
  id?: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: any;
}

export interface Session {
  id: string;
  summary: string;
  createdAt: any;
  updatedAt: any;
}
