
export interface Message {
  id: string;
  to: string;
  content: string;
  timestamp: number;
  isPinned: boolean;
}

export interface UserProfile {
  nickname: string;
  avatar: string;
  isVip: boolean;
  vipExpiry?: number;
}

export type TabType = 'hole' | 'profile';

export interface VIPModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => void;
}
