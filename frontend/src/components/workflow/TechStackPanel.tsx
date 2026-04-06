import { useState } from 'react';
import { ChevronDown, ChevronUp, Layers } from 'lucide-react';
import type { SiteDebugReport } from '@/types/debug';

interface Props {
  debug: SiteDebugReport;
}

const CATEGORY_META: Record<string, { label: string; color: string }> = {
  cms:         { label: 'CMS',          color: 'bg-blue-50 text-blue-700 border-blue-200' },
  framework:   { label: 'Framework',    color: 'bg-violet-50 text-violet-700 border-violet-200' },
  analytics:   { label: 'Analytics',    color: 'bg-orange-50 text-orange-700 border-orange-200' },
  ecommerce:   { label: 'E-commerce',   color: 'bg-green-50 text-green-700 border-green-200' },
  tag_manager: { label: 'Tag Manager',  color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  marketing:   { label: 'Marketing',    color: 'bg-pink-50 text-pink-700 border-pink-200' },
  payment:     { label: 'Payment',      color: 'bg-teal-50 text-teal-700 border-teal-200' },
  cdn:         { label: 'CDN',          color: 'bg-gray-50 text-gray-600 border-gray-200' },
  hosting:     { label: 'Hosting',      color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  security:    { label: 'Security',     color: 'bg-red-50 text-red-700 border-red-200' },
  other:       { label: 'Other',        color: 'bg-gray-50 text-gray-500 border-gray-200' },
};

const CATEGORY_ORDER = [
  'cms', 'framework', 'ecommerce', 'analytics', 'tag_manager',
  'marketing', 'payment', 'cdn', 'hosting', 'security', 'other',
];

export default function TechStackPanel({ debug }: Props) {
  const [open, setOpen] = useState(true);

  const techs = debug.technologies_detected ?? [];
  if (techs.length === 0) return null;

  // Group by category
  const grouped: Record<string, typeof techs> = {};
  for (const t of techs) {
    const key = t.category in CATEGORY_META ? t.category : 'other';
    (grouped[key] ??= []).push(t);
  }

  const orderedCategories = CATEGORY_ORDER.filter((c) => grouped[c]);

  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 bg-white hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Layers className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-xs font-semibold text-gray-700">
            Tech Stack
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 font-medium">
            {techs.length} detected
          </span>
          {debug.technologies_source === 'wappalyzer_api' && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 font-medium">
              Wappalyzer
            </span>
          )}
        </div>
        {open
          ? <ChevronUp className="w-3.5 h-3.5 text-gray-400" />
          : <ChevronDown className="w-3.5 h-3.5 text-gray-400" />}
      </button>

      {/* Body */}
      {open && (
        <div className="border-t border-gray-100 px-4 py-3 space-y-3 bg-white">
          {orderedCategories.map((cat) => {
            const meta = CATEGORY_META[cat];
            return (
              <div key={cat}>
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
                  {meta.label}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {grouped[cat].map((t) => (
                    <span
                      key={t.name}
                      className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border font-medium ${meta.color}`}
                    >
                      {t.name}
                      {t.version && (
                        <span className="opacity-50 font-normal">{t.version}</span>
                      )}
                      {t.confidence != null && t.confidence < 100 && (
                        <span className="opacity-40 font-normal">{t.confidence}%</span>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
