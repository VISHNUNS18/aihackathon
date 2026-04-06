import { Router } from 'express';
import Stripe from 'stripe';

export const stripeRouter = Router();

const DAY = 86400;
const now = Math.floor(Date.now() / 1000);

// ─── Refund eligibility (mirrors frontend lib/refundEligibility.ts) ────────────

interface RefundCheck { pass: boolean | null; label: string; detail: string; }

function computeRefundEligibility(
  charges: MappedCharge[],
  subscriptions: MappedSubscription[],
  isAppSumo: boolean,
) {
  const checks: RefundCheck[] = [];
  const lastCharge = charges.find((c) => c.status === 'succeeded');
  const daysSince = lastCharge
    ? Math.floor((Date.now() / 1000 - lastCharge.created) / DAY)
    : 999;
  const sub = subscriptions[0];
  const isAnnual = sub?.items[0]?.price?.recurring?.interval === 'year';
  const succeededCharges = charges.filter((c) => c.status === 'succeeded');
  const isDuplicate =
    succeededCharges.length > 1 &&
    succeededCharges.slice(0, 2).every((c) =>
      Math.abs(c.created - succeededCharges[0].created) < 3600,
    );

  checks.push({
    pass: !isAppSumo,
    label: 'Not an AppSumo deal',
    detail: isAppSumo
      ? 'AppSumo deals are non-refundable. Redirect to support@appsumo.com'
      : 'Not an AppSumo account',
  });
  checks.push({
    pass: isDuplicate ? true : isAnnual ? daysSince <= 14 : daysSince <= 30,
    label: isAnnual ? 'Within 14-day annual refund window' : 'Within 30-day monthly refund window',
    detail: `${daysSince} days since last charge`,
  });
  checks.push({
    pass: !lastCharge?.refunded,
    label: 'Not already refunded',
    detail: lastCharge?.refunded ? 'A refund was already issued on this charge' : 'No prior refund',
  });
  if (isDuplicate) {
    checks.push({ pass: true, label: 'Duplicate charge detected', detail: 'Always eligible for refund' });
  }

  const allPassed = checks.every((c) => c.pass !== false);
  const appsumoFail = checks.find((c) => c.label.includes('AppSumo') && !c.pass);

  return {
    eligible: allPassed,
    reason: appsumoFail
      ? 'AppSumo deal — non-refundable'
      : allPassed ? 'All conditions met' : 'Outside refund window or already refunded',
    daysSinceCharge: daysSince,
    checks,
    verdict: appsumoFail ? 'REDIRECT TO APPSUMO' : allPassed ? 'ELIGIBLE FOR REFUND' : 'NOT ELIGIBLE',
    verdictType: appsumoFail ? 'no' : allPassed ? 'ok' : 'no',
  };
}

// ─── Mapped types (what the frontend StripeCustomer type expects) ─────────────

interface MappedCharge {
  id: string; amount: number; currency: string;
  status: 'succeeded' | 'pending' | 'failed';
  created: number; description: string; refunded: boolean; amount_refunded: number;
  payment_method_details?: { card?: { brand: string; last4: string } };
  failure_reason?: string;
}

interface MappedSubscription {
  id: string; status: string;
  current_period_start: number; current_period_end: number;
  cancel_at_period_end: boolean; canceled_at: number | null;
  items: Array<{
    id: string;
    price: { id: string; unit_amount: number; currency: string; recurring: { interval: string; interval_count: number } | null; product: string };
    quantity: number;
  }>;
  metadata: Record<string, string>;
}

interface MappedInvoice {
  id: string; number: string;
  status: 'draft' | 'open' | 'paid' | 'uncollectible' | 'void';
  amount_due: number; amount_paid: number; amount_remaining: number; currency: string;
  created: number; period_start: number; period_end: number;
  subscription: string | null; hosted_invoice_url: string;
  discount: null | { coupon: { id: string; name: string; percent_off: number | null; amount_off: number | null } };
  tax: number | null;
  lines: Array<{ id: string; description: string; amount: number; currency: string; period: { start: number; end: number } }>;
  // Extended fields for support context
  failure_reason?: string;
  attempt_count?: number;
  next_payment_attempt?: number | null;
}

