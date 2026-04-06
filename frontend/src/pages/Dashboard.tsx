import { useNavigate } from 'react-router-dom';

import MetricCard from '@/components/shared/MetricCard';
import { useHistoryStore } from '@/store/historyStore';


const CATEGORIES = ['Technical', 'Billing/Refund', 'Account', 'Setup', 'Scanner', 'Bug'];

export default function Dashboard() {
  const { entries } = useHistoryStore();
  const navigate = useNavigate();

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      <div>
        <h1 className="text-lg font-semibold text-gray-800">Dashboard</h1>
        <p className="text-sm text-gray-400">AI Support Desk overview</p>
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
