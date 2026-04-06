import { Router } from 'express';
import axios from 'axios';

export const debugRouter = Router();

// ─── Plugin conflict database ─────────────────────────────────────────────────

const KNOWN_CONFLICTS = [
  {
    name: 'WP Rocket',
    signatures: ['wp-rocket', 'wprocket'],
    type: 'caching',
    fix: 'Exclude the CookieYes script URL from WP Rocket\'s JS minification and "Delay JS Execution" settings. Go to WP Rocket → File Optimization → Excluded JS Files.',
  },
  {
    name: 'Cloudflare Rocket Loader',
    signatures: ['rocket-loader'],
    type: 'cdn',
    fix: 'Disable Rocket Loader for the CookieYes script in Cloudflare dashboard, or add data-cfasync="false" to the CookieYes script tag.',
  },
  {
    name: 'Autoptimize',
    signatures: ['autoptimize'],
    type: 'minification',
    fix: 'Add the CookieYes script URL to the Autoptimize exclusion list under Settings → Autoptimize → JS, CSS & HTML.',
  },
  {
    name: 'W3 Total Cache',
    signatures: ['w3tc', 'w3-total-cache'],
    type: 'caching',
    fix: 'Exclude the CookieYes script from JS minification in W3 Total Cache → Performance → Minify settings.',
  },
  {
    name: 'LiteSpeed Cache',
    signatures: ['litespeed', 'lscache'],
    type: 'caching',
    fix: 'Add the CookieYes script to LiteSpeed Cache\'s JS exclusion list under LiteSpeed Cache → Page Optimization → JS Settings.',
  },
  {
    name: 'SG Optimizer',
    signatures: ['sgo-js', 'sg-optimizer'],
    type: 'caching',
    fix: 'Exclude the CookieYes script from SG Optimizer JS minification/combination settings.',
  },
  {
    name: 'Hummingbird',
    signatures: ['wphb-', 'hummingbird'],
    type: 'caching',
    fix: 'Exclude the CookieYes script from Hummingbird\'s Asset Optimization settings.',
  },
  {
    name: 'Google Tag Manager',
    signatures: ['googletagmanager.com/gtm.js', 'gtm.js'],
    type: 'tag_manager',
    fix: 'If loading CookieYes via GTM, ensure the tag fires on "Consent Initialization" trigger, not "Page View".',
  },
  {
    name: 'Cookiebot',
    signatures: ['cookiebot', 'consentcdn.cookiebot'],
    type: 'conflict_cmp',
    fix: 'Multiple CMP scripts detected. Remove Cookiebot or CookieYes — running two CMPs causes conflicts.',
  },
  {
    name: 'OneTrust',
    signatures: ['onetrust', 'cdn.cookielaw.org'],
    type: 'conflict_cmp',
    fix: 'Multiple CMP scripts detected. Remove OneTrust or CookieYes — running two CMPs causes conflicts.',
  },
];

// ─── Wappalyzer-style technology signatures ───────────────────────────────────

interface TechSignature {
  name: string;
  category: 'cms' | 'framework' | 'analytics' | 'ecommerce' | 'cdn' | 'hosting' | 'marketing' | 'payment' | 'tag_manager' | 'security' | 'other';
  patterns: string[];        // regex patterns matched against HTML
  headerPatterns?: string[]; // matched against response headers
  icon?: string;
}

