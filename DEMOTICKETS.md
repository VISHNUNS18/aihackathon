# CX Intelligence Panel — Demo Tickets Reference

All demo tickets are served locally without hitting Zendesk. Load any ticket by entering the ID in the ticket input or clicking a quick-pick chip.

---

## Certification & Document Requests

These tickets trigger **Skill 8 — Cert Lookup** and display the `CertificationPanel` below the draft.

### #12370 — Tax Residency Certificate (Poland) — **Found**

| Field | Value |
|---|---|
| Subject | Tax Residency Certificate (Poland) needed for vendor onboarding |
| Requester | Sarah Mitchell — sarah.mitchell@enterprisecorp.com |
| Tags | certification, tax-residency, poland, vendor |
| Expected outcome | **Document found** — CookieYes TRC Poland 2025 shown with "Download from Drive" button |

**What it demos:** Happy path — the requested country's TRC exists in the Drive library. Agent shares the download link directly in their reply.

---

### #12374 — Tax Residency Certificate (Armenia) — **Not found → Escalation**

| Field | Value |
|---|---|
| Subject | Tax Residency Certificate for Armenia required — vendor registration |
| Requester | Armen Petrosyan — finance@armeniaprocure.am |
| Tags | certification, tax-residency, armenia, vendor |
| Expected outcome | **Document not found** — escalation form shown |

**What it demos:** CookieYes does not hold a Tax Residency Certificate for Armenia. The panel shows the escalation form pre-filled with ticket details. Agent adds optional notes and clicks "Escalate to Finance" — posts to `#cy_certification_request` on Slack and emails `finance@cookieyes.com`. A reference ID (e.g. `CY-CERT-1K3XZ`) is generated for the customer reply.

---

### #12371 — NDA Request — **Found (Signing required)**

| Field | Value |
|---|---|
| Subject | Can you share your NDA for review and signing? |
| Requester | Priya Mehta — legal@brightwave.io |
| Tags | certification, nda, legal, compliance |
| Expected outcome | **Document found** — purple "Share for Signing" button shown |

**What it demos:** NDA flow. CookieYes has a standard mutual NDA template. The panel shows a violet "Share for Signing" button instead of a Drive download. Agent shares the link; the customer can review and countersign directly in their browser.

---

### #12375 — SOC 1 Type I Report — **Found (Trust Center)**

| Field | Value |
|---|---|
| Subject | SOC 1 Type I Report needed for financial audit |
| Requester | Mei Lin — audit@financegroup.sg |
| Tags | certification, soc1, security-audit, financial-controls |
| Expected outcome | **Document found** — blue "Access Trust Center" button → trust.cookieyes.com |

**What it demos:** SOC 1 is available via the CookieYes Trust Center, not a direct Drive download. Panel shows the Trust Center link with a note that the report is available under NDA through the portal.

---

### #12372 — SOC 2 Type II Report — **Found (Trust Center)**

| Field | Value |
|---|---|
| Subject | SOC 2 Type II Report required for security due diligence |
| Requester | James Whitfield — j.whitfield@securecorp.io |
| Priority | High |
| Tags | certification, soc2, security-audit, compliance, due-diligence |
| Expected outcome | **Document found** — blue "Access Trust Center" button → trust.cookieyes.com |

**What it demos:** Same Trust Center flow as SOC 1. ISO 27001 also uses the same Trust Center pattern. For any security report (SOC 1, SOC 2, ISO 27001), the agent directs the customer to `https://trust.cookieyes.com` rather than sharing a raw file.

---

## Pre-sales Tickets

These tickets have no linked account. They trigger **PRESALES MODE** in the AI analyser.

### #12373 — Price Quote Request — **AI generates a formal quote**

| Field | Value |
|---|---|
| Subject | Price quote for CookieYes — 4 domains, Ultimate annual plan |
| Requester | Carlos Santos — csantos@transre.com |
| Tags | presales, pricing, quote, procurement, ultimate |
| Expected outcome | AI draft contains a formatted price quote document |

**What it demos:** When a prospect explicitly requests a formal quote, the AI generates a CookieYes-branded price quote in the draft — including Quote #, Date, Valid Until, line items, subtotal, and the standard offer disclaimer. Based on real pricing:

