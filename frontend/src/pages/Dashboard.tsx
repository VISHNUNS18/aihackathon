import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Ticket, ArrowRight, CheckCircle2, Loader2, Sparkles, Send } from 'lucide-react';

import MetricCard from '@/components/shared/MetricCard';
import { useHistoryStore } from '@/store/historyStore';
import { useTicketQueue } from '@/hooks/useTicketQueue';
import { useTicketQueueStore } from '@/store/ticketQueueStore';

const CATEGORIES = ['Technical', 'Billing/Refund', 'Account', 'Setup', 'Scanner', 'Bug'];

type PipelineStatus = 'new' | 'in_progress' | 'completed' | 'forwarded';

interface DemoTicket {
  id: string;
  subject: string;
  tag: string;
  priority: 'Normal' | 'High';
  status: PipelineStatus;
}

const INITIAL_TICKETS: DemoTicket[] = [
  // New
  { id: '12367', subject: 'Cookie banner not showing on homepage',                        tag: 'Technical',    priority: 'High',   status: 'new' },
  { id: '12345', subject: 'Banner disappeared after WP Rocket update',                    tag: 'Technical',    priority: 'High',   status: 'new' },
  { id: '12363', subject: 'Banner loads 3–4 seconds late — Cloudflare Rocket Loader',     tag: 'Technical',    priority: 'High',   status: 'new' },
  { id: '12370', subject: 'Tax Residency Certificate (Poland) needed for vendor onboarding', tag: 'Certification', priority: 'Normal', status: 'new' },
  { id: '12374', subject: 'Tax Residency Certificate for Armenia required',                tag: 'Certification', priority: 'Normal', status: 'new' },
  { id: '12373', subject: 'Price quote — 4 domains, Ultimate annual plan',                tag: 'Pre-sales',    priority: 'Normal', status: 'new' },
  // In Progress
  { id: '12366', subject: 'How do I enable default consent settings?',                    tag: 'Technical',    priority: 'Normal', status: 'in_progress' },
  { id: '12361', subject: 'GCM v2 setup with Segment and HubSpot on Next.js',             tag: 'Technical',    priority: 'Normal', status: 'in_progress' },
  { id: '12364', subject: 'Two consent banners showing — Cookiebot conflict after migration', tag: 'Technical', priority: 'High',   status: 'in_progress' },
  { id: '12372', subject: 'SOC 2 Type II Report required for security due diligence',     tag: 'Certification', priority: 'High',  status: 'in_progress' },
  { id: '12352', subject: 'Evaluating CookieYes — looking for a demo before we commit',   tag: 'Pre-sales',    priority: 'Normal', status: 'in_progress' },
  // Completed
  { id: '12360', subject: 'Analytics trackers firing before consent — Shopify store',     tag: 'Technical',    priority: 'High',   status: 'completed' },
  { id: '12365', subject: 'Verify GCM v2 setup before GDPR audit',                       tag: 'Technical',    priority: 'Normal', status: 'completed' },
  { id: '12368', subject: 'Refund request — charged twice this month',                    tag: 'Billing',      priority: 'Normal', status: 'completed' },
  { id: '12353', subject: 'Agency plan enquiry — managing 15 client websites',            tag: 'Pre-sales',    priority: 'Normal', status: 'completed' },
  // Forwarded
  { id: '12362', subject: 'Banner slow on WordPress + WooCommerce + Cloudflare',          tag: 'Technical',    priority: 'Normal', status: 'forwarded' },
  { id: '12355', subject: 'Switching from Cookiebot to CookieYes — migration questions',  tag: 'Pre-sales',    priority: 'Normal', status: 'forwarded' },
];

const TAG_STYLES: Record<string, string> = {
  'Technical':     'bg-blue-50 text-blue-600 border-blue-100',
  'Billing':       'bg-red-50 text-red-600 border-red-100',
  'Certification': 'bg-amber-50 text-amber-700 border-amber-100',
  'Legal':         'bg-purple-50 text-purple-600 border-purple-100',
  'Pre-sales':     'bg-green-50 text-green-700 border-green-100',
};

