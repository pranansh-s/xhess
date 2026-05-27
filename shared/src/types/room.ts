export interface Room {
  participants: string[];
  createdBy: string;
  chat: ChatMessage[];
  gameId?: string;
}

export interface ChatMessage {
  content: string;
  senderId: string;
  timestamp: number;
}
