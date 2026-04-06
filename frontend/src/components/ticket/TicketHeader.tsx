import { ExternalLink } from 'lucide-react';
import Badge from '@/components/shared/Badge';
import { formatDate } from '@/lib/utils';
import type { TicketBundle } from '@/types/ticket';

const statusVariant  = { open: 'green', pending: 'yellow', solved: 'blue',   closed: 'gray'   } as const;
const priorityVariant = { urgent: 'red', high: 'yellow',  normal: 'blue',    low: 'gray'      } as const;

export default function TicketHeader({ bundle }: { bundle: TicketBundle }) {
  const { ticket, requester } = bundle;
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-1">
          <span className="text-xs font-mono text-gray-400">#{ticket.id}</span>
          <Badge variant={statusVariant[ticket.status]}>{ticket.status}</Badge>
          <Badge variant={priorityVariant[ticket.priority]}>{ticket.priority}</Badge>
        </div>
        <h2 className="text-sm font-semibold text-gray-800 truncate">{ticket.subject}</h2>
        <div className="flex items-center gap-3 mt-1 text-xs text-gray-400 flex-wrap">
          <span className="font-medium text-gray-600">{requester.name}</span>
          <span>{requester.email}</span>
          <span>{formatDate(ticket.created_at)}</span>
        </div>
        {ticket.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {ticket.tags.slice(0, 8).map((tag) => (
              <span key={tag} className="text-[10px] px-1.5 py-0.5 bg-gray-100 rounded text-gray-500">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
      <a
        href={`https://zendesk.com/agent/tickets/${ticket.id}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1 text-xs text-brand hover:underline flex-shrink-0"
      >
        Zendesk <ExternalLink className="w-3 h-3" />
      </a>
    </div>
  );
}
