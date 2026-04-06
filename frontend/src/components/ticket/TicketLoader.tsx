import { useState } from 'react';
import { Search, Zap } from 'lucide-react';
import { useWorkflow } from '@/hooks/useWorkflow';
import { useWorkflowStore } from '@/store/workflowStore';
import Spinner from '@/components/shared/Spinner';

const DEMO_GROUPS = [
  {
    label: 'Support Cases',
    tickets: [
      { id: '12345', label: 'Banner gone after WP Rocket update',     badge: 'Technical',  color: 'text-amber-600 border-amber-200 bg-amber-50'  },
      { id: '12346', label: 'Accidental annual upgrade — refund',      badge: 'Billing',    color: 'text-blue-600 border-blue-200 bg-blue-50'    },
      { id: '12349', label: 'Card declined 3×, account past due',      badge: 'Billing',    color: 'text-blue-600 border-blue-200 bg-blue-50'    },
      { id: '12347', label: '2FA lost after phone change',             badge: 'Urgent',     color: 'text-red-600 border-red-200 bg-red-50'       },
      { id: '12350', label: 'GDPR erasure + account deletion',         badge: 'Account',    color: 'text-violet-600 border-violet-200 bg-violet-50' },
      { id: '12351', label: 'Free plan scanner limit hit',             badge: 'Upgrade',    color: 'text-teal-600 border-teal-200 bg-teal-50'    },
      { id: '12348', label: 'Banner not showing — no account found',   badge: 'Info Needed',color: 'text-purple-600 border-purple-200 bg-purple-50' },
    ],
  },
  {
    label: 'Pre-sales',
    tickets: [
      { id: '12352', label: 'Evaluating CookieYes — requesting demo', badge: 'Pre-sales',  color: 'text-emerald-600 border-emerald-200 bg-emerald-50' },
      { id: '12353', label: 'Agency plan for 15 client sites',         badge: 'Pre-sales',  color: 'text-emerald-600 border-emerald-200 bg-emerald-50' },
      { id: '12354', label: 'LGPD + PDPA compliance question',         badge: 'Pre-sales',  color: 'text-emerald-600 border-emerald-200 bg-emerald-50' },
      { id: '12355', label: 'Migrating from Cookiebot',                badge: 'Pre-sales',  color: 'text-emerald-600 border-emerald-200 bg-emerald-50' },
    ],
  },
];

export default function TicketLoader() {
  const [input, setInput] = useState('');
  const [activeGroup, setActiveGroup] = useState<'Support Cases' | 'Pre-sales'>('Support Cases');
  const { run } = useWorkflow();
  const { isRunning } = useWorkflowStore();

  const handleLoad = (id: string) => {
    if (!id.trim() || isRunning) return;
    run(id.trim());
  };

  const currentTickets = DEMO_GROUPS.find((g) => g.label === activeGroup)?.tickets ?? [];

  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
      {/* Search row */}
      <div className="px-5 pt-4 pb-3 flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLoad(input)}
            placeholder="Enter Zendesk ticket ID..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors"
            disabled={isRunning}
          />
        </div>
        <button
          onClick={() => handleLoad(input)}
          disabled={isRunning || !input.trim()}
          className="flex items-center gap-2 px-4 py-2 bg-brand text-white text-sm font-semibold rounded-lg hover:bg-brand-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
        >
          {isRunning ? <Spinner className="border-white border-t-transparent" /> : <Zap className="w-4 h-4" />}
          {isRunning ? 'Running…' : 'Run Workflow'}
        </button>
      </div>

      {/* Demo section */}
      <div className="border-t border-gray-50 px-5 pb-4">
        {/* Tab switcher */}
        <div className="flex items-center gap-1 pt-3 pb-2.5">
          <span className="text-xs font-medium text-gray-400 uppercase tracking-wide mr-2">Demo:</span>
          {DEMO_GROUPS.map((g) => (
            <button
              key={g.label}
              onClick={() => setActiveGroup(g.label as typeof activeGroup)}
              className={`px-3 py-1 text-xs font-medium rounded-full transition-all ${
                activeGroup === g.label
                  ? 'bg-brand text-white'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              {g.label}
            </button>
          ))}
        </div>

        {/* Ticket buttons */}
        <div className="flex flex-wrap gap-1.5">
          {currentTickets.map((t) => (
            <button
              key={t.id}
              onClick={() => { setInput(t.id); handleLoad(t.id); }}
              disabled={isRunning}
              className={`flex items-center gap-1.5 text-xs px-3 py-1.5 border rounded-full font-medium transition-all disabled:opacity-50 hover:shadow-sm ${t.color}`}
            >
              <span className="opacity-50">#{t.id}</span>
              <span>{t.label}</span>
              <span className="opacity-40">·</span>
              <span className="font-semibold">{t.badge}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
