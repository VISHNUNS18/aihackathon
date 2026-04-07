export type CertDocType =
  | 'tax_residency'
  | 'incorporation'
  | 'msme'
  | 'pan_card'
  | 'iso_27001'
  | 'soc1'
  | 'soc2'
  | 'dpa'
  | 'financial_statement'
  | 'vat_certificate'
  | 'nda'
  | 'mod_rfi'
  | 'other';

export interface CertDocument {
  id: string;
  type: CertDocType;
  name: string;
  country?: string;
  year?: number;
  issued_by: string;
  filename: string;
  drive_url: string;
  trust_center_url?: string;    // SOC 1 / SOC 2 — link to Trust Center instead of Drive
  signing_required?: boolean;   // NDA — customer must sign
  expires_at?: string | null;
  size_kb?: number;
}

export interface CertSearchResult {
  found: boolean;
  query: string;
  detected_type: CertDocType | null;
  document?: CertDocument;
}

export interface CertEscalationResult {
  slack_posted: boolean;
  email_sent: boolean;
  slack_channel: string;
  email_to: string;
  reference_id: string;
}
