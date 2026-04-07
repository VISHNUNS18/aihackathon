import { useState } from 'react';
import { Cookie, AlertTriangle, MoreHorizontal } from 'lucide-react';
import type { CookieDetail } from '@/types/account';

interface Props {
  cookies: CookieDetail[];
}

const CATEGORY_ORDER = ['Necessary', 'Functional', 'Analytics', 'Performance', 'Advertisement', 'Uncategorised'];

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  Necessary:     'Necessary cookies are required to enable the basic features of this site, such as providing secure log-in or adjusting your consent preferences. These cookies do not store any personally identifiable data.',
  Functional:    'Functional cookies help perform certain functionalities like sharing the content of the website on social media platforms, collecting feedback, and other third-party features.',
  Analytics:     'Analytical cookies are used to understand how visitors interact with the website. These cookies help provide information on metrics such as the number of visitors, bounce rate, traffic source, etc.',
  Performance:   'Performance cookies are used to understand and analyse the key performance indexes of the website which helps in delivering a better user experience for the visitors.',
  Advertisement: 'Advertisement cookies are used to provide visitors with customised advertisements based on the pages you visited previously and to analyse the effectiveness of the ad campaigns.',
  Uncategorised: 'Uncategorised cookies are cookies that we are in the process of classifying, together with the providers of individual cookies.',
};

