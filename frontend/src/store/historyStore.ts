import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface HistoryEntry {
  ticketId: string;
  subject: string;
  category: string;
  product: string;
  processedAt: string;
  agentName: string;
}

interface HistoryState {
  entries: HistoryEntry[];
  addEntry: (e: HistoryEntry) => void;
  clear: () => void;
}

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set) => ({
      entries: [],
      addEntry: (e) =>
        set((s) => ({ entries: [e, ...s.entries].slice(0, 100) })),
      clear: () => set({ entries: [] }),
    }),
    { name: 'ticket-history' }
  )
);
