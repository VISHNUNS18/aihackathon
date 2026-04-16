import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bug, CheckCircle, ExternalLink, AlertCircle, ChevronDown, Loader2, Sparkles, ArrowRight } from 'lucide-react';
import Modal from '@/components/shared/Modal';
import { useTicketQueueStore } from '@/store/ticketQueueStore';
import { useJira } from '@/hooks/useJira';
import type { SiteDebugReport } from '@/types/debug';
import api from '@/lib/api';

const DEMO_BUG_TICKET = '99999';

interface AutoFixResult {
  rootCause: string;
  fixedCode: string;
  explanation: string;
  jiraUrl: string;
}

interface JiraModalProps {
  open: boolean;
  onClose: () => void;
}

const ISSUE_TYPES = ['Bug', 'Task', 'Story', 'Improvement', 'Epic'];
const PRIORITIES  = ['urgent', 'high', 'normal', 'low'];

const PRIORITY_COLORS: Record<string, string> = {
  urgent: 'text-red-600 bg-red-50 border-red-200',
  high:   'text-orange-600 bg-orange-50 border-orange-200',
  normal: 'text-blue-600 bg-blue-50 border-blue-200',
  low:    'text-gray-500 bg-gray-50 border-gray-200',
};

const PRIORITY_DOT: Record<string, string> = {
  urgent: 'bg-red-500',
  high:   'bg-orange-400',
  normal: 'bg-blue-400',
  low:    'bg-gray-300',
};

function SelectField({
  label, value, options, onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">{label}</span>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none pl-3 pr-7 py-1.5 text-xs font-medium border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand cursor-pointer"
        >
          {options.map((o) => (
            <option key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</option>
          ))}
        </select>
        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
      </div>
    </div>
  );
}

