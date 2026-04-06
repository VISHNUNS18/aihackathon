import { useState } from 'react';
import { Edit3, Check } from 'lucide-react';

interface DraftEditorProps {
  draft: string;
  onChange: (v: string) => void;
}

export default function DraftEditor({ draft, onChange }: DraftEditorProps) {
  const [editing, setEditing] = useState(false);

  return (
    <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          Draft Response
        </span>
        <button
          onClick={() => setEditing(!editing)}
          className="flex items-center gap-1 text-xs text-brand hover:underline"
        >
          {editing ? <><Check className="w-3 h-3" /> Done</> : <><Edit3 className="w-3 h-3" /> Edit</>}
        </button>
      </div>
      {editing ? (
        <textarea
          value={draft}
          onChange={(e) => onChange(e.target.value)}
          className="w-full p-4 text-sm text-gray-700 resize-none focus:outline-none min-h-[120px] font-sans"
          rows={5}
        />
      ) : (
        <div className="p-4 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
          {draft || <span className="text-gray-300 italic">Draft will appear after AI analysis completes...</span>}
        </div>
      )}
      <div className="px-4 pb-2 flex justify-end">
        <span className="text-xs text-gray-300">{draft.split(' ').filter(Boolean).length} words</span>
      </div>
    </div>
  );
}
