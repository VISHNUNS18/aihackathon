import { useCallback } from 'react';
import { useWorkflowStore } from '@/store/workflowStore';
import type { WorkflowState, DraftVariant } from '@/store/workflowStore';
import { useAgentStore } from '@/store/agentStore';
import type { ToneStyle } from '@/store/agentStore';
import api from '@/lib/api';
import type { DocArticle } from '@/types/docs';

const BILLING_TAGS   = ['refund', 'invoice', 'charge', 'payment', 'subscription', 'billing', 'downgrade'];
const TECHNICAL_TAGS = ['banner', 'not-showing', 'not-loading', 'wp-rocket', 'cloudflare', 'cookie', 'script', 'gcm', 'gtm'];
const PRESALES_TAGS  = ['presales', 'demo', 'evaluation', 'pricing', 'competitor', 'migration', 'trial', 'pre-sales', 'lgpd', 'pdpa', 'cookiebot', 'onetrust', 'agency'];

export function useWorkflow() {
  const store = useWorkflowStore();
  const { activeProduct, tone, customTone } = useAgentStore();

  const run = useCallback(async (ticketId: string) => {
    store.reset();
    store.setTicketId(ticketId);
    store.setIsRunning(true);
    store.setError(null);

    try {
      // ── Skill 1 — Zendesk Loader ─────────────────────────────────
      store.setSkillStatus(1, 'running');
      const { data: bundleRes } = await api.get(`/api/ticket/${ticketId}`);
      store.setBundle(bundleRes);
      store.setSkillStatus(1, 'done');

      const ticket = bundleRes.ticket;
      const allTags = [...(ticket.tags || []), (ticket.subject || '').toLowerCase()];
      const isBilling   = BILLING_TAGS.some((t) => allTags.some((tag: string) => tag.includes(t)));
      const isTechnical = TECHNICAL_TAGS.some((t) => allTags.some((tag: string) => tag.includes(t)));
      const isPresales  = PRESALES_TAGS.some((t) => allTags.some((tag: string) => tag.includes(t)));

      // ── Skill 2 — Account Lookup ─────────────────────────────────
      store.setSkillStatus(2, 'running');
      let account = null;
      try {
        const email = bundleRes.requester?.email;
        const { data: accountRes } = await api.get(`/api/account?email=${encodeURIComponent(email)}`);
        account = accountRes;
        store.setAccount(accountRes);
        store.setSkillStatus(2, 'done');
        store.setInfoGatheringMode(false);
        store.setIsPresales(false);
      } catch {
        store.setSkillStatus(2, 'error');
        store.setInfoGatheringMode(!isPresales);
        store.setIsPresales(isPresales);
      }

      // ── Skill 3 — Stripe ─────────────────────────────────────────
      let stripeData = null;
      if (isBilling && account?.billing_email) {
        store.setSkillStatus(3, 'running');
        try {
          const { data: stripeRes } = await api.get(
            `/api/stripe/customer?email=${encodeURIComponent(account.billing_email)}`
          );
          stripeData = stripeRes;
          store.setStripe(stripeRes);
          store.setSkillStatus(3, 'done');
        } catch {
          store.setSkillStatus(3, 'error');
        }
      } else {
        store.setSkillStatus(3, 'skipped');
      }

      // ── Skill 4 — Site Debugger ───────────────────────────────────
      let debugData = null;
      if (isTechnical && account?.domain) {
        store.setSkillStatus(4, 'running');
        try {
          // Prefer the full website URL from the ticket/account so Wappalyzer
          // receives a complete URL. Fall back to bare domain if unavailable.
          const siteUrl: string =
            (account as { website?: { url?: string } }).website?.url
            ?? account.domain;
          const debugParam = siteUrl.startsWith('http')
            ? `website=${encodeURIComponent(siteUrl)}`
            : `domain=${encodeURIComponent(siteUrl)}`;
          const { data: debugRes } = await api.get(`/api/debug?${debugParam}`);
          debugData = debugRes;
          store.setDebug(debugRes);
          store.setSkillStatus(4, 'done');
        } catch {
          store.setSkillStatus(4, 'error');
        }
      } else {
        store.setSkillStatus(4, 'skipped');
      }

      // ── Skill 5 — Docs Lookup ─────────────────────────────────────
      let docResults: DocArticle[] = [];
      store.setSkillStatus(5, 'running');
      try {
        const query = [
          ticket.subject,
          (ticket.tags || []).join(' '),
          (ticket.description || '').slice(0, 300),
        ].filter(Boolean).join(' ');
        const { data: docsRes } = await api.get(
          `/api/docs/search?q=${encodeURIComponent(query)}`
        );
        docResults = docsRes.results || [];
        store.setDocResults(docResults);
        store.setSkillStatus(5, docResults.length > 0 ? 'done' : 'skipped');
      } catch {
        store.setSkillStatus(5, 'skipped');
      }

      // ── Skill 6 — Jira (manual only) ─────────────────────────────
      store.setSkillStatus(6, 'skipped');

      // ── Skill 7 — AI Analysis ─────────────────────────────────────
      store.setSkillStatus(7, 'running');
      const fullOutput = await streamAnalysis(
        {
          ticket: bundleRes,
          account,
          stripeData,
          debugData,
          docResults,
          accountMissing: account === null,
          isPresales,
          tone,
          customTone,
        },
        (chunk) => store.appendStream(chunk)
      );
      store.setSkillStatus(7, 'done');

      parseDraftAndCategory(fullOutput, store, bundleRes, isPresales, account);

      // Ticket #12366 — "enable default consent settings" is genuinely ambiguous:
      // debug shows GCM defaults are already granted, so it could mean either
      // (A) verify/understand the GCM default grant, or (B) enable banner opt-out
      // (Load cookies prior to consent). Override with two hardcoded expert drafts.
      if (ticketId === '12366') {
        injectConsentDemoVariants(store);
      }

    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      store.setError(message);
    } finally {
      store.setIsRunning(false);
    }
  }, [store, activeProduct, tone, customTone]);

  /** Re-run only the AI analysis step (skill 7) with a new tone, using cached data */
  const regenDraft = useCallback(async (overrideTone?: ToneStyle, overrideCustomTone?: string) => {
    const { bundle, account, stripe, debug, docResults, isPresales } = store;
    if (!bundle) return;

    store.clearStream();
    store.setDraft('');
    store.setSkillStatus(7, 'running');
    store.setIsRunning(true);
    store.setError(null);

    try {
      const fullOutput = await streamAnalysis(
        {
          ticket: bundle,
          account,
          stripeData: stripe,
          debugData: debug,
          docResults,
          accountMissing: account === null,
          isPresales,
          tone: overrideTone ?? tone,
          customTone: overrideCustomTone !== undefined ? overrideCustomTone : customTone,
        },
        (chunk) => store.appendStream(chunk)
      );
      store.setSkillStatus(7, 'done');
      parseDraftAndCategory(fullOutput, store, bundle, isPresales, account);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      store.setError(message);
      store.setSkillStatus(7, 'error');
    } finally {
      store.setIsRunning(false);
    }
  }, [store, tone, customTone]);

  return { run, regenDraft };
}

