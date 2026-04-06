import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Trash2 } from 'lucide-react';
import { useHistoryStore } from '@/store/historyStore';

export default function TicketHistory() {
  const { entries, clear } = useHistoryStore();
  const [q, setQ] = useState('');
  const navigate = useNavigate();

  const filtered = entries.filter((e) =>
    e.ticketId.includes(q) || e.subject?.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-gray-800">Ticket History</h1>
          <p className="text-sm text-gray-400">{entries.length} tickets processed</p>
        </div>
        <button onClick={clear} className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-600">
          <Trash2 className="w-3.5 h-3.5" /> Clear history
        </button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by ticket ID or subject..."
          className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
        />
      </div>

      <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="px-4 py-2.5 text-left text-xs text-gray-400 font-medium">Ticket</th>
              <th className="px-4 py-2.5 text-left text-xs text-gray-400 font-medium">Subject</th>
              <th className="px-4 py-2.5 text-left text-xs text-gray-400 font-medium">Category</th>
              <th className="px-4 py-2.5 text-left text-xs text-gray-400 font-medium">Agent</th>
              <th className="px-4 py-2.5 text-left text-xs text-gray-400 font-medium">Product</th>
              <th className="px-4 py-2.5 text-left text-xs text-gray-400 font-medium">Processed</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((e, i) => (
              <tr
                key={i}
                onClick={() => navigate(`/desk/${e.ticketId}`)}
                className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer"
              >
                <td className="px-4 py-2.5 font-mono text-xs text-brand">#{e.ticketId}</td>
                <td className="px-4 py-2.5 text-gray-700 max-w-[200px] truncate">{e.subject || '—'}</td>
                <td className="px-4 py-2.5">
                  <span className="text-xs px-2 py-0.5 bg-gray-100 rounded-full text-gray-500">{e.category || '—'}</span>
                </td>
                <td className="px-4 py-2.5 text-gray-500">{e.agentName}</td>
                <td className="px-4 py-2.5 text-gray-500">{e.product}</td>
                <td className="px-4 py-2.5 text-gray-400 text-xs">{new Date(e.processedAt).toLocaleString()}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-gray-400 text-sm">No results</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
