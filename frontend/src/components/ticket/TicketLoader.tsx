import { useState } from 'react';
import { Search, Zap, Layers } from 'lucide-react';
import { useTicketQueue } from '@/hooks/useTicketQueue';
import { useTicketQueueStore } from '@/store/ticketQueueStore';
import Spinner from '@/components/shared/Spinner';

export default function TicketLoader() {
  const [input, setInput] = useState('');
  const { runSingle, runBatch } = useTicketQueue();
  const tickets = useTicketQueueStore((s) => s.tickets);

  // Any ticket currently processing
  const isAnyRunning = Object.values(tickets).some((t) => t.status === 'running');

  // Parse input — supports comma-separated or newline-separated IDs
  const parseIds = (raw: string): string[] =>
    raw.split(/[\n,]+/).map((s) => s.trim()).filter(Boolean);

  const handleLoad = () => {
    if (!input.trim() || isAnyRunning) return;
    const ids = parseIds(input);
    if (ids.length === 0) return;
    if (ids.length === 1) {
      runSingle(ids[0]);
    } else {
      runBatch(ids);
    }
    setInput('');
  };

  const ids = parseIds(input);
  const isBatch = ids.length > 1;
  const isDisabled = !input.trim() || isAnyRunning;

  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
      <div className="px-5 py-4 flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLoad()}
            placeholder="Ticket ID — or paste multiple IDs comma-separated…"
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors"
            disabled={isAnyRunning}
          />
        </div>

        <button
          onClick={handleLoad}
          disabled={isDisabled}
          className={`flex items-center gap-2 px-4 py-2 text-white text-sm font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm ${
            isBatch
              ? 'bg-violet-600 hover:bg-violet-700'
              : 'bg-brand hover:bg-brand-dark'
          }`}
        >
          {isAnyRunning ? (
            <>
              <Spinner className="border-white border-t-transparent" />
              Running…
            </>
          ) : isBatch ? (
            <>
              <Layers className="w-4 h-4" />
              Run Batch ({ids.length})
            </>
          ) : (
            <>
              <Zap className="w-4 h-4" />
              Run Workflow
            </>
          )}
        </button>
      </div>

      {/* Batch hint */}
      {!isAnyRunning && !input && (
        <div className="px-5 pb-3 -mt-1">
          <p className="text-[11px] text-gray-400">
            Tip: paste multiple ticket IDs separated by commas to process them in parallel
          </p>
        </div>
      )}
    </div>
  );
}