const COLUMNS: { key: PipelineStatus; label: string; icon: React.ReactNode; headerColor: string; dotColor: string; countColor: string }[] = [
  {
    key: 'new',
    label: 'New',
    icon: <Sparkles className="w-3.5 h-3.5" />,
    headerColor: 'border-t-green-400',
    dotColor: 'bg-green-500',
    countColor: 'bg-green-100 text-green-700',
  },
  {
    key: 'in_progress',
    label: 'Analysis In Progress',
    icon: <Loader2 className="w-3.5 h-3.5" />,
    headerColor: 'border-t-blue-400',
    dotColor: 'bg-blue-500',
    countColor: 'bg-blue-100 text-blue-700',
  },
  {
    key: 'completed',
    label: 'Review Completed',
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    headerColor: 'border-t-violet-400',
    dotColor: 'bg-violet-500',
    countColor: 'bg-violet-100 text-violet-700',
  },
  {
    key: 'forwarded',
    label: 'Action Taken',
    icon: <Send className="w-3.5 h-3.5" />,
    headerColor: 'border-t-gray-300',
    dotColor: 'bg-gray-400',
    countColor: 'bg-gray-100 text-gray-500',
  },
];

const NEXT_STATUS: Record<PipelineStatus, PipelineStatus | null> = {
  new:         'in_progress',
  in_progress: 'completed',
  completed:   'forwarded',
  forwarded:   null,
};

const ACTION_LABEL: Record<PipelineStatus, string> = {
  new:         'Start',
  in_progress: 'Mark Review Complete',
  completed:   'Forward',
  forwarded:   '',
};

const ACTION_STYLE: Record<PipelineStatus, string> = {
  new:         'text-blue-600 hover:bg-blue-50 border-blue-100',
  in_progress: 'text-violet-600 hover:bg-violet-50 border-violet-100',
  completed:   'text-emerald-600 hover:bg-emerald-50 border-emerald-100 font-semibold',
  forwarded:   '',
};