const TECH_SIGNATURES: TechSignature[] = [
  // ── Frameworks & Libraries ─────────────────────────────────────────────────
  { name: 'React',         category: 'framework',   patterns: ['react\\.min\\.js', '__NEXT_DATA__', 'data-reactroot', 'data-react', '_reactRootContainer'] },
  { name: 'Next.js',       category: 'framework',   patterns: ['__NEXT_DATA__', '/_next/static', 'next/dist'] },
  { name: 'Vue.js',        category: 'framework',   patterns: ['vue\\.min\\.js', '__vue__', 'data-v-', 'nuxt\\.js'] },
  { name: 'Nuxt.js',       category: 'framework',   patterns: ['__nuxt', '__NUXT__', '_nuxt/'] },
  { name: 'Angular',       category: 'framework',   patterns: ['ng-version', 'angular\\.min\\.js', 'ng-app'] },
  { name: 'jQuery',        category: 'framework',   patterns: ['jquery\\.min\\.js', 'jquery-\\d', 'jQuery\\.fn\\.jquery'] },
  { name: 'Svelte',        category: 'framework',   patterns: ['__svelte', '\\.svelte-'] },
  { name: 'Gatsby',        category: 'framework',   patterns: ['gatsby', '___gatsby', '/page-data/'] },

  // ── Analytics ──────────────────────────────────────────────────────────────
  { name: 'Google Analytics 4', category: 'analytics', patterns: ['gtag\\(', 'google-analytics\\.com/g/', 'GA_MEASUREMENT_ID', 'googletagmanager\\.com/gtag'] },
  { name: 'Google Analytics (UA)', category: 'analytics', patterns: ['google-analytics\\.com/analytics\\.js', "ga\\('create'", 'UA-\\d{4,}'] },
  { name: 'Hotjar',        category: 'analytics',   patterns: ['hotjar\\.com', 'hj\\(\'identify', '_hjSettings'] },
  { name: 'Mixpanel',      category: 'analytics',   patterns: ['mixpanel\\.com', 'mixpanel\\.init'] },
  { name: 'Segment',       category: 'analytics',   patterns: ['segment\\.io', 'analytics\\.load\\(', 'cdn\\.segment\\.com'] },
  { name: 'Clarity',       category: 'analytics',   patterns: ['clarity\\.ms', 'Microsoft Clarity'] },
  { name: 'Plausible',     category: 'analytics',   patterns: ['plausible\\.io', 'data-domain'] },

  // ── Tag Managers ────────────────────────────────────────────────────────────
  { name: 'Google Tag Manager', category: 'tag_manager', patterns: ['googletagmanager\\.com/gtm\\.js', 'GTM-[A-Z0-9]+'] },
  { name: 'Tealium',       category: 'tag_manager', patterns: ['tealium\\.com', 'utag\\.js'] },

  // ── E-commerce ─────────────────────────────────────────────────────────────
  { name: 'WooCommerce',   category: 'ecommerce',   patterns: ['woocommerce', 'wc-cart', 'wc_add_to_cart'] },
  { name: 'Magento',       category: 'ecommerce',   patterns: ['Magento', 'mage\\.', '/skin/frontend/'] },
  { name: 'PrestaShop',    category: 'ecommerce',   patterns: ['prestashop', '/modules/blockcart/'] },
  { name: 'BigCommerce',   category: 'ecommerce',   patterns: ['bigcommerce', 'cdn\\.bigcommerce\\.com'] },

  // ── CDN ────────────────────────────────────────────────────────────────────
  { name: 'Cloudflare',    category: 'cdn',         patterns: ['cloudflare', '__cf_bm', 'cf-ray'], headerPatterns: ['cf-ray', 'cf-cache-status'] },
  { name: 'Fastly',        category: 'cdn',         patterns: [], headerPatterns: ['x-served-by', 'fastly-'] },
  { name: 'jsDelivr',      category: 'cdn',         patterns: ['cdn\\.jsdelivr\\.net'] },
  { name: 'cdnjs',         category: 'cdn',         patterns: ['cdnjs\\.cloudflare\\.com'] },
  { name: 'unpkg',         category: 'cdn',         patterns: ['unpkg\\.com'] },

  // ── Hosting ────────────────────────────────────────────────────────────────
  { name: 'Vercel',        category: 'hosting',     patterns: ['vercel\\.app', '__vercel_', '_vercel'], headerPatterns: ['x-vercel-id'] },
  { name: 'Netlify',       category: 'hosting',     patterns: ['netlify\\.app', 'netlify\\.com'], headerPatterns: ['x-nf-request-id'] },
  { name: 'GitHub Pages',  category: 'hosting',     patterns: ['github\\.io'] },

  // ── Marketing / CRM ────────────────────────────────────────────────────────
  { name: 'HubSpot',       category: 'marketing',   patterns: ['hubspot\\.com', 'hs-scripts\\.com', '_hsp'] },
  { name: 'Intercom',      category: 'marketing',   patterns: ['intercom\\.io', 'widget\\.intercom\\.io', 'Intercom\\('] },
  { name: 'Drift',         category: 'marketing',   patterns: ['drift\\.com', 'js\\.driftt\\.com'] },
  { name: 'Mailchimp',     category: 'marketing',   patterns: ['mailchimp\\.com', 'mc\\.us\\d+\\.list-manage'] },
  { name: 'Crisp',         category: 'marketing',   patterns: ['crisp\\.chat', 'client\\.crisp\\.chat'] },
  { name: 'Zendesk Widget', category: 'marketing',  patterns: ['zdassets\\.com', 'zendesk\\.com/embeddable_framework'] },

  // ── Payment ────────────────────────────────────────────────────────────────
  { name: 'Stripe',        category: 'payment',     patterns: ['stripe\\.com/v3', 'js\\.stripe\\.com'] },
  { name: 'PayPal',        category: 'payment',     patterns: ['paypal\\.com/sdk', 'paypalobjects\\.com'] },
  { name: 'Square',        category: 'payment',     patterns: ['squareup\\.com', 'web\\.squarecdn\\.com'] },

  // ── Security ───────────────────────────────────────────────────────────────
  { name: 'reCAPTCHA',     category: 'security',    patterns: ['google\\.com/recaptcha', 'recaptcha\\.net'] },
  { name: 'hCaptcha',      category: 'security',    patterns: ['hcaptcha\\.com'] },
  { name: 'Turnstile',     category: 'security',    patterns: ['challenges\\.cloudflare\\.com/turnstile'] },

  // ── Fonts / Other ──────────────────────────────────────────────────────────
  { name: 'Google Fonts',  category: 'other',       patterns: ['fonts\\.googleapis\\.com', 'fonts\\.gstatic\\.com'] },
  { name: 'Font Awesome',  category: 'other',       patterns: ['fontawesome', 'fa-\\w+'] },
  { name: 'Google Maps',   category: 'other',       patterns: ['maps\\.googleapis\\.com', 'google\\.com/maps'] },
];

