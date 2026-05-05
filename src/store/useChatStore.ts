import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface ChatSession {
  id: string;
  userId: string; // Scoped to user
  title: string;
  messages: Message[];
  updatedAt: number;
}

interface ChatState {
  sessions: ChatSession[];
  currentSessionId: string | null;
  isLoading: boolean;
  
  // Actions
  addMessage: (sessionId: string, message: Message) => void;
  createNewSession: (userId: string) => string;
  setCurrentSession: (id: string) => void;
  deleteSession: (id: string) => void;
  updateSessionTitle: (id: string, title: string) => void;
  clearSessions: () => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      sessions: [],
      currentSessionId: null,
      isLoading: false,

      addMessage: (sessionId, message) =>
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === sessionId
              ? { ...s, messages: [...s.messages, message], updatedAt: Date.now() }
              : s
          ),
        })),

      createNewSession: (userId) => {
        const id = Math.random().toString(36).substring(7);
        const newSession: ChatSession = {
          id,
          userId,
          title: 'New Conversation',
          messages: [],
          updatedAt: Date.now(),
        };
        set((state) => ({
          sessions: [newSession, ...state.sessions],
          currentSessionId: id,
        }));
        return id;
      },

      setCurrentSession: (id) => set({ currentSessionId: id }),

      deleteSession: (id) =>
        set((state) => ({
          sessions: state.sessions.filter((s) => s.id !== id),
          currentSessionId: state.currentSessionId === id ? null : state.currentSessionId,
        })),

      updateSessionTitle: (id, title) =>
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === id ? { ...s, title } : s
          ),
        })),

      clearSessions: () => set({ sessions: [], currentSessionId: null }),
    }),
    {
      name: 'elegoo-chat-v2', // Incremented version to avoid conflicts
    }
  )
);