// ─── Mock Stripe scenarios ────────────────────────────────────────────────────
// One scenario per billing email. Each covers a distinct support case.

type StripeScenario = {
  customer: { id: string; email: string; name: string; created: number; currency: string; balance: number };
  subscriptions: MappedSubscription[];
  invoices: MappedInvoice[];
  charges: MappedCharge[];
};

const STRIPE_SCENARIOS: Record<string, StripeScenario> = {

  // ── 1. billing@techcorp.io — ACTIVE + REFUND ELIGIBLE (annual, 10 days ago) ─
  'billing@techcorp.io': {
    customer: { id: 'cus_tech_001', email: 'billing@techcorp.io', name: 'TechCorp Solutions', created: now - 730 * DAY, currency: 'usd', balance: 0 },
    subscriptions: [{
      id: 'sub_tech_001',
      status: 'active',
      current_period_start: now - 10 * DAY,
      current_period_end: now + 355 * DAY,
      cancel_at_period_end: false,
      canceled_at: null,
      items: [{
        id: 'si_tech_001',
        price: { id: 'price_professional_annual', unit_amount: 79900, currency: 'usd', recurring: { interval: 'year', interval_count: 1 }, product: 'CookieYes Professional' },
        quantity: 1,
      }],
      metadata: { plan: 'Professional', source: 'direct' },
    }],
    invoices: [
      {
        id: 'in_tech_001',
        number: 'INV-2026-PRO-001',
        status: 'paid',
        amount_due: 79900, amount_paid: 79900, amount_remaining: 0,
        currency: 'usd',
        created: now - 10 * DAY,
        period_start: now - 10 * DAY, period_end: now + 355 * DAY,
        subscription: 'sub_tech_001',
        hosted_invoice_url: 'https://invoice.stripe.com/i/acct_tech/inv_001',
        discount: null, tax: null,
        lines: [{ id: 'il_tech_001', description: 'CookieYes Professional Annual', amount: 79900, currency: 'usd', period: { start: now - 10 * DAY, end: now + 355 * DAY } }],
      },
      {
        id: 'in_tech_000',
        number: 'INV-2025-PRO-012',
        status: 'paid',
        amount_due: 79900, amount_paid: 79900, amount_remaining: 0,
        currency: 'usd',
        created: now - 375 * DAY,
        period_start: now - 375 * DAY, period_end: now - 10 * DAY,
        subscription: 'sub_tech_001',
        hosted_invoice_url: 'https://invoice.stripe.com/i/acct_tech/inv_000',
        discount: null, tax: null,
        lines: [{ id: 'il_tech_000', description: 'CookieYes Professional Annual', amount: 79900, currency: 'usd', period: { start: now - 375 * DAY, end: now - 10 * DAY } }],
      },
    ],
    charges: [
      { id: 'ch_tech_001', amount: 79900, currency: 'usd', status: 'succeeded', created: now - 10 * DAY, description: 'CookieYes Professional Annual', refunded: false, amount_refunded: 0, payment_method_details: { card: { brand: 'visa', last4: '4242' } } },
      { id: 'ch_tech_000', amount: 79900, currency: 'usd', status: 'succeeded', created: now - 375 * DAY, description: 'CookieYes Professional Annual', refunded: false, amount_refunded: 0, payment_method_details: { card: { brand: 'visa', last4: '4242' } } },
    ],
  },

  // ── 2. admin@shopnow.com — PAYMENT FAILED (card_declined, 3 attempts) ───────
  'admin@shopnow.com': {
    customer: { id: 'cus_shop_002', email: 'admin@shopnow.com', name: 'ShopNow Ltd.', created: now - 520 * DAY, currency: 'usd', balance: -19900 },
    subscriptions: [{
      id: 'sub_shop_002',
      status: 'past_due',
      current_period_start: now - 3 * DAY,
      current_period_end: now + 27 * DAY,
      cancel_at_period_end: false,
      canceled_at: null,
      items: [{
        id: 'si_shop_002',
        price: { id: 'price_business_monthly', unit_amount: 19900, currency: 'usd', recurring: { interval: 'month', interval_count: 1 }, product: 'CookieYes Business' },
        quantity: 1,
      }],
      metadata: { plan: 'Business', source: 'direct' },
    }],
    invoices: [
      {
        id: 'in_shop_002',
        number: 'INV-2026-BIZ-039',
        status: 'open',
        amount_due: 19900, amount_paid: 0, amount_remaining: 19900,
        currency: 'usd',
        created: now - 3 * DAY,
        period_start: now - 3 * DAY, period_end: now + 27 * DAY,
        subscription: 'sub_shop_002',
        hosted_invoice_url: 'https://invoice.stripe.com/i/acct_shop/inv_039',
        discount: null, tax: null,
        failure_reason: 'card_declined',
        attempt_count: 3,
        next_payment_attempt: now + 4 * DAY,
        lines: [{ id: 'il_shop_002', description: 'CookieYes Business Monthly', amount: 19900, currency: 'usd', period: { start: now - 3 * DAY, end: now + 27 * DAY } }],
      },
      {
        id: 'in_shop_001',
        number: 'INV-2026-BIZ-038',
        status: 'paid',
        amount_due: 19900, amount_paid: 19900, amount_remaining: 0,
        currency: 'usd',
        created: now - 33 * DAY,
        period_start: now - 33 * DAY, period_end: now - 3 * DAY,
        subscription: 'sub_shop_002',
        hosted_invoice_url: 'https://invoice.stripe.com/i/acct_shop/inv_038',
        discount: null, tax: null,
        lines: [{ id: 'il_shop_001', description: 'CookieYes Business Monthly', amount: 19900, currency: 'usd', period: { start: now - 33 * DAY, end: now - 3 * DAY } }],
      },
    ],
    charges: [
      { id: 'ch_shop_003', amount: 19900, currency: 'usd', status: 'failed', created: now - 1 * DAY, description: 'CookieYes Business Monthly (attempt 3)', refunded: false, amount_refunded: 0, payment_method_details: { card: { brand: 'mastercard', last4: '0001' } }, failure_reason: 'card_declined' },
      { id: 'ch_shop_002', amount: 19900, currency: 'usd', status: 'failed', created: now - 2 * DAY, description: 'CookieYes Business Monthly (attempt 2)', refunded: false, amount_refunded: 0, payment_method_details: { card: { brand: 'mastercard', last4: '0001' } }, failure_reason: 'card_declined' },
      { id: 'ch_shop_001', amount: 19900, currency: 'usd', status: 'failed', created: now - 3 * DAY, description: 'CookieYes Business Monthly (attempt 1)', refunded: false, amount_refunded: 0, payment_method_details: { card: { brand: 'mastercard', last4: '0001' } }, failure_reason: 'card_declined' },
      { id: 'ch_shop_000', amount: 19900, currency: 'usd', status: 'succeeded', created: now - 33 * DAY, description: 'CookieYes Business Monthly', refunded: false, amount_refunded: 0, payment_method_details: { card: { brand: 'mastercard', last4: '0001' } } },
    ],
  },

  // ── 3. contact@designstudio.co — ACTIVE but OUTSIDE 30-day refund window ────
  'contact@designstudio.co': {
    customer: { id: 'cus_design_003', email: 'contact@designstudio.co', name: 'Design Studio Co', created: now - 265 * DAY, currency: 'usd', balance: 0 },
    subscriptions: [{
      id: 'sub_design_003',
      status: 'active',
      current_period_start: now - 35 * DAY,
      current_period_end: now + -5 * DAY,
      cancel_at_period_end: false,
      canceled_at: null,
      items: [{
        id: 'si_design_003',
        price: { id: 'price_starter_monthly', unit_amount: 2900, currency: 'usd', recurring: { interval: 'month', interval_count: 1 }, product: 'CookieYes Starter' },
        quantity: 1,
      }],
      metadata: { plan: 'Starter' },
    }],
    invoices: [
      {
        id: 'in_design_003',
        number: 'INV-2026-STR-022',
        status: 'paid',
        amount_due: 2900, amount_paid: 2900, amount_remaining: 0,
        currency: 'usd',
        created: now - 35 * DAY,
        period_start: now - 35 * DAY, period_end: now - 5 * DAY,
        subscription: 'sub_design_003',
        hosted_invoice_url: 'https://invoice.stripe.com/i/acct_design/inv_022',
        discount: null, tax: null,
        lines: [{ id: 'il_design_003', description: 'CookieYes Starter Monthly', amount: 2900, currency: 'usd', period: { start: now - 35 * DAY, end: now - 5 * DAY } }],
      },
      {
        id: 'in_design_002',
        number: 'INV-2026-STR-021',
        status: 'paid',
        amount_due: 2900, amount_paid: 2900, amount_remaining: 0,
        currency: 'usd',
        created: now - 65 * DAY,
        period_start: now - 65 * DAY, period_end: now - 35 * DAY,
        subscription: 'sub_design_003',
        hosted_invoice_url: 'https://invoice.stripe.com/i/acct_design/inv_021',
        discount: null, tax: null,
        lines: [{ id: 'il_design_002', description: 'CookieYes Starter Monthly', amount: 2900, currency: 'usd', period: { start: now - 65 * DAY, end: now - 35 * DAY } }],
      },
    ],
    charges: [
      { id: 'ch_design_002', amount: 2900, currency: 'usd', status: 'succeeded', created: now - 35 * DAY, description: 'CookieYes Starter Monthly', refunded: false, amount_refunded: 0, payment_method_details: { card: { brand: 'visa', last4: '5678' } } },
      { id: 'ch_design_001', amount: 2900, currency: 'usd', status: 'succeeded', created: now - 65 * DAY, description: 'CookieYes Starter Monthly', refunded: false, amount_refunded: 0, payment_method_details: { card: { brand: 'visa', last4: '5678' } } },
    ],
  },

  // ── 4. founder@startupxyz.io — APPSUMO lifetime, non-refundable ──────────────
  'founder@startupxyz.io': {
    customer: { id: 'cus_appsumo_004', email: 'founder@startupxyz.io', name: 'StartupXYZ', created: now - 451 * DAY, currency: 'usd', balance: 0 },
    subscriptions: [],
    invoices: [
      {
        id: 'in_appsumo_004',
        number: 'APPSUMO-2024-001',
        status: 'paid',
        amount_due: 6900, amount_paid: 6900, amount_remaining: 0,
        currency: 'usd',
        created: now - 451 * DAY,
        period_start: now - 451 * DAY, period_end: now + 999 * DAY,
        subscription: null,
        hosted_invoice_url: '',
        discount: null, tax: null,
        lines: [{ id: 'il_appsumo_004', description: 'CookieYes Lifetime Deal via AppSumo', amount: 6900, currency: 'usd', period: { start: now - 451 * DAY, end: now + 999 * DAY } }],
      },
    ],
    charges: [
      { id: 'ch_appsumo_004', amount: 6900, currency: 'usd', status: 'succeeded', created: now - 451 * DAY, description: 'AppSumo Lifetime Deal', refunded: false, amount_refunded: 0, payment_method_details: { card: { brand: 'amex', last4: '8888' } } },
    ],
  },

  // ── 5. accounts@globalretail.net — CANCELLED, last invoice unpaid ────────────
  'accounts@globalretail.net': {
    customer: { id: 'cus_retail_005', email: 'accounts@globalretail.net', name: 'Global Retail Inc.', created: now - 1050 * DAY, currency: 'usd', balance: 9900 },
    subscriptions: [{
      id: 'sub_retail_005',
      status: 'canceled',
      current_period_start: now - 45 * DAY,
      current_period_end: now - 15 * DAY,
      cancel_at_period_end: false,
      canceled_at: now - 15 * DAY,
      items: [{
        id: 'si_retail_005',
        price: { id: 'price_professional_monthly', unit_amount: 9900, currency: 'usd', recurring: { interval: 'month', interval_count: 1 }, product: 'CookieYes Professional' },
        quantity: 1,
      }],
      metadata: { plan: 'Professional', cancelled_reason: 'customer_request' },
    }],
    invoices: [
      {
        id: 'in_retail_005b',
        number: 'INV-2026-PRO-041',
        status: 'uncollectible',
        amount_due: 9900, amount_paid: 0, amount_remaining: 9900,
        currency: 'usd',
        created: now - 45 * DAY,
        period_start: now - 45 * DAY, period_end: now - 15 * DAY,
        subscription: 'sub_retail_005',
        hosted_invoice_url: 'https://invoice.stripe.com/i/acct_retail/inv_041',
        discount: null, tax: null,
        failure_reason: 'card_declined',
        attempt_count: 4,
        next_payment_attempt: null,
        lines: [{ id: 'il_retail_005b', description: 'CookieYes Professional Monthly', amount: 9900, currency: 'usd', period: { start: now - 45 * DAY, end: now - 15 * DAY } }],
      },
      {
        id: 'in_retail_005a',
        number: 'INV-2026-PRO-040',
        status: 'paid',
        amount_due: 9900, amount_paid: 9900, amount_remaining: 0,
        currency: 'usd',
        created: now - 75 * DAY,
        period_start: now - 75 * DAY, period_end: now - 45 * DAY,
        subscription: 'sub_retail_005',
        hosted_invoice_url: 'https://invoice.stripe.com/i/acct_retail/inv_040',
        discount: null, tax: null,
        lines: [{ id: 'il_retail_005a', description: 'CookieYes Professional Monthly', amount: 9900, currency: 'usd', period: { start: now - 75 * DAY, end: now - 45 * DAY } }],
      },
    ],
    charges: [
      { id: 'ch_retail_004', amount: 9900, currency: 'usd', status: 'failed', created: now - 45 * DAY, description: 'CookieYes Professional Monthly (attempt 4)', refunded: false, amount_refunded: 0, payment_method_details: { card: { brand: 'visa', last4: '9999' } }, failure_reason: 'card_declined' },
      { id: 'ch_retail_003', amount: 9900, currency: 'usd', status: 'succeeded', created: now - 75 * DAY, description: 'CookieYes Professional Monthly', refunded: false, amount_refunded: 0, payment_method_details: { card: { brand: 'visa', last4: '9999' } } },
    ],
  },
};

