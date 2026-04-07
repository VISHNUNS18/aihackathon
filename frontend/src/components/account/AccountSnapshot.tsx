import { useState } from 'react';
import { Shield, Globe, ScanLine, Zap, TrendingUp, AlertTriangle, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import Badge from '@/components/shared/Badge';
import { formatDate } from '@/lib/utils';
import type { Account, ScanRecord } from '@/types/account';
import CookieListPanel from './CookieListPanel';

function formatFailedReason(reason: string): string {
  return reason
    .replace(/_/g, ' ')
    .replace(/\b(\d+)(\s+percentage)/i, '$1%')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

interface Props { account: Account }

export default function AccountSnapshot({ account }: Props) {
  const [expandedScan, setExpandedScan] = useState<number | null>(null);

  const planVariant = account.plan_status === 'active' ? 'green'
    : account.plan_status === 'past_due' ? 'red' : 'gray';

  const pageviewsPct = account.pageviews
    ? Math.min(100, Math.round((account.pageviews.views / account.pageviews.limit) * 100))
    : null;

  const pageviewsColor = pageviewsPct === null ? ''
    : pageviewsPct >= 90 ? 'bg-red-400'
    : pageviewsPct >= 70 ? 'bg-amber-400'
    : 'bg-green-400';

  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Account</span>
          {account.appsumo_deal && (
            <span className="text-[10px] px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full font-semibold">AppSumo</span>
          )}
        </div>
        <Badge variant={planVariant}>{account.plan_status.replace('_', ' ')}</Badge>
      </div>

      <div className="p-5 space-y-4">
        {/* Plan + billing */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="text-xs text-gray-400 mb-0.5">Plan</div>
            <div className="text-sm font-semibold text-gray-800">{account.plan}</div>
            <div className="text-xs text-gray-400">{account.billing_cycle}</div>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="text-xs text-gray-400 mb-0.5">Next Billing</div>
            <div className="text-sm font-semibold text-gray-800">{account.next_billing_date || '—'}</div>
            <div className="text-xs text-gray-400">{account.regulation || 'GDPR'}</div>
          </div>
        </div>

        {/* Domain + banner */}
        <div className="flex items-center justify-between py-2 border-t border-gray-50">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-gray-300" />
            <div>
              <div className="text-xs text-gray-400">Domain</div>
              <div className="text-sm font-medium text-brand">{account.domain}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-gray-300" />
            <div className="text-right">
              <div className="text-xs text-gray-400">Banner</div>
              <Badge variant={account.banner_active ? 'green' : 'red'}>
                {account.banner_active ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </div>
        </div>

        {/* Pageviews */}
        {pageviewsPct !== null && (
          <div className="border-t border-gray-50 pt-3">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-gray-300" />
                <span className="text-xs text-gray-400">Pageviews</span>
              </div>
              <span className={`text-xs font-semibold ${pageviewsPct >= 90 ? 'text-red-500' : pageviewsPct >= 70 ? 'text-amber-500' : 'text-gray-600'}`}>
                {account.pageviews!.views.toLocaleString()} / {account.pageviews!.limit.toLocaleString()}
              </span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${pageviewsColor}`}
                style={{ width: `${pageviewsPct}%` }}
              />
            </div>
          </div>
        )}

        {/* Scan history */}
        {account.scan_history && account.scan_history.length > 0 && (
          <div className="border-t border-gray-50 pt-3 space-y-2">
            <div className="flex items-center gap-1.5 mb-1">
              <ScanLine className="w-3.5 h-3.5 text-gray-300" />
              <span className="text-xs text-gray-400 font-medium">Scan History</span>
            </div>

            {/* Table header */}
            <div className="grid grid-cols-6 gap-1 px-2 text-[10px] text-gray-400 font-medium uppercase tracking-wide">
              <span className="col-span-2">Date</span>
              <span className="text-center">Status</span>
              <span className="text-center">URLs</span>
              <span className="text-center">Cookies</span>
              <span className="text-center">Scripts</span>
            </div>

            {account.scan_history.slice(0, 3).map((scan: ScanRecord, i: number) => {
              const isFailed = scan.scan_status === 'failed';
              const hasUrls = (scan.scanned_urls?.length ?? 0) > 0;
              const isExpanded = expandedScan === i;

              return (
                <div key={i} className={`rounded-lg overflow-hidden border ${isFailed ? 'border-red-100 bg-red-50/40' : 'border-gray-100 bg-gray-50/60'}`}>
                  {/* Main row */}
                  <div className="grid grid-cols-6 gap-1 px-2 py-2 items-center">
                    <span className="col-span-2 text-[11px] text-gray-600 font-mono leading-tight">
                      {formatDate(scan.scan_date)}
                    </span>
                    <span className="text-center">
                      {isFailed
                        ? <span className="inline-block text-[10px] px-1.5 py-0.5 bg-red-100 text-red-600 rounded font-semibold">failed</span>
                        : <span className="inline-block text-[10px] px-1.5 py-0.5 bg-green-100 text-green-600 rounded font-semibold">done</span>
                      }
                    </span>
                    {/* URLs — clickable if we have the list */}
                    <span className="text-center">
                      {hasUrls ? (
                        <button
                          onClick={() => setExpandedScan(isExpanded ? null : i)}
                          className="inline-flex items-center gap-0.5 text-[11px] font-medium text-brand hover:underline"
                          title="View scanned URLs"
                        >
                          {scan.urls_scanned}
                          {isExpanded
                            ? <ChevronUp className="w-2.5 h-2.5" />
                            : <ChevronDown className="w-2.5 h-2.5" />}
                        </button>
                      ) : (
                        <span className={`text-[11px] font-medium ${isFailed ? 'text-red-400' : 'text-gray-600'}`}>
                          {scan.urls_scanned}
                        </span>
                      )}
                    </span>
                    <span className={`text-center text-[11px] font-medium ${isFailed ? 'text-red-400' : 'text-gray-600'}`}>{scan.cookies}</span>
                    <span className={`text-center text-[11px] font-medium ${isFailed ? 'text-red-400' : 'text-gray-600'}`}>{scan.scripts}</span>
                  </div>

                  {/* Failed reason */}
                  {isFailed && scan.failed_reason && (
                    <div className="flex items-center gap-1.5 px-2 pb-2">
                      <AlertTriangle className="w-3 h-3 text-red-400 flex-shrink-0" />
                      <span className="text-[11px] text-red-500">{formatFailedReason(scan.failed_reason)}</span>
                    </div>
                  )}

                  {/* Scanned URLs expanded list */}
                  {isExpanded && hasUrls && (
                    <div className="border-t border-gray-100 px-2 py-2 space-y-1 bg-white">
                      <p className="text-[10px] text-gray-400 uppercase tracking-wide font-medium mb-1.5">Scanned URLs</p>
                      {scan.scanned_urls!.map((url, j) => (
                        <a
                          key={j}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-[11px] text-brand hover:underline truncate"
                        >
                          <ExternalLink className="w-2.5 h-2.5 flex-shrink-0 opacity-60" />
                          <span className="truncate">{url}</span>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Cookie list */}
        {account.cookie_list && account.cookie_list.length > 0 && (
          <CookieListPanel cookies={account.cookie_list} />
        )}

        {/* GCM + banner version footer */}
        <div className="flex items-center justify-between border-t border-gray-50 pt-2.5">
          <div className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-gray-300" />
            <span className="text-xs text-gray-400">GCM v2</span>
            <Badge variant={account.gcm_enabled ? 'green' : 'gray'}>
              {account.gcm_enabled ? 'On' : 'Off'}
            </Badge>
          </div>
          <span className="text-xs text-gray-400">v{account.banner_version}</span>
        </div>
      </div>

      {account.appsumo_deal && (
        <div className="mx-5 mb-4 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700 font-medium">
          AppSumo deal — refunds not available. Redirect to support@appsumo.com
        </div>
      )}
    </div>
  );
}
