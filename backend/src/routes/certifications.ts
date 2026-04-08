import { Router } from 'express';

export const certificationsRouter = Router();

// ─── Mock Google Drive — CookieYes common certifications ─────────────────────
// In production replace with Google Drive API using a service account.

interface CertDoc {
  id: string;
  type: string;
  name: string;
  country?: string;
  year?: number;
  issued_by: string;
  filename: string;
  drive_url: string;
  trust_center_url?: string;    // if set, link to Trust Center instead of Drive
  signing_required?: boolean;   // if true, customer must sign (NDA flow)
  expires_at: string | null;
  size_kb: number;
  keywords: string[];
}

const CERT_LIBRARY: CertDoc[] = [
  // ── Tax Residency — UK ────────────────────────────────────────────────────
  {
    id: 'cert_tr_uk_2025',
    type: 'tax_residency',
    name: 'Tax Residency Certificate 2025 — United Kingdom',
    country: 'United Kingdom',
    year: 2025,
    issued_by: 'HM Revenue & Customs (HMRC)',
    filename: 'CookieYes_TaxResidency_UK_2025.pdf',
    drive_url: 'https://drive.google.com/file/d/1qXoYk_taxres_uk_2025_demo/view?usp=sharing',
    expires_at: '2025-12-31',
    size_kb: 142,
    keywords: ['tax residency', 'tax residence', 'residency certificate', 'trc', 'tax certificate', 'tax cert', '2025', 'uk', 'united kingdom', 'hmrc'],
  },
  // ── Tax Residency — Poland ────────────────────────────────────────────────
  {
    id: 'cert_tr_pl_2025',
    type: 'tax_residency',
    name: 'Tax Residency Certificate 2025 — Poland',
    country: 'Poland',
    year: 2025,
    issued_by: 'Urząd Skarbowy (Polish Tax Authority)',
    filename: 'CookieYes_TaxResidency_Poland_2025.pdf',
    drive_url: 'https://drive.google.com/file/d/1qXoYk_taxres_pl_2025_demo/view?usp=sharing',
    expires_at: '2025-12-31',
    size_kb: 156,
    keywords: ['tax residency', 'tax residence', 'residency certificate', 'trc', 'tax cert', 'poland', 'pl', 'polish', '2025'],
  },
  // NOTE: Armenia TRC is NOT in the library — queries for Armenia will not be found → escalation
  // ── Certificate of Incorporation ──────────────────────────────────────────
  {
    id: 'cert_inc',
    type: 'incorporation',
    name: 'Certificate of Incorporation',
    issued_by: 'Companies House, United Kingdom',
    filename: 'CookieYes_Certificate_of_Incorporation.pdf',
    drive_url: 'https://drive.google.com/file/d/1qXoYk_inc_demo/view?usp=sharing',
    expires_at: null,
    size_kb: 211,
    keywords: ['incorporation', 'certificate of incorporation', 'company registration', 'coi', 'company cert', 'registered company'],
  },
  // ── MSME ─────────────────────────────────────────────────────────────────
  {
    id: 'cert_msme',
    type: 'msme',
    name: 'MSME / Udyam Registration Certificate',
    issued_by: 'Ministry of MSME, India',
    filename: 'CookieYes_MSME_Udyam.pdf',
    drive_url: 'https://drive.google.com/file/d/1qXoYk_msme_demo/view?usp=sharing',
    expires_at: null,
    size_kb: 78,
    keywords: ['msme', 'udyam', 'udyog aadhaar', 'small business certificate', 'sme certificate'],
  },
  // ── ISO 27001 — Trust Center ──────────────────────────────────────────────
  {
    id: 'cert_iso',
    type: 'iso_27001',
    name: 'ISO/IEC 27001:2022 Certificate',
    issued_by: 'Bureau Veritas Certification',
    filename: 'CookieYes_ISO27001_2022.pdf',
    drive_url: 'https://trust.cookieyes.com',
    trust_center_url: 'https://trust.cookieyes.com',
    expires_at: '2026-11-30',
    size_kb: 195,
    keywords: ['iso', 'iso 27001', 'information security', 'isms', 'iso certificate', 'security certification', 'iso/iec', '27001'],
  },
  // ── SOC 1 — Trust Center ─────────────────────────────────────────────────
  {
    id: 'cert_soc1',
    type: 'soc1',
    name: 'SOC 1 Type I Report 2024',
    year: 2024,
    issued_by: 'Deloitte & Touche LLP',
    filename: 'CookieYes_SOC1_TypeI_2024.pdf',
    drive_url: 'https://trust.cookieyes.com',
    trust_center_url: 'https://trust.cookieyes.com',
    expires_at: '2025-06-30',
    size_kb: 1820,
    keywords: ['soc 1', 'soc1', 'soc type i', 'soc type 1', 'financial controls', 'aicpa soc'],
  },
  // ── SOC 2 — Trust Center ─────────────────────────────────────────────────
  {
    id: 'cert_soc2',
    type: 'soc2',
    name: 'SOC 2 Type II Report 2024',
    year: 2024,
    issued_by: 'Deloitte & Touche LLP',
    filename: 'CookieYes_SOC2_TypeII_2024.pdf',
    drive_url: 'https://trust.cookieyes.com',
    trust_center_url: 'https://trust.cookieyes.com',
    expires_at: '2025-06-30',
    size_kb: 2340,
    keywords: ['soc 2', 'soc2', 'soc report', 'aicpa', 'security audit', 'trust services', 'type ii', 'type 2', 'soc type ii', 'soc type 2'],
  },
  // ── DPA ──────────────────────────────────────────────────────────────────
  {
    id: 'cert_dpa',
    type: 'dpa',
    name: 'Data Processing Agreement (DPA)',
    issued_by: 'CookieYes Limited',
    filename: 'CookieYes_DPA_v3.pdf',
    drive_url: 'https://drive.google.com/file/d/1qXoYk_dpa_demo/view?usp=sharing',
    expires_at: null,
    size_kb: 318,
    keywords: ['dpa', 'data processing agreement', 'data processing addendum', 'gdpr agreement', 'processor agreement', 'sub-processor'],
  },
  // ── Financial Statements ──────────────────────────────────────────────────
  {
    id: 'cert_fs_2024',
    type: 'financial_statement',
    name: 'Financial Statements FY 2023-24',
    year: 2024,
    issued_by: 'CookieYes Limited',
    filename: 'CookieYes_FinancialStatements_FY2024.pdf',
    drive_url: 'https://drive.google.com/file/d/1qXoYk_fs_2024_demo/view?usp=sharing',
    expires_at: null,
    size_kb: 890,
    keywords: ['financial statement', 'annual report', 'balance sheet', 'p&l', 'profit and loss', 'audited accounts', 'financial report', 'fy 2024', 'fy24'],
  },
  // ── NDA ──────────────────────────────────────────────────────────────────
  {
    id: 'cert_nda',
    type: 'nda',
    name: 'Mutual Non-Disclosure Agreement (NDA)',
    issued_by: 'CookieYes Limited',
    filename: 'CookieYes_NDA_Template_v2.pdf',
    drive_url: 'https://drive.google.com/file/d/1qXoYk_nda_template_demo/view?usp=sharing',
    signing_required: true,
    expires_at: null,
    size_kb: 124,
    keywords: ['nda', 'non-disclosure', 'non disclosure', 'confidentiality agreement', 'mutual nda', 'mnda', 'confidentiality'],
  },
  // ── MOD RFI ──────────────────────────────────────────────────────────────
  {
    id: 'cert_mod_rfi',
    type: 'mod_rfi',
    name: 'Ministry of Defence Supplier RFI Response 2024',
    year: 2024,
    issued_by: 'CookieYes Limited',
    filename: 'CookieYes_MOD_RFI_Response_2024.pdf',
    drive_url: 'https://drive.google.com/file/d/1qXoYk_mod_rfi_2024_demo/view?usp=sharing',
    expires_at: '2025-12-31',
    size_kb: 342,
    keywords: ['mod rfi', 'mod', 'ministry of defence', 'ministry of defense', 'rfi', 'request for information', 'government supplier', 'defence procurement', 'defense procurement'],
  },
];

