import { useState } from 'react';
import { useWorkflowStore } from '@/store/workflowStore';
import { formatCurrency, formatDate } from '@/lib/utils';
import RefundChecker from './RefundChecker';
import Badge from '@/components/shared/Badge';

const TABS = ['Overview', 'Invoices', 'Charges', 'Refund Check'] as const;

export default function StripePanel() {
  const stripe = useWorkflowStore((s) => s.stripe);
  const [tab, setTab] = useState<(typeof TABS)[number]>('Overview');

  if (!stripe) {
    return (
      <div className="bg-white border border-dashed border-gray-200 rounded-xl p-10 text-center text-gray-400 text-sm">
        Stripe data loads automatically for billing tickets
      </div>
    );
  }

  const sub = stripe.subscriptions[0];
  const lastCharge = stripe.charges[0];

  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
      <div className="flex border-b border-gray-100">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-xs font-medium border-b-2 transition-all ${
              tab === t
                ? 'border-brand text-brand'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="p-5">
        {tab === 'Overview' && (
          <div className="grid grid-cols-2 gap-4">
            <div><div className="text-xs text-gray-400">Customer</div><div className="text-sm font-medium">{stripe.name}</div></div>
            <div><div className="text-xs text-gray-400">Email</div><div className="text-sm font-medium">{stripe.email}</div></div>
            {sub && <>
              <div><div className="text-xs text-gray-400">Plan</div><div className="text-sm font-medium">{sub.items[0]?.price?.product || 'N/A'}</div></div>
              <div><div className="text-xs text-gray-400">Amount</div><div className="text-sm font-semibold text-gray-800">{formatCurrency(sub.items[0]?.price?.unit_amount || 0, sub.items[0]?.price?.currency)}/{sub.items[0]?.price?.recurring?.interval}</div></div>
              <div><div className="text-xs text-gray-400">Status</div><Badge variant={sub.status === 'active' ? 'green' : 'red'}>{sub.status}</Badge></div>
              <div><div className="text-xs text-gray-400">Next Billing</div><div className="text-sm">{formatDate(sub.current_period_end)}</div></div>
            </>}
            {lastCharge && <>
              <div><div className="text-xs text-gray-400">Last Charge</div><div className="text-sm font-semibold">{formatCurrency(lastCharge.amount, lastCharge.currency)}</div></div>
              <div><div className="text-xs text-gray-400">Charge Date</div><div className="text-sm">{formatDate(lastCharge.created)}</div></div>
            </>}
          </div>
        )}

        {tab === 'Invoices' && (
          <table className="w-full text-xs">
            <thead><tr className="border-b border-gray-100">
              <th className="pb-2 text-left text-gray-400 font-medium">Date</th>
              <th className="pb-2 text-left text-gray-400 font-medium">Number</th>
              <th className="pb-2 text-right text-gray-400 font-medium">Amount</th>
              <th className="pb-2 text-left text-gray-400 font-medium pl-3">Status</th>
            </tr></thead>
            <tbody>
              {stripe.invoices.map((inv) => (
                <tr key={inv.id} className="border-b border-gray-50">
                  <td className="py-2">{formatDate(inv.created)}</td>
                  <td>{inv.number}</td>
                  <td className="text-right font-mono">{formatCurrency(inv.amount_paid, inv.currency)}</td>
                  <td className="pl-3"><Badge variant={inv.status === 'paid' ? 'green' : inv.status === 'open' ? 'yellow' : 'gray'}>{inv.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {tab === 'Charges' && (
          <table className="w-full text-xs">
            <thead><tr className="border-b border-gray-100">
              <th className="pb-2 text-left text-gray-400 font-medium">Date</th>
              <th className="pb-2 text-right text-gray-400 font-medium">Amount</th>
              <th className="pb-2 text-left text-gray-400 font-medium pl-3">Card</th>
              <th className="pb-2 text-left text-gray-400 font-medium pl-3">Status</th>
              <th className="pb-2 text-left text-gray-400 font-medium pl-3">Refunded</th>
            </tr></thead>
            <tbody>
              {stripe.charges.map((c) => (
                <tr key={c.id} className="border-b border-gray-50">
                  <td className="py-2">{formatDate(c.created)}</td>
                  <td className="text-right font-mono">{formatCurrency(c.amount, c.currency)}</td>
                  <td className="pl-3">{c.payment_method_details?.card ? `${c.payment_method_details.card.brand} ••••${c.payment_method_details.card.last4}` : '—'}</td>
                  <td className="pl-3"><Badge variant={c.status === 'succeeded' ? 'green' : 'red'}>{c.status}</Badge></td>
                  <td className="pl-3">{c.refunded ? <Badge variant="yellow">Refunded</Badge> : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {tab === 'Refund Check' && (
          <RefundChecker eligibility={stripe.refundEligibility} />
        )}
      </div>
    </div>
  );
}
