"use strict";
const pptxgen = require("pptxgenjs");

// ─── Color palette ──────────────────────────────────────────────────────────
const C = {
  bg:        "0F172A",  // slate-900 dark navy
  bgCard:    "1E293B",  // slightly lighter card
  bgCard2:   "162032",  // alternate card row
  white:     "FFFFFF",
  blue:      "3B82F6",
  green:     "22C55E",
  orange:    "F59E0B",
  red:       "EF4444",
  purple:    "8B5CF6",
  muted:     "94A3B8",
  lightBlue: "93C5FD",
  darkText:  "0F172A",
  codeText:  "7DD3FC",
};

// ─── Helper: fresh shadow ────────────────────────────────────────────────────
const mkShadow = () => ({ type: "outer", blur: 8, offset: 3, angle: 135, color: "000000", opacity: 0.35 });

// ─── Presentation setup ─────────────────────────────────────────────────────
let pres = new pptxgen();
pres.layout = "LAYOUT_16x9";  // 10" × 5.625"
pres.author  = "CX Intelligence Panel";
pres.title   = "CX Intelligence Multi-Agent Architecture";

// ──────────────────────────────────────────────────────────────────────────────
// SLIDE 1 — TITLE
// ──────────────────────────────────────────────────────────────────────────────
{
  let sl = pres.addSlide();
  sl.background = { color: C.bg };

  // Decorative left accent bar
  sl.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 0.45, h: 5.625, fill: { color: C.blue }, line: { color: C.blue } });

  // Decorative top-right corner block
  sl.addShape(pres.shapes.RECTANGLE, { x: 8.2, y: 0, w: 1.8, h: 0.08, fill: { color: C.blue }, line: { color: C.blue } });

  // Small label "CX INTELLIGENCE PANEL"
  sl.addText("CX INTELLIGENCE PANEL", {
    x: 0.75, y: 0.6, w: 7, h: 0.4,
    fontSize: 13, fontFace: "Arial", bold: true, color: C.blue,
    charSpacing: 4, align: "left", margin: 0,
  });

  // Main title
  sl.addText("AI-Powered Support\nAutomation", {
    x: 0.75, y: 1.2, w: 7.5, h: 2.1,
    fontSize: 44, fontFace: "Arial Black", bold: true, color: C.white,
    align: "left", valign: "top", margin: 0,
  });

  // Subtitle
  sl.addText("Multi-Agent Architecture & Parallel Execution", {
    x: 0.75, y: 3.4, w: 8, h: 0.5,
    fontSize: 22, fontFace: "Arial", color: C.muted,
    align: "left", margin: 0,
  });

  // Bottom thin line
  sl.addShape(pres.shapes.RECTANGLE, { x: 0.75, y: 4.55, w: 8.5, h: 0.04, fill: { color: C.blue }, line: { color: C.blue } });

  // Footer tech line
  sl.addText("Built with  React  ·  TypeScript  ·  Node.js  ·  Claude AI", {
    x: 0.75, y: 4.75, w: 8.5, h: 0.4,
    fontSize: 13, fontFace: "Arial", color: C.muted, align: "left", margin: 0,
  });

  // Right side geometric decoration
  sl.addShape(pres.shapes.RECTANGLE, { x: 7.8, y: 0.8, w: 2.2, h: 3.5, fill: { color: "1E293B", transparency: 30 }, line: { color: C.blue, width: 1.5 } });
  sl.addText("{ }", { x: 7.9, y: 1.7, w: 2, h: 1.6, fontSize: 64, fontFace: "Courier New", color: "1E3A5F", align: "center", bold: true, margin: 0 });
}

// ──────────────────────────────────────────────────────────────────────────────
// SLIDE 2 — THE PROBLEM
// ──────────────────────────────────────────────────────────────────────────────
{
  let sl = pres.addSlide();
  sl.background = { color: C.bg };

  // Header accent bar
  sl.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.07, fill: { color: C.orange }, line: { color: C.orange } });

  // Title
  sl.addText("The Problem: One Ticket, Too Many Tools", {
    x: 0.4, y: 0.2, w: 9.2, h: 0.65,
    fontSize: 32, fontFace: "Arial Black", bold: true, color: C.white, align: "left", margin: 0,
  });

  // Left side – bullet points in a card
  sl.addShape(pres.shapes.RECTANGLE, { x: 0.35, y: 1.05, w: 5.7, h: 4.1, fill: { color: C.bgCard }, line: { color: "334155", width: 1 }, shadow: mkShadow() });
  sl.addText([
    { text: "Agent receives a ticket — what happens?",      options: { bullet: true, breakLine: true, bold: true, color: C.lightBlue } },
    { text: "Open Zendesk → read conversation thread",      options: { bullet: true, breakLine: true } },
    { text: "Open CookieYes Admin → look up account",       options: { bullet: true, breakLine: true } },
    { text: "Open Stripe → check subscription & billing",   options: { bullet: true, breakLine: true } },
    { text: "Open the site → debug if banner is live",      options: { bullet: true, breakLine: true } },
    { text: "Search internal docs → find articles",         options: { bullet: true, breakLine: true } },
    { text: "Write reply manually using all of the above",  options: { bullet: true } },
  ], {
    x: 0.55, y: 1.15, w: 5.3, h: 3.9,
    fontSize: 14, fontFace: "Arial", color: C.white,
    paraSpaceAfter: 6, align: "left", valign: "top",
  });

  // Right side – orange callout card
  sl.addShape(pres.shapes.RECTANGLE, { x: 6.35, y: 1.05, w: 3.25, h: 4.1, fill: { color: C.orange }, line: { color: C.orange }, shadow: mkShadow() });

  // Callout stats
  sl.addText([
    { text: "8–12 min", options: { fontSize: 42, bold: true, fontFace: "Arial Black", breakLine: true, color: C.darkText } },
    { text: "per ticket", options: { fontSize: 16, fontFace: "Arial", color: C.darkText, breakLine: true } },
  ], { x: 6.45, y: 1.25, w: 3.05, h: 1.1, align: "center", valign: "middle", margin: 0 });

  sl.addShape(pres.shapes.RECTANGLE, { x: 6.55, y: 2.35, w: 2.85, h: 0.04, fill: { color: C.darkText, transparency: 40 }, line: { color: C.darkText, transparency: 40 } });

  sl.addText([
    { text: "5–6", options: { fontSize: 42, bold: true, fontFace: "Arial Black", breakLine: true, color: C.darkText } },
    { text: "browser tabs", options: { fontSize: 16, fontFace: "Arial", color: C.darkText, breakLine: true } },
  ], { x: 6.45, y: 2.45, w: 3.05, h: 1.1, align: "center", valign: "middle", margin: 0 });

  sl.addShape(pres.shapes.RECTANGLE, { x: 6.55, y: 3.55, w: 2.85, h: 0.04, fill: { color: C.darkText, transparency: 40 }, line: { color: C.darkText, transparency: 40 } });

  sl.addText([
    { text: "100%", options: { fontSize: 42, bold: true, fontFace: "Arial Black", breakLine: true, color: C.darkText } },
    { text: "manual work", options: { fontSize: 16, fontFace: "Arial", color: C.darkText, breakLine: true } },
  ], { x: 6.45, y: 3.65, w: 3.05, h: 1.1, align: "center", valign: "middle", margin: 0 });
}

