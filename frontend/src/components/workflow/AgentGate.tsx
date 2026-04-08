import { useState, useRef } from 'react';
import { CheckCircle, Copy, Send, AlertCircle, ExternalLink, RefreshCw, Sparkles, X, GitBranch } from 'lucide-react';
import { useTicketQueueStore } from '@/store/ticketQueueStore';
import { useAgentStore } from '@/store/agentStore';
import type { ToneStyle } from '@/store/agentStore';
import { useTicketQueue } from '@/hooks/useTicketQueue';
import DraftEditor from './DraftEditor';

const TONES: { key: ToneStyle; label: string; emoji: string }[] = [
  { key: 'friendly',     label: 'Friendly',     emoji: '😊' },
  { key: 'professional', label: 'Professional',  emoji: '👔' },
  { key: 'technical',    label: 'Technical',     emoji: '🔧' },
  { key: 'concise',      label: 'Concise',       emoji: '⚡' },
];

interface Props {
  ticketId?: string;
}

export default function AgentGate({ ticketId }: Props) {
  // Resolve which ticket to display
  const activeTicketId = useTicketQueueStore((s) => s.activeTicketId);
  const resolvedId = ticketId ?? activeTicketId ?? '';
  const ticket = useTicketQueueStore((s) => (resolvedId ? s.tickets[resolvedId] : undefined));
  const updateTicket = useTicketQueueStore((s) => s.updateTicket);

  const draft          = ticket?.draft          ?? '';
  const draftVariants  = ticket?.draftVariants  ?? [];
  const bundle         = ticket?.bundle         ?? null;
  const account        = ticket?.account        ?? null;
  const category       = ticket?.category       ?? '';
  const infoGatheringMode = ticket?.infoGatheringMode ?? false;
  const skillStatuses  = ticket?.skillStatuses  ?? {};
  const jira           = ticket?.jira           ?? null;
  const isRunning      = ticket?.status === 'running';
  const draftReady     = ticket?.draftReady ?? false;
  const skill7Running  = (ticket?.skillStatuses?.[7] ?? 'idle') === 'running';

  const { tone, setTone, customTone, setCustomTone } = useAgentStore();
  const { regenDraft } = useTicketQueue();

  const [copied, setCopied] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [showCustomTone, setShowCustomTone] = useState(false);
  const [localCustomTone, setLocalCustomTone] = useState(customTone);
  const customToneRef = useRef<HTMLTextAreaElement>(null);

  const setDraft = (d: string) => {
    if (resolvedId) updateTicket(resolvedId, { draft: d });
  };

  const handleCopy = () => {
    if (!draft) return;
    navigator.clipboard.writeText(draft);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const contextChips = [
    { label: 'Account', status: skillStatuses[2] },
    { label: 'Stripe',  status: skillStatuses[3] },
    { label: 'Site',    status: skillStatuses[4] },
  ].filter((c) => c.status === 'done');

  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Send className="w-4 h-4 text-brand" />
          <span className="text-sm font-semibold text-gray-700">Next Response</span>
          <span className="text-xs text-gray-400">— ready to forward to customer</span>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap justify-end">
          {category && (
            <span className="text-xs px-2.5 py-0.5 bg-brand/10 text-brand rounded-full font-medium">
              {category}
            </span>
          )}
          {contextChips.map((c) => (
            <span key={c.label} className="text-xs px-2 py-0.5 bg-green-50 text-green-600 border border-green-100 rounded-full">
              {c.label} ✓
            </span>
          ))}
        </div>
      </div>

      <div className="p-5 space-y-3">

        {/* ── Tone selector ───────────────────────────────────────────── */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-gray-400 font-medium flex-shrink-0">Tone:</span>
            {TONES.map((t) => (
              <button
                key={t.key}
                onClick={() => {
                  setTone(t.key);
                  if (customTone) { setCustomTone(''); setLocalCustomTone(''); }
                  if (draft && resolvedId) regenDraft(resolvedId, t.key, '');
                }}
                title={`Switch to ${t.label} tone and regenerate`}
                className={`flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg border transition-all ${
                  tone === t.key && !customTone
                    ? 'bg-brand text-white border-brand font-semibold'
                    : 'bg-white text-gray-500 border-gray-200 hover:border-brand/40 hover:text-brand'
                }`}
              >
                <span>{t.emoji}</span>
                {t.label}
              </button>
            ))}

            <button
              onClick={() => {
                setShowCustomTone(!showCustomTone);
                if (!showCustomTone) setTimeout(() => customToneRef.current?.focus(), 50);
              }}
              className={`flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg border transition-all ${
                customTone
                  ? 'bg-violet-600 text-white border-violet-600 font-semibold'
                  : 'bg-white text-gray-500 border-gray-200 hover:border-violet-400 hover:text-violet-600'
              }`}
            >
              <Sparkles className="w-3 h-3" />
              {customTone ? 'Custom ✓' : 'Custom'}
            </button>

            {draft && !isRunning && resolvedId && (
              <button
                onClick={() => regenDraft(resolvedId, tone, customTone)}
                className="flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg border border-gray-200 text-gray-500 hover:border-brand/40 hover:text-brand transition-all ml-auto"
              >
                <RefreshCw className="w-3 h-3" />
                Regenerate
              </button>
            )}
          </div>

          {(showCustomTone || customTone) && (
            <div className="relative">
              <textarea
                ref={customToneRef}
                value={localCustomTone}
                onChange={(e) => setLocalCustomTone(e.target.value)}
                onBlur={() => {
                  setCustomTone(localCustomTone);
                  if (draft && localCustomTone !== customTone && resolvedId) {
                    regenDraft(resolvedId, tone, localCustomTone);
                  }
                }}
                rows={2}
                placeholder='Describe your preferred tone, e.g. "Always empathise first, then explain the fix. End with an offer to follow up."'
                className="w-full px-3 py-2 pr-8 text-xs text-gray-700 border border-violet-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-violet-400 resize-none bg-violet-50/40 placeholder-gray-400"
              />
              {localCustomTone && (
                <button
                  onClick={() => {
                    setLocalCustomTone('');
                    setCustomTone('');
                    setShowCustomTone(false);
                    if (draft && resolvedId) regenDraft(resolvedId, tone, '');
                  }}
                  className="absolute top-2 right-2 text-gray-300 hover:text-gray-500"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <p className="text-[11px] text-violet-400 mt-1">
                Custom prompt overrides the preset tone. Saved on blur · regenerates draft automatically.
              </p>
            </div>
          )}
        </div>

        {/* ── Ambiguous query — interpretation picker ─────────────────── */}
        {draftVariants.length > 1 && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 space-y-2">
            <div className="flex items-center gap-2">
              <GitBranch className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
              <span className="text-xs font-semibold text-amber-700">Ambiguous query — pick the best interpretation</span>
            </div>
            <div className="flex flex-col gap-2">
              {draftVariants.map((v, i) => (
                <button
                  key={`${v.label}-${i}`}
                  onClick={() => {
                    setSelectedVariant(i);
                    setDraft(v.draft);
                  }}
                  className={`flex items-start gap-2.5 px-3 py-2.5 rounded-lg border text-left transition-all ${
                    selectedVariant === i
                      ? 'border-amber-400 bg-white shadow-sm'
                      : 'border-amber-100 bg-amber-50/60 hover:border-amber-300 hover:bg-white'
                  }`}
                >
                  <span className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    selectedVariant === i ? 'bg-amber-500 text-white' : 'bg-amber-200 text-amber-700'
                  }`}>
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span className={`text-xs font-medium leading-relaxed ${
                    selectedVariant === i ? 'text-amber-900' : 'text-amber-700'
                  }`}>
                    {v.label}
                  </span>
                </button>
              ))}
            </div>
            <p className="text-[11px] text-amber-500 pl-1">
              Selecting an interpretation loads its draft below. Edit as needed before sending.
            </p>
          </div>
        )}

        {/* ── Info-gathering notice ───────────────────────────────────── */}
        {infoGatheringMode && (
          <div className="flex items-start gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2.5">
            <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
            <span>
              Account not found for <strong>{(bundle as { requester?: { email?: string } } | null)?.requester?.email}</strong> — draft asks for registered email &amp; domain.
              Re-run the workflow once the customer replies.
            </span>
          </div>
        )}

        {/* ── Draft ───────────────────────────────────────────────────── */}
        {(isRunning && !draft) || (skill7Running && !draftReady) ? (
          // Loading skeleton while AI streams (also covers regen flow)
          <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
            <div className="flex items-center px-4 py-2.5 border-b border-gray-100">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Draft Response</span>
            </div>
            <div className="p-4 space-y-2 animate-pulse">
              <div className="h-3 bg-gray-100 rounded-full w-full" />
              <div className="h-3 bg-gray-100 rounded-full w-5/6" />
              <div className="h-3 bg-gray-100 rounded-full w-4/5" />
              <div className="h-3 bg-gray-100 rounded-full w-full" />
              <div className="h-3 bg-gray-100 rounded-full w-3/4" />
              <div className="flex items-center gap-1.5 mt-3">
                <Sparkles className="w-3 h-3 text-brand animate-pulse" />
                <span className="text-xs text-gray-400 animate-pulse">Drafting your response…</span>
              </div>
            </div>
          </div>
        ) : !draftReady && !isRunning && !skill7Running ? (
          // Safety net: done but draft empty (parse failure or not yet run)
          <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
            <div className="flex items-center px-4 py-2.5 border-b border-gray-100">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Draft Response</span>
            </div>
            <div className="p-4 text-xs text-gray-400 text-center py-6">
              {bundle
                ? 'Draft unavailable — try regenerating.'
                : 'Run the workflow to generate a draft.'}
            </div>
          </div>
        ) : (
          <DraftEditor draft={draft} onChange={setDraft} />
        )}

        {/* ── Copy action ─────────────────────────────────────────────── */}
        <div className="flex items-center gap-3 pt-1 flex-wrap">
          <button
            onClick={handleCopy}
            disabled={!draft}
            className="flex items-center gap-2 px-5 py-2 bg-brand text-white text-sm font-semibold rounded-lg hover:bg-brand-dark disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            {copied
              ? <><CheckCircle className="w-4 h-4" /> Copied!</>
              : <><Copy className="w-4 h-4" /> Copy &amp; Forward</>}
          </button>
          <p className="text-xs text-gray-400">Use Raise Bug / Escalate Slack buttons in the pipeline bar above.</p>
        </div>

        {/* ── Jira success banner ──────────────────────────────────────── */}
        {jira && (
          <div className="flex items-center justify-between px-4 py-3 bg-green-50 border border-green-100 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
              <div>
                <span className="text-sm font-semibold text-green-700">Jira — </span>
                <span className="text-sm text-green-700 font-mono">{jira.key}</span>
                <p className="text-xs text-green-600 mt-0.5 truncate max-w-xs">
                  {jira.summary || `Banner issue on ${(account as { domain?: string } | null)?.domain}`}
                </p>
              </div>
            </div>
            <a
              href={jira.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 transition-colors flex-shrink-0"
            >
              <ExternalLink className="w-3 h-3" />
              Open in Jira
            </a>
          </div>
        )}

        {/* ── Escalation hint ──────────────────────────────────────────── */}
        {bundle && !jira && (
          <p className="text-[11px] text-gray-300 text-center">
            Use <strong>Raise Bug</strong> or <strong>Escalate Slack</strong> in the pipeline bar ↑ to escalate this ticket.
          </p>
        )}

      </div>
    </div>
  );
}
