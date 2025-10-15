export interface Agent {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export interface Wizard {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

export interface Conversation {
  id: string;
  messages: Message[];
  lastUpdated: Date;
}