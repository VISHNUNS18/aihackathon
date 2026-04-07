import { Router } from 'express';
import axios from 'axios';

export const ticketRouter = Router();

function zendeskAuth(): string {
  const token = process.env.ZENDESK_BEARER_TOKEN;
  if (!token) throw new Error('ZENDESK_BEARER_TOKEN not configured');
  return `Bearer ${token}`;
}

// ─── Demo tickets ─────────────────────────────────────────────────────────────
// IDs 12345 / 12346 / 12347 always return mock data so the demo works
// without a live Zendesk connection. Requester emails are matched to the
// mock accounts in account.ts so the full workflow runs end-to-end.

const now = new Date();
const daysAgo = (n: number) => new Date(now.getTime() - n * 86400000).toISOString();

const DEMO_TICKETS: Record<string, unknown> = {

  // ── #12345 — Technical: banner not loading after WP Rocket update ─────────
  '12345': {
    ticket: {
      id: 12345,
      subject: 'Cookie banner not showing after WP Rocket update',
      description: 'Our cookie consent banner has completely disappeared since we updated WP Rocket last week. We\'ve tried clearing cache multiple times but the banner still doesn\'t appear.',
      status: 'open',
      priority: 'high',
      tags: ['banner', 'not-loading', 'wp-rocket', 'wordpress', 'caching'],
      channel: 'web',
      created_at: daysAgo(2),
      updated_at: daysAgo(0),
      product: 'cookieyes',
      requester_id: 9001,
      assignee_id: null,
      organization_id: 3001,
    },
    requester: {
      id: 9001,
      name: 'Sarah Mitchell',
      email: 'contact@designstudio.co',
      tickets_count: 3,
      organization: 'Design Studio Co',
      created_at: daysAgo(265),
    },
    assignee: null,
    conversation: [
      {
        id: 1001, index: 1, is_agent: false,
        author_id: 9001, author_name: 'Sarah Mitchell',
        body: '<p>Hi, our cookie consent banner has completely disappeared from our website since we updated WP Rocket to the latest version last week. We\'ve tried clearing the cache multiple times but it still doesn\'t show up. Our website is designstudio.co. Can you help?</p>',
        plain_body: 'Hi, our cookie consent banner has completely disappeared from our website since we updated WP Rocket to the latest version last week. We\'ve tried clearing the cache multiple times but it still doesn\'t show up. Our website is designstudio.co. Can you help?',
        created_at: daysAgo(2),
        attachments: [],
        via: { channel: 'web' },
      },
      {
        id: 1002, index: 2, is_agent: true,
        author_id: 8001, author_name: 'Support Agent',
        body: '<p>Hi Sarah, thanks for reaching out. I can see your account and I\'m looking into this now. Could you confirm whether you\'re using the WP Rocket minification or defer JS settings?</p>',
        plain_body: 'Hi Sarah, thanks for reaching out. I can see your account and I\'m looking into this now. Could you confirm whether you\'re using the WP Rocket minification or defer JS settings?',
        created_at: daysAgo(1),
        attachments: [],
        via: { channel: 'web' },
      },
      {
        id: 1003, index: 3, is_agent: false,
        author_id: 9001, author_name: 'Sarah Mitchell',
        body: '<p>Yes, we have both JS minification and "Delay JS execution" turned on in WP Rocket. Could that be the issue? We haven\'t changed any CookieYes settings.</p>',
        plain_body: 'Yes, we have both JS minification and "Delay JS execution" turned on in WP Rocket. Could that be the issue? We haven\'t changed any CookieYes settings.',
        created_at: daysAgo(0),
        attachments: [],
        via: { channel: 'web' },
      },
    ],
  },

  // ── #12346 — Billing: refund request, annual plan, within window ──────────
  '12346': {
    ticket: {
      id: 12346,
      subject: 'Refund request — accidentally upgraded to annual plan',
      description: 'I accidentally clicked annual instead of monthly when upgrading. I\'d like a refund and to switch back to monthly billing.',
      status: 'open',
      priority: 'normal',
      tags: ['refund', 'billing', 'annual', 'downgrade'],
      channel: 'email',
      created_at: daysAgo(1),
      updated_at: daysAgo(0),
      product: 'cookieyes',
      requester_id: 9002,
      assignee_id: null,
      organization_id: 3002,
    },
    requester: {
      id: 9002,
      name: 'James Chen',
      email: 'billing@techcorp.io',
      tickets_count: 1,
      organization: 'TechCorp Solutions',
      created_at: daysAgo(730),
    },
    assignee: null,
    conversation: [
      {
        id: 2001, index: 1, is_agent: false,
        author_id: 9002, author_name: 'James Chen',
        body: '<p>Hello, I made a mistake when upgrading our plan yesterday. I intended to switch to Professional Monthly but accidentally selected the Annual plan instead. I was charged $799. I\'d like a refund for the annual charge and to be moved to the monthly plan ($99/month) instead. This happened yesterday so it should be well within your refund window. Please help.</p>',
        plain_body: 'Hello, I made a mistake when upgrading our plan yesterday. I intended to switch to Professional Monthly but accidentally selected the Annual plan instead. I was charged $799. I\'d like a refund for the annual charge and to be moved to the monthly plan ($99/month) instead. This happened yesterday so it should be well within your refund window. Please help.',
        created_at: daysAgo(1),
        attachments: [],
        via: { channel: 'email' },
      },
    ],
  },

  // ── #12348 — No account found → info-gathering mode ─────────────────────
  '12348': {
    ticket: {
      id: 12348,
      subject: 'Cookie banner not appearing on my website',
      description: 'Hi, I just installed CookieYes on my website but the banner is not showing up at all. I\'ve followed the setup guide but nothing is working.',
      status: 'open',
      priority: 'normal',
      tags: ['banner', 'setup', 'not-showing'],
      channel: 'web',
      created_at: daysAgo(0),
      updated_at: daysAgo(0),
      product: 'cookieyes',
      requester_id: 9005,
      assignee_id: null,
      organization_id: null,
    },
    requester: {
      id: 9005,
      name: 'Priya Nair',
      email: 'priya@newventure.xyz',
      tickets_count: 1,
      organization: '',
      created_at: daysAgo(0),
    },
    assignee: null,
    conversation: [
      {
        id: 5001, index: 1, is_agent: false,
        author_id: 9005, author_name: 'Priya Nair',
        body: '<p>Hi, I just signed up for CookieYes and installed the script on my website but the banner is not appearing at all. I followed the installation guide and added the script to my site header. My website is newventure.xyz. Is there something I\'m missing?</p>',
        plain_body: 'Hi, I just signed up for CookieYes and installed the script on my website but the banner is not appearing at all. I followed the installation guide and added the script to my site header. My website is newventure.xyz. Is there something I\'m missing?',
        created_at: daysAgo(0),
        attachments: [],
        via: { channel: 'web' },
      },
    ],
  },

  // ── #12352 — Pre-sales: demo request + plan evaluation ───────────────────
  '12352': {
    ticket: {
      id: 12352,
      subject: 'Evaluating CookieYes — looking for a demo before we commit',
      description: 'We are assessing consent management platforms for our e-commerce store. Can we get a live demo or trial access?',
      status: 'new',
      priority: 'normal',
      tags: ['presales', 'demo', 'evaluation', 'trial'],
      channel: 'web',
      created_at: daysAgo(0),
      updated_at: daysAgo(0),
      product: 'cookieyes',
      requester_id: 9010,
      assignee_id: null,
      organization_id: null,
    },
    requester: {
      id: 9010,
      name: 'James Thornton',
      email: 'james@modernbrand.co',
      tickets_count: 1,
      organization: 'ModernBrand',
      created_at: daysAgo(0),
    },
    assignee: null,
    conversation: [
      {
        id: 10001, index: 1, is_agent: false,
        author_id: 9010, author_name: 'James Thornton',
        body: '<p>Hi CookieYes team,\n\nWe\'re currently evaluating consent management platforms for our Shopify store (around 80,000 monthly visitors). We\'re comparing CookieYes, Cookiebot, and OneTrust.\n\nA few things we\'d like to understand before committing:\n- Can we get a live demo or speak with someone?\n- Does CookieYes support Google Consent Mode v2 for GA4 and Google Ads?\n- How does your pricing compare to Cookiebot?\n- Is there a trial we can test with our real store before paying?\n\nWe need a solution in place by end of this month for GDPR compliance.\n\nThanks,\nJames</p>',
        plain_body: 'We\'re currently evaluating CookieYes for our Shopify store (~80k monthly visitors). Questions about GCM v2, pricing vs Cookiebot, and trial options.',
        created_at: daysAgo(0),
        attachments: [],
        via: { channel: 'web' },
      },
    ],
  },

  // ── #12353 — Pre-sales: agency managing multiple client sites ─────────────
  '12353': {
    ticket: {
      id: 12353,
      subject: 'Agency plan enquiry — managing consent for 15 client websites',
      description: 'We are a digital agency managing cookie consent for around 15 client websites. Looking for the best plan option.',
      status: 'new',
      priority: 'normal',
      tags: ['presales', 'agency', 'multi-domain', 'pricing', 'clients'],
      channel: 'email',
      created_at: daysAgo(1),
      updated_at: daysAgo(0),
      product: 'cookieyes',
      requester_id: 9011,
      assignee_id: null,
      organization_id: null,
    },
    requester: {
      id: 9011,
      name: 'Rachel Kim',
      email: 'hello@digitalagencypro.co',
      tickets_count: 1,
      organization: 'Digital Agency Pro',
      created_at: daysAgo(1),
    },
    assignee: null,
    conversation: [
      {
        id: 11001, index: 1, is_agent: false,
        author_id: 9011, author_name: 'Rachel Kim',
        body: '<p>Hi,\n\nWe\'re a digital marketing agency and currently manage cookie consent for around 15 of our clients\' websites. Right now we\'re using a mix of free tools but we need something more professional and scalable.\n\nCould you tell me:\n1. What\'s your Agency plan and how is it priced?\n2. Can each client have their own login/dashboard, or is it all managed centrally?\n3. Do you offer white-labelling so the banner doesn\'t say "Powered by CookieYes"?\n4. Can we transfer existing sites from our account to client accounts if they want to manage it themselves?\n\nWe\'d potentially be buying 15+ licenses so keen to understand if there\'s a volume discount.\n\nThanks,\nRachel</p>',
        plain_body: 'Digital agency managing 15 client sites. Questions about agency plan pricing, white-labelling, client logins, and volume discounts.',
        created_at: daysAgo(1),
        attachments: [],
        via: { channel: 'email' },
      },
    ],
  },

  // ── #12354 — Pre-sales: LGPD + PDPA compliance question ──────────────────
  '12354': {
    ticket: {
      id: 12354,
      subject: 'Does CookieYes cover LGPD (Brazil) and PDPA (Thailand)?',
      description: 'We are launching in Brazil and Southeast Asia and need to confirm CookieYes supports LGPD and PDPA regulations.',
      status: 'new',
      priority: 'normal',
      tags: ['presales', 'lgpd', 'pdpa', 'compliance', 'international', 'brazil'],
      channel: 'email',
      created_at: daysAgo(0),
      updated_at: daysAgo(0),
      product: 'cookieyes',
      requester_id: 9012,
      assignee_id: null,
      organization_id: null,
    },
    requester: {
      id: 9012,
      name: 'Carlos Mendes',
      email: 'compliance@globalventures.io',
      tickets_count: 1,
      organization: 'Global Ventures IO',
      created_at: daysAgo(0),
    },
    assignee: null,
    conversation: [
      {
        id: 12001, index: 1, is_agent: false,
        author_id: 9012, author_name: 'Carlos Mendes',
        body: '<p>Hello,\n\nWe\'re expanding our SaaS platform to Brazil and several Southeast Asian markets (Thailand, Singapore). We currently use a GDPR banner for European visitors but now need to cover additional regulations:\n\n- LGPD (Brazil) — our Brazilian user base is growing significantly\n- PDPA (Thailand)\n- PDPC (Singapore)\n\nWe need the consent banner to automatically show the correct version based on the visitor\'s country. Questions:\n1. Does CookieYes support LGPD and PDPA natively?\n2. Can it show different banners by geographic location?\n3. Is geo-targeting included in all plans or only higher tiers?\n4. Do you have documentation on LGPD compliance we can share with our legal team?\n\nThanks,\nCarlos</p>',
        plain_body: 'Expanding to Brazil and Southeast Asia. Need LGPD (Brazil), PDPA (Thailand), geo-targeted banners. Questions about plan requirements.',
        created_at: daysAgo(0),
        attachments: [],
        via: { channel: 'email' },
      },
    ],
  },

  // ── #12355 — Pre-sales: migrating from Cookiebot ─────────────────────────
  '12355': {
    ticket: {
      id: 12355,
      subject: 'Switching from Cookiebot to CookieYes — migration questions',
      description: 'We are currently using Cookiebot and want to switch to CookieYes. Looking for guidance on migration and any potential issues.',
      status: 'new',
      priority: 'normal',
      tags: ['presales', 'cookiebot', 'migration', 'competitor', 'switch'],
      channel: 'web',
      created_at: daysAgo(0),
      updated_at: daysAgo(0),
      product: 'cookieyes',
      requester_id: 9013,
      assignee_id: null,
      organization_id: null,
    },
    requester: {
      id: 9013,
      name: 'Tom Eriksson',
      email: 'devteam@techswitch.io',
      tickets_count: 1,
      organization: 'TechSwitch IO',
      created_at: daysAgo(0),
    },
    assignee: null,
    conversation: [
      {
        id: 13001, index: 1, is_agent: false,
        author_id: 9013, author_name: 'Tom Eriksson',
        body: '<p>Hi,\n\nWe\'ve been using Cookiebot for 2 years but we\'re unhappy with their recent price increases and the complexity of their dashboard. We have 3 WordPress sites and one Shopify store, all currently running Cookiebot.\n\nBefore we switch I want to understand:\n1. Can we run both CookieYes and Cookiebot simultaneously during migration, or do we need to switch all at once?\n2. Will existing user consent records be lost when we switch?\n3. Does CookieYes support Google Consent Mode v2? We use GA4 and Google Ads across all sites.\n4. Is the CookieYes dashboard simpler than Cookiebot? That\'s a big pain point for us.\n5. What plan would cover 4 domains with ~200,000 combined monthly pageviews?\n\nHappy to start a trial if it helps.\n\nThanks,\nTom</p>',
        plain_body: 'Switching from Cookiebot. 3 WordPress + 1 Shopify, ~200k monthly pageviews across 4 domains. Questions about migration, consent records, GCM v2.',
        created_at: daysAgo(0),
        attachments: [],
        via: { channel: 'web' },
      },
    ],
  },

  // ── #12349 — Billing: payment failed, card declined, ShopNow ────────────
  '12349': {
    ticket: {
      id: 12349,
      subject: 'Payment failed — card keeps getting declined',
      description: 'Our Business plan payment has failed 3 times this week. We\'ve tried two different cards and both are being declined. Our account is now showing past due.',
      status: 'open',
      priority: 'high',
      tags: ['billing', 'payment-failed', 'card-declined', 'past-due'],
      channel: 'email',
      created_at: daysAgo(3),
      updated_at: daysAgo(0),
      product: 'cookieyes',
      requester_id: 9006,
      assignee_id: null,
      organization_id: 3006,
    },
    requester: {
      id: 9006,
      name: 'Emma Walsh',
      email: 'admin@shopnow.com',
      tickets_count: 2,
      organization: 'ShopNow Ltd.',
      created_at: daysAgo(881),
    },
    assignee: null,
    conversation: [
      {
        id: 6001, index: 1, is_agent: false,
        author_id: 9006, author_name: 'Emma Walsh',
        body: '<p>Hi, our CookieYes Business plan payment has been failing for 3 days now. We\'ve tried our company Visa and our backup Mastercard — both are being declined. The account is now showing as "past due" and I\'m worried the banner will stop working. Our Stripe portal shows the charge is being attempted but failing. Can you check what\'s happening on your end?</p>',
        plain_body: 'Hi, our CookieYes Business plan payment has been failing for 3 days now. We\'ve tried our company Visa and our backup Mastercard — both are being declined. The account is now showing as "past due" and I\'m worried the banner will stop working. Our Stripe portal shows the charge is being attempted but failing. Can you check what\'s happening on your end?',
        created_at: daysAgo(3),
        attachments: [],
        via: { channel: 'email' },
      },
      {
        id: 6002, index: 2, is_agent: true,
        author_id: 8001, author_name: 'Support Agent',
        body: '<p>Hi Emma, I can see the failed payment attempts on your account. I\'ve sent a payment update link to admin@shopnow.com. Could you try updating the card details via that link? If the issue persists, it may be a block on your bank\'s side for recurring SaaS charges.</p>',
        plain_body: 'Hi Emma, I can see the failed payment attempts on your account. I\'ve sent a payment update link to admin@shopnow.com. Could you try updating the card details via that link? If the issue persists, it may be a block on your bank\'s side for recurring SaaS charges.',
        created_at: daysAgo(2),
        attachments: [],
        via: { channel: 'email' },
      },
      {
        id: 6003, index: 3, is_agent: false,
        author_id: 9006, author_name: 'Emma Walsh',
        body: '<p>I received the link and tried adding a third card but it\'s still failing with "card_declined: insufficient funds" even though we have plenty in the account. Our finance team confirmed there\'s no block on their end. Is there a way to extend our grace period while we sort this out?</p>',
        plain_body: 'I received the link and tried adding a third card but it\'s still failing with "card_declined: insufficient funds" even though we have plenty in the account. Our finance team confirmed there\'s no block on their end. Is there a way to extend our grace period while we sort this out?',
        created_at: daysAgo(0),
        attachments: [],
        via: { channel: 'email' },
      },
    ],
  },

  // ── #12350 — Account: deletion request + GDPR erasure ─────────────────
  '12350': {
    ticket: {
      id: 12350,
      subject: 'Please delete our account and all associated data',
      description: 'We are switching to a competitor and need our CookieYes account and all customer consent data deleted under GDPR Article 17.',
      status: 'open',
      priority: 'normal',
      tags: ['account', 'deletion', 'gdpr', 'data-erasure', 'cancellation'],
      channel: 'email',
      created_at: daysAgo(1),
      updated_at: daysAgo(0),
      product: 'cookieyes',
      requester_id: 9007,
      assignee_id: null,
      organization_id: 3007,
    },
    requester: {
      id: 9007,
      name: 'Nina Kowalski',
      email: 'accounts@globalretail.net',
      tickets_count: 4,
      organization: 'Global Retail Inc.',
      created_at: daysAgo(1052),
    },
    assignee: null,
    conversation: [
      {
        id: 7001, index: 1, is_agent: false,
        author_id: 9007, author_name: 'Nina Kowalski',
        body: '<p>Hi CookieYes team,\n\nWe have decided to move to a different consent management platform. I would like to formally request the deletion of our account (accounts@globalretail.net) and all associated data, including consent logs, under GDPR Article 17 (Right to Erasure).\n\nPlease confirm the timeline for deletion and provide written confirmation once completed. We have already exported our data via your export tool.\n\nThank you.</p>',
        plain_body: 'We have decided to move to a different consent management platform. I would like to formally request the deletion of our account and all associated data under GDPR Article 17.',
        created_at: daysAgo(1),
        attachments: [],
        via: { channel: 'email' },
      },
    ],
  },

  // ── #12351 — Free plan: upgrade question + scanner limit hit ──────────
  '12351': {
    ticket: {
      id: 12351,
      subject: 'What plan do I need to scan more than 3 pages?',
      description: 'I\'m on the free plan and the scanner stopped after 3 pages. I need to scan my full website which has about 50 pages. What\'s the best plan for a small blog?',
      status: 'open',
      priority: 'low',
      tags: ['scanner', 'upgrade', 'free-plan', 'pricing'],
      channel: 'web',
      created_at: daysAgo(0),
      updated_at: daysAgo(0),
      product: 'cookieyes',
      requester_id: 9008,
      assignee_id: null,
      organization_id: null,
    },
    requester: {
      id: 9008,
      name: 'Mike Brennan',
      email: 'hello@myblog.dev',
      tickets_count: 1,
      organization: '',
      created_at: daysAgo(126),
    },
    assignee: null,
    conversation: [
      {
        id: 8001, index: 1, is_agent: false,
        author_id: 9008, author_name: 'Mike Brennan',
        body: '<p>Hi, I\'m using the free plan and really happy with CookieYes so far. But when I ran the cookie scanner it only scanned 3 pages of my blog before stopping. I have around 50 pages total. The dashboard says I\'ve hit my scan limit. I just want to make sure I\'m compliant across my whole site. What plan would you recommend for a small personal blog with about 8,000 visitors per month? I don\'t need anything fancy, just full site scanning and the consent banner.</p>',
        plain_body: 'Hi, I\'m using the free plan and really happy with CookieYes so far. But when I ran the cookie scanner it only scanned 3 pages of my blog before stopping.',
        created_at: daysAgo(0),
        attachments: [],
        via: { channel: 'web' },
      },
    ],
  },

  // ── #12360 — Technical: Shopify + heavy analytics stack (Wappalyzer demo) ─
  '12360': {
    ticket: {
      id: 12360,
      subject: 'Banner not blocking analytics — GDPR concern',
      description: 'We have GA4, Hotjar and Meta Pixel running. CookieYes does not seem to block them before consent.',
      status: 'open', priority: 'high',
      tags: ['banner', 'analytics', 'gdpr', 'auto-block', 'shopify'],
      channel: 'web',
      created_at: daysAgo(1), updated_at: daysAgo(0),
      product: 'cookieyes', requester_id: 9060, assignee_id: null, organization_id: 3060,
    },
    requester: {
      id: 9060, name: 'Nina Patel', email: 'hello@myshop.io',
      tickets_count: 2, organization: 'MyShop', created_at: daysAgo(90),
    },
    assignee: null,
    conversation: [
      {
        id: 6001, index: 1, is_agent: false,
        author_id: 9060, author_name: 'Nina Patel',
        body: '<p>Hi, we run a Shopify store and recently added CookieYes. We have Google Analytics 4, Hotjar, Meta Pixel and Klaviyo installed via GTM. Even after declining cookies, I can see these trackers firing in the network tab. Is auto-block supposed to stop these? GDPR compliance is critical for us as we sell to EU customers.</p>',
        plain_body: 'Hi, we run a Shopify store and recently added CookieYes. We have Google Analytics 4, Hotjar, Meta Pixel and Klaviyo installed via GTM. Even after declining cookies, I can see these trackers firing in the network tab. Is auto-block supposed to stop these? GDPR compliance is critical for us as we sell to EU customers.',
        created_at: daysAgo(1), attachments: [], via: { channel: 'web' },
      },
    ],
  },

  // ── #12361 — Technical: Next.js SaaS, GCM + Segment setup (Wappalyzer demo)
  '12361': {
    ticket: {
      id: 12361,
      subject: 'How to configure GCM with Segment and HubSpot?',
      description: 'We use Next.js with Segment and HubSpot. Need to set up Google Consent Mode properly.',
      status: 'open', priority: 'normal',
      tags: ['gcm', 'gtm', 'technical', 'segment', 'vercel'],
      channel: 'email',
      created_at: daysAgo(0), updated_at: daysAgo(0),
      product: 'cookieyes', requester_id: 9061, assignee_id: null, organization_id: 3061,
    },
    requester: {
      id: 9061, name: 'Tom Wren', email: 'dev@appstack.dev',
      tickets_count: 1, organization: 'AppStack', created_at: daysAgo(45),
    },
    assignee: null,
    conversation: [
      {
        id: 6101, index: 1, is_agent: false,
        author_id: 9061, author_name: 'Tom Wren',
        body: '<p>Hey, we are a Next.js SaaS deployed on Vercel. We have Segment for analytics, HubSpot for CRM, Stripe for payments and Intercom for support. We want to implement Google Consent Mode v2 so our ad conversions still work even when users decline analytics cookies. Can you walk me through the correct CookieYes GCM setup for this stack?</p>',
        plain_body: 'Hey, we are a Next.js SaaS deployed on Vercel. We have Segment for analytics, HubSpot for CRM, Stripe for payments and Intercom for support. We want to implement Google Consent Mode v2 so our ad conversions still work even when users decline analytics cookies. Can you walk me through the correct CookieYes GCM setup for this stack?',
        created_at: daysAgo(0), attachments: [], via: { channel: 'email' },
      },
    ],
  },

  // ── #12362 — Technical: WordPress + WooCommerce + WP Rocket conflict ────────
  '12362': {
    ticket: {
      id: 12362,
      subject: 'Cookie banner gone after installing WP Rocket on WooCommerce site',
      description: 'We run WooCommerce and just installed WP Rocket for performance. The cookie banner vanished immediately.',
      status: 'open', priority: 'high',
      tags: ['banner', 'not-loading', 'wp-rocket', 'wordpress', 'woocommerce', 'caching'],
      channel: 'web',
      created_at: daysAgo(2), updated_at: daysAgo(0),
      product: 'cookieyes', requester_id: 9062, assignee_id: null, organization_id: 3062,
    },
    requester: {
      id: 9062, name: 'Rosa Meier', email: 'support@blogpress.net',
      tickets_count: 1, organization: 'BlogPress', created_at: daysAgo(180),
    },
    assignee: null,
    conversation: [
      {
        id: 6201, index: 1, is_agent: false,
        author_id: 9062, author_name: 'Rosa Meier',
        body: '<p>Hello, we have a WooCommerce store on WordPress. We installed WP Rocket two days ago for speed optimization and the CookieYes banner completely disappeared. We also use Hotjar and Google Tag Manager. I have tried disabling WP Rocket and the banner comes back immediately so it is definitely WP Rocket causing this. We have JS minification and Delay JS Execution turned on. Can you tell me exactly what to exclude in WP Rocket settings?</p>',
        plain_body: 'Hello, we have a WooCommerce store on WordPress. We installed WP Rocket two days ago for speed optimization and the CookieYes banner completely disappeared. We also use Hotjar and Google Tag Manager. I have tried disabling WP Rocket and the banner comes back immediately so it is definitely WP Rocket causing this. We have JS minification and Delay JS Execution turned on. Can you tell me exactly what to exclude in WP Rocket settings?',
        created_at: daysAgo(2), attachments: [], via: { channel: 'web' },
      },
    ],
  },

  // ── #12363 — Technical: Legacy marketing site, Cloudflare + HubSpot + GTM ──
  '12363': {
    ticket: {
      id: 12363,
      subject: 'Banner loads slowly — Cloudflare Rocket Loader suspected',
      description: 'Our marketing site uses Cloudflare and the consent banner appears 3-4 seconds after page load, causing a flash of unblocked content.',
      status: 'open', priority: 'normal',
      tags: ['banner', 'cloudflare', 'cdn', 'performance', 'technical'],
      channel: 'email',
      created_at: daysAgo(1), updated_at: daysAgo(0),
      product: 'cookieyes', requester_id: 9063, assignee_id: null, organization_id: 3063,
    },
    requester: {
      id: 9063, name: 'Marc Dubois', email: 'tech@brandsite.co',
      tickets_count: 3, organization: 'BrandSite', created_at: daysAgo(300),
    },
    assignee: null,
    conversation: [
      {
        id: 6301, index: 1, is_agent: false,
        author_id: 9063, author_name: 'Marc Dubois',
        body: '<p>Hi, our website runs on WordPress with Cloudflare in front. We use HubSpot for marketing, Mailchimp for email, GTM for tag management and reCAPTCHA for forms. The CookieYes banner takes 3 to 4 seconds to appear after the page loads, which means trackers like HubSpot and Mailchimp fire before the user can consent. I think Cloudflare Rocket Loader might be the issue. What should I configure?</p>',
        plain_body: 'Hi, our website runs on WordPress with Cloudflare in front. We use HubSpot for marketing, Mailchimp for email, GTM for tag management and reCAPTCHA for forms. The CookieYes banner takes 3 to 4 seconds to appear after the page loads, which means trackers like HubSpot and Mailchimp fire before the user can consent. I think Cloudflare Rocket Loader might be the issue. What should I configure?',
        created_at: daysAgo(1), attachments: [], via: { channel: 'email' },
      },
    ],
  },

  // ── #12364 — Technical: Competing CMP (Cookiebot still active) ───────────
  '12364': {
    ticket: {
      id: 12364,
      subject: 'Two consent banners showing — Cookiebot and CookieYes conflict',
      description: 'After migrating to CookieYes we now see two cookie banners on our site. Cookiebot script appears to still be running.',
      status: 'open', priority: 'urgent',
      tags: ['banner', 'conflict_cmp', 'cookiebot', 'technical', 'react'],
      channel: 'web',
      created_at: daysAgo(0), updated_at: daysAgo(0),
      product: 'cookieyes', requester_id: 9064, assignee_id: null, organization_id: 3064,
    },
    requester: {
      id: 9064, name: 'Lena Koch', email: 'dev@techventure.io',
      tickets_count: 1, organization: 'TechVenture', created_at: daysAgo(20),
    },
    assignee: null,
    conversation: [
      {
        id: 6401, index: 1, is_agent: false,
        author_id: 9064, author_name: 'Lena Koch',
        body: '<p>Hi, we just migrated from Cookiebot to CookieYes on our React app. We removed the Cookiebot script from GTM but we are still seeing two consent banners appearing — one from Cookiebot and one from CookieYes. We also use Google Analytics 4 and Segment. Visitors are getting two consent prompts which is terrible UX. How do we fully remove Cookiebot and make sure only CookieYes runs?</p>',
        plain_body: 'Hi, we just migrated from Cookiebot to CookieYes on our React app. We removed the Cookiebot script from GTM but we are still seeing two consent banners appearing — one from Cookiebot and one from CookieYes. We also use Google Analytics 4 and Segment. Visitors are getting two consent prompts which is terrible UX. How do we fully remove Cookiebot and make sure only CookieYes runs?',
        created_at: daysAgo(0), attachments: [], via: { channel: 'web' },
      },
    ],
  },

  // ── #12347 — Account: 2FA locked out, AppSumo user ───────────────────────
  '12347': {
    ticket: {
      id: 12347,
      subject: 'Locked out of account — 2FA authenticator app lost',
      description: 'I got a new phone and lost access to my authenticator app. I\'m completely locked out of my CookieYes account. Please reset my 2FA.',
      status: 'open',
      priority: 'urgent',
      tags: ['2fa', 'account', 'locked-out', 'authentication'],
      channel: 'email',
      created_at: daysAgo(0),
      updated_at: daysAgo(0),
      product: 'cookieyes',
      requester_id: 9004,
      assignee_id: null,
      organization_id: 3004,
    },
    requester: {
      id: 9004,
      name: 'Alex Rivera',
      email: 'founder@startupxyz.io',
      tickets_count: 2,
      organization: 'StartupXYZ',
      created_at: daysAgo(451),
    },
    assignee: null,
    conversation: [
      {
        id: 4001, index: 1, is_agent: false,
        author_id: 9004, author_name: 'Alex Rivera',
        body: '<p>Hi, I recently got a new phone and I no longer have access to my Google Authenticator app. I\'m completely locked out of my CookieYes account and can\'t use the backup codes either — I can\'t find them. My account email is founder@startupxyz.io. I need my 2FA reset urgently as my website\'s consent banner depends on this account. Please help as soon as possible.</p>',
        plain_body: 'Hi, I recently got a new phone and I no longer have access to my Google Authenticator app. I\'m completely locked out of my CookieYes account and can\'t use the backup codes either — I can\'t find them. My account email is founder@startupxyz.io. I need my 2FA reset urgently as my website\'s consent banner depends on this account. Please help as soon as possible.',
        created_at: daysAgo(0),
        attachments: [],
        via: { channel: 'email' },
      },
    ],
  },

  // ── #12366 — Ambiguous: "enable default consent settings" ───────────────────
  // GCM debug shows consent defaults are already correctly configured.
  // Could mean: (A) enable/verify GCM default consent — already done
  //             (B) enable "Load cookies prior to consent" in banner settings
  '12366': {
    ticket: {
      id: 12366,
      subject: 'I want to enable my default consent settings',
      description: 'I want to enable the default consent settings on my website. Can you help me set this up?',
      status: 'open', priority: 'normal',
      tags: ['gcm', 'gtm', 'technical', 'consent'],
      channel: 'web',
      created_at: daysAgo(0), updated_at: daysAgo(0),
      product: 'cookieyes', requester_id: 9066, assignee_id: null, organization_id: 3066,
    },
    requester: {
      id: 9066, name: 'James Okafor', email: 'admin@consentdemo.io',
      tickets_count: 1, organization: 'ConsentDemo', created_at: daysAgo(148),
    },
    assignee: null,
    conversation: [
      {
        id: 6601, index: 1, is_agent: false,
        author_id: 9066, author_name: 'James Okafor',
        body: '<p>Hi, I want to enable the default consent settings on my website. I have CookieYes installed with Google Tag Manager and Google Analytics 4. I just want to make sure that by default, consent is enabled for my visitors. Can you help me get this set up correctly? Our site is consentdemo.io.</p>',
        plain_body: 'Hi, I want to enable the default consent settings on my website. I have CookieYes installed with Google Tag Manager and Google Analytics 4. I just want to make sure that by default, consent is enabled for my visitors. Can you help me get this set up correctly? Our site is consentdemo.io.',
        created_at: daysAgo(0), attachments: [], via: { channel: 'web' },
      },
    ],
  },

  // ── #12365 — GCM v2 verification — all categories correct ───────────────────
  '12365': {
    ticket: {
      id: 12365,
      subject: 'Please verify our Google Consent Mode v2 setup is correct',
      description: 'We recently implemented GCM v2 with CookieYes and want to confirm everything is configured correctly before our GDPR audit next week.',
      status: 'open', priority: 'normal',
      tags: ['gcm', 'gtm', 'gdpr', 'technical', 'verification'],
      channel: 'email',
      created_at: daysAgo(0), updated_at: daysAgo(0),
      product: 'cookieyes', requester_id: 9065, assignee_id: null, organization_id: 3065,
    },
    requester: {
      id: 9065, name: 'Clara Hoffman', email: 'privacy@gcmready.io',
      tickets_count: 1, organization: 'GCMReady', created_at: daysAgo(60),
    },
    assignee: null,
    conversation: [
      {
        id: 6501, index: 1, is_agent: false,
        author_id: 9065, author_name: 'Clara Hoffman',
        body: '<p>Hi CookieYes team, we implemented Google Consent Mode v2 on our website last month using your GCM integration guide. We have an external GDPR audit coming up next week and our auditor has asked us to confirm that consent defaults are set before any tags fire, and that all six GCM v2 categories are correctly configured. Can you verify our setup at gcmready.io looks correct? We use Google Tag Manager with GA4 and Google Ads.</p>',
        plain_body: 'Hi CookieYes team, we implemented Google Consent Mode v2 on our website last month using your GCM integration guide. We have an external GDPR audit coming up next week and our auditor has asked us to confirm that consent defaults are set before any tags fire, and that all six GCM v2 categories are correctly configured. Can you verify our setup at gcmready.io looks correct? We use Google Tag Manager with GA4 and Google Ads.',
        created_at: daysAgo(0), attachments: [], via: { channel: 'email' },
      },
    ],
  },

  // ── #12370 — Cert: Tax Residency Certificate 2025 — Poland (found in Drive)
  '12370': {
    ticket: {
      id: 12370, subject: 'Tax Residency Certificate (Poland) needed for vendor onboarding',
      status: 'open', priority: 'normal',
      tags: ['certification', 'tax-residency', 'certificate', 'vendor', 'finance', 'poland'],
      description: 'Hi, we are onboarding CookieYes as a vendor in our Polish procurement system. Our finance team requires a Tax Residency Certificate for Poland for 2025 to process the payment. Could you please provide this document? We need it ASAP as our vendor registration deadline is end of this week. Thanks.',
      created_at: daysAgo(1), updated_at: daysAgo(1),
      channel: 'email', product: 'cookieyes', requester_id: 9101, assignee_id: null, organization_id: 3101,
    },
    requester: { id: 9101, name: 'Sarah Mitchell', email: 'sarah.mitchell@enterprisecorp.com', tickets_count: 2, organization: 'EnterpriseCorp Inc.', created_at: daysAgo(90) },
    assignee: null,
    conversation: [
      {
        id: 901001, index: 1, is_agent: false, author_name: 'Sarah Mitchell',
        body: '<p>Hi, we are onboarding CookieYes as a vendor in our Polish procurement system. Our finance team requires a <strong>Tax Residency Certificate for Poland (2025)</strong> to process the payment. Could you please provide this document? We need it ASAP as our vendor registration deadline is end of this week.</p>',
        plain_body: 'Hi, we are onboarding CookieYes as a vendor in our Polish procurement system. Our finance team requires a Tax Residency Certificate for Poland (2025) to process the payment. Could you please provide this document? We need it ASAP as our vendor registration deadline is end of this week.',
        created_at: daysAgo(1), attachments: [], via: { channel: 'email' },
      },
    ],
  },

  // ── #12371 — Cert: NDA request ────────────────────────────────────────────
  '12371': {
    ticket: {
      id: 12371, subject: 'Can you share your NDA for review and signing?',
      status: 'open', priority: 'normal',
      tags: ['certification', 'nda', 'legal', 'compliance', 'certificate'],
      description: 'Hi, before we proceed with our evaluation of CookieYes for our organisation, our legal team requires a signed Non-Disclosure Agreement (NDA) to be in place. Could you please share your standard NDA template so we can review it and have our legal team countersign? Thank you.',
      created_at: daysAgo(0), updated_at: daysAgo(0),
      channel: 'email', product: 'cookieyes', requester_id: 9102, assignee_id: null, organization_id: 3102,
    },
    requester: { id: 9102, name: 'Priya Mehta', email: 'legal@brightwave.io', tickets_count: 1, organization: 'BrightWave Technologies', created_at: daysAgo(30) },
    assignee: null,
    conversation: [
      {
        id: 902001, index: 1, is_agent: false, author_name: 'Priya Mehta',
        body: '<p>Hi, before we proceed with our evaluation of CookieYes, our legal team requires a signed <strong>Non-Disclosure Agreement (NDA)</strong> to be in place. Could you please share your standard NDA template so we can review and countersign it?</p>',
        plain_body: 'Hi, before we proceed with our evaluation of CookieYes, our legal team requires a signed Non-Disclosure Agreement (NDA) to be in place. Could you please share your standard NDA template so we can review and countersign it?',
        created_at: daysAgo(0), attachments: [], via: { channel: 'email' },
      },
    ],
  },

  // ── #12372 — Cert: SOC 2 Type II (available via Trust Center) ───────────
  '12372': {
    ticket: {
      id: 12372, subject: 'SOC 2 Type II Report required for security due diligence',
      status: 'open', priority: 'high',
      tags: ['certification', 'soc2', 'security-audit', 'compliance', 'certificate', 'due-diligence'],
      description: 'Hi CookieYes team, our security team is conducting a vendor risk assessment and requires the latest SOC 2 Type II report for CookieYes. This is required before we can sign our annual contract renewal. Our deadline is April 15.',
      created_at: daysAgo(2), updated_at: daysAgo(2),
      channel: 'email', product: 'cookieyes', requester_id: 9103, assignee_id: null, organization_id: 3103,
    },
    requester: { id: 9103, name: 'James Whitfield', email: 'j.whitfield@securecorp.io', tickets_count: 3, organization: 'SecureCorp Ltd', created_at: daysAgo(200) },
    assignee: null,
    conversation: [
      {
        id: 903001, index: 1, is_agent: false, author_name: 'James Whitfield',
        body: '<p>Hi, our security team is conducting a <strong>vendor risk assessment</strong> and requires the latest <strong>SOC 2 Type II report</strong> for CookieYes. Required before our annual contract renewal. Deadline: April 15.</p>',
        plain_body: 'Hi, our security team is conducting a vendor risk assessment and requires the latest SOC 2 Type II report for CookieYes. Required before our annual contract renewal. Deadline: April 15.',
        created_at: daysAgo(2), attachments: [], via: { channel: 'email' },
      },
    ],
  },

  // ── #12374 — Cert: Tax Residency — Armenia (NOT available → escalation) ───
  '12374': {
    ticket: {
      id: 12374, subject: 'Tax Residency Certificate for Armenia required — vendor registration',
      status: 'open', priority: 'normal',
      tags: ['certification', 'tax-residency', 'certificate', 'vendor', 'finance', 'armenia'],
      description: 'Hi, we are registering CookieYes as a vendor with our procurement system in Armenia. Our finance team requires a Tax Residency Certificate for Armenia for 2025. Could you please provide this document at the earliest? Our vendor onboarding deadline is next Friday.',
      created_at: daysAgo(0), updated_at: daysAgo(0),
      channel: 'email', product: 'cookieyes', requester_id: 9105, assignee_id: null, organization_id: 3105,
    },
    requester: { id: 9105, name: 'Armen Petrosyan', email: 'finance@armeniaprocure.am', tickets_count: 1, organization: 'Armenia Procurement Ltd', created_at: daysAgo(10) },
    assignee: null,
    conversation: [
      {
        id: 905001, index: 1, is_agent: false, author_name: 'Armen Petrosyan',
        body: '<p>Hi, we are registering CookieYes as a vendor in our Armenian procurement system. Our finance team requires a <strong>Tax Residency Certificate for Armenia (2025)</strong>. Could you please share this at the earliest? Deadline is next Friday.</p>',
        plain_body: 'Hi, we are registering CookieYes as a vendor in our Armenian procurement system. Our finance team requires a Tax Residency Certificate for Armenia (2025). Could you please share this at the earliest? Deadline is next Friday.',
        created_at: daysAgo(0), attachments: [], via: { channel: 'email' },
      },
    ],
  },

  // ── #12375 — Cert: SOC 1 Type I (available via Trust Center) ─────────────
  '12375': {
    ticket: {
      id: 12375, subject: 'SOC 1 Type I Report needed for financial audit',
      status: 'open', priority: 'normal',
      tags: ['certification', 'soc1', 'security-audit', 'compliance', 'certificate', 'financial-controls'],
      description: 'Hi CookieYes team, our internal audit team is conducting a financial controls review and needs the latest SOC 1 Type I report for CookieYes as part of our third-party vendor assessment. Could you please share this? Thank you.',
      created_at: daysAgo(1), updated_at: daysAgo(1),
      channel: 'email', product: 'cookieyes', requester_id: 9106, assignee_id: null, organization_id: 3106,
    },
    requester: { id: 9106, name: 'Mei Lin', email: 'audit@financegroup.sg', tickets_count: 2, organization: 'Finance Group SG', created_at: daysAgo(120) },
    assignee: null,
    conversation: [
      {
        id: 906001, index: 1, is_agent: false, author_name: 'Mei Lin',
        body: '<p>Hi, our internal audit team is conducting a financial controls review and needs the latest <strong>SOC 1 Type I report</strong> for CookieYes as part of our third-party vendor assessment. Could you please share this?</p>',
        plain_body: 'Hi, our internal audit team is conducting a financial controls review and needs the latest SOC 1 Type I report for CookieYes as part of our third-party vendor assessment. Could you please share this?',
        created_at: daysAgo(1), attachments: [], via: { channel: 'email' },
      },
    ],
  },

  // ── #12373 — Pre-sales: formal price quote request ────────────────────────
  '12373': {
    ticket: {
      id: 12373, subject: 'Price quote for CookieYes — 4 domains, Ultimate annual plan',
      status: 'open', priority: 'normal',
      tags: ['presales', 'pricing', 'quote', 'procurement', 'ultimate'],
      description: 'Hi, we are evaluating CookieYes for our organisation and have decided to proceed with the Ultimate annual plan for 4 of our websites. Our procurement team requires a formal price quote document to process the purchase order. Could you please send us an official quote? Our procurement contact is Carlos Santos (csantos@transre.com).',
      created_at: daysAgo(0), updated_at: daysAgo(0),
      channel: 'email', product: 'cookieyes', requester_id: 9104, assignee_id: null, organization_id: 3104,
    },
    requester: { id: 9104, name: 'Carlos Santos', email: 'csantos@transre.com', tickets_count: 1, organization: 'TransRe Global', created_at: daysAgo(0) },
    assignee: null,
    conversation: [
      {
        id: 904001, index: 1, is_agent: false, author_name: 'Carlos Santos',
        body: '<p>Hi, we have evaluated CookieYes and would like to proceed with the <strong>Ultimate plan (annual billing)</strong> for <strong>4 domains</strong>. Our procurement team requires a formal price quote to raise a purchase order internally. Could you send us an official quote? Contact: Carlos Santos, csantos@transre.com.</p>',
        plain_body: 'Hi, we have evaluated CookieYes and would like to proceed with the Ultimate plan (annual billing) for 4 domains. Our procurement team requires a formal price quote to raise a purchase order internally. Could you send us an official quote? Contact: Carlos Santos, csantos@transre.com.',
        created_at: daysAgo(0), attachments: [], via: { channel: 'email' },
      },
    ],
  },

  // ── #12356 — Pre-sales: remove branding / white-label (Ultimate feature) ──
  '12356': {
    ticket: {
      id: 12356, subject: 'How do I remove the "Powered by CookieYes" branding from our banner?',
      status: 'new', priority: 'normal',
      tags: ['presales', 'branding', 'white-label', 'ultimate', 'upgrade'],
      description: 'We are a luxury e-commerce brand and the "Powered by CookieYes" text in the footer of our consent banner does not match our brand guidelines. Is it possible to remove it? We are currently on the Basic plan.',
      created_at: daysAgo(0), updated_at: daysAgo(0),
      channel: 'web', product: 'cookieyes', requester_id: 9105, assignee_id: null, organization_id: null,
    },
    requester: { id: 9105, name: 'Sophie Laurent', email: 'hello@maisonluxe.fr', tickets_count: 1, organization: 'Maison Luxe', created_at: daysAgo(0) },
    assignee: null,
    conversation: [
      {
        id: 905001, index: 1, is_agent: false, author_name: 'Sophie Laurent',
        body: '<p>Hello,\n\nWe run a luxury fashion e-commerce store and we are using CookieYes for our cookie consent banner. However, we have noticed there is a "Powered by CookieYes" text in the footer of the banner.\n\nOur brand guidelines require all elements on the website to be unbranded or carry only our own logo. Is it possible to remove this CookieYes branding from the banner?\n\nWe are currently on the Basic plan. Would we need to upgrade to remove it, and if so, what would the cost be?\n\nThank you,\nSophie Laurent\nMaison Luxe</p>',
        plain_body: 'Hello, we are on the Basic plan and want to remove the "Powered by CookieYes" branding from our consent banner. Our luxury brand guidelines require unbranded elements. Would we need to upgrade? What would it cost?',
        created_at: daysAgo(0), attachments: [], via: { channel: 'web' },
      },
    ],
  },
};

