import { useWorkflowStore } from '@/store/workflowStore';
import { formatDate } from '@/lib/utils';

export default function ConversationThread() {
  const bundle = useWorkflowStore((s) => s.bundle);
  if (!bundle) return null;

  return (
    <div className="divide-y divide-gray-50">
      {bundle.conversation.map((msg, i) => (
        <div
          key={msg.id || i}
          className={`py-3 ${msg.is_agent ? 'bg-blue-50/30' : ''}`}
        >
          <div className="flex items-center gap-2 mb-1.5">
            <div
              className={`w-5 h-5 rounded-full text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0 ${
                msg.is_agent ? 'bg-brand' : 'bg-gray-400'
              }`}
            >
              {msg.author_name?.charAt(0) || '?'}
            </div>
            <span className="text-xs font-semibold text-gray-700">{msg.author_name}</span>
            <span className="text-xs text-gray-400">{formatDate(msg.created_at)}</span>
            {msg.is_agent && (
              <span className="text-[10px] px-1.5 py-0.5 bg-brand/10 text-brand rounded font-semibold">Agent</span>
            )}
          </div>
          <p className="text-sm text-gray-700 leading-relaxed pl-7 whitespace-pre-wrap">
            {msg.plain_body || msg.body}
          </p>
        </div>
      ))}
    </div>
  );
}
