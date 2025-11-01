export type Part = 
  | { text: string; inlineData?: never }
  | { text?: never; inlineData: { mimeType: string; data: string } };

export interface Message {
  role: 'user' | 'model';
  parts: Part[];
  timestamp: number;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
}