export interface StripeCustomer {
  id: string;
  email: string;
  name: string;
  created: number;
  currency: string;
  balance: number;
  subscriptions: Subscription[];
  invoices: Invoice[];
  charges: Charge[];
  refundEligibility: RefundEligibility;
}

export interface Subscription {
  id: string;
  status: string;
  current_period_start: number;
  current_period_end: number;
  cancel_at_period_end: boolean;
  canceled_at: number | null;
  items: SubscriptionItem[];
  metadata: Record<string, string>;
}

export interface SubscriptionItem {
  id: string;
  price: {
    id: string;
    unit_amount: number;
    currency: string;
    recurring: { interval: 'month' | 'year'; interval_count: number };
    product: string;
  };
  quantity: number;
}

export interface Invoice {
  id: string;
  number: string;
  status: 'draft' | 'open' | 'paid' | 'uncollectible' | 'void';
  amount_due: number;
  amount_paid: number;
  amount_remaining: number;
  currency: string;
  created: number;
  period_start: number;
  period_end: number;
  subscription: string | null;
  hosted_invoice_url: string;
  discount: Discount | null;
  tax: number | null;
  lines: InvoiceLine[];
}

export interface InvoiceLine {
  id: string;
  description: string;
  amount: number;
  currency: string;
  period: { start: number; end: number };
}

export interface Discount {
  coupon: { id: string; name: string; percent_off: number | null; amount_off: number | null };
}

export interface Charge {
  id: string;
  amount: number;
  currency: string;
  status: 'succeeded' | 'pending' | 'failed';
  created: number;
  description: string;
  refunded: boolean;
  amount_refunded: number;
  payment_method_details?: { card?: { brand: string; last4: string } };
}

export interface RefundEligibility {
  eligible: boolean;
  reason: string;
  daysSinceCharge: number;
  checks: RefundCheck[];
  verdict: string;
  verdictType: 'ok' | 'no' | 'warn';
}

export interface RefundCheck {
  pass: boolean | null;
  label: string;
  detail: string;
}