// ──────────────────────────────────────────────────────────────────────────────
// SLIDE 3 — THE SOLUTION
// ──────────────────────────────────────────────────────────────────────────────
{
  let sl = pres.addSlide();
  sl.background = { color: C.bg };

  // Header accent
  sl.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.07, fill: { color: C.green }, line: { color: C.green } });

  // Title
  sl.addText("The Solution: Replace Tabs with Agents", {
    x: 0.4, y: 0.15, w: 9.2, h: 0.65, fontSize: 32, fontFace: "Arial Black", bold: true, color: C.white, align: "left", margin: 0,
  });

  // Quote card
  sl.addShape(pres.shapes.RECTANGLE, { x: 0.35, y: 0.95, w: 9.3, h: 0.82, fill: { color: "162032" }, line: { color: C.blue, width: 1.5 } });
  sl.addText("\"Like having 8 specialists in a room — hand them the ticket, get the answer.\"", {
    x: 0.55, y: 0.97, w: 9.0, h: 0.76,
    fontSize: 16, fontFace: "Arial", italic: true, color: C.lightBlue, align: "center", valign: "middle", margin: 0,
  });

  // 3 comparison rows
  const rows = [
    { before: "6 browser tabs, manual",  after: "1 dashboard, automated" },
    { before: "8–12 min per ticket",      after: "~30 seconds" },
    { before: "One ticket at a time",     after: "3 tickets simultaneously" },
  ];

  rows.forEach((row, i) => {
    const y = 2.0 + i * 1.03;

    // Red card (before)
    sl.addShape(pres.shapes.RECTANGLE, { x: 0.35, y, w: 3.8, h: 0.75, fill: { color: "7F1D1D" }, line: { color: C.red, width: 1.5 } });
    sl.addText("✗  " + row.before, { x: 0.45, y: y + 0.05, w: 3.6, h: 0.65, fontSize: 14, fontFace: "Arial", color: C.white, align: "left", valign: "middle", bold: true, margin: 0 });

    // Arrow
    sl.addText("→", { x: 4.2, y: y + 0.05, w: 0.9, h: 0.65, fontSize: 28, fontFace: "Arial", color: C.muted, align: "center", valign: "middle", margin: 0 });

    // Green card (after)
    sl.addShape(pres.shapes.RECTANGLE, { x: 5.15, y, w: 4.5, h: 0.75, fill: { color: "14532D" }, line: { color: C.green, width: 1.5 } });
    sl.addText("✓  " + row.after, { x: 5.25, y: y + 0.05, w: 4.3, h: 0.65, fontSize: 14, fontFace: "Arial", color: C.white, align: "left", valign: "middle", bold: true, margin: 0 });
  });
}

