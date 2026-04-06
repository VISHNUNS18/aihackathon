export interface ScriptCheck {
  check: string;
  pass: boolean;
  detail: string;
}

export interface ConflictingPlugin {
  name: string;
  type: 'caching' | 'minification' | 'cdn' | 'tag_manager' | 'conflict_cmp' | 'security' | 'other';
  signatures: string[];
  detected: boolean;
  fix: string;
}

export interface SiteDebugReport {
  domain: string;
  final_url: string;
  checked_at: string;
  status_code: number | null;
  load_time_ms: number | null;
  is_https: boolean;
  cms_detected: string;

  // Script
  script_installed: boolean;
  script_src: string | null;
  script_position: 'head' | 'body' | 'unknown';
  script_has_async: boolean;
  script_has_defer: boolean;

  // Banner & consent
  banner_detected: boolean;
  consent_cookie_present: boolean;
  total_scripts_on_page: number;

  // Checks
  script_checks: ScriptCheck[];
  passed_checks: number;
  total_checks: number;

  // Conflicts
  conflicting_plugins: ConflictingPlugin[];
  detected_conflict_count: number;

  // Verdict
  verdict: 'ok' | 'conflict' | 'script_missing' | 'error';
  recommended_fix: string | null;
  console_errors: string[];
}
