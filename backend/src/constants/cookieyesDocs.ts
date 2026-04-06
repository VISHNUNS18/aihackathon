export interface DocArticle {
  id: string;
  title: string;
  category: 'Getting Started' | 'Technical' | 'Billing' | 'Compliance' | 'Account' | 'Presales' | 'Features';
  tags: string[];
  content: string;
}

export const COOKIEYES_DOCS: DocArticle[] = [

  // ─── GETTING STARTED ──────────────────────────────────────────────────────────
  {
    id: 'gs_install_general',
    title: 'How to install the CookieYes script',
    category: 'Getting Started',
    tags: ['install', 'setup', 'script', 'banner', 'head', 'getting started', 'not showing'],
    content: `Copy the CookieYes script from Dashboard → Settings → Script. Paste it inside the <head> section of your website before </head>. The script MUST be in <head> — placing it in <body> delays the banner and can cause consent compliance issues. After installation, clear all caches and test in an incognito/private browser window. Banner should appear on the first visit. If it doesn't: (1) Confirm script is in <head> not <body>, (2) Clear all caching layers (server, CDN, browser), (3) Disable any ad blockers or extensions, (4) Verify the domain in CookieYes dashboard exactly matches your live site URL (including www. or non-www). The banner won't show if consent was already given — check in incognito.`,
  },
  {
    id: 'gs_install_wordpress',
    title: 'Installing CookieYes on WordPress',
    category: 'Getting Started',
    tags: ['wordpress', 'wp', 'plugin', 'install', 'setup', 'cms'],
    content: `Method 1 — Plugin (recommended): WordPress Admin → Plugins → Add New → search "CookieYes" → Install and Activate → connect using your API key from the CookieYes dashboard. Method 2 — Manual script: Copy script from Dashboard → Settings → Script. Go to Appearance → Theme File Editor → header.php → paste before </head>. Critical: If using WP Rocket, W3 Total Cache, LiteSpeed Cache, SG Optimizer, Hummingbird, or Autoptimize, you MUST exclude the CookieYes script URL from: (a) JS minification, (b) JS combination, (c) Delay/Defer JS execution. Failing to do this is the #1 cause of banner disappearing after a WordPress update. Always clear all plugin caches after installation or any change.`,
  },
  {
    id: 'gs_install_shopify',
    title: 'Installing CookieYes on Shopify',
    category: 'Getting Started',
    tags: ['shopify', 'install', 'setup', 'theme', 'liquid', 'ecommerce'],
    content: `Method 1 — App Store (recommended): Install the CookieYes app from the Shopify App Store. Follow the setup wizard. Method 2 — Manual: Copy script from Dashboard → Settings → Script. In Shopify Admin → Online Store → Themes → Edit Code → layout/theme.liquid → paste before </head>. Notes: Shopify's CDN caches pages — always test in a new incognito window after installation. The banner may not appear in the Shopify admin theme preview — this is expected behavior, test on the live storefront. CookieYes works with all Shopify themes including Dawn, Debut, and custom themes.`,
  },
  {
    id: 'gs_install_webflow_wix',
    title: 'Installing on Webflow, Wix, or Squarespace',
    category: 'Getting Started',
    tags: ['webflow', 'wix', 'squarespace', 'custom code', 'install', 'setup', 'no-code'],
    content: `Webflow: Project Settings → Custom Code → Head Code → paste the CookieYes script → Publish site. Wix: Settings → Custom Code → + Add Custom Code → paste in Head section → Apply to All Pages. Squarespace: Settings → Advanced → Code Injection → Header → paste the script → Save. All platforms: the script must load in the HEAD, not the footer. After publishing, always clear site cache and test on the live URL in incognito. Webflow's Designer preview does NOT show the banner — always publish and test on the live domain. For Wix, ensure "Apply to All Pages" is selected or the banner will only appear on one page.`,
  },

  // ─── TECHNICAL ────────────────────────────────────────────────────────────────
  {
    id: 'tech_banner_not_showing',
    title: 'Banner not showing — full troubleshooting guide',
    category: 'Technical',
    tags: ['banner', 'not showing', 'not loading', 'not appearing', 'disappeared', 'missing', 'invisible', 'troubleshoot'],
    content: `Step 1 — Script placement: Open browser DevTools → Network tab → search "cookieyes". Confirm it loads with 200 status. If missing, the script is not installed correctly. Step 2 — Cache: Clear ALL caches (WordPress plugin cache, server cache, CDN cache, browser cache). Test in incognito. Step 3 — Plugin conflicts: If on WordPress, check WP Rocket, W3TC, LiteSpeed Cache, Autoptimize — these commonly strip or defer the script. Exclude the CookieYes script URL from all JS optimization settings. Step 4 — Banner published: CookieYes dashboard → Banners → confirm status is "Published" not "Draft". Step 5 — Domain match: Dashboard domain must exactly match live site (www.example.com ≠ example.com). Step 6 — Prior consent: Banner won't show if user already consented. Delete "cookieyes-consent" cookie and reload in incognito. Step 7 — Geo-blocking: If geo-targeting is enabled, the banner only shows in selected regions.`,
  },
  {
    id: 'tech_wp_rocket',
    title: 'WP Rocket conflict fix',
    category: 'Technical',
    tags: ['wp rocket', 'wprocket', 'caching', 'minify', 'defer', 'delay js', 'conflict', 'wordpress', 'banner disappeared'],
    content: `WP Rocket's JS minification and "Delay JavaScript Execution" are the most common causes of CookieYes banner disappearing after a plugin update. Fix for Delay JS: WP Rocket → File Optimization → JS Files → Excluded JS (Delay Execution) → add the CookieYes script URL. Fix for Minification: WP Rocket → File Optimization → JavaScript → Exclude from minification → add the CookieYes script URL. The script URL is found in CookieYes Dashboard → Settings → Script (looks like: https://cdn-cookieyes.com/client_data/[KEY]/script.js). After saving, clear WP Rocket cache (Dashboard → WP Rocket → Clear Cache) AND clear browser cache. Test in incognito. If still failing, also check: WP Rocket → Advanced Rules → Never Cache URL — ensure the page isn't being fully cached without scripts.`,
  },
  {
    id: 'tech_cloudflare',
    title: 'Cloudflare Rocket Loader conflict fix',
    category: 'Technical',
    tags: ['cloudflare', 'rocket loader', 'cdn', 'conflict', 'cfasync', 'data-cfasync'],
    content: `Cloudflare Rocket Loader delays all JavaScript including the CookieYes script, causing the banner to appear after page content loads or not at all. Fix 1 — Script attribute (least disruptive): Add data-cfasync="false" to the CookieYes script tag in HTML: <script data-cfasync="false" src="https://cdn-cookieyes.com/..."></script>. Fix 2 — Disable Rocket Loader globally: Cloudflare Dashboard → Speed → Optimization → Rocket Loader → Off. Fix 3 — Page Rule: Create a Cloudflare Page Rule matching your domain to disable Rocket Loader for that URL. After any fix, purge Cloudflare cache (Caching → Configuration → Purge Everything) and test in incognito.`,
  },
  {
    id: 'tech_gcm_v2',
    title: 'Google Consent Mode v2 (GCM) setup and troubleshooting',
    category: 'Technical',
    tags: ['gcm', 'google consent mode', 'v2', 'gtm', 'analytics', 'ga4', 'ads', 'attribution', 'gtag'],
    content: `CookieYes supports Google Consent Mode v2 natively. Setup: Dashboard → Settings → Integrations → Google Consent Mode → Enable → choose Basic or Advanced mode. Basic mode: blocks all Google cookies until consent. Advanced mode: allows anonymized pings before consent (recommended for GA4). GTM integration: Dashboard → Settings → Integrations → GTM → enter your GTM container ID. Critical: The CookieYes script MUST appear BEFORE the GTM snippet in your <head>. If CookieYes loads after GTM, consent signals are not set in time and GA4/Ads will collect data without consent. GCM v2 manages: ad_storage, analytics_storage, ad_personalization, ad_user_data signals. Available on Professional and above plans only. Not available on Free or Starter.`,
  },

  // ─── BILLING ──────────────────────────────────────────────────────────────────
  {
    id: 'billing_plans',
    title: 'CookieYes plans and pricing overview',
    category: 'Billing',
    tags: ['plans', 'pricing', 'upgrade', 'free', 'starter', 'professional', 'business', 'enterprise', 'pageviews', 'compare'],
    content: `Free: 10,000 pageviews/month, 1 domain, basic banner, no GCM, scanner limited to 3 pages. Starter (~$10/month): 25,000 pageviews, 1 domain, custom banner, basic reporting. Professional (~$39/month): 100,000 pageviews, unlimited domains, GCM v2, auto-blocking, multi-regulation, priority support. Business (~$99/month): 500,000 pageviews, unlimited domains, all features, dedicated support. Enterprise: Custom pageviews, SLA, custom contract — escalate to sales. Annual plans: ~20% discount vs monthly. Free trial: 14 days on Professional, no credit card required. AppSumo: lifetime deal, non-refundable, redirect to AppSumo for billing issues. Key differentiators by plan: GCM v2 → Professional+. Auto-blocking → Professional+. Unlimited domains → Professional+. Multi-regulation (LGPD, PDPA, etc.) → Professional+.`,
  },
  {
    id: 'billing_refund',
    title: 'Refund policy and eligibility',
    category: 'Billing',
    tags: ['refund', 'money back', 'cancel', 'return', 'policy', 'eligible', 'annual', 'monthly', '14 days', '30 days'],
    content: `CookieYes offers a no-questions-asked refund policy with these criteria: Monthly plans: refund within 30 days of the charge. Annual plans: refund within 14 days of the charge. Duplicate charges: always eligible, process immediately. AppSumo deals: NON-REFUNDABLE — redirect customer to support@appsumo.com. Already refunded charges: not eligible again. Process: Verify eligibility against the criteria above → process refund in Stripe → confirm to customer. Refunds appear in 5-10 business days. Edge cases (outside window, partial refund): escalate to team lead for review. Team lead can approve exceptional cases. Never process a refund outside policy without team lead approval. Always log the refund decision and reason in the Zendesk ticket.`,
  },
  {
    id: 'billing_invoice',
    title: 'Invoice management and regeneration',
    category: 'Billing',
    tags: ['invoice', 'receipt', 'vat', 'billing address', 'regenerate', 'tax', 'b2b'],
    content: `Customers can download invoices from Dashboard → Billing → Invoices. Invoice regeneration: Inform the customer that Stripe does not allow modifying existing invoices. For updated billing address or VAT number: a new invoice can be generated for the current billing period with corrected details. To add VAT/billing details for future invoices: Dashboard → Account → Billing Details → add VAT number and billing address before next billing date. Historical invoices cannot be retroactively corrected. If the customer needs a corrected invoice for their accounts team, the support agent can generate a new invoice PDF with the correct details via Stripe's invoice editor (for the current/latest charge only). Escalate complex multi-invoice VAT corrections to team lead.`,
  },
  {
    id: 'billing_payment_failed',
    title: 'Payment failed — card declined handling',
    category: 'Billing',
    tags: ['payment failed', 'card declined', 'past due', 'billing', 'stripe', 'update card', 'subscription at risk'],
    content: `When payment fails, Stripe automatically retries up to 3 times over 7 days. Account stays active (marked "past_due") during retries. Resolution steps: (1) Send the customer a Stripe payment update link (Customer Portal) from the admin panel. (2) Ask them to add a new card and set it as default. Common decline reasons: insufficient funds, card expired, bank blocking recurring SaaS charge, card limit reached. If customer says card is valid but still declining: advise them to contact their bank to whitelist charges from "CookieYes / Mozilor" for recurring billing. Account suspension: occurs after all retries fail. Reinstate by processing a successful manual payment or waiting for the customer to update their card and triggering a retry.`,
  },
  {
    id: 'billing_downgrade',
    title: 'Plan downgrade process',
    category: 'Billing',
    tags: ['downgrade', 'cancel', 'lower plan', 'reduce', 'free plan', 'feature loss'],
    content: `Downgrades take effect at the end of the current billing period — never immediately. Customer-initiated: Dashboard → Billing → Change Plan → select lower plan → confirm. Agent-initiated: requires team lead approval. Before processing, always inform the customer what they will lose: downgrading from Professional → features lost include GCM v2, auto-blocking, multi-domain, multi-regulation. Websites beyond the plan domain limit will be deactivated (not deleted — data is retained). Customer can re-upgrade at any time to restore full access. Consent logs are always retained regardless of plan. If the customer is downgrading due to cost, consider offering an annual plan discount as an alternative. Log all downgrade interactions in the ticket.`,
  },

  // ─── COMPLIANCE ───────────────────────────────────────────────────────────────
  {
    id: 'compliance_gdpr',
    title: 'GDPR compliance with CookieYes',
    category: 'Compliance',
    tags: ['gdpr', 'europe', 'eu', 'privacy', 'compliance', 'consent', 'regulation', 'dpa'],
    content: `CookieYes is fully compliant with the EU General Data Protection Regulation (GDPR). What CookieYes handles: (1) Prior explicit consent before non-essential cookies, (2) Granular consent by category (Necessary, Analytics, Marketing, Functional), (3) Easy withdrawal — "Manage Cookies" button always accessible, (4) Consent logs stored for 3 years for audit purposes, (5) Auto-generated cookie declaration/policy page updated after each scan. Setup: Dashboard → Settings → Regulations → GDPR → Enable → set consent model to Opt-in. CookieYes acts as a data processor — customers must include CookieYes/Mozilor in their privacy policy as a sub-processor. For DPAs (Data Processing Agreements), direct to legal@cookieyes.com.`,
  },
  {
    id: 'compliance_ccpa',
    title: 'CCPA/CPRA compliance with CookieYes',
    category: 'Compliance',
    tags: ['ccpa', 'california', 'us', 'usa', 'opt out', 'do not sell', 'cpra', 'privacy'],
    content: `CookieYes supports CCPA (California Consumer Privacy Act) and CPRA compliance. Key features: "Do Not Sell or Share My Personal Information" opt-out link, geo-targeting to show CCPA banner only to California visitors, opt-out consent model (cookies active by default, user opts out). Setup: Dashboard → Settings → Regulations → CCPA → Enable → add "Do Not Sell" link to website footer. Multi-jurisdiction: CookieYes can show different consent models based on visitor location — GDPR opt-in for EU visitors, CCPA opt-out for US visitors. This geo-targeting is available on Professional and above. Free/Starter plans support one regulation at a time.`,
  },
  {
    id: 'compliance_lgpd_pdpa',
    title: 'LGPD (Brazil) and PDPA (Thailand/Asia) compliance',
    category: 'Compliance',
    tags: ['lgpd', 'brazil', 'pdpa', 'thailand', 'asia', 'international', 'global', 'pipeda', 'popia'],
    content: `CookieYes supports international privacy laws beyond GDPR and CCPA. LGPD (Brazil): requires prior consent for non-essential cookies for Brazilian visitors, similar to GDPR. Enable: Settings → Regulations → LGPD. PDPA (Thailand): explicit consent required before processing personal data. Enable: Settings → Regulations → PDPA. Other supported regulations: PIPEDA (Canada), POPIA (South Africa), nFADP (Switzerland), UK-GDPR. Multi-regulation setup: on Professional and above, CookieYes can show regulation-specific banners based on the visitor's country using geo-targeting. Free and Starter plans are limited to one active regulation. For businesses with a global audience, the Professional plan is required for multi-regulation geo-targeted compliance.`,
  },

  // ─── ACCOUNT ──────────────────────────────────────────────────────────────────
  {
    id: 'account_2fa',
    title: '2FA reset — locked out of account',
    category: 'Account',
    tags: ['2fa', 'two factor', 'authenticator', 'locked out', 'reset', 'google authenticator', 'backup codes'],
    content: `If the customer is locked out due to 2FA: Step 1 — Backup codes: Ask if they saved their backup codes when setting up 2FA. Each backup code is single-use. Step 2 — Identity verification (required before any reset): Customer must confirm (a) account email, (b) billing address or last 4 digits of payment card, or (c) last invoice amount. Step 3 — Admin reset: Once identity is verified, go to Admin panel → Account → Security → Disable 2FA. Send customer a password reset email to regain access. They can re-enable 2FA after logging in. Important: NEVER reset 2FA without completing identity verification. Log the verification method used in the ticket. If identity cannot be verified, escalate to team lead.`,
  },
  {
    id: 'account_deletion',
    title: 'Account deletion and GDPR right to erasure',
    category: 'Account',
    tags: ['delete', 'deletion', 'gdpr erasure', 'close account', 'right to erasure', 'article 17', 'data removal', 'cancel'],
    content: `Account deletion process: Step 1 — Verify identity (confirm email + billing details). Step 2 — Check subscription status: if active, it should be cancelled first (or will be cancelled at deletion). Step 3 — Data export: Advise the customer to export their data (Dashboard → Account → Export Data) before deletion. Allow up to 14 days for export. Step 4 — Schedule deletion: Admin → Account → Delete Account → confirm. Deletion is processed 14 days after request. GDPR Article 17 compliance: All personal data including consent logs, account details, and billing history is permanently deleted. A written confirmation is sent by email. Critical: deletion is IRREVERSIBLE. Always confirm explicitly with the customer before proceeding. Log the request and confirmation in the ticket.`,
  },
  {
    id: 'account_agency_transfer',
    title: 'Agency accounts and website transfer rules',
    category: 'Account',
    tags: ['agency', 'transfer', 'multi-site', 'client', 'websites', 'organization', 'credit'],
    content: `Agency accounts are designed for managing multiple client websites. Transfer rules: Standard → Agency transfer: supported. Agency → Normal: NOT possible. Agency → Agency: NOT possible. Process for Standard → Agency transfer: collect list of websites, get consent from both account owners, verify in admin panel, process transfer. Credits policy: paid plan websites receive prorated credit when transferred. Free plan websites receive NO credit. Post-transfer: verify setup status for each transferred website in admin dashboard as "Completed". Agency pricing: send pricing sheet ONLY when explicitly requested by the customer. Do not quote Agency pricing proactively. For enterprise agency deals, escalate to team lead or sales.`,
  },

  // ─── PRESALES ─────────────────────────────────────────────────────────────────
  {
    id: 'presales_faq',
    title: 'Pre-sales FAQ — demo, trial, and evaluation',
    category: 'Presales',
    tags: ['presales', 'demo', 'trial', 'evaluation', 'prospect', 'sign up', 'free trial', 'no credit card'],
    content: `Demo requests: CookieYes does not offer live product demos or phone/video calls. Direct prospects to: (1) Product demo video on the CookieYes website, (2) 14-day free trial of the Professional plan — no credit card required, (3) Free plan — always free, no expiry, no card needed. Trial features: the 14-day trial includes all Professional plan features including GCM v2, auto-blocking, unlimited domains, and priority support. Free plan limitations: 10,000 pageviews/month, 1 domain, basic banner, scanner limited to 3 pages. For prospects who need more before committing: encourage the free trial — it's the fastest way to evaluate the full product. Avoid promising features that are not yet available.`,
  },
  {
    id: 'presales_plan_guide',
    title: 'Plan recommendation guide',
    category: 'Presales',
    tags: ['which plan', 'plan recommendation', 'pageviews', 'domains', 'gcm', 'features', 'presales', 'pricing'],
    content: `Plan recommendation framework — ask the prospect: (1) How many monthly pageviews across all sites? (2) How many domains/websites? (3) Do they use Google Analytics or Google Ads (needs GCM v2)? (4) What regulations apply (GDPR, CCPA, LGPD, etc.)? Recommendations: Personal blog/small site, under 10k pageviews → Free plan. Small business, 1 site, up to 25k pageviews → Starter ($10/month). Medium business OR multiple sites OR Google Analytics/Ads user OR multiple regulations → Professional ($39/month). High-traffic site (100k-500k pageviews) → Business ($99/month). Agency managing 10+ client sites → Agency plan. Annual plans save ~20%. For e-commerce (Shopify/WooCommerce): recommend Professional for GCM v2 and auto-blocking which are critical for ad attribution.`,
  },
  {
    id: 'presales_competitor',
    title: 'CookieYes vs competitors (Cookiebot, OneTrust, Osano)',
    category: 'Presales',
    tags: ['cookiebot', 'onetrust', 'osano', 'competitor', 'comparison', 'switch', 'migrate', 'alternative', 'vs'],
    content: `vs Cookiebot: CookieYes is significantly more affordable for SMBs. Both cover GDPR/CCPA equally. CookieYes has a simpler setup, more intuitive dashboard, and includes unlimited domains on Professional (Cookiebot charges per domain). CookieYes CSAT: 99%, 5-star support rating. Migration from Cookiebot: install CookieYes → remove Cookiebot. Running two CMPs simultaneously causes consent conflicts — remove the old one before or immediately after installing CookieYes. vs OneTrust: OneTrust is enterprise-focused with complex pricing. CookieYes is the better choice for SMBs and growing businesses. Both support GCM v2. vs Osano: similar feature set, CookieYes typically offers better pricing at SMB tier. Key CookieYes differentiators: under-5-minute setup, no-code customisation, competitive pricing, and the highest-rated support team in the CMP category.`,
  },
  {
    id: 'presales_multi_domain',
    title: 'Multi-domain and agency use for prospects',
    category: 'Presales',
    tags: ['multi domain', 'multiple sites', 'agency', 'clients', 'subdomains', 'multiple websites', 'white label'],
    content: `Multiple websites: Professional and above plans support unlimited domains under one account. Each domain has its own banner configuration, cookie scan, and consent logs. Subdomains: a banner on example.com does NOT automatically cover app.example.com — each subdomain needs its own CookieYes script instance (or wildcard subdomain setup on Professional+). Prospect managing client sites: recommend Agency plan — each client site is managed separately with the option for clients to have their own CookieYes login. White-label/branding: CookieYes branding can be removed on paid plans. Free plans display "Powered by CookieYes". Reseller program: not currently available. For large agency prospects (10+ sites), escalate to team lead for custom Agency pricing.`,
  },
];