// ─── Keyword-based type inference ─────────────────────────────────────────────

function inferDocType(query: string): string | null {
  const q = query.toLowerCase();
  if (q.includes('tax residen') || q.includes('trc')) return 'tax_residency';
  if (q.includes('incorporat') || q.includes(' coi')) return 'incorporation';
  if (q.includes('msme') || q.includes('udyam'))      return 'msme';
  if (q.includes('iso') || q.includes('27001'))       return 'iso_27001';
  if (q.includes('soc 1') || q.includes('soc1') || q.includes('soc type i')) return 'soc1';
  if (q.includes('soc 2') || q.includes('soc2') || q.includes('type ii'))    return 'soc2';
  if (q.includes('dpa') || q.includes('data processing agreement'))           return 'dpa';
  if (q.includes('financial statement') || q.includes('balance sheet') || q.includes('annual report')) return 'financial_statement';
  if (q.includes('vat') || q.includes('value added tax')) return 'vat_certificate';
  if (q.includes('nda') || q.includes('non-disclosure') || q.includes('non disclosure')) return 'nda';
  if (q.includes('mod rfi') || q.includes('ministry of defence') || q.includes('ministry of defense')) return 'mod_rfi';
  if (q.includes('certificate') || q.includes('certification')) return 'other';
  return null;
}

