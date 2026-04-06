export interface SkillDefinition {
  id: number;
  name: string;
  shortName: string;
  description: string;
  color: string;
  bgColor: string;
  trigger: 'always' | 'billing_ticket' | 'technical_ticket' | 'confirmed_bug' | 'always_last';
}

export const SKILLS: SkillDefinition[] = [
  {
    id: 1,
    name: 'Zendesk Loader',
    shortName: 'Zendesk',
    description: 'Load ticket + conversation thread',
    color: '#3b82f6',
    bgColor: '#eff6ff',
    trigger: 'always',
  },
  {
    id: 2,
    name: 'Account Lookup',
    shortName: 'Account',
    description: 'Fetch account, plan, domain, banner',
    color: '#8b5cf6',
    bgColor: '#f5f3ff',
    trigger: 'always',
  },
  {
    id: 3,
    name: 'Stripe Billing',
    shortName: 'Stripe',
    description: 'Subscriptions, invoices, refund eligibility',
    color: '#0ea5e9',
    bgColor: '#f0f9ff',
    trigger: 'billing_ticket',
  },
  {
    id: 4,
    name: 'Site Debugger',
    shortName: 'Site Debug',
    description: 'Banner check, plugin conflicts',
    color: '#f59e0b',
    bgColor: '#fffbeb',
    trigger: 'technical_ticket',
  },
  {
    id: 5,
    name: 'Docs Lookup',
    shortName: 'Docs',
    description: 'Match relevant CookieYes documentation',
    color: '#06b6d4',
    bgColor: '#ecfeff',
    trigger: 'always',
  },
  {
    id: 6,
    name: 'Jira',
    shortName: 'Jira',
    description: 'Raise bug, notify Slack, link ticket',
    color: '#ef4444',
    bgColor: '#fef2f2',
    trigger: 'confirmed_bug',
  },
  {
    id: 7,
    name: 'AI Analyser',
    shortName: 'AI',
    description: 'AI analysis + draft response',
    color: '#10b981',
    bgColor: '#ecfdf5',
    trigger: 'always_last',
  },
];
