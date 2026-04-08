import { create } from 'zustand';
import type { TicketBundle } from '@/types/ticket';
import type { Account } from '@/types/account';
import type { StripeCustomer } from '@/types/stripe';
import type { SiteDebugReport } from '@/types/debug';
import type { JiraIssue } from '@/types/jira';
import type { DocArticle } from '@/types/docs';
import type { CertSearchResult } from '@/types/certification';
import type { SkillStatus, DraftVariant } from '@/store/workflowStore';

// ── Per-ticket isolated state ─────────────────────────────────────────────────

export interface PerTicketState {
  ticketId: string;
  status: 'queued' | 'running' | 'done' | 'error';

  // Data
  bundle: TicketBundle | null;
  account: Account | null;
  stripe: StripeCustomer | null;
  debug: SiteDebugReport | null;
  jira: JiraIssue | null;
  docResults: DocArticle[];
  certResult: CertSearchResult | null;

  // Flags
  isCertRequest: boolean;
  infoGatheringMode: boolean;
  isPresales: boolean;

  // Skill pipeline
  skillStatuses: Record<number, SkillStatus>;

  // AI output
  streamOutput: string;
  draft: string;
  draftReady: boolean;
  draftVariants: DraftVariant[];
  category: string;
  querySummary: string;

  // Meta
  error: string | null;
  startedAt: number;
  completedAt: number | null;
}

const makeInitialTicket = (ticketId: string): PerTicketState => ({
  ticketId,
  status: 'queued',
  bundle: null,
  account: null,
  stripe: null,
  debug: null,
  jira: null,
  docResults: [],
  certResult: null,
  isCertRequest: false,
  infoGatheringMode: false,
  isPresales: false,
  skillStatuses: { 1: 'idle', 2: 'idle', 3: 'idle', 4: 'idle', 5: 'idle', 6: 'idle', 7: 'idle', 8: 'idle' },
  streamOutput: '',
  draft: '',
  draftReady: false,
  draftVariants: [],
  category: '',
  querySummary: '',
  error: null,
  startedAt: Date.now(),
  completedAt: null,
});

// ── Queue store ───────────────────────────────────────────────────────────────

interface TicketQueueStore {
  tickets: Record<string, PerTicketState>;   // ticketId → isolated state
  activeTicketId: string | null;             // which ticket agent is viewing
  maxConcurrent: number;                     // Claude API concurrency cap
  runningAiCount: number;                    // live semaphore

  // Actions
  addTickets: (ids: string[]) => void;
  setActiveTicket: (id: string) => void;
  updateTicket: (id: string, patch: Partial<PerTicketState>) => void;
  appendTicketStream: (id: string, chunk: string) => void;
  removeTicket: (id: string) => void;
  incrementAi: () => void;
  decrementAi: () => void;
  setMaxConcurrent: (n: number) => void;
  clearAll: () => void;
}

export const useTicketQueueStore = create<TicketQueueStore>((set) => ({
  tickets: {},
  activeTicketId: null,
  maxConcurrent: 3,
  runningAiCount: 0,

  addTickets: (ids) =>
    set((s) => {
      const incoming: Record<string, PerTicketState> = {};
      for (const id of ids) {
        // Don't re-initialise a ticket already in progress
        if (!s.tickets[id]) {
          incoming[id] = makeInitialTicket(id);
        }
      }
      return { tickets: { ...s.tickets, ...incoming } };
    }),

  setActiveTicket: (id) => set({ activeTicketId: id }),

  updateTicket: (id, patch) =>
    set((s) => {
      const existing = s.tickets[id];
      if (!existing) return s;
      return {
        tickets: {
          ...s.tickets,
          [id]: { ...existing, ...patch },
        },
      };
    }),

  // Optimised stream append — avoids spreading entire patch object on every chunk
  appendTicketStream: (id, chunk) =>
    set((s) => {
      const existing = s.tickets[id];
      if (!existing) return s;
      return {
        tickets: {
          ...s.tickets,
          [id]: { ...existing, streamOutput: existing.streamOutput + chunk },
        },
      };
    }),

  removeTicket: (id) =>
    set((s) => {
      const { [id]: _, ...rest } = s.tickets;
      const activeTicketId = s.activeTicketId === id
        ? (Object.keys(rest)[0] ?? null)
        : s.activeTicketId;
      return { tickets: rest, activeTicketId };
    }),

  incrementAi: () => set((s) => ({ runningAiCount: s.runningAiCount + 1 })),
  decrementAi: () => set((s) => ({ runningAiCount: Math.max(0, s.runningAiCount - 1) })),
  setMaxConcurrent: (n) => set({ maxConcurrent: Math.min(5, Math.max(1, n)) }),

  clearAll: () => set({ tickets: {}, activeTicketId: null, runningAiCount: 0 }),
}));
