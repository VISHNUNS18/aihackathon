import { useState } from 'react';
import { ChevronDown, ChevronUp, ShieldCheck, ShieldAlert, ShieldX, AlertTriangle } from 'lucide-react';
import type { SiteDebugReport } from '@/types/debug';

type ConsentVal = 'granted' | 'denied' | 'missing';

interface Props { debug: SiteDebugReport }

const CATEGORY_LABELS: Record<string, string> = {
  analytics_storage:       'Analytics Storage',
  ad_storage:              'Ad Storage',
  ad_user_data:            'Ad User Data',
  ad_personalization:      'Ad Personalization',
  functionality_storage:   'Functionality Storage',
  personalization_storage: 'Personalization Storage',
};

function ConsentBadge({ value }: { value: ConsentVal }) {
  const styles: Record<ConsentVal, string> = {
    granted: 'bg-green-50 text-green-700 border-green-200',
    denied:  'bg-red-50 text-red-600 border-red-200',
    missing: 'bg-gray-100 text-gray-400 border-gray-200',
  };
  return (
    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${styles[value]}`}>
      {value}
    </span>
  );
}

export default function GCMStatusPanel({ debug }: Props) {
  const [open, setOpen] = useState(true);
  const gcm = debug.gcm_status;
  if (!gcm) return null;

  const { detected, was_set_late, entries, warnings, verdict } = gcm;

  const HeaderIcon = verdict === 'ok'
    ? <ShieldCheck className="w-3.5 h-3.5 text-green-500" />
    : verdict === 'warning'
    ? <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
    : <ShieldX className="w-3.5 h-3.5 text-gray-400" />;

  const verdictBadge = verdict === 'ok'
    ? <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200 font-semibold">Set correctly</span>
    : verdict === 'warning'
    ? <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-semibold">Warnings</span>
    : <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-400 border border-gray-200 font-semibold">Not found</span>;

  const categoryKeys = Object.keys(entries).length > 0
    ? Object.keys(entries)
    : [];

  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 bg-white hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          {HeaderIcon}
          <span className="text-xs font-semibold text-gray-700">Google Consent Mode v2</span>
          {verdictBadge}
        </div>
        {open ? <ChevronUp className="w-3.5 h-3.5 text-gray-400" /> : <ChevronDown className="w-3.5 h-3.5 text-gray-400" />}
      </button>

      {open && (
        <div className="border-t border-gray-100 bg-white">

          {/* Not detected */}
          {!detected && (
            <div className="px-4 py-4 text-xs text-gray-500 flex items-start gap-2">
              <ShieldX className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
              <span>No Consent Mode data found on this page. Ensure <code className="bg-gray-100 px-1 rounded">gtag('consent','default',&#123;...&#125;)</code> is called before any tags fire.</span>
            </div>
          )}

          {/* Consent entries table */}
          {detected && categoryKeys.length > 0 && (
            <div className="px-4 pt-3 pb-2">
              <div className="grid grid-cols-[1fr_80px_80px] gap-x-3 gap-y-1.5 items-center">
                {/* Column headers */}
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Category</span>
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide text-center">Default</span>
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide text-center">Update</span>

                {/* Rows */}
                {categoryKeys.map((key) => {
                  const entry = entries[key];
                  const label = CATEGORY_LABELS[key] ?? key.replace(/_/g, ' ');
                  const rowWarning = entry.default === 'missing';
                  return (
                    <>
                      <span key={`${key}-label`} className={`text-xs ${rowWarning ? 'text-amber-700 font-medium' : 'text-gray-600'}`}>
                        {label}
                        {rowWarning && <AlertTriangle className="w-3 h-3 inline ml-1 text-amber-500" />}
                      </span>
                      <div key={`${key}-default`} className="flex justify-center">
                        <ConsentBadge value={entry.default} />
                      </div>
                      <div key={`${key}-update`} className="flex justify-center">
                        <ConsentBadge value={entry.update} />
                      </div>
                    </>
                  );
                })}
              </div>
            </div>
          )}

          {/* Warnings / verdict */}
          <div className="px-4 pb-3 pt-1 space-y-1.5">
            {warnings.map((w, i) => (
              <div key={i} className="flex items-start gap-1.5 text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                {w}
              </div>
            ))}
            {detected && !was_set_late && warnings.length === 0 && (
              <div className="flex items-center gap-1.5 text-xs text-green-700 bg-green-50 border border-green-100 rounded-lg px-3 py-2">
                <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0" />
                Consent mode states were set correctly.
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