export default function CookieListPanel({ cookies }: Props) {
  const [selectedCategory, setSelectedCategory] = useState('Necessary');
  const [expandedCookie, setExpandedCookie] = useState<string | null>(null);

  // Group cookies by category
  const grouped = cookies.reduce<Record<string, CookieDetail[]>>((acc, c) => {
    (acc[c.category] ??= []).push(c);
    return acc;
  }, {});

  // Build ordered category list, include all admin categories even if empty
  const categories = CATEGORY_ORDER.map((cat) => ({
    name: cat,
    count: grouped[cat]?.length ?? 0,
  }));

  const uncategorisedCount = grouped['Uncategorised']?.length ?? 0;
  const activeCookies = grouped[selectedCategory] ?? [];

  return (
    <div className="border-t border-gray-50 pt-3">
      {/* Section header */}
      <div className="flex items-center gap-1.5 mb-3">
        <Cookie className="w-3.5 h-3.5 text-gray-300" />
        <span className="text-xs text-gray-400 font-medium">Cookie List</span>
        <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded-full font-medium">
          {cookies.length}
        </span>
        {uncategorisedCount > 0 && (
          <span className="flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded-full font-semibold">
            <AlertTriangle className="w-2.5 h-2.5" />
            {uncategorisedCount} uncategorised
          </span>
        )}
      </div>

      <div>
        {/* Uncategorised alert banner */}
          {uncategorisedCount > 0 && (
            <div className="flex items-start gap-2 mb-3 px-3 py-2.5 bg-amber-50 border border-amber-200 rounded-lg">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-[11px] text-amber-700 leading-relaxed">
                <span className="font-semibold">{uncategorisedCount} {uncategorisedCount === 1 ? 'cookie' : 'cookies'} uncategorised.</span>
                {' '}These cookies were discovered during the last scan but have not been assigned a category. Review and categorise them in the CookieYes admin to ensure accurate consent collection.
              </p>
            </div>
          )}

          {/* Two-column admin layout */}
          <div className="flex rounded-xl border border-gray-200 overflow-hidden" style={{ minHeight: '220px' }}>

            {/* Left — category sidebar */}
            <div className="flex-shrink-0 w-36 border-r border-gray-100 bg-gray-50">
              {categories.map(({ name, count }) => {
                const isActive = selectedCategory === name;
                const isUncategorised = name === 'Uncategorised' && count > 0;
                return (
                  <button
                    key={name}
                    onClick={() => { setSelectedCategory(name); setExpandedCookie(null); }}
                    className={`w-full text-left px-3 py-2.5 border-b border-gray-100 last:border-b-0 transition-colors ${
                      isActive
                        ? 'bg-white border-l-2 border-l-brand'
                        : 'hover:bg-gray-100 border-l-2 border-l-transparent'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className={`text-[11px] font-medium leading-tight ${isActive ? 'text-gray-800' : 'text-gray-500'}`}>
                        {name}
                      </span>
                      <span className={`text-[10px] font-semibold flex-shrink-0 ${
                        isUncategorised
                          ? 'text-amber-600'
                          : isActive
                          ? 'text-brand'
                          : 'text-gray-400'
                      }`}>
                        {count}
                      </span>
                    </div>
                    <div className="text-[10px] text-gray-400 mt-0.5">
                      {count === 1 ? '1 Cookie' : `${count} Cookies`}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Right — cookie detail panel */}
            <div className="flex-1 min-w-0 bg-white">
              {/* Category header */}
              <div className="px-4 py-3 border-b border-gray-100">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-sm font-semibold ${selectedCategory === 'Uncategorised' ? 'text-amber-700' : 'text-gray-800'}`}>
                    {selectedCategory}
                  </span>
                  {selectedCategory === 'Uncategorised' && uncategorisedCount > 0 && (
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                  )}
                </div>
                <p className="text-[11px] text-gray-400 leading-relaxed">
                  {CATEGORY_DESCRIPTIONS[selectedCategory]}
                </p>
              </div>

              {/* Cookie table */}
              {activeCookies.length === 0 ? (
                <div className="flex items-center justify-center py-8">
                  <span className="text-[11px] text-gray-300">No cookies in this category</span>
                </div>
              ) : (
                <div>
                  {/* Table header */}
                  <div className="grid grid-cols-10 gap-2 px-4 py-2 bg-gray-50/80 border-b border-gray-100">
                    <span className="col-span-3 text-[10px] text-gray-400 font-semibold uppercase tracking-wide">Cookie Id</span>
                    <span className="col-span-4 text-[10px] text-gray-400 font-semibold uppercase tracking-wide">Domain</span>
                    <span className="col-span-2 text-[10px] text-gray-400 font-semibold uppercase tracking-wide">Duration</span>
                    <span className="col-span-1" />
                  </div>

                  {/* Cookie rows */}
                  <div className="divide-y divide-gray-50">
                    {activeCookies.map((cookie) => {
                      const key = `${selectedCategory}-${cookie.name}`;
                      const isExpanded = expandedCookie === key;
                      return (
                        <div key={key}>
                          {/* Main row */}
                          <div className="grid grid-cols-10 gap-2 px-4 py-2.5 items-center hover:bg-gray-50/60 transition-colors">
                            <span className="col-span-3 text-[11px] font-mono font-medium text-gray-700 truncate" title={cookie.name}>
                              {cookie.name}
                            </span>
                            <span className="col-span-4 text-[11px] text-gray-500 truncate" title={cookie.domain}>
                              {cookie.domain}
                            </span>
                            <span className="col-span-2 text-[11px] text-gray-500">
                              {cookie.duration}
                            </span>
                            <button
                              onClick={() => setExpandedCookie(isExpanded ? null : key)}
                              className="col-span-1 flex justify-center p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                              title={isExpanded ? 'Collapse' : 'View details'}
                            >
                              <MoreHorizontal className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Expanded detail */}
                          {isExpanded && (
                            <div className="px-4 pb-3 pt-1 bg-gray-50/40 space-y-2.5 border-t border-gray-100">
                              <div>
                                <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide mb-1">Description</p>
                                <p className="text-[11px] text-gray-600 leading-relaxed">
                                  {cookie.description ?? 'No description available.'}
                                </p>
                              </div>
                              <div>
                                <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide mb-1">Script URL Pattern</p>
                                <p className={`text-[11px] font-mono leading-relaxed ${cookie.script_url_pattern === 'Not available' ? 'text-gray-400 italic' : 'text-brand break-all'}`}>
                                  {cookie.script_url_pattern ?? 'Not available'}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                                  cookie.type === 'first_party'
                                    ? 'bg-sky-50 text-sky-600'
                                    : 'bg-orange-50 text-orange-600'
                                }`}>
                                  {cookie.type === 'first_party' ? 'First party' : 'Third party'}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

          </div>
      </div>
    </div>
  );
}