// ──────────────────────────────────────────────────────────────────────────────
// SLIDE 4 — THE 8 SKILLS
// ──────────────────────────────────────────────────────────────────────────────
{
  let sl = pres.addSlide();
  sl.background = { color: C.bg };

  // Header accent
  sl.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.07, fill: { color: C.blue }, line: { color: C.blue } });

  // Title
  sl.addText("8 Specialist Agents (Skills)", {
    x: 0.4, y: 0.15, w: 9.2, h: 0.6, fontSize: 32, fontFace: "Arial Black", bold: true, color: C.white, align: "left", margin: 0,
  });

  // Table data
  const tableRows = [
    [
      { text: "#",        options: { bold: true, color: C.white, fill: { color: "1D4ED8" }, align: "center" } },
      { text: "Agent",    options: { bold: true, color: C.white, fill: { color: "1D4ED8" } } },
      { text: "What It Does", options: { bold: true, color: C.white, fill: { color: "1D4ED8" } } },
    ],
    ...([
      ["1", "Zendesk Loader",  "Fetches ticket + full conversation thread"],
      ["2", "Account Lookup",  "Customer plan, domain, banner status"],
      ["3", "Stripe Billing",  "Subscription, invoices, refund eligibility"],
      ["4", "Site Debugger",   "Is the banner live? Plugin conflicts?"],
      ["5", "Docs Lookup",     "Finds relevant CookieYes help articles"],
      ["6", "AI Analyser",     "Claude drafts the reply with full context"],
      ["7", "Jira Creator",    "Raises a bug ticket (manual trigger)"],
      ["8", "Cert Lookup",     "Finds certificates in Google Drive"],
    ].map((r, i) => {
      const bgColor = i % 2 === 0 ? "1E293B" : "162032";
      return [
        { text: r[0], options: { bold: true, color: C.blue, fill: { color: bgColor }, align: "center" } },
        { text: r[1], options: { bold: true, color: C.white, fill: { color: bgColor } } },
        { text: r[2], options: { color: C.muted, fill: { color: bgColor } } },
      ];
    }))
  ];

  sl.addTable(tableRows, {
    x: 0.35, y: 0.9, w: 9.3, h: 4.1,
    colW: [0.5, 2.2, 6.6],
    border: { pt: 0.5, color: "334155" },
    fontSize: 14, fontFace: "Arial",
    rowH: 0.42,
  });

  // Bottom note
  sl.addText("Skills 1–6 run automatically. Skill 7 is triggered manually.", {
    x: 0.35, y: 5.25, w: 9.3, h: 0.28, fontSize: 11, fontFace: "Arial", color: C.muted, italic: true, align: "center", margin: 0,
  });
}

// ──────────────────────────────────────────────────────────────────────────────
// SLIDE 5 — PARALLEL EXECUTION
// ──────────────────────────────────────────────────────────────────────────────
{
  let sl = pres.addSlide();
  sl.background = { color: C.bg };

  // Header accent
  sl.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.07, fill: { color: C.blue }, line: { color: C.blue } });

  // Title
  sl.addText("Parallel Execution — The Secret Sauce", {
    x: 0.4, y: 0.15, w: 9.2, h: 0.6, fontSize: 32, fontFace: "Arial Black", bold: true, color: C.white, align: "left", margin: 0,
  });

  // Subtitle
  sl.addText("Groups of agents fire simultaneously instead of waiting", {
    x: 0.4, y: 0.8, w: 9.2, h: 0.35, fontSize: 15, fontFace: "Arial", color: C.muted, italic: true, align: "left", margin: 0,
  });

  // Gantt chart rows
  const stages = [
    { label: "Stage 1", bars: [{ x: 1.45, w: 7.7, text: "Skill 1: Zendesk Loader", color: C.blue, parallel: false }] },
    { label: "Stage 2", bars: [
      { x: 1.45, w: 3.7, text: "Skill 2: Account Lookup", color: "1D4ED8", parallel: false },
      { x: 5.25, w: 3.9, text: "Skill 5: Docs Lookup",   color: "1E40AF", parallel: true },
    ]},
    { label: "Stage 3", bars: [
      { x: 1.45, w: 3.7, text: "Skill 3: Stripe Billing", color: "B45309", parallel: false },
      { x: 5.25, w: 3.9, text: "Skill 4: Site Debugger",  color: "92400E", parallel: true },
    ]},
    { label: "Stage 4", bars: [
      { x: 1.45, w: 4.5, text: "Skill 6: Claude AI",      color: "15803D", parallel: false },
      { x: 6.05, w: 3.1, text: "Skill 8: Cert Lookup",    color: "166534", parallel: true },
    ]},
  ];

  stages.forEach((stage, i) => {
    const y = 1.3 + i * 0.75;

    // Stage label box
    sl.addShape(pres.shapes.RECTANGLE, { x: 0.25, y, w: 1.1, h: 0.55, fill: { color: C.bgCard }, line: { color: "475569", width: 1 } });
    sl.addText(stage.label, { x: 0.25, y: y + 0.05, w: 1.1, h: 0.45, fontSize: 11, fontFace: "Arial", bold: true, color: C.muted, align: "center", margin: 0 });

    stage.bars.forEach((bar) => {
      sl.addShape(pres.shapes.RECTANGLE, { x: bar.x, y: y + 0.02, w: bar.w, h: 0.5, fill: { color: bar.color }, line: { color: bar.color } });
      sl.addText(bar.text, { x: bar.x + 0.1, y: y + 0.07, w: bar.w - 0.15, h: 0.4, fontSize: 12, fontFace: "Arial", bold: true, color: C.white, align: "left", valign: "middle", margin: 0 });
    });

    // PARALLEL label for stages 2,3,4
    if (stage.bars.length > 1) {
      sl.addShape(pres.shapes.RECTANGLE, { x: 9.22, y: y + 0.1, w: 0.62, h: 0.32, fill: { color: "14532D" }, line: { color: C.green, width: 1.5 } });
      sl.addText("PARA", { x: 9.22, y: y + 0.1, w: 0.62, h: 0.32, fontSize: 9, fontFace: "Arial", bold: true, color: C.green, align: "center", valign: "middle", margin: 0 });
    }
  });

  // Bottom two boxes
  sl.addShape(pres.shapes.RECTANGLE, { x: 0.25, y: 4.45, w: 4.65, h: 0.85, fill: { color: C.bgCard }, line: { color: C.blue, width: 1.5 } });
  sl.addText([
    { text: "Technical: ", options: { bold: true, color: C.blue } },
    { text: "Promise.all() fires all API calls simultaneously", options: { color: C.white } },
  ], { x: 0.4, y: 4.5, w: 4.4, h: 0.75, fontSize: 13, fontFace: "Arial", align: "left", valign: "middle" });

  sl.addShape(pres.shapes.RECTANGLE, { x: 5.1, y: 4.45, w: 4.65, h: 0.85, fill: { color: C.bgCard }, line: { color: C.orange, width: 1.5 } });
  sl.addText([
    { text: "Simple: ", options: { bold: true, color: C.orange } },
    { text: "Like relay runners going 2 at a time — halves the wait", options: { color: C.white } },
  ], { x: 5.25, y: 4.5, w: 4.4, h: 0.75, fontSize: 13, fontFace: "Arial", align: "left", valign: "middle" });
}

