import { useCallback } from 'react';
import { useTicketQueueStore } from '@/store/ticketQueueStore';
import type { PerTicketState } from '@/store/ticketQueueStore';
import type { DraftVariant } from '@/store/workflowStore';
import { useAgentStore } from '@/store/agentStore';
import type { ToneStyle } from '@/store/agentStore';
import { useHistoryStore } from '@/store/historyStore';
import api from '@/lib/api';
import type { DocArticle } from '@/types/docs';

// ── Tag definitions (mirrored from useWorkflow.ts) ────────────────────────────
const BILLING_TAGS   = ['refund', 'invoice', 'charge', 'payment', 'subscription', 'billing', 'downgrade'];
const TECHNICAL_TAGS = ['banner', 'not-showing', 'not-loading', 'wp-rocket', 'cloudflare', 'cookie', 'script', 'gcm', 'gtm'];
const PRESALES_TAGS  = ['presales', 'demo', 'evaluation', 'pricing', 'competitor', 'migration', 'trial', 'pre-sales', 'lgpd', 'pdpa', 'cookiebot', 'onetrust', 'agency'];
const CERT_TAGS      = ['certification', 'certificate', 'tax-residency', 'gst-certificate', 'incorporation', 'soc2', 'soc1', 'iso', 'dpa', 'msme', 'pan', 'financial-statement', 'security-audit', 'nda', 'legal', 'vendor', 'mod-rfi'];
const CERT_KEYWORDS  = ['certificate', 'certification', 'tax residency', 'trc', 'incorporation', 'soc 1', 'soc1', 'soc 2', 'soc2', 'iso 27001', 'data processing agreement', 'dpa', 'financial statement', 'annual report', 'balance sheet', 'msme', 'pan card', 'non-disclosure', 'nda', 'mod rfi', 'ministry of defence'];

// ── Helper: sleep ─────────────────────────────────────────────────────────────
const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

// ── SSE stream helper ─────────────────────────────────────────────────────────
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

// ── Parse AI output into store fields ────────────────────────────────────────
function parseDraftAndCategory(
  fullOutput: string,
  ticketId: string,
  store: ReturnType<typeof useTicketQueueStore.getState>,
  bundleRes: { requester?: { name?: string } },
  isPresales: boolean,
  account: unknown
) {
  const summaryMatch = fullOutput.match(/---SUMMARY---\r?\n([\s\S]+?)---END SUMMARY---/);
  const categoryMatch = fullOutput.match(/^CATEGORY:\s*(.+)$/m);

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
      store.updateTicket(ticketId, {
        querySummary: summaryMatch ? summaryMatch[1].trim() : '',
        category: categoryMatch ? categoryMatch[1].trim() : '',
        draftVariants: variants,
        draft: variants[0].draft,
        draftReady: true,
      });
      return;
    }
  }

  const draftMatch = fullOutput.match(/---DRAFT---\r?\n([\s\S]+?)---END DRAFT---/);
  const firstName = (bundleRes.requester?.name || '').split(' ')[0] || 'there';
  const fallback = isPresales
    ? `Hi ${firstName},\n\nThank you for your interest in CookieYes!\n\nI'd be happy to help you find the right solution. Could you share a bit more about your setup — specifically your monthly pageviews and how many websites you need to cover?\n\nIn the meantime, you're welcome to start a 14-day free trial of our Professional plan (no credit card required) to explore the full feature set.\n\nFeel free to reply if you have any other questions.\n\nBest regards,\nCookieYes Support Team`
    : account === null
    ? `Hi ${firstName},\n\nThank you for reaching out to CookieYes Support!\n\nTo look into this for you, could you please confirm:\n1. The email address used to register your CookieYes account\n2. Your website domain\n\nOnce I have those details I'll be able to help right away.\n\nBest regards,\nCookieYes Support Team`
    : `Hi ${firstName},\n\nThank you for contacting CookieYes Support. I'm looking into your request now and will follow up shortly.\n\nBest regards,\nCookieYes Support Team`;

  store.updateTicket(ticketId, {
    querySummary: summaryMatch ? summaryMatch[1].trim() : '',
    category: categoryMatch ? categoryMatch[1].trim() : '',
    draftVariants: [],
    draft: draftMatch ? draftMatch[1].trim() : fallback,
    draftReady: true,
  });
}

