import { useState } from 'react';
import { Cookie, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import type { CookieDetail } from '@/types/account';

interface Props {
  cookies: CookieDetail[];
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  Necessary:     { bg: 'bg-blue-50',   text: 'text-blue-700',   dot: 'bg-blue-400' },
  Analytics:     { bg: 'bg-purple-50', text: 'text-purple-700', dot: 'bg-purple-400' },
  Marketing:     { bg: 'bg-rose-50',   text: 'text-rose-700',   dot: 'bg-rose-400' },
  Functional:    { bg: 'bg-green-50',  text: 'text-green-700',  dot: 'bg-green-400' },
  Preferences:   { bg: 'bg-amber-50',  text: 'text-amber-700',  dot: 'bg-amber-400' },
  Uncategorized: { bg: 'bg-gray-100',  text: 'text-gray-600',   dot: 'bg-gray-400' },
};

function categoryColor(cat: string) {
  return CATEGORY_COLORS[cat] ?? CATEGORY_COLORS['Uncategorized'];
}

export default function CookieListPanel({ cookies }: Props) {
  const [panelOpen, setPanelOpen] = useState(false);
  const [openCategories, setOpenCategories] = useState<Set<string>>(new Set());
  const [expandedCookie, setExpandedCookie] = useState<string | null>(null);

  const grouped = cookies.reduce<Record<string, CookieDetail[]>>((acc, c) => {
    (acc[c.category] ??= []).push(c);
    return acc;
  }, {});

  const toggleCategory = (cat: string) =>
    setOpenCategories((prev) => {
      const next = new Set(prev);
      next.has(cat) ? next.delete(cat) : next.add(cat);
      return next;
    });

  return (
    <div className="border-t border-gray-50 pt-3">
      {/* Panel toggle */}
      <button
        onClick={() => setPanelOpen((v) => !v)}
        className="w-full flex items-center justify-between group"
      >
        <div className="flex items-center gap-1.5">
          <Cookie className="w-3.5 h-3.5 text-gray-300" />
          <span className="text-xs text-gray-400 font-medium">Cookie List</span>
          <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded-full font-medium">
            {cookies.length}
          </span>
        </div>
        {panelOpen
          ? <ChevronUp className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-500" />
          : <ChevronDown className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-500" />}
      </button>

      {panelOpen && (
        <div className="mt-2 space-y-1.5">
          {/* Category summary chips */}
          <div className="flex flex-wrap gap-1 mb-2">
            {Object.entries(grouped).map(([cat, items]) => {
              const c = categoryColor(cat);
              return (
                <span key={cat} className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium ${c.bg} ${c.text}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
                  {cat} ({items.length})
                </span>
              );
            })}
          </div>

          {/* Category accordions */}
          {Object.entries(grouped).map(([cat, items]) => {
            const c = categoryColor(cat);
            const isOpen = openCategories.has(cat);
            return (
              <div key={cat} className={`rounded-lg border overflow-hidden ${isOpen ? 'border-gray-200' : 'border-gray-100'}`}>
                {/* Category header */}
                <button
                  onClick={() => toggleCategory(cat)}
                  className={`w-full flex items-center justify-between px-2.5 py-2 text-left transition-colors ${isOpen ? 'bg-gray-50' : 'bg-white hover:bg-gray-50'}`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${c.dot}`} />
                    <span className="text-xs font-semibold text-gray-700">{cat}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${c.bg} ${c.text}`}>
                      {items.length}
                    </span>
                  </div>
                  {isOpen
                    ? <ChevronUp className="w-3 h-3 text-gray-400" />
                    : <ChevronDown className="w-3 h-3 text-gray-400" />}
                </button>

                {/* Cookie rows */}
                {isOpen && (
                  <div className="divide-y divide-gray-50">
                    {/* Column headers */}
                    <div className="grid grid-cols-12 gap-1 px-2.5 py-1.5 bg-gray-50/80 text-[10px] text-gray-400 font-medium uppercase tracking-wide">
                      <span className="col-span-4">Name</span>
                      <span className="col-span-4">Domain</span>
                      <span className="col-span-2">Duration</span>
                      <span className="col-span-2 text-center">Type</span>
                    </div>
                    {items.map((cookie) => {
                      const key = `${cat}-${cookie.name}`;
                      const isExpanded = expandedCookie === key;
                      return (
                        <div key={key}>
                          <button
                            onClick={() => setExpandedCookie(isExpanded ? null : key)}
                            className="w-full grid grid-cols-12 gap-1 px-2.5 py-2 items-center text-left hover:bg-gray-50/80 transition-colors"
                          >
                            <span className="col-span-4 text-[11px] font-mono text-gray-700 truncate" title={cookie.name}>
                              {cookie.name}
                            </span>
                            <span className="col-span-4 text-[11px] text-gray-500 truncate" title={cookie.domain}>
                              {cookie.domain}
                            </span>
                            <span className="col-span-2 text-[11px] text-gray-500">
                              {cookie.duration}
                            </span>
                            <span className="col-span-2 flex justify-center">
                              <span className={`text-[9px] px-1.5 py-0.5 rounded font-semibold ${
                                cookie.type === 'first_party'
                                  ? 'bg-sky-50 text-sky-600'
                                  : 'bg-orange-50 text-orange-600'
                              }`}>
                                {cookie.type === 'first_party' ? '1st' : '3rd'}
                              </span>
                            </span>
                          </button>
                          {isExpanded && cookie.description && (
                            <div className="px-3 pb-2.5 pt-0.5 bg-gray-50/60">
                              <p className="text-[11px] text-gray-500 leading-relaxed">{cookie.description}</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