> **Ultimate plan (annual):** $550/domain/year × 4 domains = **$2,200.00**
> (Annual pricing = 10 months charged — 2 months free)

Quote format matches the official CookieYes quote template:

```
CookieYes Limited
3 Warren Yard Warren Park, Wolverton Mill, Milton Keynes, MK12 5NW, United Kingdom

                              Price Quote        CookieYes

Date:          7 April 2026
Valid Until:   14 April 2026
Quote #:       CY-202
Customer ID:   csantos@transre.com
Customer:      Carlos Santos

Description                                     Unit Price   Domains   Total
CookieYes Cookie Consent Solution Ultimate       $550.00      4         $2,200.00

                                  Subtotal                             $2,200.00
                                  Tax/VAT Rate                         If applicable
                                  Total                                $2,200.00

This offer is only available to new CookieYes customers...
```

---

### #12352 — Demo evaluation (Technical pre-sales)

| Field | Value |
|---|---|
| Subject | Evaluating CookieYes — looking for a demo before we commit |
| Requester | James Thornton — james@modernbrand.co |
| Tags | presales, demo, evaluation, trial |
| Expected outcome | AI in PRESALES MODE recommends Pro plan, answers GCM v2 and competitor questions, offers free trial |

**What it demos:** Standard pre-sales qualification. The prospect runs a Shopify store with ~80k monthly visitors and is asking about Google Consent Mode v2, how CookieYes compares to Cookiebot, and whether there is a free trial. AI answers each question directly and recommends the **Pro plan ($250/year)** based on their traffic, mentioning the **14-day free trial** with no credit card required.

**Expected AI behaviour:**
- Confirms GCM v2 is supported on Pro and above
- Briefly highlights CookieYes advantages over Cookiebot (simplicity, pricing, no per-domain scan limits)
- Recommends Pro plan as the right fit for ~80k pageviews/month on one domain
- Ends with a clear CTA: start the free trial or link to pricing page

---

### #12353 — Agency plan enquiry

| Field | Value |
|---|---|
| Subject | Agency plan enquiry — managing consent for 15 client websites |
| Requester | Rachel Kim — hello@digitalagencypro.co |
| Tags | presales, agency, pricing, clients |
| Expected outcome | AI identifies agency segment, explains agency pricing is quoted separately, does NOT share a specific price |

**What it demos:** Agency pre-sales qualification. The prospect manages cookie consent across 15 client websites and wants to know about bulk or agency pricing. AI recognises this as an agency use case, explains that agency plans are available and priced separately (not shown on the public pricing page), and offers to connect them with the sales team.

**Expected AI behaviour:**
- Identifies the prospect as an agency managing multiple client domains
- Explains the standard plans (Basic/Pro/Ultimate) are per-domain and may not be the right fit for 15 sites
- States that agency plans are quoted separately after a brief lead qualification
- Does NOT invent or guess an agency price
- Ends with an invitation to share more about their use case so sales can prepare a tailored quote

---

### #12354 — International compliance (LGPD / PDPA)

| Field | Value |
|---|---|
| Subject | Does CookieYes cover LGPD (Brazil) and PDPA (Thailand)? |
| Requester | Carlos Mendes — compliance@globalventures.io |
| Tags | presales, lgpd, pdpa, compliance, international |
| Expected outcome | AI confirms LGPD and PDPA support, recommends Pro plan for geo-targeting |

**What it demos:** Compliance-focused pre-sales. The prospect operates in Brazil and Thailand and needs to verify that CookieYes can handle region-specific consent requirements (LGPD for Brazil, PDPA for Thailand) in addition to GDPR.

**Expected AI behaviour:**
- Confirms CookieYes supports LGPD (Brazil) and PDPA (Thailand) banner configurations
- Explains that geo-targeting (showing different banner text or consent types by country) requires the **Pro plan or above**
- Recommends Pro plan ($250/year per domain) for multi-regulation compliance use cases
- Mentions CookieYes auto-categorises cookies and supports opt-in and opt-out flows for different regulations
- Ends with free trial offer

---

### #12355 — Migration from Cookiebot