function detectTechnologies(
  html: string,
  headers: Record<string, string | string[] | undefined>
): Array<{ name: string; category: TechSignature['category'] }> {
  const headerStr = JSON.stringify(headers).toLowerCase();
  const detected: Array<{ name: string; category: TechSignature['category'] }> = [];

  for (const tech of TECH_SIGNATURES) {
    const matchesHtml  = tech.patterns.some((p) => new RegExp(p, 'i').test(html));
    const matchesHeader = (tech.headerPatterns ?? []).some((p) => headerStr.includes(p.toLowerCase()));
    if (matchesHtml || matchesHeader) {
      detected.push({ name: tech.name, category: tech.category });
    }
  }

  return detected;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function extractScriptTags(html: string): string[] {
  const matches = html.match(/<script[^>]*>/gi) || [];
  return matches;
}

function findCookieYesScript(html: string): { found: boolean; tag: string | null; src: string | null; hasAsync: boolean; hasDefer: boolean } {
  const scriptTagMatch = html.match(/<script[^>]*(cookieyes\.com|cdn\.cookielaw\.org)[^>]*>/i);
  if (!scriptTagMatch) return { found: false, tag: null, src: null, hasAsync: false, hasDefer: false };
  const tag = scriptTagMatch[0];
  const srcMatch = tag.match(/src=["']([^"']+)["']/i);
  return {
    found: true,
    tag,
    src: srcMatch ? srcMatch[1] : null,
    hasAsync: /\basync\b/i.test(tag),
    hasDefer: /\bdefer\b/i.test(tag),
  };
}

function detectCMS(html: string): string {
  if (/wp-content|wp-includes|wordpress/i.test(html)) return 'WordPress';
  if (/shopify/i.test(html)) return 'Shopify';
  if (/webflow\.com/i.test(html)) return 'Webflow';
  if (/wix\.com|wixsite/i.test(html)) return 'Wix';
  if (/squarespace/i.test(html)) return 'Squarespace';
  if (/drupal/i.test(html)) return 'Drupal';
  if (/joomla/i.test(html)) return 'Joomla';
  return 'Unknown / Custom';
}

function detectConsent(html: string): { bannerDetected: boolean; consentCookiePresent: boolean; cookieCount: number } {
  const bannerDetected = /cky-consent|cky-banner|cookieyes/i.test(html);
  const consentCookiePresent = /cookieyes-consent/i.test(html);
  const cookieMatches = html.match(/document\.cookie/gi) || [];
  return { bannerDetected, consentCookiePresent, cookieCount: cookieMatches.length };
}

function detectHttps(url: string): boolean {
  return url.startsWith('https://');
}

function getScriptPosition(html: string, scriptSrc: string | null): 'head' | 'body' | 'unknown' {
  if (!scriptSrc) return 'unknown';
  const scriptIdx = html.toLowerCase().indexOf(scriptSrc.toLowerCase());
  if (scriptIdx === -1) return 'unknown';
  const headEnd = html.toLowerCase().indexOf('</head>');
  return headEnd !== -1 && scriptIdx < headEnd ? 'head' : 'body';
}

// ─── Route ────────────────────────────────────────────────────────────────────

debugRouter.get('/', async (req, res) => {
  const { domain } = req.query;
  if (!domain) { res.status(400).json({ error: 'domain required' }); return; }

  const rawDomain = String(domain);
  const url = rawDomain.startsWith('http') ? rawDomain : `https://${rawDomain}`;
  const checkedAt = new Date().toISOString();

  try {
    const startTime = Date.now();
    const response = await axios.get(url, {
      timeout: 12000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; CookieYes-Support-Debugger/2.0)',
        'Accept': 'text/html,application/xhtml+xml',
      },
      maxRedirects: 5,
    });
    const loadTimeMs = Date.now() - startTime;

    const html: string = response.data || '';
    const finalUrl: string = response.request?.res?.responseUrl || url;
    const statusCode: number = response.status;

    // ── Script detection ───────────────────────────────────────────────────
    const scriptInfo = findCookieYesScript(html);
    const scriptPosition = getScriptPosition(html, scriptInfo.src);
    const allScriptTags = extractScriptTags(html);

    // ── Plugin conflicts ───────────────────────────────────────────────────
    const conflicts = KNOWN_CONFLICTS.map((plugin) => ({
      ...plugin,
      detected: plugin.signatures.some((sig) => html.toLowerCase().includes(sig)),
    }));
    const detectedConflicts = conflicts.filter((c) => c.detected);

    // ── Consent + CMS ──────────────────────────────────────────────────────
    const { bannerDetected, consentCookiePresent, cookieCount } = detectConsent(html);
    const cms = detectCMS(html);
    const isHttps = detectHttps(finalUrl);

    // ── Script health checks ───────────────────────────────────────────────
    const scriptChecks: Array<{ check: string; pass: boolean; detail: string }> = [];

    scriptChecks.push({
      check: 'Script installed',
      pass: scriptInfo.found,
      detail: scriptInfo.found
        ? `Found: ${scriptInfo.src}`
        : 'CookieYes script tag not found in page HTML. Install via Settings → Script.',
    });

    if (scriptInfo.found) {
      scriptChecks.push({
        check: 'Script in <head>',
        pass: scriptPosition === 'head',
        detail: scriptPosition === 'head'
          ? 'Script is correctly placed in the <head> section.'
          : 'Script found in <body>. Move it to <head> to ensure banner loads before page content.',
      });

      scriptChecks.push({
        check: 'No defer attribute',
        pass: !scriptInfo.hasDefer,
        detail: scriptInfo.hasDefer
          ? 'Script has "defer" attribute — this delays execution and can prevent banner from showing before content loads. Remove defer.'
          : 'No defer attribute — correct.',
      });

      scriptChecks.push({
        check: 'HTTPS delivery',
        pass: isHttps,
        detail: isHttps
          ? 'Site is served over HTTPS — secure context confirmed.'
          : 'Site is served over HTTP. Browsers may block mixed content, preventing the script from loading.',
      });

      scriptChecks.push({
        check: 'No CMP conflicts',
        pass: detectedConflicts.filter((c) => c.type === 'conflict_cmp').length === 0,
        detail: detectedConflicts.filter((c) => c.type === 'conflict_cmp').length > 0
          ? `Competing CMP detected: ${detectedConflicts.filter((c) => c.type === 'conflict_cmp').map((c) => c.name).join(', ')}. Remove one.`
          : 'No competing CMP scripts found.',
      });

      scriptChecks.push({
        check: 'Banner rendering',
        pass: bannerDetected,
        detail: bannerDetected
          ? 'CookieYes banner HTML detected in page source.'
          : 'Banner HTML not found. This may indicate the script is blocked, delayed, or a caching plugin is stripping it.',
      });
    }

    // ── Verdict ────────────────────────────────────────────────────────────
    const verdict = !scriptInfo.found ? 'script_missing'
      : detectedConflicts.length > 0 ? 'conflict'
      : bannerDetected ? 'ok'
      : 'error';

    const primaryConflict = detectedConflicts[0] ?? null;

    res.json({
      domain: rawDomain,
      final_url: finalUrl,
      checked_at: checkedAt,
      status_code: statusCode,
      load_time_ms: loadTimeMs,
      is_https: isHttps,
      cms_detected: cms,

      // Script
      script_installed: scriptInfo.found,
      script_src: scriptInfo.src,
      script_position: scriptPosition,
      script_has_async: scriptInfo.hasAsync,
      script_has_defer: scriptInfo.hasDefer,

      // Banner & consent
      banner_detected: bannerDetected,
      consent_cookie_present: consentCookiePresent,
      total_scripts_on_page: allScriptTags.length,

      // Checks
      script_checks: scriptChecks,
      passed_checks: scriptChecks.filter((c) => c.pass).length,
      total_checks: scriptChecks.length,

      // Conflicts
      conflicting_plugins: conflicts,
      detected_conflict_count: detectedConflicts.length,

      // Verdict
      verdict,
      recommended_fix: primaryConflict?.fix ?? (
        !scriptInfo.found ? 'Install the CookieYes script in your site <head> via Settings → Script in your CookieYes dashboard.' :
        !bannerDetected ? 'Script found but banner not rendering. Clear site cache and test in an incognito window.' :
        null
      ),
      console_errors: [],
    });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Fetch failed';
    const isTimeout = message.includes('timeout');
    const isCertError = message.includes('certificate') || message.includes('SSL');

    res.json({
      domain: rawDomain,
      final_url: url,
      checked_at: checkedAt,
      status_code: null,
      load_time_ms: null,
      is_https: url.startsWith('https'),
      cms_detected: 'Unknown',
      script_installed: false,
      script_src: null,
      script_position: 'unknown',
      script_has_async: false,
      script_has_defer: false,
      banner_detected: false,
      consent_cookie_present: false,
      total_scripts_on_page: 0,
      script_checks: [],
      passed_checks: 0,
      total_checks: 0,
      conflicting_plugins: KNOWN_CONFLICTS.map((p) => ({ ...p, detected: false })),
      detected_conflict_count: 0,
      verdict: 'error',
      recommended_fix: isTimeout
        ? 'Site did not respond within 12 seconds. Check if the domain is accessible and not behind a firewall.'
        : isCertError
        ? 'SSL certificate error on the domain. The site may have an expired or misconfigured HTTPS certificate.'
        : `Could not fetch site: ${message}`,
      console_errors: [message],
    });
  }
});