// ──────────────────────────────────────────────────────────────────────────────
// SLIDE 6 — MULTI-TICKET CONCURRENCY
// ──────────────────────────────────────────────────────────────────────────────
{
  let sl = pres.addSlide();
  sl.background = { color: C.bg };

  // Header accent
  sl.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.07, fill: { color: C.purple }, line: { color: C.purple } });

  // Title
  sl.addText("Multiple Tickets Running at the Same Time", {
    x: 0.4, y: 0.15, w: 9.2, h: 0.6, fontSize: 32, fontFace: "Arial Black", bold: true, color: C.white, align: "left", margin: 0,
  });

  // Left: Giant "3"
  sl.addShape(pres.shapes.RECTANGLE, { x: 0.35, y: 0.95, w: 3.1, h: 3.1, fill: { color: "1E293B" }, line: { color: C.blue, width: 2 } });
  sl.addText("3", { x: 0.35, y: 0.95, w: 3.1, h: 2.2, fontSize: 120, fontFace: "Arial Black", bold: true, color: C.blue, align: "center", valign: "middle", margin: 0 });
  sl.addText("Tickets simultaneously", { x: 0.35, y: 3.15, w: 3.1, h: 0.55, fontSize: 17, fontFace: "Arial", color: C.white, align: "center", bold: true, margin: 0 });

  // Right: 3 ticket cards
  const tickets = [
    { id: "#12366", border: C.green,  label: "Running...  ●" },
    { id: "#12367", border: C.blue,   label: "Running...  ●" },
    { id: "#12368", border: C.orange, label: "Running...  ●" },
  ];
  tickets.forEach((t, i) => {
    const y = 1.0 + i * 0.95;
    sl.addShape(pres.shapes.RECTANGLE, { x: 3.8, y, w: 5.85, h: 0.78, fill: { color: C.bgCard }, line: { color: t.border, width: 2 }, shadow: mkShadow() });
    sl.addText([
      { text: "Ticket ", options: { color: C.muted, fontSize: 15 } },
      { text: t.id, options: { color: C.white, bold: true, fontSize: 16 } },
      { text: "  —  " + t.label, options: { color: t.border, fontSize: 15, bold: true } },
    ], { x: 3.95, y: y + 0.1, w: 5.55, h: 0.58, fontFace: "Arial", align: "left", valign: "middle" });
  });

  // Bottom code-style box
  sl.addShape(pres.shapes.RECTANGLE, { x: 3.8, y: 3.95, w: 5.85, h: 1.35, fill: { color: "0D1117" }, line: { color: "30363D", width: 1.5 } });
  sl.addText([
    { text: "maxConcurrent", options: { color: C.codeText, bold: true } },
    { text: ": 3    // configurable\n", options: { color: C.muted } },
    { text: "runningAiCount", options: { color: C.codeText, bold: true } },
    { text: "    // live semaphore\n", options: { color: C.muted } },
    { text: "useTicketQueue.ts", options: { color: C.green, bold: true } },
    { text: "  // orchestration hook", options: { color: C.muted } },
  ], { x: 4.0, y: 4.05, w: 5.5, h: 1.15, fontSize: 13, fontFace: "Courier New", align: "left", valign: "top" });

  // Analogy
  sl.addText("\"Like 3 checkout lanes — all serve different customers at once\"", {
    x: 0.35, y: 4.38, w: 3.3, h: 0.9, fontSize: 13, fontFace: "Arial", italic: true, color: C.muted, align: "center", valign: "middle",
  });
}

