import { CheckCircle, XCircle, Loader, Clock, Trash2, ListChecks, Sparkles } from 'lucide-react';
import { useTicketQueueStore } from '@/store/ticketQueueStore';
import type { PerTicketState } from '@/store/ticketQueueStore';
import { SKILLS } from '@/constants/skills';
import type { SkillStatus } from '@/store/workflowStore';

// ── Status helpers ────────────────────────────────────────────────────────────

const STATUS_BADGE: Record<PerTicketState['status'], { label: string; className: string }> = {
  queued:  { label: 'Queued',     className: 'bg-gray-100 text-gray-500' },
  running: { label: 'Running',    className: 'bg-blue-50 text-blue-600' },
  done:    { label: 'Done',       className: 'bg-green-50 text-green-700' },
  error:   { label: 'Error',      className: 'bg-red-50 text-red-600' },
};

interface StatusBadgeProps {
  status: PerTicketState['status'];
  draftReady: boolean;
}

function StatusBadge({ status, draftReady }: StatusBadgeProps) {
  // Intermediate state: done but draft not yet parsed (regen flow or parse failure)
  if (status === 'done' && !draftReady) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-600">
        <Sparkles className="w-2.5 h-2.5 animate-pulse" />
        Drafting
      </span>
    );
  }

  const { label, className } = STATUS_BADGE[status];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${className}`}>
      {status === 'running' && <Loader className="w-2.5 h-2.5 animate-spin" />}
      {status === 'done' && draftReady && <CheckCircle className="w-2.5 h-2.5" />}
      {status === 'error'   && <XCircle className="w-2.5 h-2.5" />}
      {label}
    </span>
  );
}

// ── Mini skill strip ──────────────────────────────────────────────────────────

const MINI_SKILL_COLOR: Record<SkillStatus, string> = {
  done:    'bg-green-400',
  running: 'bg-blue-400 animate-pulse',
  error:   'bg-red-400',
  skipped: 'bg-gray-200',
  idle:    'bg-gray-100',
};

function MiniSkillStrip({ skillStatuses }: { skillStatuses: Record<number, SkillStatus> }) {
  return (
    <div className="flex items-center gap-0.5 mt-1.5">
      {SKILLS.map((skill) => {
        const status = skillStatuses[skill.id] ?? 'idle';
        return (
          <div
            key={skill.id}
            title={`${skill.shortName}: ${status}`}
            className={`w-4 h-1.5 rounded-sm transition-all duration-300 ${MINI_SKILL_COLOR[status]}`}
          />
        );
      })}
    </div>
  );
}

// ── Elapsed time display ──────────────────────────────────────────────────────

function ElapsedTime({ startedAt, completedAt }: { startedAt: number; completedAt: number | null }) {
  const elapsed = Math.round(((completedAt ?? Date.now()) - startedAt) / 1000);
  if (elapsed < 60) return <span>{elapsed}s ago</span>;
  return <span>{Math.round(elapsed / 60)}m ago</span>;
}

// ── Single queue row ──────────────────────────────────────────────────────────

interface RowProps {
  ticket: PerTicketState;
  isActive: boolean;
  onClick: () => void;
  onRemove: (e: React.MouseEvent) => void;
}

function QueueRow({ ticket, isActive, onClick, onRemove }: RowProps) {
  const subject = (ticket.bundle as { ticket?: { subject?: string } } | null)?.ticket?.subject;

  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-3 py-2.5 border-b border-gray-100 last:border-0 transition-colors group ${
        isActive
          ? 'bg-brand/5 border-l-2 border-l-brand'
          : 'hover:bg-gray-50 border-l-2 border-l-transparent'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          {/* Ticket ID + badge */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-gray-800 font-mono">#{ticket.ticketId}</span>
            <StatusBadge status={ticket.status} draftReady={ticket.draftReady} />
          </div>

          {/* Subject */}
          {subject && (
            <p className="text-[11px] text-gray-500 truncate mt-0.5">{subject}</p>
          )}

          {/* Category when done AND draft ready */}
          {ticket.status === 'done' && ticket.draftReady && ticket.category && (
            <span className="inline-block mt-1 text-[10px] bg-amber-50 text-amber-700 border border-amber-100 rounded px-1.5 py-0.5">
              {ticket.category}
            </span>
          )}

          {/* Error message */}
          {ticket.status === 'error' && ticket.error && (
            <p className="text-[10px] text-red-500 mt-0.5 truncate">{ticket.error}</p>
          )}

          {/* Mini skill progress bar */}
          <MiniSkillStrip skillStatuses={ticket.skillStatuses} />
        </div>

        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          {/* Elapsed time */}
          {ticket.status !== 'queued' && (
            <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
              <Clock className="w-2.5 h-2.5" />
              <ElapsedTime startedAt={ticket.startedAt} completedAt={ticket.completedAt} />
            </span>
          )}

          {/* Remove button — visible on hover */}
          <button
            onClick={onRemove}
            className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-gray-300 hover:text-red-400 transition-all"
            title="Remove from queue"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>
    </button>
  );
}

// ── Main panel ────────────────────────────────────────────────────────────────

export default function TicketQueuePanel() {
  const { tickets, activeTicketId, setActiveTicket, removeTicket, clearAll } = useTicketQueueStore();

  // Sort: running first, then queued, then done/error by startedAt desc
  const sorted = Object.values(tickets).sort((a, b) => {
    const order = { running: 0, queued: 1, done: 2, error: 3 };
    if (order[a.status] !== order[b.status]) return order[a.status] - order[b.status];
    return b.startedAt - a.startedAt;
  });

  const runningCount = sorted.filter((t) => t.status === 'running').length;
  const doneCount    = sorted.filter((t) => t.status === 'done' && t.draftReady).length;
  const totalCount   = sorted.length;

  if (totalCount === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-8 px-4 text-center">
        <ListChecks className="w-7 h-7 text-gray-200 mb-2" />
        <p className="text-xs text-gray-400">No tickets in queue</p>
        <p className="text-[11px] text-gray-300 mt-1">Paste ticket IDs above to start</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-between px-3 py-2 border-b border-gray-100 bg-white">
        <div className="flex items-center gap-2">
          <ListChecks className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-xs font-semibold text-gray-600">Queue</span>
          <span className="text-[10px] text-gray-400">
            {runningCount > 0
              ? `${runningCount} running`
              : `${doneCount}/${totalCount} done`}
          </span>
        </div>
        <button
          onClick={clearAll}
          title="Clear all tickets"
          className="p-1 rounded text-gray-300 hover:text-red-400 hover:bg-red-50 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Progress bar */}
      {totalCount > 0 && (
        <div className="flex-shrink-0 h-0.5 bg-gray-100">
          <div
            className="h-full bg-green-400 transition-all duration-500"
            style={{ width: `${(doneCount / totalCount) * 100}%` }}
          />
        </div>
      )}

      {/* Ticket rows */}
      <div className="flex-1 overflow-y-auto">
        {sorted.map((ticket) => (
          <QueueRow
            key={ticket.ticketId}
            ticket={ticket}
            isActive={ticket.ticketId === activeTicketId}
            onClick={() => setActiveTicket(ticket.ticketId)}
            onRemove={(e) => {
              e.stopPropagation();
              removeTicket(ticket.ticketId);
            }}
          />
        ))}
      </div>
    </div>
  );
}
