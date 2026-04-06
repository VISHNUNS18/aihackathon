import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import type { RefundEligibility } from '@/types/stripe';

interface Props { eligibility: RefundEligibility }

export default function RefundChecker({ eligibility }: Props) {
  const verdictColor = eligibility.verdictType === 'ok'
    ? 'text-green-700 bg-green-50 border-green-200'
    : eligibility.verdictType === 'warn'
    ? 'text-amber-700 bg-amber-50 border-amber-200'
    : 'text-red-700 bg-red-50 border-red-200';

  return (
    <div className="space-y-3">
      <div className={`px-4 py-3 rounded-lg border font-semibold text-sm ${verdictColor}`}>
        {eligibility.verdictType === 'ok' ? '✅' : '❌'} {eligibility.verdict}
      </div>
      <div className="space-y-2">
        {eligibility.checks.map((check, i) => (
          <div key={i} className="flex items-start gap-3 text-sm">
            {check.pass === true
              ? <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
              : check.pass === false
              ? <XCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              : <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />}
            <div>
              <span className="font-medium text-gray-700">{check.label}</span>
              <span className="text-gray-400 ml-2">{check.detail}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