// ──────────────────────────────────────────────────────────────────────────────
// SLIDE 7 — TECH STACK
// ──────────────────────────────────────────────────────────────────────────────
{
  let sl = pres.addSlide();
  sl.background = { color: C.bg };

  // Header accent
  sl.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.07, fill: { color: C.blue }, line: { color: C.blue } });

  // Title
  sl.addText("Technology Stack", {
    x: 0.4, y: 0.15, w: 9.2, h: 0.6, fontSize: 36, fontFace: "Arial Black", bold: true, color: C.white, align: "left", margin: 0,
  });

  // Frontend card
  sl.addShape(pres.shapes.RECTANGLE, { x: 0.35, y: 1.0, w: 4.5, h: 4.0, fill: { color: C.bgCard }, line: { color: C.blue, width: 2 }, shadow: mkShadow() });
  sl.addShape(pres.shapes.RECTANGLE, { x: 0.35, y: 1.0, w: 4.5, h: 0.55, fill: { color: "1D4ED8" }, line: { color: "1D4ED8" } });
  sl.addText("Frontend", { x: 0.45, y: 1.0, w: 4.3, h: 0.55, fontSize: 20, fontFace: "Arial Black", bold: true, color: C.white, align: "left", valign: "middle", margin: 0 });
  sl.addText([
    { text: "React 18 + TypeScript",       options: { bullet: true, breakLine: true, bold: true } },
    { text: "Tailwind CSS — styling",       options: { bullet: true, breakLine: true } },
    { text: "Zustand — state management",   options: { bullet: true, breakLine: true } },
    { text: "Vite — fast build tool",       options: { bullet: true, breakLine: true } },
    { text: "React Router v6 — navigation", options: { bullet: true } },
  ], { x: 0.55, y: 1.65, w: 4.1, h: 3.2, fontSize: 15, fontFace: "Arial", color: C.white, paraSpaceAfter: 8, align: "left", valign: "top" });

  // Backend card
  sl.addShape(pres.shapes.RECTANGLE, { x: 5.15, y: 1.0, w: 4.5, h: 4.0, fill: { color: C.bgCard }, line: { color: C.orange, width: 2 }, shadow: mkShadow() });
  sl.addShape(pres.shapes.RECTANGLE, { x: 5.15, y: 1.0, w: 4.5, h: 0.55, fill: { color: "B45309" }, line: { color: "B45309" } });
  sl.addText("Backend", { x: 5.25, y: 1.0, w: 4.3, h: 0.55, fontSize: 20, fontFace: "Arial Black", bold: true, color: C.white, align: "left", valign: "middle", margin: 0 });
  sl.addText([
    { text: "Node.js + Express (port 4000)",        options: { bullet: true, breakLine: true, bold: true } },
    { text: "TypeScript — fully type-safe",          options: { bullet: true, breakLine: true } },
    { text: "Anthropic Claude API (claude-opus-4-5)",options: { bullet: true, breakLine: true } },
    { text: "Stripe SDK + Zendesk API",              options: { bullet: true, breakLine: true } },
    { text: "Jira REST + Slack Bot API",             options: { bullet: true, breakLine: true } },
    { text: "MongoDB + Mongoose",                    options: { bullet: true } },
  ], { x: 5.35, y: 1.65, w: 4.1, h: 3.2, fontSize: 15, fontFace: "Arial", color: C.white, paraSpaceAfter: 8, align: "left", valign: "top" });

  // Bottom bar
  sl.addShape(pres.shapes.RECTANGLE, { x: 0, y: 5.32, w: 10, h: 0.3, fill: { color: "162032" }, line: { color: "162032" } });
  sl.addText("Both frontend and backend in TypeScript — Monorepo with npm workspaces", {
    x: 0.35, y: 5.32, w: 9.3, h: 0.3, fontSize: 11, fontFace: "Arial", color: C.muted, italic: true, align: "center", valign: "middle", margin: 0,
  });
}

// ──────────────────────────────────────────────────────────────────────────────
// SLIDE 8 — HOW CLAUDE FITS IN
// ──────────────────────────────────────────────────────────────────────────────
{
  let sl = pres.addSlide();
  sl.background = { color: C.bg };

  // Header accent
  sl.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.07, fill: { color: C.green }, line: { color: C.green } });

  // Title
  sl.addText("Claude AI — The Brain of the Operation", {
    x: 0.4, y: 0.15, w: 9.2, h: 0.6, fontSize: 32, fontFace: "Arial Black", bold: true, color: C.white, align: "left", margin: 0,
  });

  const boxY = 1.05;
  const boxH = 3.4;

  // Box 1 — Raw Data (blue border)
  sl.addShape(pres.shapes.RECTANGLE, { x: 0.25, y: boxY, w: 2.8, h: boxH, fill: { color: C.bgCard }, line: { color: C.blue, width: 2 }, shadow: mkShadow() });
  sl.addShape(pres.shapes.RECTANGLE, { x: 0.25, y: boxY, w: 2.8, h: 0.5, fill: { color: "1D4ED8" }, line: { color: "1D4ED8" } });
  sl.addText("Raw Data", { x: 0.35, y: boxY, w: 2.6, h: 0.5, fontSize: 16, fontFace: "Arial Black", bold: true, color: C.white, align: "center", valign: "middle", margin: 0 });
  sl.addText([
    { text: "Ticket + conversation",  options: { bullet: true, breakLine: true } },
    { text: "Account details",        options: { bullet: true, breakLine: true } },
    { text: "Billing status",         options: { bullet: true, breakLine: true } },
    { text: "Site debug report",      options: { bullet: true, breakLine: true } },
    { text: "Matched doc articles",   options: { bullet: true } },
  ], { x: 0.35, y: boxY + 0.6, w: 2.6, h: 2.7, fontSize: 13, fontFace: "Arial", color: C.white, paraSpaceAfter: 6, align: "left", valign: "top" });

  // Arrow 1
  sl.addText("→", { x: 3.1, y: 2.25, w: 0.7, h: 0.6, fontSize: 28, fontFace: "Arial", color: C.blue, align: "center", bold: true, margin: 0 });

  // Box 2 — Claude (bright blue fill)
  sl.addShape(pres.shapes.RECTANGLE, { x: 3.85, y: boxY, w: 2.8, h: boxH, fill: { color: "1D4ED8" }, line: { color: "60A5FA", width: 2 }, shadow: mkShadow() });
  sl.addShape(pres.shapes.RECTANGLE, { x: 3.85, y: boxY, w: 2.8, h: 0.5, fill: { color: "1E40AF" }, line: { color: "1E40AF" } });
  sl.addText("Claude claude-opus-4-5", { x: 3.9, y: boxY, w: 2.7, h: 0.5, fontSize: 13, fontFace: "Arial Black", bold: true, color: C.white, align: "center", valign: "middle", margin: 0 });
  sl.addText([
    { text: "System prompt = 8-skill workflow", options: { bullet: true, breakLine: true } },
    { text: "Single batched API call",           options: { bullet: true, breakLine: true } },
    { text: "Streaming (token by token)",         options: { bullet: true, breakLine: true } },
    { text: "max_tokens: 2,500",                  options: { bullet: true } },
  ], { x: 3.95, y: boxY + 0.6, w: 2.6, h: 2.7, fontSize: 13, fontFace: "Arial", color: C.white, paraSpaceAfter: 6, align: "left", valign: "top" });

  // Arrow 2
  sl.addText("→", { x: 6.7, y: 2.25, w: 0.7, h: 0.6, fontSize: 28, fontFace: "Arial", color: C.green, align: "center", bold: true, margin: 0 });

  // Box 3 — Output (green border)
  sl.addShape(pres.shapes.RECTANGLE, { x: 7.45, y: boxY, w: 2.2, h: boxH, fill: { color: C.bgCard }, line: { color: C.green, width: 2 }, shadow: mkShadow() });
  sl.addShape(pres.shapes.RECTANGLE, { x: 7.45, y: boxY, w: 2.2, h: 0.5, fill: { color: "15803D" }, line: { color: "15803D" } });
  sl.addText("Structured Output", { x: 7.5, y: boxY, w: 2.1, h: 0.5, fontSize: 13, fontFace: "Arial Black", bold: true, color: C.white, align: "center", valign: "middle", margin: 0 });
  sl.addText([
    { text: "Analysis + root cause",    options: { bullet: true, breakLine: true } },
    { text: "Category classification",  options: { bullet: true, breakLine: true } },
    { text: "Draft reply (toned)",       options: { bullet: true, breakLine: true } },
    { text: "Multi-variant drafts",      options: { bullet: true, breakLine: true } },
    { text: "Jira suggestion",           options: { bullet: true } },
  ], { x: 7.55, y: boxY + 0.6, w: 2.0, h: 2.7, fontSize: 12, fontFace: "Arial", color: C.white, paraSpaceAfter: 6, align: "left", valign: "top" });

  // Note
  sl.addShape(pres.shapes.RECTANGLE, { x: 0.25, y: 4.65, w: 9.5, h: 0.65, fill: { color: "162032" }, line: { color: "334155", width: 1 } });
  sl.addText("systemPrompt.ts (252 lines) defines the full workflow as Claude instructions", {
    x: 0.4, y: 4.7, w: 9.2, h: 0.55, fontSize: 12, fontFace: "Courier New", italic: true, color: C.muted, align: "center", valign: "middle", margin: 0,
  });
}