// ─── Stripe SDK mappers (for real API calls) ──────────────────────────────────

function mapSubscription(s: Stripe.Subscription) {
  return {
    id: s.id,
    status: s.status,
    current_period_start: s.current_period_start,
    current_period_end: s.current_period_end,
    cancel_at_period_end: s.cancel_at_period_end,
    canceled_at: s.canceled_at ?? null,
    items: s.items.data.map((item) => ({
      id: item.id,
      price: {
        id: item.price.id,
        unit_amount: item.price.unit_amount ?? 0,
        currency: item.price.currency,
        recurring: item.price.recurring
          ? { interval: item.price.recurring.interval, interval_count: item.price.recurring.interval_count }
          : null,
        product: typeof item.price.product === 'string' ? item.price.product : item.price.product.id,
      },
      quantity: item.quantity ?? 1,
    })),
    metadata: s.metadata,
  };
}

function mapInvoice(inv: Stripe.Invoice) {
  return {
    id: inv.id,
    number: inv.number ?? '',
    status: inv.status,
    amount_due: inv.amount_due,
    amount_paid: inv.amount_paid,
    amount_remaining: inv.amount_remaining,
    currency: inv.currency,
    created: inv.created,
    period_start: inv.period_start,
    period_end: inv.period_end,
    subscription: typeof inv.subscription === 'string' ? inv.subscription : inv.subscription?.id ?? null,
    hosted_invoice_url: inv.hosted_invoice_url ?? '',
    discount: inv.discount
      ? { coupon: { id: inv.discount.coupon.id, name: inv.discount.coupon.name ?? '', percent_off: inv.discount.coupon.percent_off ?? null, amount_off: inv.discount.coupon.amount_off ?? null } }
      : null,
    tax: inv.tax ?? null,
    lines: inv.lines.data.map((l) => ({
      id: l.id,
      description: l.description ?? '',
      amount: l.amount,
      currency: l.currency,
      period: { start: l.period.start, end: l.period.end },
    })),
  };
}