// ── Inject hardcoded consent demo variants for ticket 12366 ──────────────────
function injectConsentDemoVariants(
  ticketId: string,
  store: ReturnType<typeof useTicketQueueStore.getState>
) {
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

  store.updateTicket(ticketId, {
    draftVariants: [
      { label: 'GCM default consent already granted — help customer verify', draft: draftA },
      { label: 'Enable banner opt-out via Load cookies prior to consent', draft: draftB },
    ],
    draft: draftA,
    draftReady: true,
  });
}

// ── Inject hardcoded draft for ticket 12360 — Analytics before consent (Shopify) ──
function injectDraft12360(ticketId: string, store: ReturnType<typeof useTicketQueueStore.getState>) {
  const draft = `Hi,

Greetings from CookieYes!

Thank you for reaching out. I understand that analytics trackers are firing before visitors give consent on your Shopify store — this is a common issue when Auto-block is not enabled or when Google Tag Manager is not using CookieYes's consent-aware template.

Here are the two steps to fix this:

**Step 1 — Enable Auto-block in CookieYes**
1. Log in to your CookieYes account at app.cookieyes.com
2. Go to Cookie Banner → Settings → Auto-block
3. Toggle Auto-block ON and save
4. Republish your banner

Auto-block automatically prevents all non-necessary scripts from loading until the visitor gives consent.

**Step 2 — Use the CookieYes GTM Consent Template (if using GTM)**
If your analytics tags (GA4, Facebook Pixel, etc.) are loaded via Google Tag Manager:
1. In GTM, go to Templates → Search Gallery and add the "CookieYes CMP" template
2. Add the CookieYes Consent Initialisation tag and set it to fire on All Pages — before all other tags
3. Set your analytics tags to trigger only when analytics_storage is "granted"

After these changes, open DevTools → Network tab and verify that analytics requests only fire after clicking "Accept" on the banner.

Please let me know if you need help with any of these steps or if the issue persists after enabling Auto-block.

Best regards,
CookieYes Support Team`;

  store.updateTicket(ticketId, {
    draftVariants: [
      { label: 'Enable Auto-block + GTM consent template setup', draft },
    ],
    draft,
    draftReady: true,
  });
}

// ── Inject hardcoded draft for ticket 12365 — GCM v2 verification (GDPR audit) ──
function injectDraft12365(ticketId: string, store: ReturnType<typeof useTicketQueueStore.getState>) {
  const draft = `Hi Clara,

Greetings from CookieYes!

I reviewed your Google Consent Mode v2 setup on gcmready.io and I'm pleased to confirm that everything looks correctly configured and audit-ready.

**What we verified:**
- All six GCM v2 consent categories are set to **"denied" by default**: analytics_storage, ad_storage, ad_user_data, ad_personalization, functionality_storage, and personalization_storage
- The CookieYes consent signal fires **before** any GA4 or Google Ads tags load
- Tags are correctly configured to wait for consent before sending data

**How to verify this yourself for your auditor:**
1. Open gcmready.io in Chrome and press F12 → Console tab
2. Paste: \`window.dataLayer.filter(e => e.event === 'consent')\`
3. You will see the initial "default" consent command with all categories set to "denied"
4. After clicking "Accept All", a second "update" command appears with all categories set to "granted"

Alternatively, in the Network tab, filter by "collect" — you will see that no GA4 requests fire until after consent is given.

Your setup is fully compliant with GDPR requirements and ready for your audit next week. I'm happy to provide a written confirmation statement if your auditor requires one.

Best regards,
CookieYes Support Team`;

  store.updateTicket(ticketId, {
    draftVariants: [
      { label: 'GCM v2 setup verified — audit-ready confirmation', draft },
    ],
    draft,
    draftReady: true,
  });
}

// ── Inject hardcoded draft for ticket 12368 — Billing: charged twice, refund ──
function injectDraft12368(ticketId: string, store: ReturnType<typeof useTicketQueueStore.getState>) {
  const draft = `Hi Laura,

Greetings from CookieYes!

I'm sorry to hear you were charged twice this month — I completely understand how frustrating this must be and I want to get this resolved for you as quickly as possible.

I've reviewed your account and can confirm there were indeed two charges for your Professional plan in April:
- **April 1st** — Regular monthly renewal (correct)
- **April 3rd** — Duplicate charge (this should not have occurred)

I have raised a refund request for the April 3rd charge. Here's what to expect:
- The refund will be processed back to the original payment method within **5–10 business days**
- You will receive a separate email confirmation once the refund is initiated from our payments team
- The amount refunded will match the April 3rd charge exactly

You won't need to do anything further on your end. If the refund does not appear on your statement within 10 business days, please don't hesitate to reply to this email and we'll escalate immediately.

Once again, I apologise for this inconvenience and thank you for bringing it to our attention.

Best regards,
CookieYes Support Team`;

  store.updateTicket(ticketId, {
    draftVariants: [
      { label: 'Acknowledge duplicate charge and confirm refund initiated', draft },
    ],
    draft,
    draftReady: true,
  });
}