// ──────────────────────────────────────────────────────────────────────────────
// SLIDE 9 — DATA FLOW
// ──────────────────────────────────────────────────────────────────────────────
{
  let sl = pres.addSlide();
  sl.background = { color: C.bg };

  // Header accent
  sl.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.07, fill: { color: C.orange }, line: { color: C.orange } });

  // Title
  sl.addText("End-to-End Data Flow", {
    x: 0.4, y: 0.15, w: 9.2, h: 0.6, fontSize: 36, fontFace: "Arial Black", bold: true, color: C.white, align: "left", margin: 0,
  });

  // Flowchart — arranged horizontally with connecting arrows to fit slide
  // Row 1: Entry
  sl.addShape(pres.shapes.RECTANGLE, { x: 3.8, y: 0.9, w: 2.4, h: 0.5, fill: { color: "1D4ED8" }, line: { color: C.blue } });
  sl.addText("Agent enters Ticket ID", { x: 3.8, y: 0.9, w: 2.4, h: 0.5, fontSize: 12, fontFace: "Arial", bold: true, color: C.white, align: "center", valign: "middle", margin: 0 });

  sl.addText("↓", { x: 4.7, y: 1.4, w: 0.6, h: 0.28, fontSize: 18, fontFace: "Arial", color: C.muted, align: "center", margin: 0 });

  // Row 2: Skill 1
  sl.addShape(pres.shapes.RECTANGLE, { x: 3.2, y: 1.68, w: 3.6, h: 0.5, fill: { color: "1D4ED8" }, line: { color: C.blue } });
  sl.addText("Skill 1: GET /api/ticket/:id → Zendesk API", { x: 3.2, y: 1.68, w: 3.6, h: 0.5, fontSize: 11, fontFace: "Arial", color: C.white, align: "center", valign: "middle", bold: true, margin: 0 });

  sl.addText("↓", { x: 4.7, y: 2.18, w: 0.6, h: 0.28, fontSize: 18, fontFace: "Arial", color: C.muted, align: "center", margin: 0 });

  // Row 3: Parallel header
  sl.addShape(pres.shapes.RECTANGLE, { x: 0.35, y: 2.46, w: 9.3, h: 0.38, fill: { color: "14532D" }, line: { color: C.green, width: 1 } });
  sl.addText("Promise.all() — PARALLEL", { x: 0.35, y: 2.46, w: 9.3, h: 0.38, fontSize: 13, fontFace: "Arial Black", bold: true, color: C.green, align: "center", valign: "middle", margin: 0 });

  // Row 4: 4 parallel boxes
  const pBoxes = [
    { x: 0.35, text: "Skill 2\n/api/account",    color: "1D4ED8" },
    { x: 2.7,  text: "Skill 3\n/api/stripe",      color: "B45309" },
    { x: 5.05, text: "Skill 4\n/api/debug",       color: "7C3AED" },
    { x: 7.4,  text: "Skill 5\n/api/docs",        color: "0F766E" },
  ];
  pBoxes.forEach(b => {
    sl.addShape(pres.shapes.RECTANGLE, { x: b.x, y: 2.86, w: 2.2, h: 0.68, fill: { color: b.color }, line: { color: b.color } });
    sl.addText(b.text, { x: b.x + 0.05, y: 2.86, w: 2.1, h: 0.68, fontSize: 12, fontFace: "Arial", color: C.white, align: "center", valign: "middle", bold: true, margin: 0 });
  });

  sl.addText("↓  All results combined", { x: 3.5, y: 3.56, w: 3.0, h: 0.3, fontSize: 12, fontFace: "Arial", color: C.muted, align: "center", margin: 0 });

  // Row 5: Claude
  sl.addShape(pres.shapes.RECTANGLE, { x: 2.5, y: 3.88, w: 5.0, h: 0.5, fill: { color: "15803D" }, line: { color: C.green } });
  sl.addText("Skill 6: POST /api/analyze → Claude API (SSE stream)", { x: 2.5, y: 3.88, w: 5.0, h: 0.5, fontSize: 12, fontFace: "Arial", bold: true, color: C.white, align: "center", valign: "middle", margin: 0 });

  sl.addText("↓", { x: 4.7, y: 4.4, w: 0.6, h: 0.28, fontSize: 18, fontFace: "Arial", color: C.muted, align: "center", margin: 0 });

  // Row 6: Output
  sl.addShape(pres.shapes.RECTANGLE, { x: 2.8, y: 4.68, w: 4.4, h: 0.5, fill: { color: "B45309" }, line: { color: C.orange } });
  sl.addText("Draft ready — Agent reviews + sends / Jira / Slack", { x: 2.8, y: 4.68, w: 4.4, h: 0.5, fontSize: 12, fontFace: "Arial", bold: true, color: C.white, align: "center", valign: "middle", margin: 0 });
}