function mapCharge(c: Stripe.Charge) {
  return {
    id: c.id,
    amount: c.amount,
    currency: c.currency,
    status: c.status,
    created: c.created,
    description: c.description ?? '',
    refunded: c.refunded,
    amount_refunded: c.amount_refunded,
    payment_method_details: c.payment_method_details?.card
      ? { card: { brand: c.payment_method_details.card.brand ?? '', last4: c.payment_method_details.card.last4 ?? '' } }
      : undefined,
  };
}

// ─── Route ────────────────────────────────────────────────────────────────────

stripeRouter.get('/customer', async (req, res) => {
  const { email } = req.query;
  if (!email) { res.status(400).json({ error: 'email required' }); return; }

  const emailStr = String(email);
  const stripeKey = process.env.STRIPE_SECRET_KEY;

  // ── Mock path (no real key or placeholder) ───────────────────────────────────
  if (!stripeKey || stripeKey.includes('xxxx')) {
    const scenario = STRIPE_SCENARIOS[emailStr];

    if (!scenario) {
      res.status(404).json({ error: 'No Stripe customer found for this email' });
      return;
    }

    const isAppSumo = scenario.customer.id.includes('appsumo');
    const refundEligibility = computeRefundEligibility(
      scenario.charges,
      scenario.subscriptions,
      isAppSumo,
    );

    res.json({ ...scenario.customer, ...scenario, refundEligibility });
    return;
  }

  // ── Real Stripe path ──────────────────────────────────────────────────────────
  try {
    const stripe = new Stripe(stripeKey);
    const customers = await stripe.customers.search({ query: `email:'${emailStr}'` });
    const customer = customers.data[0];
    if (!customer) { res.status(404).json({ error: 'No Stripe customer found' }); return; }

    const [subsRes, invoicesRes, chargesRes] = await Promise.all([
      stripe.subscriptions.list({ customer: customer.id, limit: 5 }),
      stripe.invoices.list({ customer: customer.id, limit: 10 }),
      stripe.charges.list({ customer: customer.id, limit: 20 }),
    ]);

    const mappedCharges = chargesRes.data.map(mapCharge);
    const mappedSubs = subsRes.data.map(mapSubscription);
    const isAppSumo = customer.metadata?.source === 'appsumo';
    const refundEligibility = computeRefundEligibility(mappedCharges, mappedSubs, isAppSumo);

    res.json({
      id: customer.id,
      email: customer.email ?? '',
      name: customer.name ?? '',
      created: customer.created,
      currency: customer.currency ?? 'usd',
      balance: customer.balance,
      subscriptions: mappedSubs,
      invoices: invoicesRes.data.map(mapInvoice),
      charges: mappedCharges,
      refundEligibility,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ error: 'Stripe lookup failed', detail: message });
  }
});