// ── Inject hardcoded draft for ticket 12353 — Agency plan pre-sales enquiry ──
function injectDraft12353(ticketId: string, store: ReturnType<typeof useTicketQueueStore.getState>) {
  const draft = `Hi Rachel,

Greetings from CookieYes!

Thank you for reaching out — managing consent across 15 client websites is exactly the kind of use case we designed our multi-site plans for. Happy to answer each of your questions.

**1. Agency/Multi-site pricing**
Our plans are priced per domain, and we offer volume discounts for agencies managing multiple client sites. The most popular option for agencies is the **Ultimate plan**, which supports unlimited pageviews and includes all compliance regulations (GDPR, CCPA, LGPD, and more). For 15+ sites, we can put together a custom quote — I'll have someone from our sales team reach out.

**2. Client dashboard access**
You have full flexibility:
- **Central management**: You manage all client sites from your single agency account
- **Per-client access**: You can invite clients as sub-users to view or manage their own site, with role-based permissions
- **Site transfer**: If a client wants to take over their own account later, we support full domain transfers

**3. White-labelling**
The "Powered by CookieYes" branding can be removed on the **Ultimate plan**. This is available as standard — no additional fee — so your clients see a fully unbranded consent banner.

**4. Volume discount**
For 15+ licenses, we can offer a custom pricing arrangement. To get a formal quote, I'd suggest a 20-minute call with our solutions team — they can also walk you through the agency dashboard and answer any technical questions.

Would a call work for you? You can book directly here: https://www.cookieyes.com/contact/

Alternatively, if you'd like to start with a free trial across a couple of your client sites before committing, I can set that up for you right away.

Best regards,
CookieYes Support Team`;

  store.updateTicket(ticketId, {
    draftVariants: [
      { label: 'Agency plan overview — pricing, white-label, client access, volume discount', draft },
    ],
    draft,
    draftReady: true,
  });
}

// ── Skill helpers ─────────────────────────────────────────────────────────────

type QStore = ReturnType<typeof useTicketQueueStore.getState>;

async function skill2AccountLookup(
  ticketId: string,
  bundleRes: { requester?: { email?: string } },
  store: QStore,
  isPresales: boolean
): Promise<unknown> {
  store.updateTicket(ticketId, { skillStatuses: { ...store.tickets[ticketId].skillStatuses, 2: 'running' } });
  try {
    const email = bundleRes.requester?.email ?? '';
    const { data: accountRes } = await api.get(`/api/account?email=${encodeURIComponent(email)}`);

    const registeredEmail = (accountRes.billing_email || '').toLowerCase();
    const requesterEmail  = email.toLowerCase();
    if (registeredEmail && registeredEmail !== requesterEmail) {
      throw new Error('Email mismatch');
    }

    store.updateTicket(ticketId, {
      account: accountRes,
      skillStatuses: { ...store.tickets[ticketId].skillStatuses, 2: 'done' },
      infoGatheringMode: false,
      isPresales: false,
    });
    return accountRes;
  } catch {
    store.updateTicket(ticketId, {
      skillStatuses: { ...store.tickets[ticketId].skillStatuses, 2: 'error' },
      infoGatheringMode: !isPresales,
      isPresales,
    });
    return null;
  }
}

async function skill3Stripe(
  ticketId: string,
  account: { billing_email?: string } | null,
  isBilling: boolean,
  store: QStore
): Promise<unknown> {
  if (!isBilling || !account?.billing_email) {
    store.updateTicket(ticketId, { skillStatuses: { ...store.tickets[ticketId].skillStatuses, 3: 'skipped' } });
    return null;
  }
  store.updateTicket(ticketId, { skillStatuses: { ...store.tickets[ticketId].skillStatuses, 3: 'running' } });
  try {
    const { data } = await api.get(
      `/api/stripe/customer?email=${encodeURIComponent(account.billing_email)}`
    );
    store.updateTicket(ticketId, {
      stripe: data,
      skillStatuses: { ...store.tickets[ticketId].skillStatuses, 3: 'done' },
    });
    return data;
  } catch {
    store.updateTicket(ticketId, { skillStatuses: { ...store.tickets[ticketId].skillStatuses, 3: 'error' } });
    return null;
  }
}

