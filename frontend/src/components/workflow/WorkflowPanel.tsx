import { BookOpen, Globe, Mail, ExternalLink, Sparkles, FileText, ChevronDown, Clock, User } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useTicketQueueStore } from '@/store/ticketQueueStore';
import type { RelatedTicket } from '@/store/ticketQueueStore';
import OutputRenderer from './OutputRenderer';
import AgentGate from './AgentGate';
import TechStackPanel from './TechStackPanel';
import GCMStatusPanel from './GCMStatusPanel';
import CertificationPanel from './CertificationPanel';
import Spinner from '@/components/shared/Spinner';
import type { SiteDebugReport } from '@/types/debug';

type PanelTab = 'analysis' | 'related' | 'draft';

interface Props {
  ticketId?: string;
}

export default function WorkflowPanel({ ticketId }: Props) {
  const [activeTab, setActiveTab] = useState<PanelTab>('analysis');
  const [streamCollapsed, setStreamCollapsed] = useState(true);
  const streamRef = useRef<HTMLDivElement>(null);

  const activeTicketId = useTicketQueueStore((s) => s.activeTicketId);
  const resolvedId = ticketId ?? activeTicketId ?? '';
  const ticket = useTicketQueueStore((s) => (resolvedId ? s.tickets[resolvedId] : undefined));

  const streamOutput  = ticket?.streamOutput  ?? '';
  const isRunning     = ticket?.status === 'running';
  const error         = ticket?.error         ?? null;
  const docResults    = ticket?.docResults    ?? [];
  const debug         = ticket?.debug         ?? null;
  const bundle        = ticket?.bundle        ?? null;
  const account       = ticket?.account       ?? null;
  const isCertRequest = ticket?.isCertRequest ?? false;
  const draftReady    = ticket?.draftReady    ?? false;

  const relatedTickets: RelatedTicket[] = (ticket?.relatedTickets ?? []) as RelatedTicket[];
  const debugReport = debug as SiteDebugReport | null;

  const websiteUrl = debugReport?.final_url || (account?.domain ? `https://${account.domain}` : null);
  const email = (bundle as { requester?: { email?: string } } | null)?.requester?.email
    ?? (account as { billing_email?: string } | null)?.billing_email
    ?? null;

  // Auto-switch to Draft tab when draft becomes ready
  useEffect(() => {
    if (draftReady) {
      setActiveTab('draft');
    }
  }, [draftReady]);

  // Auto-expand stream while running, collapse again when done
  useEffect(() => {
    if (isRunning) setStreamCollapsed(false);
    else if (draftReady) setStreamCollapsed(true);
  }, [isRunning, draftReady]);

  // Auto-scroll stream to bottom while running
  useEffect(() => {
    if (isRunning && streamRef.current && !streamCollapsed) {
      streamRef.current.scrollTop = streamRef.current.scrollHeight;
    }
  }, [streamOutput, isRunning, streamCollapsed]);

  // Reset to analysis tab when a new ticket loads
  useEffect(() => {
    if (isRunning) setActiveTab('analysis');
  }, [resolvedId]);

  const skill7Running = (ticket?.skillStatuses?.[7] ?? 'idle') === 'running';
  const hasStream = Boolean(streamOutput || isRunning || skill7Running);

  return (
    <div className="flex flex-col h-full gap-0 overflow-hidden">

      {/* ── Context bar ───────────────────────────────────────────── */}
      {(websiteUrl || email) && (
        <div className="flex-shrink-0 flex items-center gap-3 px-3 py-2 bg-white border border-gray-100 rounded-xl text-xs text-gray-500 flex-wrap mb-3">
          {websiteUrl && (
            <a
              href={websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-brand hover:underline font-medium min-w-0"
            >
              <Globe className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">{websiteUrl.replace(/^https?:\/\//, '')}</span>
            </a>
          )}
          {websiteUrl && email && <span className="text-gray-200">|</span>}
          {email && (
            <span className="flex items-center gap-1.5 min-w-0">
              <Mail className="w-3.5 h-3.5 flex-shrink-0 text-gray-400" />
              <span className="truncate">{email}</span>
            </span>
          )}
        </div>
      )}

      {/* ── Error ─────────────────────────────────────────────────── */}
      {error && (
        <div className="flex-shrink-0 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-700 text-sm mb-3">
          <strong className="font-semibold">Error:</strong> {error}
        </div>
      )}

      {/* ── Tab bar ───────────────────────────────────────────────── */}
      <div className="flex-shrink-0 flex items-center gap-1 mb-3 bg-gray-100 rounded-xl p-1">
        {/* AI Analysis */}
        <button
          onClick={() => setActiveTab('analysis')}
          className={`flex-1 flex items-center justify-center gap-1 px-2 py-2 text-xs font-semibold rounded-lg transition-all ${
            activeTab === 'analysis'
              ? 'bg-white text-gray-800 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 flex-shrink-0" />
          <span>Analysis</span>
          {isRunning && (
            <Spinner className="border-emerald-500 border-t-transparent w-3 h-3 ml-0.5" />
          )}
          {!isRunning && draftReady && (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
          )}
        </button>

        {/* Related Tickets */}
        <button
          onClick={() => setActiveTab('related')}
          className={`flex-1 flex items-center justify-center gap-1 px-2 py-2 text-xs font-semibold rounded-lg transition-all ${
            activeTab === 'related'
              ? 'bg-white text-gray-800 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Clock className="w-3.5 h-3.5 flex-shrink-0" />
          <span>Related</span>
          {relatedTickets.length > 0 && (
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0 ${
              activeTab === 'related' ? 'bg-gray-100 text-gray-600' : 'bg-gray-200 text-gray-500'
            }`}>{relatedTickets.length}</span>
          )}
        </button>

        {/* Draft */}
        <button
          onClick={() => setActiveTab('draft')}
          className={`flex-1 flex items-center justify-center gap-1 px-2 py-2 text-xs font-semibold rounded-lg transition-all ${
            activeTab === 'draft'
              ? 'bg-white text-gray-800 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <FileText className="w-3.5 h-3.5 flex-shrink-0" />
          <span>Draft</span>
          {draftReady && (
            <span className="w-1.5 h-1.5 rounded-full bg-brand flex-shrink-0" />
          )}
        </button>
      </div>

      {/* ══════════════════════════════════════════════════════════
          AI ANALYSIS TAB
      ══════════════════════════════════════════════════════════ */}
      {activeTab === 'analysis' && (
        <div className="flex flex-col gap-3 flex-1 min-h-0">

          {/* Docs matched */}
          {docResults.length > 0 && (
            <div className="flex-shrink-0 bg-cyan-50 border border-cyan-100 rounded-xl px-4 py-3">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="w-3.5 h-3.5 text-cyan-600" />
                <span className="text-xs font-semibold text-cyan-700">Documentation matched</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {docResults.map((doc) =>
                  doc.url ? (
                    <a
                      key={doc.id}
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs px-2.5 py-1 bg-white border border-cyan-200 text-cyan-700 rounded-full hover:bg-cyan-50 hover:border-cyan-400 transition-colors"
                    >
                      {doc.title}
                      <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                    </a>
                  ) : (
                    <span key={doc.id} className="text-xs px-2.5 py-1 bg-white border border-cyan-200 text-cyan-700 rounded-full">
                      {doc.title}
                    </span>
                  )
                )}
              </div>
            </div>
          )}

          {/* Stream output */}
          {hasStream && (
            <div className={`flex flex-col bg-gray-950 rounded-xl overflow-hidden border border-gray-800 shadow-sm ${streamCollapsed ? 'flex-shrink-0' : 'flex-1 min-h-0'}`}>
              {/* Stream header */}
              <div
                className="flex-shrink-0 flex items-center justify-between px-4 py-2.5 bg-gray-900 cursor-pointer select-none"
                onClick={() => setStreamCollapsed((v) => !v)}
              >
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500 opacity-80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500 opacity-80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500 opacity-80" />
                  </div>
                  <span className="text-xs font-mono text-gray-400 ml-1">GPT-4o — AI Analysis Stream</span>
                </div>
                <div className="flex items-center gap-3">
                  {isRunning && (
                    <div className="flex items-center gap-1.5 text-xs text-emerald-400">
                      <Spinner className="border-emerald-400 border-t-transparent w-3 h-3" />
                      <span>Streaming…</span>
                    </div>
                  )}
                  {!isRunning && draftReady && (
                    <span className="text-xs text-emerald-400 font-medium">Done</span>
                  )}
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-gray-500 transition-transform ${streamCollapsed ? '' : 'rotate-180'}`}
                  />
                </div>
              </div>

              {/* Stream body */}
              {!streamCollapsed && (
                <div
                  ref={streamRef}
                  className="flex-1 min-h-0 p-4 overflow-y-auto"
                >
                  <OutputRenderer text={streamOutput} />
                  {isRunning && (
                    <span className="inline-block w-2 h-4 bg-emerald-400 ml-0.5 animate-pulse align-text-bottom" />
                  )}
                  {!streamOutput && isRunning && (
                    <span className="text-xs text-gray-500 animate-pulse">Waiting for GPT-4o…</span>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Empty state */}
          {!hasStream && !error && (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-10 text-gray-400">
              <Sparkles className="w-8 h-8 mb-3 opacity-30" />
              <p className="text-sm font-medium text-gray-500">No analysis yet</p>
              <p className="text-xs mt-1">Load a ticket to start the AI pipeline</p>
            </div>
          )}

          {/* GCM + Tech Stack below stream */}
          {debugReport?.gcm_status && (
            <div className="flex-shrink-0">
              <GCMStatusPanel debug={debugReport} />
            </div>
          )}
          {debugReport && debugReport.technologies_detected?.length > 0 && (
            <div className="flex-shrink-0">
              <TechStackPanel debug={debugReport} />
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          RELATED TICKETS TAB
      ══════════════════════════════════════════════════════════ */}
      {activeTab === 'related' && (
        <div className="flex-1 min-h-0 overflow-y-auto">
          {relatedTickets.length > 0 ? (
            <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-gray-50">
                <Clock className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-xs font-semibold text-gray-600">Related Tickets</span>
                <span className="ml-auto text-[10px] font-semibold px-2 py-0.5 bg-gray-200 text-gray-500 rounded-full">
                  {relatedTickets.length}
                </span>
              </div>
              <div className="divide-y divide-gray-50">
                {relatedTickets.map((rt) => (
                  <div key={rt.id} className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors">
                    <span className={`flex-shrink-0 mt-0.5 flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                      rt.match_reason === 'same_customer'
                        ? 'bg-purple-50 text-purple-600 border-purple-100'
                        : 'bg-blue-50 text-blue-600 border-blue-100'
                    }`}>
                      {rt.match_reason === 'same_customer'
                        ? <><User className="w-2.5 h-2.5" /> Same customer</>
                        : <><BookOpen className="w-2.5 h-2.5" /> Similar topic</>}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono text-gray-400">#{rt.id}</span>
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                          rt.status === 'open'   ? 'bg-green-50 text-green-600' :
                          rt.status === 'solved' ? 'bg-gray-100 text-gray-500' :
                                                   'bg-amber-50 text-amber-600'
                        }`}>{rt.status}</span>
                        {rt.requester_name && (
                          <span className="text-[10px] text-gray-400 truncate">{rt.requester_name}</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-700 font-medium mt-0.5">{rt.subject}</p>
                      {rt.tags.length > 0 && (
                        <div className="flex gap-1 mt-1.5 flex-wrap">
                          {rt.tags.slice(0, 5).map((tag) => (
                            <span key={tag} className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-400 rounded">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      <p className="text-[10px] text-gray-300 mt-1.5">
                        {new Date(rt.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-4 py-2.5 bg-gray-50 border-t border-gray-100">
                <p className="text-[10px] text-gray-400">
                  <span className="font-semibold">Used in draft:</span> same-customer history prevents re-asking for info already provided; similar-topic patterns inform the solution approach.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-16 text-gray-400">
              <Clock className="w-8 h-8 mb-3 opacity-30" />
              <p className="text-sm font-medium text-gray-500">No related tickets</p>
              <p className="text-xs mt-1">No prior tickets found for this customer or topic</p>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          DRAFT TAB
      ══════════════════════════════════════════════════════════ */}
      {activeTab === 'draft' && (
        <div className="flex-1 min-h-0 overflow-y-auto">
          <div className="flex flex-col gap-3 pb-4">
            {isCertRequest && <CertificationPanel />}
            <AgentGate ticketId={resolvedId} />
          </div>
        </div>
      )}

    </div>
  );
}
