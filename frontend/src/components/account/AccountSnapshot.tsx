import { Shield, Globe, ScanLine, Zap, TrendingUp } from 'lucide-react';
import Badge from '@/components/shared/Badge';
import { formatDate } from '@/lib/utils';
import type { Account } from '@/types/account';

interface Props { account: Account }

export default function AccountSnapshot({ account }: Props) {
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

        {/* Scan + GCM */}
        <div className="grid grid-cols-2 gap-3 border-t border-gray-50 pt-3">
          <div className="flex items-center gap-2">
            <ScanLine className="w-3.5 h-3.5 text-gray-300" />
            <div>
              <div className="text-xs text-gray-400">Last Scan</div>
              <div className="text-xs font-medium text-gray-600">{formatDate(account.scanner_last_run)}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-gray-300" />
            <div>
              <div className="text-xs text-gray-400">GCM v2</div>
              <Badge variant={account.gcm_enabled ? 'green' : 'gray'}>
                {account.gcm_enabled ? 'On' : 'Off'}
              </Badge>
            </div>
          </div>
        </div>

        {/* Cookies count */}
        {account.cookies_detected > 0 && (
          <div className="flex items-center justify-between text-xs text-gray-500 border-t border-gray-50 pt-2.5">
            <span>{account.cookies_detected} cookies detected</span>
            <span className="text-gray-400">v{account.banner_version}</span>
          </div>
        )}
      </div>

      {account.appsumo_deal && (
        <div className="mx-5 mb-4 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700 font-medium">
          AppSumo deal — refunds not available. Redirect to support@appsumo.com
        </div>
      )}
    </div>
  );
}
