import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Agent } from '@/types/agent';

export type ToneStyle = 'friendly' | 'professional' | 'technical' | 'concise';

interface AgentState {
  agent: Agent | null;
  activeProduct: 'cookieyes' | 'product-b';
  tone: ToneStyle;
  customTone: string;          // free-text prompt — overrides preset when non-empty
  defaultChannel: string;      // remembered Slack target (channel or DM)
  setAgent: (a: Agent) => void;
  setActiveProduct: (p: 'cookieyes' | 'product-b') => void;
  setTone: (t: ToneStyle) => void;
  setCustomTone: (t: string) => void;
  setDefaultChannel: (c: string) => void;
  logout: () => void;
}

export const useAgentStore = create<AgentState>()(
  persist(
    (set) => ({
      agent: null,
      activeProduct: 'cookieyes',
      tone: 'friendly',
      customTone: '',
      defaultChannel: '#cx-escalations',
      setAgent: (a) => set({ agent: a }),
      setActiveProduct: (p) => set({ activeProduct: p }),
      setTone: (t) => set({ tone: t }),
      setCustomTone: (t) => set({ customTone: t }),
      setDefaultChannel: (c) => set({ defaultChannel: c }),
      logout: () => set({ agent: null }),
    }),
    { name: 'agent-store' }
  )
);