// ──────────────────────────────────────────────────────────────────────────────
// SLIDE 10 — LIVE DEMO
// ──────────────────────────────────────────────────────────────────────────────
{
  let sl = pres.addSlide();
  sl.background = { color: C.bg };

  // Header accent
  sl.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.07, fill: { color: C.blue }, line: { color: C.blue } });

  // Title
  sl.addText("Live Demo", {
    x: 0.4, y: 0.15, w: 9.2, h: 0.6, fontSize: 40, fontFace: "Arial Black", bold: true, color: C.white, align: "left", margin: 0,
  });

  // Subtitle
  sl.addText("Load ticket #12366 — Google Consent Mode v2", {
    x: 0.4, y: 0.82, w: 9.2, h: 0.38, fontSize: 17, fontFace: "Arial", color: C.muted, italic: true, align: "left", margin: 0,
  });

  // 6 checklist items
  const checks = [
    { text: "Enter ticket ID",                                       detail: "→ Skill 1 fires (Zendesk loads)" },
    { text: "Skills 2 + 5 light up green",                           detail: "simultaneously" },
    { text: "Skills 3 + 4 fire next",                                detail: "(Stripe + Debug in parallel)" },
    { text: "Claude streams the reply in real-time",                  detail: "" },
    { text: "Draft appears — multiple variants",                     detail: "for ambiguous query" },
    { text: "Add 2 more tickets",                                    detail: "→ all 3 run at once" },
  ];

  checks.forEach((item, i) => {
    const y = 1.3 + i * 0.63;
    // Checkbox square
    sl.addShape(pres.shapes.RECTANGLE, { x: 0.35, y: y + 0.05, w: 0.38, h: 0.38, fill: { color: C.bgCard }, line: { color: C.blue, width: 2 } });
    // Item text
    sl.addText([
      { text: item.text, options: { bold: true, color: C.white } },
      { text: item.detail ? "  " + item.detail : "", options: { color: C.muted } },
    ], { x: 0.85, y: y + 0.02, w: 8.8, h: 0.46, fontSize: 15, fontFace: "Arial", align: "left", valign: "middle" });
  });

  // Bottom status line
  sl.addShape(pres.shapes.RECTANGLE, { x: 0.35, y: 5.12, w: 9.3, h: 0.34, fill: { color: "162032" }, line: { color: C.blue, width: 1 } });
  sl.addText("Skill pipeline status:  queued → running → done ✓", {
    x: 0.45, y: 5.12, w: 9.1, h: 0.34, fontSize: 13, fontFace: "Courier New", color: C.green, align: "center", valign: "middle", margin: 0,
  });
}

