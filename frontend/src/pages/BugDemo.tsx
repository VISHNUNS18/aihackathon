import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Bug, CheckCircle2, Loader2, ExternalLink, AlertTriangle,
  Wrench, Sparkles, ArrowLeft, Tag,
} from 'lucide-react';
import api from '@/lib/api';

// ── Live widget — toggled between buggy and fixed modes ───────────────────────
function ConsentStatsWidget({ fixed }: { fixed: boolean }) {
  const [accepted, setAccepted] = useState(0);
  const [rejected, setRejected] = useState(0);

  const handleAccept = () => setAccepted(c => fixed ? c + 1 : c - 1);
  const handleReject = () => setRejected(c => fixed ? c + 1 : c - 1);

  const total = accepted + rejected;
  const acceptRate = fixed
    ? (total > 0 ? Math.round((accepted / total) * 100) : 0)
    : Math.round((accepted / total) * 100);
  const bad = accepted < 0 || rejected < 0 || isNaN(acceptRate);

  return (
    <div className={`rounded-xl border-2 p-4 transition-all duration-500 ${
      fixed ? 'border-green-200 bg-white' : 'border-red-200 bg-white'
    }`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-gray-700">ConsentStatsWidget — Live</span>
        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
          fixed ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-600'
        }`}>
          {fixed ? '✓ Fixed' : '⚠ Buggy'}
        </span>
      </div>

      <div className="flex gap-2 mb-3">
        <button onClick={handleAccept}
          className="flex-1 py-2 rounded-lg bg-green-50 border border-green-200 text-green-700 text-xs font-medium hover:bg-green-100 transition-colors">
          ✓ Accept All
        </button>
        <button onClick={handleReject}
          className="flex-1 py-2 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-medium hover:bg-red-100 transition-colors">
          ✗ Reject All
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-2">
        {[
          { label: 'Accepted', val: accepted, bad: accepted < 0 },
          { label: 'Rejected', val: rejected, bad: rejected < 0 },
          { label: 'Rate',     val: isNaN(acceptRate) ? 'NaN%' : `${acceptRate}%`, bad: isNaN(acceptRate) },
        ].map(({ label, val, bad: b }) => (
          <div key={label} className="bg-gray-50 rounded-lg p-2.5 text-center">
            <div className={`text-xl font-bold ${b ? 'text-red-500' : 'text-gray-700'}`}>{val}</div>
            <div className="text-[11px] text-gray-400">{label}</div>
          </div>
        ))}
      </div>

      {!fixed && bad && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-lg p-2 text-xs text-red-600">
          <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" />
          <span>Counters decrement instead of increment — NaN% on initial load.</span>
        </div>
      )}
    </div>
  );
}

// ── Types ─────────────────────────────────────────────────────────────────────
interface JiraTicket {
  key: string;
  url: string;
  summary: string;
  description: string;
  status: string;
  priority: string;
  created: string;
  labels: string[];
  fixComment: string | null;
}

interface FixResult {
  rootCause: string;
  fixedCode: string;
  explanation: string;
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function BugDemo() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const jiraKey = searchParams.get('jira') ?? '';

  const [ticket,   setTicket]   = useState<JiraTicket | null>(null);
  const [fix,      setFix]      = useState<FixResult | null>(null);
  const [loading,  setLoading]  = useState(false);
  const [applying, setApplying] = useState(false);
  const [fixed,    setFixed]    = useState(false);
  const [error,    setError]    = useState('');

  // Auto-load ticket + fix as soon as we have the jira key
  useEffect(() => {
    if (!jiraKey) return;
    setLoading(true);
    setError('');

    Promise.all([
      api.get(`/api/jira/ticket/${jiraKey}`),
      api.post('/api/jira/apply-fix', { jiraKey }),
    ])
      .then(([ticketRes, fixRes]) => {
        setTicket(ticketRes.data);
        setFix(fixRes.data);
      })
      .catch(err => setError(err instanceof Error ? err.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, [jiraKey]);

  const handleApplyFix = async () => {
    setApplying(true);
    await new Promise(r => setTimeout(r, 600)); // brief pause for visual effect
    setFixed(true);
    setApplying(false);
  };

  // ── No jira key: prompt user ───────────────────────────────────────────────
  if (!jiraKey) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-sm px-6">
          <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center mx-auto mb-4">
            <Bug className="w-6 h-6 text-red-600" />
          </div>
          <h2 className="text-base font-semibold text-gray-800 mb-2">Bug Fix Demo</h2>
          <p className="text-sm text-gray-500 mb-4">
            Load ticket <span className="font-mono font-bold text-gray-700">#99999</span> in Ticket Desk, run the workflow, then click <strong>Raise Bug</strong> to create a Jira ticket. The "View Bug Fix Demo" button will bring you here automatically.
          </p>
          <button
            onClick={() => navigate('/desk/99999')}
            className="flex items-center gap-2 px-4 py-2 bg-brand text-white text-sm font-medium rounded-lg mx-auto transition-colors hover:opacity-90"
            style={{ backgroundColor: '#6366f1' }}
          >
            Open Ticket #99999
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-gray-50 p-5">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <button
          onClick={() => navigate(-1)}
          className="p-1.5 rounded-lg text-gray-400 hover:bg-white hover:text-gray-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-red-100 flex items-center justify-center">
            <Bug className="w-3.5 h-3.5 text-red-600" />
          </div>
          <h1 className="text-base font-semibold text-gray-800">Bug Fix Demo</h1>
          {jiraKey && (
            <span className="text-xs font-mono px-2 py-0.5 bg-gray-100 border border-gray-200 text-gray-600 rounded-full">
              {jiraKey}
            </span>
          )}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center gap-2 text-sm text-gray-500 py-8 justify-center">
          <Loader2 className="w-4 h-4 animate-spin" />
          Pulling Jira ticket {jiraKey}…
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600 mb-4">
          <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
          {error}
        </div>
      )}

      {!loading && ticket && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 max-w-6xl">

          {/* ── LEFT — Jira ticket card + live widget ── */}
          <div className="space-y-4">

            {/* Jira ticket card */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-gray-700">{ticket.key}</span>
                  <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${
                    ticket.status.toLowerCase() === 'done' || ticket.status.toLowerCase() === 'resolved'
                      ? 'bg-green-50 border-green-200 text-green-700'
                      : 'bg-blue-50 border-blue-200 text-blue-700'
                  }`}>{ticket.status}</span>
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-full border bg-orange-50 border-orange-200 text-orange-700">
                    {ticket.priority}
                  </span>
                </div>
                <a href={ticket.url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-blue-600 hover:underline font-medium">
                  Jira <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="p-4">
                <p className="text-sm font-semibold text-gray-800 mb-2">{ticket.summary}</p>
                {ticket.description && (
                  <p className="text-xs text-gray-500 leading-relaxed line-clamp-3">{ticket.description}</p>
                )}
                {ticket.labels.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {ticket.labels.map(l => (
                      <span key={l} className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded">
                        <Tag className="w-2.5 h-2.5" />{l}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Live widget */}
            <ConsentStatsWidget fixed={fixed} />

            {/* Apply fix button */}
            {!fixed && fix && (
              <button
                onClick={handleApplyFix}
                disabled={applying}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-60"
              >
                {applying
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Applying fix…</>
                  : <><Wrench className="w-4 h-4" /> Apply Fix from Jira</>
                }
              </button>
            )}

            {fixed && (
              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl text-xs text-green-700 font-medium">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                Fix applied — widget is now working correctly
              </div>
            )}
          </div>

          {/* ── RIGHT — Fix details ── */}
          <div className="space-y-4">
            {fix ? (
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 bg-purple-50 border-b border-purple-100">
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                  <span className="text-xs font-semibold text-purple-800">AI-Generated Fix — pulled from Jira</span>
                </div>
                <div className="p-4 space-y-4">
                  {fix.rootCause && (
                    <div>
                      <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Root Cause</div>
                      <p className="text-xs text-gray-700 leading-relaxed">{fix.rootCause}</p>
                    </div>
                  )}
                  {fix.fixedCode && (
                    <div>
                      <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Fixed Code</div>
                      <pre className={`rounded-lg p-3 text-xs font-mono overflow-x-auto leading-relaxed border transition-all duration-500 ${
                        fixed
                          ? 'bg-green-50 border-green-200 text-gray-800'
                          : 'bg-gray-50 border-gray-200 text-gray-700'
                      }`}>
                        <code>{fix.fixedCode}</code>
                      </pre>
                    </div>
                  )}
                  {fix.explanation && (
                    <div>
                      <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Changes Made</div>
                      <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-line">{fix.explanation}</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white border border-gray-100 rounded-xl p-8 flex items-center justify-center">
                <Loader2 className="w-5 h-5 text-gray-300 animate-spin" />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