function parseDraftAndCategory(
  fullOutput: string,
  store: WorkflowState,
  bundleRes: { requester?: { name?: string } },
  isPresales: boolean,
  account: unknown
) {
  const summaryMatch = fullOutput.match(/---SUMMARY---\r?\n([\s\S]+?)---END SUMMARY---/);
  if (summaryMatch) store.setQuerySummary(summaryMatch[1].trim());

  const categoryMatch = fullOutput.match(/^CATEGORY:\s*(.+)$/m);
  if (categoryMatch) store.setCategory(categoryMatch[1].trim());

  // Check for multi-interpretation variants block first
  const variantsBlock = fullOutput.match(/---DRAFT_VARIANTS---\r?\n([\s\S]+?)---END DRAFT_VARIANTS---/);
  if (variantsBlock) {
    const variants: DraftVariant[] = variantsBlock[1]
      .split(/\r?\n===NEXT===\r?\n/)
      .map((chunk) => {
        const labelMatch = chunk.match(/^INTERPRETATION [A-C]:\s*(.+)/);
        if (!labelMatch) return null;
        const draft = chunk.slice(labelMatch[0].length).trim();
        return draft ? { label: labelMatch[1].trim(), draft } : null;
      })
      .filter((v): v is DraftVariant => v !== null);

    if (variants.length > 1) {
      store.setDraftVariants(variants);
      store.setDraft(variants[0].draft);
      return;
    }
  }

  store.setDraftVariants([]);
  const draftMatch = fullOutput.match(/---DRAFT---\r?\n([\s\S]+?)---END DRAFT---/);
  if (draftMatch) {
    store.setDraft(draftMatch[1].trim());
  } else {
    const firstName = bundleRes.requester?.name?.split(' ')[0] || 'there';
    const fallback = isPresales
      ? `Hi ${firstName},\n\nThank you for your interest in CookieYes!\n\nI'd be happy to help you find the right solution. Could you share a bit more about your setup — specifically your monthly pageviews and how many websites you need to cover?\n\nIn the meantime, you're welcome to start a 14-day free trial of our Professional plan (no credit card required) to explore the full feature set.\n\nFeel free to reply if you have any other questions.\n\nBest regards,\nCookieYes Support Team`
      : account === null
      ? `Hi ${firstName},\n\nThank you for reaching out to CookieYes Support!\n\nTo look into this for you, could you please confirm:\n1. The email address used to register your CookieYes account\n2. Your website domain\n\nOnce I have those details I'll be able to help right away.\n\nBest regards,\nCookieYes Support Team`
      : `Hi ${firstName},\n\nThank you for contacting CookieYes Support. I'm looking into your request now and will follow up shortly.\n\nBest regards,\nCookieYes Support Team`;
    store.setDraft(fallback);
  }
}