// ──────────────────────────────────────────────────────────────────────────────
// SLIDE 11 — BEFORE vs AFTER
// ──────────────────────────────────────────────────────────────────────────────
{
  let sl = pres.addSlide();
  sl.background = { color: C.bg };

  // Header accent
  sl.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.07, fill: { color: C.green }, line: { color: C.green } });

  // Title
  sl.addText("Impact: Before & After", {
    x: 0.4, y: 0.15, w: 9.2, h: 0.6, fontSize: 36, fontFace: "Arial Black", bold: true, color: C.white, align: "left", margin: 0,
  });

  const tableRows = [
    [
      { text: "Metric",             options: { fill: { color: "334155" }, color: C.white, bold: true, align: "left"   } },
      { text: "Before (Manual)",    options: { fill: { color: "7F1D1D" }, color: C.white, bold: true, align: "center" } },
      { text: "After (CX Panel)",   options: { fill: { color: "14532D" }, color: C.white, bold: true, align: "center" } },
    ],
    ...([
      ["Time per ticket",     "8–12 minutes",      "~30 seconds"],
      ["Browser tabs",        "5–6 tabs",           "1 dashboard"],
      ["Account lookup",      "Manual search",      "Automatic — Skill 2"],
      ["Billing check",       "Open Stripe",        "Automatic — Skill 3"],
      ["Site debug",          "Check manually",     "Automatic — Skill 4"],
      ["Reply writing",       "From scratch",       "Claude-drafted + reviewed"],
      ["Concurrent tickets",  "1 at a time",        "3 simultaneously"],
      ["Jira bug creation",   "Manual copy-paste",  "One-click"],
    ].map((r, i) => {
      const bg = i % 2 === 0 ? "1E293B" : "162032";
      return [
        { text: r[0], options: { fill: { color: bg }, color: C.white,  bold: true,  align: "left" } },
        { text: r[1], options: { fill: { color: bg }, color: C.red,    bold: false, align: "center" } },
        { text: r[2], options: { fill: { color: bg }, color: C.green,  bold: true,  align: "center" } },
      ];
    }))
  ];

  sl.addTable(tableRows, {
    x: 0.35, y: 0.9, w: 9.3, h: 4.0,
    colW: [2.6, 3.0, 3.7],
    border: { pt: 0.5, color: "334155" },
    fontSize: 14, fontFace: "Arial",
    rowH: 0.42,
  });

  // Callout
  sl.addShape(pres.shapes.RECTANGLE, { x: 0.35, y: 5.05, w: 9.3, h: 0.42, fill: { color: "14532D" }, line: { color: C.green, width: 2 } });
  sl.addText("~95% reduction in manual lookup time per ticket", {
    x: 0.45, y: 5.05, w: 9.1, h: 0.42, fontSize: 16, fontFace: "Arial Black", bold: true, color: C.green, align: "center", valign: "middle", margin: 0,
  });
}

// ──────────────────────────────────────────────────────────────────────────────
// SLIDE 12 — SUMMARY
// ──────────────────────────────────────────────────────────────────────────────
{
  let sl = pres.addSlide();
  sl.background = { color: C.bg };

  // Header accent
  sl.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.07, fill: { color: C.blue }, line: { color: C.blue } });

  // Title
  sl.addText("Summary", {
    x: 0.4, y: 0.15, w: 9.2, h: 0.6, fontSize: 40, fontFace: "Arial Black", bold: true, color: C.white, align: "left", margin: 0,
  });

  // 2×2 grid of cards
  const cards = [
    { x: 0.3,  y: 0.95, color: C.blue,   borderColor: "1D4ED8", num: "8",    heading: "Specialist Agents",     body: "Each skill handles one job — from ticket loading to AI drafting" },
    { x: 5.15, y: 0.95, color: C.green,  borderColor: "15803D", num: "⚡",   heading: "Parallel Execution",    body: "Skills fire in groups simultaneously — cutting wait time by ~70%" },
    { x: 0.3,  y: 3.0,  color: C.orange, borderColor: "B45309", num: "3",    heading: "Multi-Ticket Queue",    body: "Up to 3 tickets at once — semaphore-controlled, isolated state" },
    { x: 5.15, y: 3.0,  color: C.purple, borderColor: "7C3AED", num: "1",    heading: "One Claude Call",       body: "All data batched into a single streaming API call — efficient and fast" },
  ];

  cards.forEach(card => {
    // Card background
    sl.addShape(pres.shapes.RECTANGLE, { x: card.x, y: card.y, w: 4.55, h: 1.85, fill: { color: C.bgCard }, line: { color: card.borderColor, width: 2 }, shadow: mkShadow() });

    // Left accent stripe
    sl.addShape(pres.shapes.RECTANGLE, { x: card.x, y: card.y, w: 0.65, h: 1.85, fill: { color: card.color }, line: { color: card.color } });

    // Number / icon
    sl.addText(card.num, { x: card.x, y: card.y + 0.25, w: 0.65, h: 1.0, fontSize: 42, fontFace: "Arial Black", bold: true, color: C.white, align: "center", margin: 0 });

    // Heading
    sl.addText(card.heading, { x: card.x + 0.75, y: card.y + 0.15, w: 3.65, h: 0.52, fontSize: 18, fontFace: "Arial Black", bold: true, color: card.color, align: "left", margin: 0 });

    // Body
    sl.addText(card.body, { x: card.x + 0.75, y: card.y + 0.72, w: 3.65, h: 1.0, fontSize: 13, fontFace: "Arial", color: C.white, align: "left", valign: "top", margin: 0 });
  });

  // Footer
  sl.addShape(pres.shapes.RECTANGLE, { x: 0, y: 5.3, w: 10, h: 0.325, fill: { color: "0D1117" }, line: { color: "0D1117" } });
  sl.addText("React · TypeScript · Node.js · Express · Claude API · Zendesk · Stripe · Jira · Slack", {
    x: 0.25, y: 5.3, w: 9.5, h: 0.325, fontSize: 11, fontFace: "Arial", color: C.muted, align: "center", valign: "middle", margin: 0,
  });
}

// ─── Write file ──────────────────────────────────────────────────────────────
pres.writeFile({ fileName: "/Users/Vishnu/Documents/CodeBase/Support_project/CX Intelligence panel/CX_Intelligence_MultiAgent_Architecture.pptx" })
  .then(() => console.log("✅ PPTX saved successfully."))
  .catch(e => { console.error("❌ Error:", e); process.exit(1); });
