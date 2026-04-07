import { ChevronDown, ChevronUp, BookOpen, Globe, Mail, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import { useWorkflowStore } from '@/store/workflowStore';
import OutputRenderer from './OutputRenderer';
import AgentGate from './AgentGate';
import TechStackPanel from './TechStackPanel';
import GCMStatusPanel from './GCMStatusPanel';
import Spinner from '@/components/shared/Spinner';
import type { SiteDebugReport } from '@/types/debug';

export default function WorkflowPanel() {
  const { streamOutput, isRunning, error, docResults, debug, bundle, account } = useWorkflowStore();
  const debugReport = debug as SiteDebugReport | null;
  const [outputExpanded, setOutputExpanded] = useState(false);

  const websiteUrl = debugReport?.final_url || (account?.domain ? `https://${account.domain}` : null);
  const email = (bundle as { requester?: { email?: string } } | null)?.requester?.email
    ?? (account as { billing_email?: string } | null)?.billing_email
    ?? null;

  return (
    <div className="space-y-3">

      {/* ── Website + email context bar ──────────────────────────── */}
      {(websiteUrl || email) && (
        <div className="flex items-center gap-3 px-3 py-2 bg-white border border-gray-100 rounded-xl text-xs text-gray-500 flex-wrap">
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

      {/* ── Error ──────────────────────────────────────────────────── */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-700 text-sm">
          <strong className="font-semibold">Error:</strong> {error}
        </div>
      )}

      {/* ── Docs matched ──────────────────────────────────────────── */}
      {docResults.length > 0 && (
        <div className="bg-cyan-50 border border-cyan-100 rounded-xl px-4 py-3">
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

      {/* ── AI stream output ──────────────────────────────────────── */}
      {(streamOutput || isRunning) && (
        <div className="bg-gray-950 rounded-xl overflow-hidden border border-gray-800 shadow-sm">
          <div
            className="flex items-center justify-between px-4 py-2.5 bg-gray-900 cursor-pointer select-none"
            onClick={() => setOutputExpanded((v) => !v)}
          >
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500 opacity-80" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500 opacity-80" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500 opacity-80" />
              </div>
              <span className="text-xs font-mono text-gray-400 ml-1">AI Analysis</span>
            </div>
            <div className="flex items-center gap-3">
              {isRunning && (
                <div className="flex items-center gap-1.5 text-xs text-emerald-400">
                  <Spinner className="border-emerald-400 border-t-transparent w-3 h-3" />
                  <span>Processing…</span>
                </div>
              )}
              {outputExpanded
                ? <ChevronUp className="w-3.5 h-3.5 text-gray-500" />
                : <ChevronDown className="w-3.5 h-3.5 text-gray-500" />}
            </div>
          </div>

          {outputExpanded && (
            <div className="p-4 max-h-96 overflow-y-auto">
              <OutputRenderer text={streamOutput} />
              {isRunning && (
                <span className="inline-block w-2 h-4 bg-emerald-400 ml-0.5 animate-pulse align-text-bottom" />
              )}
            </div>
          )}
        </div>
      )}

      {/* ── GCM status ───────────────────────────────────────────── */}
      {debugReport && debugReport.gcm_status && (
        <GCMStatusPanel debug={debugReport} />
      )}

      {/* ── Tech stack (Wappalyzer) ───────────────────────────────── */}
      {debugReport && debugReport.technologies_detected?.length > 0 && (
        <TechStackPanel debug={debugReport} />
      )}

      {/* ── Next Response ─────────────────────────────────────────── */}
      <AgentGate />
    </div>
  );
}
