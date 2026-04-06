import type { RefundEligibility, RefundCheck, Charge, Subscription } from '@/types/stripe';

export function computeRefundEligibility(
  charges: Charge[],
  subscriptions: Subscription[],
  _invoices: unknown[],
  isAppSumo: boolean
): RefundEligibility {
  const checks: RefundCheck[] = [];
  const lastCharge = charges.find((c) => c.status === 'succeeded');
  const daysSince = lastCharge
    ? Math.floor((Date.now() / 1000 - lastCharge.created) / 86400)
    : 999;
  const sub = subscriptions[0];
  const isAnnual = sub?.items[0]?.price?.recurring?.interval === 'year';
  const isDuplicate = charges.filter((c) => c.status === 'succeeded').length > 1 &&
    charges.slice(0, 2).every((c) =>
      Math.abs(c.created - charges[0].created) < 3600
    );

  checks.push({
    pass: !isAppSumo,
    label: 'Not an AppSumo deal',
    detail: isAppSumo ? 'AppSumo deals are non-refundable. Redirect to support@appsumo.com' : 'Not an AppSumo account',
  });

  checks.push({
    pass: isDuplicate ? true : isAnnual ? daysSince <= 14 : daysSince <= 30,
    label: isAnnual ? 'Within 14-day annual refund window' : 'Within 30-day monthly refund window',
    detail: `${daysSince} days since last charge`,
  });

  checks.push({
    pass: !lastCharge?.refunded,
    label: 'Not already refunded',
    detail: lastCharge?.refunded ? 'A refund was already issued on this charge' : 'No prior refund',
  });

  if (isDuplicate) {
    checks.push({ pass: true, label: 'Duplicate charge detected', detail: 'Always eligible for refund' });
  }

  const allPassed = checks.every((c) => c.pass !== false);
  const appsumoFail = checks.find((c) => c.label.includes('AppSumo') && !c.pass);

  return {
    eligible: allPassed,
    reason: appsumoFail ? 'AppSumo deal — non-refundable' : allPassed ? 'All conditions met' : 'Outside refund window or already refunded',
    daysSinceCharge: daysSince,
    checks,
    verdict: appsumoFail
      ? 'REDIRECT TO APPSUMO'
      : allPassed
      ? 'ELIGIBLE FOR REFUND'
      : 'NOT ELIGIBLE',
    verdictType: appsumoFail ? 'no' : allPassed ? 'ok' : 'no',
  };
}