| Field | Value |
|---|---|
| Subject | Switching from Cookiebot to CookieYes — migration questions |
| Requester | Tom Eriksson — devteam@techswitch.io |
| Tags | presales, cookiebot, migration, competitor |
| Expected outcome | AI handles migration positively, confirms GCM v2 parity and consent log portability, recommends Pro plan |

**What it demos:** Competitor migration pre-sales. The prospect runs 3 WordPress sites and 1 Shopify store (4 domains, ~200k combined monthly pageviews) on Cookiebot and wants to switch due to price increases and dashboard complexity. They ask about running both tools simultaneously during migration, consent record portability, GCM v2 support, and which plan to choose.

**Expected AI behaviour:**
- Confirms GCM v2 is fully supported on Pro and above
- Addresses consent log portability: CookieYes maintains its own consent logs; existing Cookiebot logs stay on Cookiebot but are not required for GDPR compliance going forward
- Confirms migration can be done site-by-site (no need to switch all at once)
- Notes CookieYes dashboard is designed for simplicity — single view across all domains
- Recommends **Pro plan ($250/year per domain × 4 = $1,000/year)** for 200k combined pageviews
- Ends with free trial offer

---

### #12356 — Remove branding / white-label (new)

| Field | Value |
|---|---|
| Subject | How do I remove the "Powered by CookieYes" branding from our banner? |
| Requester | Sophie Laurent — hello@maisonluxe.fr |
| Tags | presales, branding, white-label, ultimate |
| Expected outcome | AI confirms this is an Ultimate plan feature, explains upgrade path from Basic, provides pricing |

**What it demos:** Feature-gating pre-sales. The prospect is a luxury e-commerce brand currently on the Basic plan. Their brand guidelines require unbranded elements and they want to remove the "Powered by CookieYes" footer text from the consent banner.

**Expected AI behaviour:**
- Confirms that removing the "Powered by CookieYes" branding is available on the **Ultimate plan only**
- Explains they are currently on Basic and would need to upgrade to Ultimate
- Provides Ultimate plan pricing: **$55/month** or **$550/year** (annual = 2 months free)
- Notes other Ultimate benefits: unlimited pageviews, weekly scanning, full customisation, remove branding
- Ends with the 14-day free trial offer so they can test the feature before committing

---

## Pricing Reference (actual CookieYes plans)

| Plan | Monthly | Annual (per domain) | Pageviews/mo | Pages/scan |
|---|---|---|---|---|
| **Free** | $0 | $0 | 5,000 | 100 |
| **Basic** | $10 | $100 (2 months free) | 100,000 + $0.30/1k extra | 600 |
| **Pro** | $25 | $250 (2 months free) | 300,000 + $0.30/1k extra | 4,000 |
| **Ultimate** | $55 | $550 (2 months free) | Unlimited | 8,000 |

- 14-day free trial on all paid plans (no credit card required)
- Currencies: USD, EUR, GBP
- Local VAT/GST added at checkout
- Agency plans: contact sales, quoted separately

---

## Certification Library — what's available

| Document | Available | Location | Notes |
|---|---|---|---|
| Tax Residency — United Kingdom | ✅ | Google Drive | 2025 |
| Tax Residency — Poland | ✅ | Google Drive | 2025 |
| Tax Residency — Armenia | ❌ | — | Not held → escalate to Finance |
| Certificate of Incorporation | ✅ | Google Drive | Companies House UK |
| MSME / Udyam | ✅ | Google Drive | |
| ISO/IEC 27001:2022 | ✅ | Trust Center | trust.cookieyes.com |
| SOC 1 Type I | ✅ | Trust Center | trust.cookieyes.com |
| SOC 2 Type II | ✅ | Trust Center | trust.cookieyes.com |
| DPA | ✅ | Google Drive | CookieYes_DPA_v3.pdf |
| Financial Statements FY 2023-24 | ✅ | Google Drive | |
| NDA | ✅ | Drive (signing) | Customer signs via shared link |
| MOD RFI 2024 | ✅ | Google Drive | Ministry of Defence supplier RFI |
| VAT Certificate | ❌ | — | Not held → escalate to Finance |
| GST Certificate | ❌ | — | Not applicable (CookieYes is UK-registered) |