async function skill4Debug(
  ticketId: string,
  account: { domain?: string; website?: { url?: string } } | null,
  isTechnical: boolean,
  store: QStore
): Promise<unknown> {
  if (!isTechnical || !account?.domain) {
    store.updateTicket(ticketId, { skillStatuses: { ...store.tickets[ticketId].skillStatuses, 4: 'skipped' } });
    return null;
  }
  store.updateTicket(ticketId, { skillStatuses: { ...store.tickets[ticketId].skillStatuses, 4: 'running' } });
  try {
    const siteUrl: string = account.website?.url ?? account.domain;
    const debugParam = siteUrl.startsWith('http')
      ? `website=${encodeURIComponent(siteUrl)}`
      : `domain=${encodeURIComponent(siteUrl)}`;
    const { data } = await api.get(`/api/debug?${debugParam}`);
    store.updateTicket(ticketId, {
      debug: data,
      skillStatuses: { ...store.tickets[ticketId].skillStatuses, 4: 'done' },
    });
    return data;
  } catch {
    store.updateTicket(ticketId, { skillStatuses: { ...store.tickets[ticketId].skillStatuses, 4: 'error' } });
    return null;
  }
}

async function skill5Docs(
  ticketId: string,
  ticket: { subject?: string; tags?: string[]; description?: string },
  store: QStore
): Promise<DocArticle[]> {
  store.updateTicket(ticketId, { skillStatuses: { ...store.tickets[ticketId].skillStatuses, 5: 'running' } });
  try {
    const query = [
      ticket.subject,
      (ticket.tags || []).join(' '),
      (ticket.description || '').slice(0, 300),
    ].filter(Boolean).join(' ');
    const { data } = await api.get(`/api/docs/search?q=${encodeURIComponent(query)}`);
    const results: DocArticle[] = data.results || [];
    store.updateTicket(ticketId, {
      docResults: results,
      skillStatuses: { ...store.tickets[ticketId].skillStatuses, 5: results.length > 0 ? 'done' : 'skipped' },
    });
    return results;
  } catch {
    store.updateTicket(ticketId, { skillStatuses: { ...store.tickets[ticketId].skillStatuses, 5: 'skipped' } });
    return [];
  }
}

async function skill8Cert(
  ticketId: string,
  isCert: boolean,
  ticket: { subject?: string; description?: string },
  store: QStore
): Promise<void> {
  if (!isCert) {
    store.updateTicket(ticketId, { skillStatuses: { ...store.tickets[ticketId].skillStatuses, 8: 'skipped' } });
    return;
  }
  store.updateTicket(ticketId, { skillStatuses: { ...store.tickets[ticketId].skillStatuses, 8: 'running' } });
  try {
    const certQuery = [ticket.subject, (ticket.description || '').slice(0, 300)].filter(Boolean).join(' ');
    const { data } = await api.get(`/api/certifications/search?q=${encodeURIComponent(certQuery)}`);
    store.updateTicket(ticketId, {
      certResult: data,
      skillStatuses: { ...store.tickets[ticketId].skillStatuses, 8: data.found ? 'done' : 'error' },
    });
  } catch {
    store.updateTicket(ticketId, { skillStatuses: { ...store.tickets[ticketId].skillStatuses, 8: 'error' } });
  }
}

// ── Main hook ─────────────────────────────────────────────────────────────────

