export interface ColorizedLine {
  text: string;
  color: string;
  weight: 'normal' | 'bold';
}

const SKILL_PATTERNS: [RegExp, string][] = [
  [/SKILL [1-6]|📋|🎫|Zendesk Loader/i, '#3b82f6'],
  [/ACCOUNT|Admin Portal|Plan:|Domain:/i, '#8b5cf6'],
  [/STRIPE|Billing|Invoice|Refund|Charge/i, '#0ea5e9'],
  [/DEBUGGER|Banner|Plugin|Conflict|WP Rocket|Cloudflare/i, '#f59e0b'],
  [/JIRA|Bug|Escalat/i, '#ef4444'],
  [/ANALYSER|CATEGORY:|Resolution/i, '#10b981'],
  [/---DRAFT---|---END DRAFT---/i, '#a855f7'],
  [/⚠️|WARNING|ALERT|ACCOUNT NOT LINKED|INFO-GATHERING/i, '#f97316'],
  [/✅|PASS|OK|Eligible/i, '#22c55e'],
  [/❌|FAIL|NOT ELIGIBLE|Error/i, '#ef4444'],
];

export function colorizeLine(text: string): ColorizedLine {
  for (const [pattern, color] of SKILL_PATTERNS) {
    if (pattern.test(text)) {
      return { text, color, weight: 'bold' };
    }
  }
  return { text, color: '#374151', weight: 'normal' };
}