export default function JiraModal({ open, onClose }: JiraModalProps) {
  const navigate = useNavigate();
  const activeTicketId = useTicketQueueStore((s) => s.activeTicketId);
  const activeTicket   = useTicketQueueStore((s) => activeTicketId ? s.tickets[activeTicketId] : undefined);
  const ticketId  = activeTicket?.ticketId  ?? '';
  const account   = activeTicket?.account   ?? null;
  const debugRaw  = activeTicket?.debug     ?? null;
  const category  = activeTicket?.category  ?? '';
  const bundle    = activeTicket?.bundle    ?? null;
  const jira      = activeTicket?.jira      ?? null;
  const debug = debugRaw as SiteDebugReport | null;
  const { raiseIssue, loading, error } = useJira();
  const [autoFix, setAutoFix]   = useState<AutoFixResult | null>(null);
  const [fixing, setFixing]     = useState(false);
  const [fixError, setFixError] = useState<string | null>(null);
  const isDemoBug = String(ticketId) === DEMO_BUG_TICKET;

  const ticketPriority = bundle?.ticket?.priority ?? 'normal';

  const defaultSummary = account?.domain
    ? `[Bug] Banner issue on ${account.domain} — Zendesk #${ticketId}`
    : `[Bug] CookieYes issue — Zendesk #${ticketId}`;

  const defaultDescription = [
    `**Zendesk Ticket:** #${ticketId}`,
    `**Customer:** ${bundle?.requester?.name ?? '—'} (${bundle?.requester?.email ?? '—'})`,
    `**Domain:** ${account?.domain ?? '—'}`,
    `**Category:** ${category || 'Uncategorised'}`,
    `**Plan:** ${account?.plan ?? '—'}`,
    '',
    '**Debug Summary:**',
    debug
      ? `- Script installed: ${debug.script_installed ? 'Yes' : 'No'}\n- Banner detected: ${debug.banner_detected ? 'Yes' : 'No'}\n- Verdict: ${debug.verdict}\n- Console errors: ${debug.console_errors?.join(', ') || 'None'}\n- Conflicts: ${debug.detected_conflict_count ?? 0}`
      : 'No site debug data available.',
    '',
    '**Steps reported by customer:**',
    bundle?.ticket?.description?.slice(0, 400) ?? '(see Zendesk ticket)',
  ].join('\n');

  const [summary,     setSummary]     = useState(defaultSummary);
  const [description, setDescription] = useState(defaultDescription);
  const [project,     setProject]     = useState('CY');
  const [issueType,   setIssueType]   = useState('Bug');
  const [priority,    setPriority]    = useState<string>(ticketPriority);

  useEffect(() => {
    if (open) {
      setSummary(defaultSummary);
      setDescription(defaultDescription);
      setProject('CY');
      setIssueType(isDemoBug ? 'Bug' : 'Bug');
      setPriority(ticketPriority);
      setAutoFix(null);
      setFixError(null);
    }
  }, [open, ticketId]);

  const handleCreate = async () => {
    if (!summary.trim()) return;
    const issue = await raiseIssue({
      ticketId,
      domain: account?.domain ?? '',
      summary: `[${issueType}] ${summary.trim().replace(/^\[.*?\]\s*/, '')}`,
      description: [
        `**Project:** ${project}`,
        `**Type:** ${issueType}`,
        `**Priority:** ${priority}`,
        '',
        description.trim(),
      ].join('\n'),
    });

    // For the demo bug ticket, automatically trigger AI fix via Jira MCP
    if (issue?.key && isDemoBug) {
      setFixing(true);
      try {
        const { data } = await api.post('/api/jira/apply-fix', { jiraKey: issue.key });
        setAutoFix(data);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Fix generation failed';
        setFixError(msg);
      } finally {
        setFixing(false);
      }
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Raise Jira Issue"
      subtitle={`${project} · Linked to Zendesk #${ticketId}${account?.domain ? ` · ${account.domain}` : ''}`}
    >
      <div className="p-6 space-y-4">

        {/* ── Success state ─────────────────────────────────────────── */}
        {jira ? (
          <div className="space-y-4">
            {/* Ticket created */}
            <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-green-700">Jira ticket created successfully</p>
                <p className="text-xs text-green-600 font-mono mt-0.5">{jira.key}</p>
                <p className="text-xs text-green-600 mt-1 line-clamp-2">{jira.summary}</p>
              </div>
            </div>

            {/* Auto-fix status — demo bug only */}
            {isDemoBug && (
              <div className={`flex items-start gap-3 p-4 rounded-xl border ${
                fixing    ? 'bg-blue-50 border-blue-200' :
                autoFix   ? 'bg-purple-50 border-purple-200' :
                fixError  ? 'bg-red-50 border-red-200' :
                            'bg-gray-50 border-gray-200'
              }`}>
                {fixing ? (
                  <Loader2 className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5 animate-spin" />
                ) : autoFix ? (
                  <Sparkles className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                ) : fixError ? (
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                ) : (
                  <Sparkles className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                )}
                <div className="min-w-0 flex-1">
                  {fixing && (
                    <p className="text-sm font-semibold text-blue-700">AI generating fix…</p>
                  )}
                  {!fixing && autoFix && (
                    <>
                      <p className="text-sm font-semibold text-purple-700">AI fix generated & posted to Jira</p>
                      {autoFix.rootCause && (
                        <p className="text-xs text-purple-600 mt-1 leading-relaxed">{autoFix.rootCause}</p>
                      )}
                      {autoFix.fixedCode && (
                        <pre className="mt-2 bg-white border border-purple-100 rounded-lg p-2.5 text-xs font-mono text-gray-700 overflow-x-auto leading-relaxed max-h-48">
                          <code>{autoFix.fixedCode}</code>
                        </pre>
                      )}
                      {autoFix.explanation && (
                        <p className="text-xs text-purple-600 mt-2 leading-relaxed whitespace-pre-line">{autoFix.explanation}</p>
                      )}
                    </>
                  )}
                  {!fixing && !autoFix && fixError && (
                    <p className="text-xs text-red-600">{fixError}</p>
                  )}
                  {!fixing && !autoFix && !fixError && (
                    <p className="text-sm text-gray-500">Fix generation skipped</p>
                  )}
                </div>
              </div>
            )}

            <div className="flex gap-2 flex-wrap">
              <a
                href={jira.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-brand text-white text-sm font-medium rounded-lg hover:bg-brand-dark transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Open {jira.key} in Jira
              </a>
              {isDemoBug && autoFix && (
                <button
                  onClick={() => { onClose(); navigate(`/bug-demo?jira=${jira.key}`); }}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  <Bug className="w-4 h-4" />
                  View Bug Fix Demo
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-200 text-gray-600 text-sm rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* ── Metadata row — Project / Type / Priority ───────────── */}
            <div className="grid grid-cols-3 gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
              {/* Project key */}
              <div className="flex flex-col gap-1">
                <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Project</span>
                <input
                  value={project}
                  onChange={(e) => setProject(e.target.value.toUpperCase())}
                  maxLength={6}
                  className="px-3 py-1.5 text-xs font-mono font-bold border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand bg-white uppercase tracking-widest"
                />
              </div>

              {/* Issue type */}
              <SelectField
                label="Type"
                value={issueType}
                options={ISSUE_TYPES}
                onChange={setIssueType}
              />

              {/* Priority */}
              <SelectField
                label="Priority"
                value={priority}
                options={PRIORITIES}
                onChange={setPriority}
              />
            </div>

            {/* Priority badge preview */}
            <div className="flex items-center gap-2">
              <span className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border font-medium ${PRIORITY_COLORS[priority] ?? PRIORITY_COLORS.normal}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${PRIORITY_DOT[priority] ?? PRIORITY_DOT.normal}`} />
                {priority.charAt(0).toUpperCase() + priority.slice(1)} priority
              </span>
              <span className="text-xs px-2.5 py-1 rounded-full border border-gray-200 bg-gray-50 text-gray-500 font-medium">
                {issueType}
              </span>
              <span className="text-xs font-mono px-2.5 py-1 rounded-full border border-gray-200 bg-gray-50 text-gray-500 font-bold tracking-wider">
                {project}-????
              </span>
            </div>

            {/* ── Summary ────────────────────────────────────────────── */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Summary <span className="text-red-400">*</span>
              </label>
              <input
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Issue summary..."
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
              />
            </div>

            {/* ── Description ────────────────────────────────────────── */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={8}
                className="w-full px-3 py-2 text-xs text-gray-700 font-mono border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand resize-none leading-relaxed"
              />
              <p className="text-[11px] text-gray-400 mt-1">Markdown supported. Edit before creating.</p>
            </div>

            {/* ── Error ─────────────────────────────────────────────── */}
            {error && (
              <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                {error}
              </div>
            )}

            {/* ── Actions ───────────────────────────────────────────── */}
            <div className="flex gap-2 pt-1">
              <button
                onClick={handleCreate}
                disabled={loading || !summary.trim() || !project.trim()}
                className="flex items-center gap-2 px-5 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Bug className="w-4 h-4" />
                {loading ? 'Creating…' : `Create ${project} ${issueType}`}
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-200 text-gray-600 text-sm rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </>
        )}

      </div>
    </Modal>
  );
}