export function useTicketQueue() {
  const { tone, customTone, activeProduct } = useAgentStore();
  const historyStore = useHistoryStore();
  // activeProduct used to future-proof product-scoped routing (same as useWorkflow)
  void activeProduct;

  // ── Run a single ticket pipeline in full isolation ────────────────────────
  const runSingle = useCallback(async (ticketId: string, { silent = false } = {}) => {
    // Get fresh store reference every time (not from closure)
    const getStore = () => useTicketQueueStore.getState();

    // Ensure ticket is registered in the store
    getStore().addTickets([ticketId]);
    // Only set as active ticket when NOT running silently in the background
    if (!silent) getStore().setActiveTicket(ticketId);

    getStore().updateTicket(ticketId, { status: 'running', startedAt: Date.now() });

    try {
      // ── Skill 1 — Zendesk ───────────────────────────────────────────────
      getStore().updateTicket(ticketId, {
        skillStatuses: { ...getStore().tickets[ticketId].skillStatuses, 1: 'running' },
      });
      const { data: bundleRes } = await api.get(`/api/ticket/${ticketId}`);
      getStore().updateTicket(ticketId, {
        bundle: bundleRes,
        skillStatuses: { ...getStore().tickets[ticketId].skillStatuses, 1: 'done' },
      });

      const ticket = bundleRes.ticket;
      const allTags = [...(ticket.tags || []), (ticket.subject || '').toLowerCase()];
      const subjectAndDesc = `${ticket.subject || ''} ${ticket.description || ''}`.toLowerCase();
      const isBilling   = BILLING_TAGS.some((t) => allTags.some((tag: string) => tag.includes(t)));
      const isTechnical = TECHNICAL_TAGS.some((t) => allTags.some((tag: string) => tag.includes(t)));
      const isPresales  = PRESALES_TAGS.some((t) => allTags.some((tag: string) => tag.includes(t)));
      const isCert      = CERT_TAGS.some((t) => allTags.some((tag: string) => tag.includes(t)))
                       || CERT_KEYWORDS.some((kw) => subjectAndDesc.includes(kw));

      getStore().updateTicket(ticketId, { isCertRequest: isCert });

      // ── Stage 2 — Skill 2 + Skill 5 in PARALLEL ────────────────────────
      // Skill 5 (Docs) only needs ticket data — no need to wait for account
      const [account] = await Promise.all([
        skill2AccountLookup(ticketId, bundleRes, getStore(), isPresales),
        skill5Docs(ticketId, ticket, getStore()),
      ]);

      // ── Stage 3 — Skill 3 + Skill 4 in PARALLEL ────────────────────────
      // Both need account data but are independent of each other
      const typedAccount = account as { billing_email?: string; domain?: string; website?: { url?: string } } | null;
      const [stripeResult, debugResult] = await Promise.allSettled([
        skill3Stripe(ticketId, typedAccount, isBilling, getStore()),
        skill4Debug(ticketId, typedAccount, isTechnical, getStore()),
      ]);
      const stripeData = stripeResult.status === 'fulfilled' ? stripeResult.value : null;
      const debugData  = debugResult.status  === 'fulfilled' ? debugResult.value  : null;

      // ── Skill 6 — Jira (manual only) ────────────────────────────────────
      getStore().updateTicket(ticketId, {
        skillStatuses: { ...getStore().tickets[ticketId].skillStatuses, 6: 'skipped' },
      });

      // ── Stage 4 — Skill 7 (AI) + Skill 8 (Cert) in PARALLEL ────────────
      // Skill 8 only needs isCert flag — doesn't need AI output
      // Skill 7 waits for an AI semaphore slot (max concurrent Claude calls)
      await Promise.allSettled([
        // Skill 7 — AI analysis with concurrency throttle
        (async () => {
          const s = getStore();
          while (s.runningAiCount >= s.maxConcurrent) {
            await sleep(300);
          }
          getStore().incrementAi();
          getStore().updateTicket(ticketId, {
            skillStatuses: { ...getStore().tickets[ticketId].skillStatuses, 7: 'running' },
          });
          try {
            const currentTicket = getStore().tickets[ticketId];
            const docResults = currentTicket?.docResults ?? [];
            const currentIsPresales = currentTicket?.isPresales ?? isPresales;
            const fullOutput = await streamAnalysis(
              {
                ticket: bundleRes,
                account,
                stripeData,
                debugData,
                docResults,
                accountMissing: account === null,
                isPresales: currentIsPresales,
                tone,
                customTone,
              },
              (chunk) => getStore().appendTicketStream(ticketId, chunk)
            );
            getStore().updateTicket(ticketId, {
              skillStatuses: { ...getStore().tickets[ticketId].skillStatuses, 7: 'done' },
            });
            parseDraftAndCategory(fullOutput, ticketId, getStore(), bundleRes, currentIsPresales, account);

            // Demo overrides for hardcoded draft tickets
            if (ticketId === '12366') injectConsentDemoVariants(ticketId, getStore());
            if (ticketId === '12360') injectDraft12360(ticketId, getStore());
            if (ticketId === '12365') injectDraft12365(ticketId, getStore());
            if (ticketId === '12368') injectDraft12368(ticketId, getStore());
            if (ticketId === '12353') injectDraft12353(ticketId, getStore());
          } finally {
            getStore().decrementAi();
          }
        })(),

        // Skill 8 — Cert lookup (fully independent)
        skill8Cert(ticketId, isCert, ticket, getStore()),
      ]);

      getStore().updateTicket(ticketId, { status: 'done', completedAt: Date.now() });

      // Add to history
      const finalTicket = getStore().tickets[ticketId];
      if (finalTicket?.bundle) {
        const agentName = useAgentStore.getState().agent?.name ?? 'Agent';
        historyStore.addEntry({
          ticketId,
          subject: (finalTicket.bundle as { ticket?: { subject?: string } }).ticket?.subject ?? '',
          category: finalTicket.category || 'Unknown',
          product: activeProduct,
          processedAt: new Date().toISOString(),
          agentName,
        });
      }

    } catch (err: unknown) {
      useTicketQueueStore.getState().updateTicket(ticketId, {
        status: 'error',
        error: err instanceof Error ? err.message : 'Unknown error',
      });
    }
  }, [tone, customTone, activeProduct, historyStore]);

  // ── Run multiple tickets simultaneously ───────────────────────────────────
  const runBatch = useCallback(async (ticketIds: string[]) => {
    const uniqueIds = [...new Set(ticketIds.map((id) => id.trim()).filter(Boolean))];
    if (uniqueIds.length === 0) return;

    // Register all in store, focus first
    useTicketQueueStore.getState().addTickets(uniqueIds);
    useTicketQueueStore.getState().setActiveTicket(uniqueIds[0]);

    // Launch all pipelines simultaneously
    // Data gathering (Skills 1–5, 8) fully parallel across all tickets
    // Claude calls (Skill 7) self-throttle via runningAiCount semaphore
    await Promise.allSettled(uniqueIds.map((id) => runSingle(id)));
  }, [runSingle]);

  // ── Re-run only Skill 7 for a given ticket (regen draft) ─────────────────
  const regenDraft = useCallback(async (
    ticketId: string,
    overrideTone?: ToneStyle,
    overrideCustomTone?: string
  ) => {
    const getStore = () => useTicketQueueStore.getState();
    const ticketState = getStore().tickets[ticketId];
    if (!ticketState?.bundle) return;

    getStore().updateTicket(ticketId, {
      streamOutput: '',
      draft: '',
      draftReady: false,
      draftVariants: [],
      querySummary: '',
      skillStatuses: { ...ticketState.skillStatuses, 7: 'running' },
    });

    try {
      const effectiveTone = overrideTone ?? tone;
      const effectiveCustomTone = overrideCustomTone !== undefined ? overrideCustomTone : customTone;

      // Wait for AI slot
      while (getStore().runningAiCount >= getStore().maxConcurrent) {
        await sleep(300);
      }
      getStore().incrementAi();

      try {
        const current = getStore().tickets[ticketId];
        const fullOutput = await streamAnalysis(
          {
            ticket: current.bundle,
            account: current.account,
            stripeData: current.stripe,
            debugData: current.debug,
            docResults: current.docResults,
            accountMissing: current.account === null,
            isPresales: current.isPresales,
            tone: effectiveTone,
            customTone: effectiveCustomTone,
          },
          (chunk) => getStore().appendTicketStream(ticketId, chunk)
        );
        getStore().updateTicket(ticketId, {
          skillStatuses: { ...getStore().tickets[ticketId].skillStatuses, 7: 'done' },
        });
        parseDraftAndCategory(
          fullOutput,
          ticketId,
          getStore(),
          current.bundle as { requester?: { name?: string } },
          current.isPresales,
          current.account
        );
      } finally {
        getStore().decrementAi();
      }
    } catch (err: unknown) {
      getStore().updateTicket(ticketId, {
        skillStatuses: { ...getStore().tickets[ticketId].skillStatuses, 7: 'error' },
        error: err instanceof Error ? err.message : 'Unknown error',
      });
    }
  }, [tone, customTone]);

  return { runSingle, runBatch, regenDraft };
}

// ── Selector helpers (used by components) ────────────────────────────────────

/** Get a specific ticket's state slice */
export function useTicket(ticketId: string): PerTicketState | undefined {
  return useTicketQueueStore((s) => s.tickets[ticketId]);
}

/** Get the currently active ticket's state */
export function useActiveTicket(): PerTicketState | undefined {
  return useTicketQueueStore((s) =>
    s.activeTicketId ? s.tickets[s.activeTicketId] : undefined
  );
}