export default function Dashboard() {
  const { entries } = useHistoryStore();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<DemoTicket[]>(INITIAL_TICKETS);
  const { runSingle } = useTicketQueue();

  // Pre-fetch "Review Completed" tickets silently in background on mount
  // so workflow + draft are ready when the agent clicks into them
  // silent=true ensures the active ticket on TicketDesk is not disrupted
  useEffect(() => {
    const completedIds = INITIAL_TICKETS
      .filter((t) => t.status === 'completed')
      .map((t) => t.id);
    const alreadyFetched = useTicketQueueStore.getState().tickets;
    const toFetch = completedIds.filter((id) => !alreadyFetched[id]);
    toFetch.forEach((id) => runSingle(id, { silent: true }));
  }, []);

  const advance = (id: string, currentStatus: PipelineStatus, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = NEXT_STATUS[currentStatus];
    if (!next) return;
    setTickets((prev) => prev.map((t) => t.id === id ? { ...t, status: next } : t));
  };

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      <div>
        <h1 className="text-lg font-semibold text-gray-800">Dashboard</h1>
        <p className="text-sm text-gray-400">AI Support Desk overview</p>
      </div>

      {/* ── My Open Tickets — Kanban Pipeline ───────────────────────── */}
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-2">
          <Ticket className="w-4 h-4 text-gray-400" />
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">My Open Tickets</span>
          <span className="ml-1 px-2 py-0.5 text-[10px] font-semibold bg-brand/10 text-brand rounded-full">
            {tickets.length}
          </span>
        </div>

        <div className="grid grid-cols-4 divide-x divide-gray-100">
          {COLUMNS.map((col) => {
            const colTickets = tickets.filter((t) => t.status === col.key);
            return (
              <div key={col.key} className={`flex flex-col border-t-2 ${col.headerColor}`}>
                {/* Column header */}
                <div className="px-3 py-2.5 flex items-center gap-2 border-b border-gray-50">
                  <span className={`flex items-center gap-1.5 text-xs font-semibold ${
                    col.key === 'new' ? 'text-green-600' :
                    col.key === 'in_progress' ? 'text-blue-600' :
                    col.key === 'completed' ? 'text-violet-600' : 'text-gray-400'
                  }`}>
                    {col.icon}
                    {col.label}
                  </span>
                  <span className={`ml-auto text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${col.countColor}`}>
                    {colTickets.length}
                  </span>
                </div>

                {/* Cards */}
                <div className="flex flex-col gap-2 p-2.5 min-h-[120px] max-h-[420px] overflow-y-auto">
                  {colTickets.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => navigate(`/desk/${t.id}`)}
                      className={`group bg-white border rounded-xl p-3 cursor-pointer hover:shadow-md transition-all ${
                        col.key === 'completed' ? 'border-violet-100 hover:border-violet-300' :
                        col.key === 'forwarded' ? 'border-gray-100 opacity-60 hover:opacity-80' :
                        'border-gray-100 hover:border-brand/30'
                      }`}
                    >
                      {/* Ticket ID + priority */}
                      <div className="flex items-center justify-between mb-1.5">
                        <span className={`font-mono text-[11px] font-semibold ${col.key === 'forwarded' ? 'text-gray-400' : 'text-brand'}`}>
                          #{t.id}
                        </span>
                        <div className="flex items-center gap-1">
                          {t.priority === 'High' && (
                            <span className="text-[9px] font-semibold text-red-500 bg-red-50 border border-red-100 px-1.5 py-0.5 rounded-full">High</span>
                          )}
                          <span className={`w-1.5 h-1.5 rounded-full ${col.dotColor}`} />
                        </div>
                      </div>

                      {/* Subject */}
                      <p className="text-[11px] text-gray-700 leading-snug line-clamp-2 mb-2">{t.subject}</p>

                      {/* Tag */}
                      <span className={`inline-block text-[10px] font-medium border px-1.5 py-0.5 rounded-full mb-2.5 ${TAG_STYLES[t.tag] ?? 'bg-gray-50 text-gray-500 border-gray-100'}`}>
                        {t.tag}
                      </span>

                      {/* Action button */}
                      {NEXT_STATUS[t.status] && (
                        <div className="flex">
                          <button
                            onClick={(e) => advance(t.id, t.status, e)}
                            className={`flex items-center gap-1 text-[10px] border px-2 py-1 rounded-lg transition-colors ${ACTION_STYLE[t.status]}`}
                          >
                            {t.status === 'completed' ? (
                              <Send className="w-3 h-3" />
                            ) : (
                              <ArrowRight className="w-3 h-3" />
                            )}
                            {ACTION_LABEL[t.status]}
                          </button>
                        </div>
                      )}
                    </div>
                  ))}

                  {colTickets.length === 0 && (
                    <div className="flex-1 flex items-center justify-center py-6">
                      <span className="text-[11px] text-gray-300">No tickets</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <MetricCard label="Tickets Today" value={entries.filter(e => e.processedAt.startsWith(new Date().toISOString().slice(0,10))).length} sub="Processed by AI" accent="#7F77DD" />
        <MetricCard label="Open Jira Bugs" value="—" sub="Linked escalations" accent="#ef4444" />
        <MetricCard label="Avg Response" value="—" sub="Agent handle time" accent="#10b981" />
        <MetricCard label="Total Processed" value={entries.length} sub="All time" accent="#0ea5e9" />
      </div>

      <div className="grid grid-cols-[1fr_280px] gap-4">
        {/* Recent tickets */}
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Recent Tickets</span>
            <button onClick={() => navigate('/history')} className="text-xs text-brand hover:underline">View all</button>
          </div>
          <div className="divide-y divide-gray-50">
            {entries.slice(0, 8).map((e, i) => (
              <div
                key={i}
                onClick={() => navigate(`/desk/${e.ticketId}`)}
                className="px-5 py-3 hover:bg-gray-50 cursor-pointer flex items-center justify-between"
              >
                <div>
                  <div className="text-sm font-medium text-gray-700">#{e.ticketId}</div>
                  <div className="text-xs text-gray-400">{e.subject}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs px-2 py-0.5 bg-gray-100 rounded-full text-gray-500">{e.category || '—'}</div>
                  <div className="text-xs text-gray-400 mt-1">{e.agentName}</div>
                </div>
              </div>
            ))}
            {entries.length === 0 && (
              <div className="px-5 py-10 text-center text-sm text-gray-400">
                No tickets processed yet. <button onClick={() => navigate('/desk')} className="text-brand hover:underline">Load one now →</button>
              </div>
            )}
          </div>
        </div>

        {/* Category breakdown */}
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">By Category</span>
          </div>
          <div className="p-4 space-y-2">
            {CATEGORIES.map((cat) => {
              const count = entries.filter(e => e.category === cat).length;
              const pct = entries.length ? Math.round((count / entries.length) * 100) : 0;
              return (
                <div key={cat}>
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>{cat}</span>
                    <span>{count}</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-brand rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
