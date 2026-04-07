import { create } from 'zustand';
import type { TicketBundle } from '@/types/ticket';
import type { Account } from '@/types/account';
import type { StripeCustomer } from '@/types/stripe';
import type { SiteDebugReport } from '@/types/debug';
import type { JiraIssue } from '@/types/jira';
import type { DocArticle } from '@/types/docs';

export type SkillStatus = 'idle' | 'running' | 'done' | 'skipped' | 'error';

export interface DraftVariant {
  label: string;
  draft: string;
}

export interface WorkflowState {
  ticketId: string;
  bundle: TicketBundle | null;
  account: Account | null;
  stripe: StripeCustomer | null;
  debug: SiteDebugReport | null;
  jira: JiraIssue | null;
  docResults: DocArticle[];

  skillStatuses: Record<number, SkillStatus>;
  streamOutput: string;
  draft: string;
  draftVariants: DraftVariant[];
  category: string;
  querySummary: string;

  isRunning: boolean;
  error: string | null;
  infoGatheringMode: boolean;
  isPresales: boolean;

  setTicketId: (id: string) => void;
  setBundle: (b: TicketBundle) => void;
  setAccount: (a: Account) => void;
  setStripe: (s: StripeCustomer) => void;
  setDebug: (d: SiteDebugReport) => void;
  setJira: (j: JiraIssue) => void;
  setDocResults: (docs: DocArticle[]) => void;
  setSkillStatus: (id: number, status: SkillStatus) => void;
  appendStream: (text: string) => void;
  clearStream: () => void;
  setDraft: (d: string) => void;
  setDraftVariants: (v: DraftVariant[]) => void;
  setCategory: (c: string) => void;
  setQuerySummary: (s: string) => void;
  setIsRunning: (v: boolean) => void;
  setError: (e: string | null) => void;
  setInfoGatheringMode: (v: boolean) => void;
  setIsPresales: (v: boolean) => void;
  reset: () => void;
}

const initialSkillStatuses: Record<number, SkillStatus> = {
  1: 'idle', 2: 'idle', 3: 'idle', 4: 'idle', 5: 'idle', 6: 'idle', 7: 'idle',
};

export const useWorkflowStore = create<WorkflowState>((set) => ({
  ticketId: '',
  bundle: null,
  account: null,
  stripe: null,
  debug: null,
  jira: null,
  docResults: [],
  skillStatuses: { ...initialSkillStatuses },
  streamOutput: '',
  draft: '',
  draftVariants: [],
  category: '',
  querySummary: '',
  isRunning: false,
  error: null,
  infoGatheringMode: false,
  isPresales: false,

  setTicketId: (id) => set({ ticketId: id }),
  setBundle: (b) => set({ bundle: b }),
  setAccount: (a) => set({ account: a }),
  setStripe: (s) => set({ stripe: s }),
  setDebug: (d) => set({ debug: d }),
  setJira: (j) => set({ jira: j }),
  setDocResults: (docs) => set({ docResults: docs }),
  setSkillStatus: (id, status) =>
    set((s) => ({ skillStatuses: { ...s.skillStatuses, [id]: status } })),
  appendStream: (text) => set((s) => ({ streamOutput: s.streamOutput + text })),
  clearStream: () => set({ streamOutput: '', draft: '', draftVariants: [], querySummary: '' }),
  setDraft: (d) => set({ draft: d }),
  setDraftVariants: (v) => set({ draftVariants: v }),
  setCategory: (c) => set({ category: c }),
  setQuerySummary: (s) => set({ querySummary: s }),
  setIsRunning: (v) => set({ isRunning: v }),
  setError: (e) => set({ error: e }),
  setInfoGatheringMode: (v) => set({ infoGatheringMode: v }),
  setIsPresales: (v) => set({ isPresales: v }),
  reset: () =>
    set({
      bundle: null,
      account: null,
      stripe: null,
      debug: null,
      jira: null,
      docResults: [],
      skillStatuses: { ...initialSkillStatuses },
      streamOutput: '',
      draft: '',
      draftVariants: [],
      category: '',
      querySummary: '',
      isRunning: false,
      error: null,
      infoGatheringMode: false,
      isPresales: false,
    }),
}));
