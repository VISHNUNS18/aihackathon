import { useState } from 'react';
import { Search, Zap } from 'lucide-react';
import { useWorkflow } from '@/hooks/useWorkflow';
import { useWorkflowStore } from '@/store/workflowStore';
import Spinner from '@/components/shared/Spinner';

export default function TicketLoader() {
  const [input, setInput] = useState('');
  const { run } = useWorkflow();
  const { isRunning } = useWorkflowStore();

  const handleLoad = (id: string) => {
    if (!id.trim() || isRunning) return;
    run(id.trim());
  };

  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
      <div className="px-5 py-4 flex gap-3">
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
    </div>
  );
}
