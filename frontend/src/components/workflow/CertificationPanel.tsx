import { useState } from 'react';
import {
  FileCheck, FileX, Download, ExternalLink, Shield,
  Slack, Mail, CheckCircle, AlertTriangle, Loader, Send, PenLine,
} from 'lucide-react';
import { useWorkflowStore } from '@/store/workflowStore';
import type { CertSearchResult, CertEscalationResult } from '@/types/certification';
import api from '@/lib/api';

const TYPE_LABELS: Record<string, string> = {
  tax_residency:      'Tax Residency Certificate',
  incorporation:      'Certificate of Incorporation',
  msme:               'MSME / Udyam Certificate',
  pan_card:           'Company PAN Card',
  iso_27001:          'ISO/IEC 27001 Certificate',
  soc1:               'SOC 1 Type I Report',
  soc2:               'SOC 2 Type II Report',
  dpa:                'Data Processing Agreement',
  financial_statement:'Financial Statement',
  vat_certificate:    'VAT Certificate',
  nda:                'Non-Disclosure Agreement',
  mod_rfi:            'Ministry of Defence RFI',
  other:              'Document',
};

function formatKb(kb: number): string {
  return kb >= 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb} KB`;
}

export default function CertificationPanel() {
  const { certResult, ticketId, bundle, account } = useWorkflowStore();
  const [escalating, setEscalating]           = useState(false);
  const [escalated, setEscalated]             = useState<CertEscalationResult | null>(null);
  const [notes, setNotes]                     = useState('');

  if (!certResult) return null;

  const result = certResult as CertSearchResult;
  const doc    = result.document;
  const label  = TYPE_LABELS[result.detected_type ?? 'other'] ?? 'Document';

  const handleEscalate = async () => {
    setEscalating(true);
    try {
      const { data } = await api.post('/api/certifications/escalate', {
        ticketId,
        requesterName:  bundle?.requester?.name  ?? '—',
        requesterEmail: bundle?.requester?.email ?? '—',
        accountDomain:  account?.domain ?? '—',
        docType:        result.detected_type,
        docQuery:       result.query,
        notes:          notes.trim() || undefined,
      });
      setEscalated(data as CertEscalationResult);
    } catch {
      // keep escalating=false so user can retry
    } finally {
      setEscalating(false);
    }
  };

  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">

      {/* Header */}
      <div className={`px-5 py-3 border-b flex items-center gap-2 ${
        result.found
          ? 'bg-green-50 border-green-100'
          : 'bg-amber-50 border-amber-100'
      }`}>
        {result.found
          ? <FileCheck className="w-4 h-4 text-green-600 flex-shrink-0" />
          : <FileX     className="w-4 h-4 text-amber-600 flex-shrink-0" />}
        <span className={`text-sm font-semibold ${result.found ? 'text-green-700' : 'text-amber-700'}`}>
          {result.found ? 'Document found' : 'Document not found — escalation required'}
        </span>
        <span className={`ml-auto text-xs px-2 py-0.5 rounded-full font-medium ${
          result.found ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
        }`}>
          {label}
        </span>
      </div>

      <div className="p-5 space-y-4">

        {/* ── FOUND ──────────────────────────────────────────────────── */}
        {result.found && doc && (
          <>
            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
              <div className="w-10 h-12 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-[10px] font-bold text-red-600 uppercase tracking-wide">PDF</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">{doc.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">{doc.issued_by}</p>
                <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                  {doc.country && (
                    <span className="text-[11px] text-gray-500">Country: <strong>{doc.country}</strong></span>
                  )}
                  {doc.year && (
                    <span className="text-[11px] text-gray-500">Year: <strong>{doc.year}</strong></span>
                  )}
                  {doc.expires_at && (
                    <span className="text-[11px] text-gray-500">Valid until: <strong>{doc.expires_at}</strong></span>
                  )}
                  {doc.size_kb && (
                    <span className="text-[11px] text-gray-400">{formatKb(doc.size_kb)}</span>
                  )}
                  <span className="text-[11px] font-mono text-gray-400">{doc.filename}</span>
                </div>
              </div>
            </div>

            {/* ── Trust Center (SOC 1 / SOC 2) ── */}
            {doc.trust_center_url ? (
              <>
                <div className="flex gap-2">
                  <a
                    href={doc.trust_center_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Shield className="w-4 h-4" />
                    Access Trust Center
                  </a>
                  <a
                    href={doc.trust_center_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-600 text-sm rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    trust.cookieyes.com
                  </a>
                </div>
                <p className="text-xs text-gray-400">
                  Share the <strong>Access Trust Center</strong> link with the customer. The report is available under NDA through the CookieYes Trust Center portal.
                </p>
              </>
            ) : doc.signing_required ? (
              /* ── NDA — signing required ── */
              <>
                <div className="flex gap-2">
                  <a
                    href={doc.drive_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white text-sm font-semibold rounded-lg hover:bg-violet-700 transition-colors"
                  >
                    <PenLine className="w-4 h-4" />
                    Share for Signing
                  </a>
                  <a
                    href={doc.drive_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-600 text-sm rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Preview
                  </a>
                </div>
                <p className="text-xs text-gray-400">
                  Send the <strong>Share for Signing</strong> link to the customer. They can review and sign directly in their browser — no account required.
                </p>
              </>
            ) : (
              /* ── Standard Drive download ── */
              <>
                <div className="flex gap-2">
                  <a
                    href={doc.drive_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Download from Drive
                  </a>
                  <a
                    href={doc.drive_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-600 text-sm rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Open in Drive
                  </a>
                </div>
                <p className="text-xs text-gray-400">
                  Share the <strong>Download from Drive</strong> link with the customer in your reply draft above. The link is view-only and requires no sign-in.
                </p>
              </>
            )}
          </>
        )}

        {/* ── NOT FOUND: escalation form ───────────────────────────── */}
        {!result.found && (
          <>
            <div className="flex items-start gap-2 px-3 py-2.5 bg-amber-50 border border-amber-100 rounded-lg">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700">
                <strong>{label}</strong> was not found in the shared Drive.
                Escalate to the Finance team — they will source and share the document directly.
              </p>
            </div>

            {escalated ? (
              /* ── Success state ── */
              <div className="space-y-3">
                <div className="p-4 bg-green-50 border border-green-100 rounded-xl space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span className="text-sm font-semibold text-green-700">Finance team notified</span>
                  </div>
                  <div className="space-y-1 pl-6">
                    {escalated.slack_posted && (
                      <div className="flex items-center gap-2 text-xs text-green-600">
                        <Slack className="w-3 h-3" />
                        Posted to <strong>{escalated.slack_channel}</strong>
                      </div>
                    )}
                    {escalated.email_sent && (
                      <div className="flex items-center gap-2 text-xs text-green-600">
                        <Mail className="w-3 h-3" />
                        Email sent to <strong>{escalated.email_to}</strong>
                      </div>
                    )}
                    <p className="text-xs text-green-500 mt-1">
                      Reference: <span className="font-mono font-bold">{escalated.reference_id}</span>
                    </p>
                  </div>
                </div>
                <p className="text-xs text-gray-400">
                  Update your draft reply to let the customer know we're working on it — mention the reference ID so they can follow up if needed.
                </p>
              </div>
            ) : (
              /* ── Escalation form ── */
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-purple-50 border border-purple-100 rounded-lg">
                    <div className="flex items-center gap-1.5 mb-1 text-purple-600 font-semibold">
                      <Slack className="w-3 h-3" /> Slack
                    </div>
                    <p className="text-purple-700 font-mono">#cy_certification_request</p>
                  </div>
                  <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg">
                    <div className="flex items-center gap-1.5 mb-1 text-blue-600 font-semibold">
                      <Mail className="w-3 h-3" /> Email
                    </div>
                    <p className="text-blue-700 font-mono">finance@cookieyes.com</p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Additional notes for Finance <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    placeholder={`e.g. "Customer needs this for vendor onboarding by ${new Date(Date.now() + 3 * 86400000).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}"`}
                    className="w-full px-3 py-2 text-xs text-gray-700 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-400 resize-none"
                  />
                </div>

                <button
                  onClick={handleEscalate}
                  disabled={escalating}
                  className="flex items-center gap-2 px-5 py-2 bg-amber-500 text-white text-sm font-semibold rounded-lg hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {escalating
                    ? <><Loader className="w-4 h-4 animate-spin" /> Escalating…</>
                    : <><Send className="w-4 h-4" /> Escalate to Finance</>}
                </button>
                <p className="text-[11px] text-gray-400">
                  This will post to <strong>#cy_certification_request</strong> on Slack and send an email to <strong>finance@cookieyes.com</strong> with all ticket details.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