// ─── Route ────────────────────────────────────────────────────────────────────

ticketRouter.get('/:id', async (req, res) => {
  const { id } = req.params;

  // Serve demo tickets without hitting Zendesk
  if (DEMO_TICKETS[id]) {
    res.json(DEMO_TICKETS[id]);
    return;
  }

  const sub = process.env.ZENDESK_SUBDOMAIN;
  if (!sub) { res.status(500).json({ error: 'ZENDESK_SUBDOMAIN not set' }); return; }

  try {
    const base = `https://${sub}.zendesk.com/api/v2`;
    const headers = { Authorization: zendeskAuth(), 'Content-Type': 'application/json' };

    const [ticketRes, commentsRes] = await Promise.all([
      axios.get(`${base}/tickets/${id}.json`, { headers }),
      axios.get(`${base}/tickets/${id}/comments.json`, { headers }),
    ]);

    const ticket = ticketRes.data.ticket;
    const comments = commentsRes.data.comments;

    const [requesterRes, assigneeRes] = await Promise.all([
      axios.get(`${base}/users/${ticket.requester_id}.json`, { headers }),
      ticket.assignee_id
        ? axios.get(`${base}/users/${ticket.assignee_id}.json`, { headers })
        : Promise.resolve(null),
    ]);

    const conversation = comments.map((c: Record<string, unknown>, i: number) => ({
      ...c,
      index: i + 1,
      is_agent: (c.author_id as number) !== ticket.requester_id,
      author_name: (c.author_id as number) === ticket.requester_id
        ? requesterRes.data.user.name
        : assigneeRes?.data?.user?.name || 'Agent',
    }));

    res.json({
      ticket,
      requester: requesterRes.data.user,
      assignee: assigneeRes?.data?.user || null,
      conversation,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ error: 'Failed to fetch ticket', detail: message });
  }
});
