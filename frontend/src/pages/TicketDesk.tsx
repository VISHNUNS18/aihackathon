import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTicketQueue } from '@/hooks/useTicketQueue';
import { useTicketQueueStore } from '@/store/ticketQueueStore';
import TicketLoader from '@/components/ticket/TicketLoader';
import SkillsPipeline from '@/components/ticket/SkillsPipeline';
import TicketQueuePanel from '@/components/ticket/TicketQueuePanel';
import TicketHeader from '@/components/ticket/TicketHeader';
import ConversationThread from '@/components/ticket/ConversationThread';
import WorkflowPanel from '@/components/workflow/WorkflowPanel';
import StripePanel from '@/components/stripe/StripePanel';
import AccountSnapshot from '@/components/account/AccountSnapshot';
import {
  Zap, CreditCard, User,
  ChevronsLeft, ChevronsRight,
  MessageSquare, Sparkles, ListChecks, CheckCircle, X,
} from 'lucide-react';

type RightTab = 'workflow' | 'account' | 'stripe';
type ConvSize = 'compact' | 'expanded' | 'collapsed';

const CONV_WIDTH: Record<ConvSize, string> = {
  collapsed: 'w-10',
  compact:   'w-[30%]',
  expanded:  'w-[48%]',
};

export default function TicketDesk() {
  const { ticketId: paramId } = useParams();
  const { runSingle } = useTicketQueue();

  // Queue store
  const activeTicketId = useTicketQueueStore((s) => s.activeTicketId);
  const tickets        = useTicketQueueStore((s) => s.tickets);
  const hasAnyTicket   = Object.keys(tickets).length > 0;

  // Active ticket data (for right panel + conversation)
  const activeTicket = activeTicketId ? tickets[activeTicketId] : undefined;
  const bundle       = activeTicket?.bundle  ?? null;
  const account      = activeTicket?.account ?? null;
  const stripe       = activeTicket?.stripe  ?? null;
  const querySummary = activeTicket?.querySummary ?? '';
  const isRunning      = activeTicket?.status === 'running';
  const skill7Status   = activeTicket?.skillStatuses?.[7] ?? 'idle';
  const anySkillRunning = activeTicket
    ? Object.values(activeTicket.skillStatuses).some((s) => s === 'running')
    : false;
  const draftReady     = activeTicket?.draftReady ?? false;

  const [rightTab, setRightTab]   = useState<RightTab>('workflow');
  const [convSize, setConvSize]   = useState<ConvSize>('compact');
  const [queueOpen, setQueueOpen] = useState(true);
  const [aiPopupOpen, setAiPopupOpen] = useState(false);

  // URL param: auto-run ticket from deep-link
  // Skip if ticket is already running or done (e.g. pre-fetched completed tickets)
  useEffect(() => {
    if (!paramId) return;
    const existing = useTicketQueueStore.getState().tickets[paramId];
    if (existing && (existing.status === 'done' || existing.status === 'running')) {
      // Just make it the active ticket, don't re-run
      useTicketQueueStore.getState().setActiveTicket(paramId);
      return;
    }
    runSingle(paramId);
  }, [paramId]);

  const tabs: { key: RightTab; label: string; icon: React.ReactNode; show: boolean }[] = [
    { key: 'workflow', label: 'AI Analysis', icon: <Zap className="w-3 h-3" />,        show: true },
    { key: 'account',  label: 'Account',     icon: <User className="w-3 h-3" />,        show: !!account },
    { key: 'stripe',   label: 'Billing',     icon: <CreditCard className="w-3 h-3" />,  show: !!stripe },
  ];

  const cycleConvSize = () =>
    setConvSize((s) =>
      s === 'collapsed' ? 'compact' : s === 'compact' ? 'expanded' : 'collapsed'
    );

  return (
    <div className="h-full flex flex-col overflow-hidden bg-gray-50">

      {/* ── Top bar ──────────────────────────────────────────────── */}
      <div className="flex-shrink-0 px-4 pt-3 pb-2.5 space-y-2.5 border-b border-gray-200 bg-white shadow-sm">
        <TicketLoader />
        {activeTicketId && <SkillsPipeline ticketId={activeTicketId} />}
      </div>

      {/* ── Body ─────────────────────────────────────────────────── */}
      <div className="flex-1 min-h-0 flex overflow-hidden">

        {/* ── LEFT — Queue sidebar ─────────────────────────────── */}
        {hasAnyTicket && (
          <div
            className={`flex-shrink-0 flex flex-col border-r border-gray-200 bg-white transition-all duration-300 ${
              queueOpen ? 'w-52' : 'w-10'
            }`}
          >
            {/* Sidebar toggle */}
            <button
              onClick={() => setQueueOpen((v) => !v)}
              className="flex-shrink-0 flex items-center justify-between px-2.5 py-2 border-b border-gray-100 hover:bg-gray-50 transition-colors"
              title={queueOpen ? 'Collapse queue' : 'Expand queue'}
            >
              {queueOpen && (
                <div className="flex items-center gap-1.5">
                  <ListChecks className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-xs font-semibold text-gray-500">Queue</span>
                </div>
              )}
              <div className={queueOpen ? '' : 'mx-auto'}>
                {queueOpen
                  ? <ChevronsLeft className="w-3.5 h-3.5 text-gray-400" />
                  : <ChevronsRight className="w-3.5 h-3.5 text-gray-400" />}
              </div>
            </button>

            {queueOpen && <TicketQueuePanel />}

            {/* Collapsed strip — running count badge */}
            {!queueOpen && (
              <div className="flex-1 flex items-start justify-center pt-4">
                <span
                  className="text-[10px] font-mono text-gray-400"
                  style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', letterSpacing: '0.05em' }}
                >
                  Queue ({Object.keys(tickets).length})
                </span>
              </div>
            )}
          </div>
        )}

        {/* ── MAIN area ────────────────────────────────────────── */}
        {bundle ? (
          <div className="flex-1 min-w-0 flex overflow-hidden">

            {/* ── Conversation column ──────────────────────────── */}
            <div
              className={`flex-shrink-0 flex flex-col min-h-0 border-r border-gray-200 bg-white transition-all duration-300 ${CONV_WIDTH[convSize]}`}
            >
              {/* Conversation header */}
              <div className="flex-shrink-0 flex items-center justify-between px-3 py-2.5 border-b border-gray-100 bg-gray-50">
                {convSize !== 'collapsed' && (
                  <div className="flex items-center gap-1.5 min-w-0">
                    <MessageSquare className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                    <span className="text-xs font-semibold text-gray-500 truncate">Conversation</span>
                  </div>
                )}
                <button
                  onClick={cycleConvSize}
                  title={convSize === 'collapsed' ? 'Expand' : convSize === 'compact' ? 'Expand more' : 'Collapse'}
                  className="ml-auto flex-shrink-0 p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-colors"
                >
                  {convSize === 'collapsed'
                    ? <ChevronsRight className="w-3.5 h-3.5" />
                    : convSize === 'expanded'
                    ? <ChevronsLeft className="w-3.5 h-3.5" />
                    : <ChevronsRight className="w-3.5 h-3.5" />}
                </button>
              </div>

              {convSize !== 'collapsed' && (
                <>
                  <div className="flex-shrink-0 px-3 py-2.5 border-b border-gray-100">
                    <TicketHeader bundle={bundle} />
                  </div>
                  <div className="flex-1 min-h-0 overflow-y-auto px-3 py-3">
                    <ConversationThread ticketId={activeTicketId!} />

                    {/* ── Query Summary ──────────────────────────── */}
                    {(querySummary || isRunning) && (
                      <div className="mt-4 rounded-xl bg-amber-50 border border-amber-100 px-4 py-3">
                        <div className="flex items-center gap-1.5 mb-2">
                          <Sparkles className="w-3 h-3 text-amber-500" />
                          <span className="text-[11px] font-semibold text-amber-700 uppercase tracking-wide">AI Summary</span>
                        </div>
                        {querySummary ? (
                          <ul className="space-y-1.5">
                            {querySummary
                              .split(/(?<=[.!?])\s+/)
                              .filter((s) => s.trim().length > 0)
                              .map((sentence, i) => (
                                <li key={i} className="flex items-start gap-2 text-xs text-amber-900">
                                  <span className="mt-1.5 w-1 h-1 rounded-full bg-amber-400 flex-shrink-0" />
                                  <span className="leading-relaxed">{sentence.trim()}</span>
                                </li>
                              ))}
                          </ul>
                        ) : (
                          <div className="space-y-1.5 animate-pulse">
                            <div className="h-2.5 bg-amber-100 rounded-full w-full" />
                            <div className="h-2.5 bg-amber-100 rounded-full w-4/5" />
                            <div className="h-2.5 bg-amber-100 rounded-full w-3/5" />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </>
              )}

              {convSize === 'collapsed' && (
                <div className="flex-1 flex flex-col items-center pt-3 gap-2">

                  {/* Mini vertical skill progress — only while processing */}
                  {anySkillRunning && (
                    <div className="flex flex-col items-center gap-0.5">
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((id) => {
                        const s = activeTicket?.skillStatuses?.[id] ?? 'idle';
                        return (
                          <div
                            key={id}
                            className={`w-3 h-1.5 rounded-sm transition-all ${
                              s === 'done'    ? 'bg-green-400' :
                              s === 'running' ? 'bg-blue-400 animate-pulse' :
                              s === 'error'   ? 'bg-red-400' :
                              s === 'skipped' ? 'bg-gray-200' :
                              'bg-gray-100'
                            }`}
                          />
                        );
                      })}
                    </div>
                  )}

                  {/* AI Analysis tab — clickable, opens popup */}
                  <button
                    onClick={() => setAiPopupOpen(true)}
                    title="View AI Analysis"
                    className={`flex flex-col items-center gap-1 px-1 py-2 rounded-lg transition-all w-8 ${
                      draftReady
                        ? 'text-brand hover:bg-brand/10 cursor-pointer'
                        : skill7Status === 'running'
                        ? 'text-amber-400 cursor-default'
                        : 'text-gray-300 cursor-default'
                    }`}
                    disabled={!draftReady && skill7Status !== 'running'}
                  >
                    <Sparkles className={`w-3.5 h-3.5 flex-shrink-0 ${skill7Status === 'running' ? 'animate-pulse' : ''}`} />
                    <span
                      className="text-[9px] font-semibold uppercase tracking-wider flex-shrink-0"
                      style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
                    >
                      AI
                    </span>
                    {draftReady && (
                      <CheckCircle className="w-2.5 h-2.5 text-green-400 flex-shrink-0" />
                    )}
                  </button>

                  {/* Ticket ID */}
                  <span
                    className="text-[10px] font-mono text-gray-400 flex-shrink-0 mt-auto mb-2"
                    style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', letterSpacing: '0.05em' }}
                  >
                    #{(bundle as unknown as { ticket?: { id?: string | number } }).ticket?.id ?? '—'}
                  </span>
                </div>
              )}
            </div>

            {/* ── Right — AI Analysis ──────────────────────────── */}
            <div className="flex-1 min-w-0 flex flex-col min-h-0 bg-gray-50">
              {/* Tab bar */}
              <div className="flex-shrink-0 flex items-center gap-1 px-4 py-2 border-b border-gray-200 bg-white">
                {tabs.filter((t) => t.show).map((t) => (
                  <button
                    key={t.key}
                    onClick={() => setRightTab(t.key)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                      rightTab === t.key
                        ? 'bg-brand text-white shadow-sm'
                        : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                    }`}
                  >
                    {t.icon}
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Tab content */}
              <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3">
                {rightTab === 'workflow' && <WorkflowPanel ticketId={activeTicketId!} />}
                {rightTab === 'account'  && account && <AccountSnapshot account={account} />}
                {rightTab === 'stripe'   && <StripePanel />}
              </div>
            </div>
          </div>

        ) : (
          /* ── Empty state ───────────────────────────────────── */
          <div className="flex-1 min-h-0 flex overflow-hidden">
            <div className="w-[30%] flex-shrink-0 border-r border-gray-200 bg-white flex items-center justify-center">
              <div className="text-center px-6">
                <MessageSquare className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                <p className="text-xs text-gray-400">Conversation will appear here</p>
              </div>
            </div>
            <div className="flex-1 flex flex-col min-h-0 bg-gray-50">
              <div className="flex-shrink-0 flex items-center gap-1 px-4 py-2 border-b border-gray-200 bg-white">
                <span className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-brand text-white rounded-lg shadow-sm">
                  <Zap className="w-3 h-3" /> AI Analysis
                </span>
              </div>
              <div className="flex-1 min-h-0 overflow-y-auto p-4">
                <WorkflowPanel />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── AI Analysis Popup ─────────────────────────────────────────── */}
      {aiPopupOpen && activeTicketId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
            onClick={() => setAiPopupOpen(false)}
          />
          <div className="relative bg-gray-50 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[88vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-200 bg-white flex-shrink-0">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-brand" />
                <span className="text-sm font-semibold text-gray-800">AI Analysis</span>
                <span className="text-xs font-mono text-gray-400">#{activeTicketId}</span>
                {draftReady && (
                  <span className="flex items-center gap-1 text-[10px] font-semibold text-green-600 bg-green-50 border border-green-100 px-2 py-0.5 rounded-full">
                    <CheckCircle className="w-2.5 h-2.5" /> Ready
                  </span>
                )}
                {skill7Status === 'running' && (
                  <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full animate-pulse">
                    Generating…
                  </span>
                )}
              </div>
              <button
                onClick={() => setAiPopupOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              <WorkflowPanel ticketId={activeTicketId} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
