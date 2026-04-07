export interface Account {
  id: string;
  billing_email: string;
  plan: 'Free' | 'Starter' | 'Professional' | 'Business' | 'AppSumo';
  plan_status: 'active' | 'cancelled' | 'past_due';
  billing_cycle: 'monthly' | 'annual';
  next_billing_date: string;
  domain: string;
  banner_active: boolean;
  banner_version: string;
  gcm_enabled: boolean;
  scanner_last_run: string;
  cookies_detected: number;
  regulation: 'GDPR' | 'CCPA' | 'US State' | 'Custom';
  consent_template?: 'GDPR' | 'CCPA' | 'GDPR & US State Laws';
  iab_tcf_enabled?: boolean;
  geo_target?: 'worldwide' | 'eu_and_uk' | 'select_countries';
  appsumo_deal: boolean;
  created_at: string;
  product: string;
  organization_name?: string;
  pageviews?: {
    views: number;
    limit: number;
    billing_cycle: { start: string; end: string };
  };
  scan_history?: ScanRecord[];
  cookie_list?: CookieDetail[];

  // Extended admin fields
  website?: WebsiteDetails;
  email_activity?: EmailActivity[];
  scan_overview?: ScanOverview;
  two_factor?: TwoFactorInfo;
  deletion_info?: DeletionInfo;
}

export interface ScanRecord {
  scan_date: string;
  scan_status: 'completed' | 'failed' | 'running';
  urls_scanned: number;
  categories: number;
  cookies: number;
  scripts: number;
  failed_reason?: string | null;
  scanned_urls?: string[];
}

export interface CookieDetail {
  name: string;
  category: string;
  domain: string;
  duration: string;
  description?: string;
  script_url_pattern?: string;
  type: 'first_party' | 'third_party';
}

export interface WebsiteDetails {
  cms: 'WordPress' | 'Shopify' | 'Webflow' | 'Wix' | 'Custom' | 'Unknown';
  script_installed: boolean;
  script_version: string;
  last_consent_logged: string;
  auto_block: boolean;
  geo_targeting: boolean;
  subdomains: string[];
  consent_rate_percent: number;
}

export interface EmailActivity {
  type: 'welcome' | 'invoice' | 'upgrade' | 'downgrade' | 'password_reset' | 'scan_complete' | 'banner_alert' | 'payment_failed' | 'trial_ending' | '2fa_reset';
  subject: string;
  sent_at: string;
  delivered: boolean;
  opened: boolean;
}

export interface ScanOverview {
  total_scans: number;
  last_scan_status: 'completed' | 'failed' | 'running';
  cookies_by_category: Record<string, number>;
  avg_cookies_per_scan: number;
  domains_scanned: string[];
  next_scheduled_scan: string | null;
}

export interface TwoFactorInfo {
  enabled: boolean;
  method: 'totp' | 'email' | null;
  last_enabled_at: string | null;
  last_reset_at: string | null;
  reset_requested: boolean;
  reset_requested_at: string | null;
  backup_codes_remaining: number;
}

export interface DeletionInfo {
  deletion_requested: boolean;
  requested_at: string | null;
  scheduled_deletion_at: string | null;
  reason: string | null;
  data_export_completed: boolean;
  gdpr_erasure_requested: boolean;
  cancellation_reason?: string;
}