// ─── Country detection for tax residency queries ──────────────────────────────
// Maps query keywords → canonical country name matching CertDoc.country
const COUNTRY_VARIANTS: Record<string, string> = {
  'armenia':        'Armenia',
  'armenian':       'Armenia',
  'poland':         'Poland',
  'polish':         'Poland',
  'uk':             'United Kingdom',
  'united kingdom': 'United Kingdom',
  'england':        'United Kingdom',
  'britain':        'United Kingdom',
  'hmrc':           'United Kingdom',
  'india':          'India',
  'indian':         'India',
  'germany':        'Germany',
  'german':         'Germany',
  'france':         'France',
  'french':         'France',
  'netherlands':    'Netherlands',
  'dutch':          'Netherlands',
  'usa':            'United States',
  'united states':  'United States',
  'ireland':        'Ireland',
  'irish':          'Ireland',
};

function detectCountry(query: string): string | null {
  for (const [kw, country] of Object.entries(COUNTRY_VARIANTS)) {
    if (query.includes(kw)) return country;
  }
  return null;
}

// ─── GET /api/certifications/search ──────────────────────────────────────────

certificationsRouter.get('/search', (req, res) => {
  const query = String(req.query.q || '').toLowerCase().trim();
  const year  = req.query.year ? Number(req.query.year) : null;

  if (!query) {
    res.status(400).json({ error: 'query required' });
    return;
  }

  const detectedType = inferDocType(query);

  // For tax residency queries: detect if a specific country is requested.
  // If yes, only match certs whose country field matches — prevents Poland TRC
  // from being returned when Armenia TRC is requested (and vice versa).
  const requestedCountry = detectedType === 'tax_residency' ? detectCountry(query) : null;

  // Score each cert — keyword match + year match bonus
  const scored = CERT_LIBRARY.map((cert) => {
    let score = 0;

    // Country gate: tax_residency certs with a country field must match the
    // requested country exactly. Score stays 0 if there's a mismatch.
    if (requestedCountry && cert.type === 'tax_residency' && cert.country) {
      if (cert.country !== requestedCountry) return { cert, score: 0 };
    }

    for (const kw of cert.keywords) {
      if (query.includes(kw)) score += kw.split(' ').length;
    }
    if (year && cert.year === year) score += 5;
    if (!year && cert.year) score += cert.year / 1000;
    return { cert, score };
  });

  const best = scored.filter((s) => s.score > 0).sort((a, b) => b.score - a.score)[0];

  if (best) {
    res.json({
      found: true,
      query,
      detected_type: detectedType ?? best.cert.type,
      document: {
        id:               best.cert.id,
        type:             best.cert.type,
        name:             best.cert.name,
        country:          best.cert.country,
        year:             best.cert.year,
        issued_by:        best.cert.issued_by,
        filename:         best.cert.filename,
        drive_url:        best.cert.drive_url,
        trust_center_url: best.cert.trust_center_url,
        signing_required: best.cert.signing_required,
        expires_at:       best.cert.expires_at,
        size_kb:          best.cert.size_kb,
      },
    });
  } else {
    res.json({
      found: false,
      query,
      detected_type: detectedType,
      document: null,
    });
  }
});

// ─── POST /api/certifications/escalate ───────────────────────────────────────

certificationsRouter.post('/escalate', async (req, res) => {
  const {
    ticketId, requesterName, requesterEmail,
    docType, docQuery, accountDomain, notes,
  } = req.body;

  const refId = `CY-CERT-${Date.now().toString(36).toUpperCase()}`;

  // ── Slack (simulate — replace with real webhook if SLACK_WEBHOOK_URL is set) ─
  const slackWebhook = process.env.SLACK_WEBHOOK_URL;
  let slackPosted = false;

  const slackPayload = {
    channel: '#cy_certification_request',
    text: `📄 *Certificate/Document Request — ${refId}*`,
    attachments: [{
      color: '#f59e0b',
      fields: [
        { title: 'Zendesk Ticket', value: `#${ticketId}`, short: true },
        { title: 'Customer', value: `${requesterName} (${requesterEmail})`, short: true },
        { title: 'Domain', value: accountDomain || '—', short: true },
        { title: 'Document Requested', value: docQuery || docType || '—', short: false },
        { title: 'Notes', value: notes || 'No additional notes', short: false },
      ],
      footer: 'CX Intelligence Panel · Please reply in thread when actioned',
    }],
  };

  if (slackWebhook) {
    try {
      await fetch(slackWebhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(slackPayload),
        signal: AbortSignal.timeout(5000),
      });
      slackPosted = true;
    } catch {
      slackPosted = false;
    }
  } else {
    slackPosted = true;
  }

  // ── Email (simulate — replace with Nodemailer / SES / etc.) ────────────────
  console.log(`[Cert escalation] Email to finance@cookieyes.com — Ref: ${refId}`);
  console.log(`  Ticket: #${ticketId}, Customer: ${requesterEmail}, Doc: ${docQuery}`);
  const emailSent = true;

  res.json({
    slack_posted:  slackPosted,
    email_sent:    emailSent,
    slack_channel: '#cy_certification_request',
    email_to:      'finance@cookieyes.com',
    reference_id:  refId,
  });
});