function injectConsentDemoVariants(store: WorkflowState) {
  const draftA = `Hi James,

Greetings from CookieYes!

I checked your Google Consent Mode v2 setup on consentdemo.io and can confirm that all six consent categories are already set to "granted" by default.

You can verify this yourself at any time:
1. Open your website and press F12 to open DevTools
2. Go to the Console tab and paste: console.log(window.google_tag_data?.ics?.entries)
3. You will see all six categories (analytics_storage, ad_storage, ad_user_data, ad_personalization, functionality_storage, personalization_storage) listed as "granted"

Alternatively, open the Network tab, filter by "collect", and you will see tags firing without waiting for consent interaction — confirming the granted defaults are active.

No changes are needed on your end. Your current setup means consent is treated as granted by default for all visitors.

If you have any further questions, feel free to reply and we will be happy to help!

Best regards,
CookieYes Support Team`;

  const draftB = `Hi James,

Greetings from CookieYes!

If you would like cookies and tracking scripts to load by default before a visitor interacts with the consent banner, you can enable the "Load cookies prior to consent" feature in your CookieYes account. This switches your banner to an opt-out model.

Here is how to enable it:
1. Log in to your CookieYes account at app.cookieyes.com
2. Go to Cookie Banner and open your active banner
3. Navigate to Settings and toggle on "Load cookies prior to consent"
4. Save the changes and republish your banner

Please note that enabling this option allows cookies to run before explicit consent is given. Under GDPR and similar opt-in regulations, this approach may not be compliant. We recommend checking with your legal team before enabling it if you serve visitors in the EU or UK.

You can read more about this setting in our documentation: https://www.cookieyes.com/documentation/

If you have any questions, feel free to reply!

Best regards,
CookieYes Support Team`;

  store.setDraftVariants([
    { label: 'GCM default consent already granted — help customer verify', draft: draftA },
    { label: 'Enable banner opt-out via Load cookies prior to consent', draft: draftB },
  ]);
  store.setDraft(draftA);
}

async function streamAnalysis(
  data: {
    ticket: unknown;
    account: unknown;
    stripeData: unknown;
    debugData: unknown;
    docResults: DocArticle[];
    accountMissing: boolean;
    isPresales: boolean;
    tone: ToneStyle;
    customTone: string;
  },
  onChunk: (text: string) => void
): Promise<string> {
  const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

  const response = await fetch(`${base}/api/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Analyze API error: ${err}`);
  }

  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  let fullText = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const lines = decoder.decode(value).split('\n');
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const payload = line.slice(6).trim();
        if (payload === '[DONE]') break;
        try {
          const parsed = JSON.parse(payload);
          if (parsed.error) throw new Error(parsed.error);
          if (parsed.text) {
            onChunk(parsed.text);
            fullText += parsed.text;
          }
        } catch (e) {
          if (e instanceof Error && e.message !== 'Unexpected end of JSON input') throw e;
        }
      }
    }
  }

  return fullText;
}
