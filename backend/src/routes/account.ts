import { Router } from 'express';

export const accountRouter = Router();

// ─── Mock account pool ────────────────────────────────────────────────────────
// 6 accounts covering every common CookieYes support scenario.
// Each account includes: core billing, website details, email activity,
// scan overview, 2FA status, and deletion info.

const MOCK_ACCOUNTS = [

  // ── 1. TechCorp — Professional Annual, healthy, refund-eligible charge ──────
  {
    id: 'acc_pro_001',
    billing_email: 'billing@techcorp.io',
    plan: 'Professional',
    plan_status: 'active',
    billing_cycle: 'annual',
    next_billing_date: '2026-08-15',
    domain: 'techcorp.io',
    banner_active: true,
    banner_version: '3.8.2',
    gcm_enabled: true,
    scanner_last_run: '2026-04-01T10:30:00Z',
    cookies_detected: 42,
    regulation: 'GDPR',
    appsumo_deal: false,
    created_at: '2024-03-12T08:00:00Z',
    product: 'cookieyes',
    organization_name: 'TechCorp Solutions',
    pageviews: {
      views: 68420,
      limit: 100000,
      billing_cycle: { start: '2026-04-01', end: '2026-04-30' },
    },
    scan_history: [
      { scan_date: '2026-04-01', scan_status: 'completed', urls_scanned: 24, categories: 8, cookies: 42, scripts: 18, failed_reason: null },
      { scan_date: '2026-03-01', scan_status: 'completed', urls_scanned: 22, categories: 7, cookies: 38, scripts: 16, failed_reason: null },
      { scan_date: '2026-02-01', scan_status: 'failed',    urls_scanned: 0,  categories: 0, cookies: 0,  scripts: 0,  failed_reason: 'Connection timeout' },
    ],
    website: {
      cms: 'WordPress',
      script_installed: true,
      script_version: '3.8.2',
      last_consent_logged: '2026-04-05T18:42:00Z',
      auto_block: true,
      geo_targeting: true,
      subdomains: ['blog.techcorp.io', 'app.techcorp.io'],
      consent_rate_percent: 74,
    },
    email_activity: [
      { type: 'invoice',        subject: 'Your CookieYes invoice for April 2026',          sent_at: '2026-04-01T08:00:00Z', delivered: true,  opened: true  },
      { type: 'scan_complete',  subject: 'Scan complete — 42 cookies found on techcorp.io', sent_at: '2026-04-01T10:35:00Z', delivered: true,  opened: true  },
      { type: 'upgrade',        subject: 'You upgraded to Professional Annual',              sent_at: '2026-08-15T09:00:00Z', delivered: true,  opened: true  },
      { type: 'welcome',        subject: 'Welcome to CookieYes!',                           sent_at: '2024-03-12T08:05:00Z', delivered: true,  opened: true  },
    ],
    scan_overview: {
      total_scans: 14,
      last_scan_status: 'completed',
      cookies_by_category: {
        Necessary: 8, Analytics: 12, Marketing: 14, Functional: 5, Uncategorized: 3,
      },
      avg_cookies_per_scan: 40,
      domains_scanned: ['techcorp.io', 'blog.techcorp.io'],
      next_scheduled_scan: '2026-05-01T10:00:00Z',
    },
    two_factor: {
      enabled: true,
      method: 'totp',
      last_enabled_at: '2024-06-01T12:00:00Z',
      last_reset_at: null,
      reset_requested: false,
      reset_requested_at: null,
      backup_codes_remaining: 6,
    },
    deletion_info: {
      deletion_requested: false,
      requested_at: null,
      scheduled_deletion_at: null,
      reason: null,
      data_export_completed: false,
      gdpr_erasure_requested: false,
    },
  },

  // ── 2. ShopNow — Business Monthly, PAYMENT FAILED (card declined) ───────────
  {
    id: 'acc_biz_002',
    billing_email: 'admin@shopnow.com',
    plan: 'Business',
    plan_status: 'past_due',
    billing_cycle: 'monthly',
    next_billing_date: '2026-05-03',
    domain: 'shopnow.com',
    banner_active: true,
    banner_version: '3.8.1',
    gcm_enabled: false,
    scanner_last_run: '2026-04-03T09:00:00Z',
    cookies_detected: 87,
    regulation: 'GDPR',
    appsumo_deal: false,
    created_at: '2023-11-01T12:00:00Z',
    product: 'cookieyes',
    organization_name: 'ShopNow Ltd.',
    pageviews: {
      views: 245000,
      limit: 500000,
      billing_cycle: { start: '2026-04-03', end: '2026-05-02' },
    },
    scan_history: [
      { scan_date: '2026-04-03', scan_status: 'completed', urls_scanned: 56, categories: 11, cookies: 87, scripts: 34, failed_reason: null },
      { scan_date: '2026-03-03', scan_status: 'completed', urls_scanned: 54, categories: 10, cookies: 82, scripts: 31, failed_reason: null },
    ],
    website: {
      cms: 'Shopify',
      script_installed: true,
      script_version: '3.8.1',
      last_consent_logged: '2026-04-05T14:10:00Z',
      auto_block: false,
      geo_targeting: false,
      subdomains: [],
      consent_rate_percent: 61,
    },
    email_activity: [
      { type: 'payment_failed', subject: 'Action required: Payment failed for your CookieYes subscription', sent_at: '2026-04-03T08:00:00Z', delivered: true,  opened: false },
      { type: 'payment_failed', subject: 'Second payment attempt failed — please update your card',          sent_at: '2026-04-05T08:00:00Z', delivered: true,  opened: true  },
      { type: 'payment_failed', subject: 'Final notice: Your CookieYes account is past due',                 sent_at: '2026-04-07T08:00:00Z', delivered: true,  opened: false },
      { type: 'invoice',        subject: 'Invoice #INV-2026-039 — Business Plan April 2026',                 sent_at: '2026-04-03T08:01:00Z', delivered: true,  opened: true  },
      { type: 'scan_complete',  subject: 'Scan complete — 87 cookies found on shopnow.com',                  sent_at: '2026-04-03T09:05:00Z', delivered: true,  opened: true  },
    ],
    scan_overview: {
      total_scans: 29,
      last_scan_status: 'completed',
      cookies_by_category: {
        Necessary: 12, Analytics: 22, Marketing: 35, Functional: 9, Preferences: 5, Uncategorized: 4,
      },
      avg_cookies_per_scan: 81,
      domains_scanned: ['shopnow.com'],
      next_scheduled_scan: '2026-05-03T09:00:00Z',
    },
    two_factor: {
      enabled: false,
      method: null,
      last_enabled_at: null,
      last_reset_at: null,
      reset_requested: false,
      reset_requested_at: null,
      backup_codes_remaining: 0,
    },
    deletion_info: {
      deletion_requested: false,
      requested_at: null,
      scheduled_deletion_at: null,
      reason: null,
      data_export_completed: false,
      gdpr_erasure_requested: false,
    },
  },

  // ── 3. Design Studio — Starter Monthly, outside 30-day refund window ────────
  {
    id: 'acc_starter_003',
    billing_email: 'contact@designstudio.co',
    plan: 'Starter',
    plan_status: 'active',
    billing_cycle: 'monthly',
    next_billing_date: '2026-04-22',
    domain: 'designstudio.co',
    banner_active: false,
    banner_version: '3.7.9',
    gcm_enabled: false,
    scanner_last_run: '2026-03-22T14:15:00Z',
    cookies_detected: 18,
    regulation: 'GDPR',
    appsumo_deal: false,
    created_at: '2025-07-15T00:00:00Z',
    product: 'cookieyes',
    organization_name: 'Design Studio Co',
    pageviews: {
      views: 9800,
      limit: 25000,
      billing_cycle: { start: '2026-03-22', end: '2026-04-21' },
    },
    scan_history: [
      { scan_date: '2026-03-22', scan_status: 'completed', urls_scanned: 8, categories: 4, cookies: 18, scripts: 7, failed_reason: null },
    ],
    website: {
      cms: 'Webflow',
      script_installed: true,
      script_version: '3.7.9',
      last_consent_logged: '2026-03-30T09:00:00Z',
      auto_block: false,
      geo_targeting: false,
      subdomains: [],
      consent_rate_percent: 55,
    },
    email_activity: [
      { type: 'banner_alert',   subject: '⚠️ Your consent banner has been inactive for 7+ days',         sent_at: '2026-03-29T08:00:00Z', delivered: true,  opened: false },
      { type: 'invoice',        subject: 'Invoice #INV-2026-022 — Starter Plan March 2026',               sent_at: '2026-03-22T08:00:00Z', delivered: true,  opened: true  },
      { type: 'scan_complete',  subject: 'Scan complete — 18 cookies found on designstudio.co',           sent_at: '2026-03-22T14:20:00Z', delivered: true,  opened: true  },
      { type: 'welcome',        subject: 'Welcome to CookieYes!',                                         sent_at: '2025-07-15T00:05:00Z', delivered: true,  opened: true  },
    ],
    scan_overview: {
      total_scans: 9,
      last_scan_status: 'completed',
      cookies_by_category: {
        Necessary: 5, Analytics: 7, Marketing: 4, Uncategorized: 2,
      },
      avg_cookies_per_scan: 17,
      domains_scanned: ['designstudio.co'],
      next_scheduled_scan: '2026-04-22T14:00:00Z',
    },
    two_factor: {
      enabled: true,
      method: 'email',
      last_enabled_at: '2025-08-01T10:00:00Z',
      last_reset_at: '2025-11-15T14:30:00Z',
      reset_requested: false,
      reset_requested_at: null,
      backup_codes_remaining: 3,
    },
    deletion_info: {
      deletion_requested: false,
      requested_at: null,
      scheduled_deletion_at: null,
      reason: null,
      data_export_completed: false,
      gdpr_erasure_requested: false,
    },
  },

  // ── 4. StartupXYZ — AppSumo Lifetime, non-refundable ────────────────────────
  {
    id: 'acc_appsumo_004',
    billing_email: 'founder@startupxyz.io',
    plan: 'AppSumo',
    plan_status: 'active',
    billing_cycle: 'annual',
    next_billing_date: '2027-01-10',
    domain: 'startupxyz.io',
    banner_active: true,
    banner_version: '3.8.2',
    gcm_enabled: false,
    scanner_last_run: '2026-04-02T07:45:00Z',
    cookies_detected: 29,
    regulation: 'CCPA',
    appsumo_deal: true,
    created_at: '2024-01-10T00:00:00Z',
    product: 'cookieyes',
    organization_name: 'StartupXYZ',
    pageviews: {
      views: 11200,
      limit: 50000,
      billing_cycle: { start: '2026-01-10', end: '2027-01-09' },
    },
    scan_history: [
      { scan_date: '2026-04-02', scan_status: 'completed', urls_scanned: 12, categories: 5, cookies: 29, scripts: 11, failed_reason: null },
      { scan_date: '2026-03-02', scan_status: 'completed', urls_scanned: 11, categories: 5, cookies: 27, scripts: 10, failed_reason: null },
    ],
    website: {
      cms: 'Custom',
      script_installed: true,
      script_version: '3.8.2',
      last_consent_logged: '2026-04-05T11:00:00Z',
      auto_block: false,
      geo_targeting: false,
      subdomains: ['app.startupxyz.io'],
      consent_rate_percent: 68,
    },
    email_activity: [
      { type: 'scan_complete', subject: 'Scan complete — 29 cookies found on startupxyz.io', sent_at: '2026-04-02T07:50:00Z', delivered: true, opened: true  },
      { type: 'welcome',       subject: 'Welcome to CookieYes via AppSumo!',                  sent_at: '2024-01-10T00:10:00Z', delivered: true, opened: true  },
    ],
    scan_overview: {
      total_scans: 15,
      last_scan_status: 'completed',
      cookies_by_category: {
        Necessary: 7, Analytics: 10, Marketing: 8, Uncategorized: 4,
      },
      avg_cookies_per_scan: 27,
      domains_scanned: ['startupxyz.io'],
      next_scheduled_scan: '2026-05-02T07:00:00Z',
    },
    two_factor: {
      enabled: false,
      method: null,
      last_enabled_at: null,
      last_reset_at: null,
      reset_requested: true,
      reset_requested_at: '2026-04-04T09:00:00Z',
      backup_codes_remaining: 0,
    },
    deletion_info: {
      deletion_requested: false,
      requested_at: null,
      scheduled_deletion_at: null,
      reason: null,
      data_export_completed: false,
      gdpr_erasure_requested: false,
    },
  },

  // ── 5. Global Retail — Professional Monthly, past_due, deletion requested ───
  {
    id: 'acc_pastdue_005',
    billing_email: 'accounts@globalretail.net',
    plan: 'Professional',
    plan_status: 'past_due',
    billing_cycle: 'monthly',
    next_billing_date: '2026-04-01',
    domain: 'globalretail.net',
    banner_active: true,
    banner_version: '3.8.0',
    gcm_enabled: true,
    scanner_last_run: '2026-03-28T11:00:00Z',
    cookies_detected: 53,
    regulation: 'GDPR',
    appsumo_deal: false,
    created_at: '2023-05-20T00:00:00Z',
    product: 'cookieyes',
    organization_name: 'Global Retail Inc.',
    pageviews: {
      views: 98000,
      limit: 100000,
      billing_cycle: { start: '2026-04-01', end: '2026-04-30' },
    },
    scan_history: [
      { scan_date: '2026-03-28', scan_status: 'completed', urls_scanned: 30, categories: 9, cookies: 53, scripts: 22, failed_reason: null },
      { scan_date: '2026-02-28', scan_status: 'completed', urls_scanned: 28, categories: 9, cookies: 50, scripts: 20, failed_reason: null },
    ],
    website: {
      cms: 'WordPress',
      script_installed: true,
      script_version: '3.8.0',
      last_consent_logged: '2026-04-04T20:00:00Z',
      auto_block: true,
      geo_targeting: true,
      subdomains: ['shop.globalretail.net', 'blog.globalretail.net'],
      consent_rate_percent: 82,
    },
    email_activity: [
      { type: 'payment_failed',  subject: 'Action required: Payment failed — please update billing details', sent_at: '2026-04-01T08:00:00Z', delivered: true,  opened: true  },
      { type: 'payment_failed',  subject: 'Final notice: Account suspension in 3 days',                       sent_at: '2026-04-04T08:00:00Z', delivered: true,  opened: true  },
      { type: 'invoice',         subject: 'Invoice #INV-2026-041 — Professional Plan April 2026',              sent_at: '2026-04-01T08:01:00Z', delivered: true,  opened: true  },
      { type: 'scan_complete',   subject: 'Scan complete — 53 cookies on globalretail.net',                    sent_at: '2026-03-28T11:05:00Z', delivered: true,  opened: false },
      { type: 'banner_alert',    subject: '⚠️ Pageview limit at 98% — consider upgrading',                    sent_at: '2026-04-05T09:00:00Z', delivered: true,  opened: true  },
    ],
    scan_overview: {
      total_scans: 34,
      last_scan_status: 'completed',
      cookies_by_category: {
        Necessary: 10, Analytics: 15, Marketing: 18, Functional: 6, Preferences: 2, Uncategorized: 2,
      },
      avg_cookies_per_scan: 51,
      domains_scanned: ['globalretail.net', 'shop.globalretail.net'],
      next_scheduled_scan: '2026-04-28T11:00:00Z',
    },
    two_factor: {
      enabled: true,
      method: 'totp',
      last_enabled_at: '2023-06-01T10:00:00Z',
      last_reset_at: '2026-01-10T15:00:00Z',
      reset_requested: false,
      reset_requested_at: null,
      backup_codes_remaining: 2,
    },
    deletion_info: {
      deletion_requested: true,
      requested_at: '2026-04-05T14:00:00Z',
      scheduled_deletion_at: '2026-04-19T14:00:00Z',
      reason: 'Switching to a competitor product',
      data_export_completed: true,
      gdpr_erasure_requested: true,
      cancellation_reason: 'Price too high for current usage',
    },
  },

  // ── 6. MyBlog — Free plan, no Stripe customer ────────────────────────────────
  {
    id: 'acc_free_006',
    billing_email: 'hello@myblog.dev',
    plan: 'Free',
    plan_status: 'active',
    billing_cycle: 'monthly',
    next_billing_date: '',
    domain: 'myblog.dev',
    banner_active: true,
    banner_version: '3.8.2',
    gcm_enabled: false,
    scanner_last_run: '2026-04-05T16:20:00Z',
    cookies_detected: 6,
    regulation: 'GDPR',
    appsumo_deal: false,
    created_at: '2025-12-01T00:00:00Z',
    product: 'cookieyes',
    pageviews: {
      views: 1200,
      limit: 10000,
      billing_cycle: { start: '2026-04-01', end: '2026-04-30' },
    },
    scan_history: [
      { scan_date: '2026-04-05', scan_status: 'completed', urls_scanned: 3, categories: 2, cookies: 6, scripts: 4, failed_reason: null },
    ],
    website: {
      cms: 'WordPress',
      script_installed: true,
      script_version: '3.8.2',
      last_consent_logged: '2026-04-05T17:00:00Z',
      auto_block: false,
      geo_targeting: false,
      subdomains: [],
      consent_rate_percent: 90,
    },
    email_activity: [
      { type: 'scan_complete', subject: 'Scan complete — 6 cookies found on myblog.dev', sent_at: '2026-04-05T16:25:00Z', delivered: true, opened: true  },
      { type: 'welcome',       subject: 'Welcome to CookieYes!',                          sent_at: '2025-12-01T00:05:00Z', delivered: true, opened: true  },
      { type: 'trial_ending',  subject: 'Your free plan is limited — upgrade to unlock more', sent_at: '2026-01-01T09:00:00Z', delivered: true, opened: false },
    ],
    scan_overview: {
      total_scans: 4,
      last_scan_status: 'completed',
      cookies_by_category: {
        Necessary: 3, Analytics: 2, Uncategorized: 1,
      },
      avg_cookies_per_scan: 6,
      domains_scanned: ['myblog.dev'],
      next_scheduled_scan: '2026-05-05T16:00:00Z',
    },
    two_factor: {
      enabled: false,
      method: null,
      last_enabled_at: null,
      last_reset_at: null,
      reset_requested: false,
      reset_requested_at: null,
      backup_codes_remaining: 0,
    },
    deletion_info: {
      deletion_requested: false,
      requested_at: null,
      scheduled_deletion_at: null,
      reason: null,
      data_export_completed: false,
      gdpr_erasure_requested: false,
    },
  },
];

function findAccount(email?: string, domain?: string, id?: string) {
  if (id) return MOCK_ACCOUNTS.find((a) => a.id === id) ?? null;
  if (email) {
    const match = MOCK_ACCOUNTS.find(
      (a) => a.billing_email === email || email.includes(a.domain.split('.')[0])
    );
    if (match) return match;
  }
  if (domain) {
    const match = MOCK_ACCOUNTS.find((a) => a.domain === domain || domain.includes(a.domain));
    if (match) return match;
  }
  return null;
}

accountRouter.get('/', (req, res) => {
  const { email, domain, id } = req.query;

  if (!email && !domain && !id) {
    res.status(400).json({ error: 'Provide email, domain, or id' });
    return;
  }

  const account = findAccount(
    email ? String(email) : undefined,
    domain ? String(domain) : undefined,
    id ? String(id) : undefined,
  );

  if (!account) {
    res.status(404).json({ error: 'Account not found' });
    return;
  }

  res.json({ ...account, billing_email: account.billing_email || String(email ?? '') });
});
