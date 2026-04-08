# Implementation Plan: AI Loader + Draft-Ready Signals
**Date:** 2026-04-07
**Status:** Ready for Implementation
**Scope:** Two UI bugs — collapsed sidebar AI indicator + premature "Done" badge / empty draft editor

---

## Overview

- **Bug 1:** Collapsed conversation sidebar (40px wide) shows only a vertical ticket ID — no AI activity signal while streaming, no done checkmark.
- **Bug 2:** (a) `AgentGate` renders a blank `DraftEditor` textarea while AI is still streaming. (b) `TicketQueuePanel` shows green "Done" badge without confirming draft is parsed/ready. No intermediate "Drafting" state exists.

No backend changes required. No new API endpoints. The only store change is one `boolean` field.

---

## Codebase Verification Summary

| File | Confirmed State |
|------|----------------|
| `ticketQueueStore.ts` | `PerTicketState` has no `draftReady` field. `makeInitialTicket` inits 8 skill statuses. |
| `useTicketQueue.ts` | `parseDraftAndCategory` has 2 `updateTicket` calls. `injectConsentDemoVariants` has 1. `regenDraft` clears `draft` but does NOT reset `draftReady`. |
| `TicketDesk.tsx` | Collapsed conv strip is lines 186-195. `Sparkles` already imported. `CheckCircle` NOT imported. |
| `TicketQueuePanel.tsx` | `StatusBadge` takes only `{ status }`. `Sparkles` NOT imported. `CheckCircle` already imported. |
| `AgentGate.tsx` | Line 227: bare `<DraftEditor draft={draft} onChange={setDraft} />`. `Sparkles` already imported. `draftReady` not in scope. |

---

## Bug 1 — Collapsed Conversation Strip: AI Activity Indicator

### Problem

`TicketDesk.tsx` lines 186-195 render the collapsed conversation column (40px, `convSize === 'collapsed'`). Only a vertical ticket ID is shown. Zero signal for: AI streaming, which skill is active, or analysis complete.

### Data Needed in TicketDesk

Add these three derived values alongside the existing `isRunning` on line 43:

```typescript
const skill7Status    = activeTicket?.skillStatuses?.[7] ?? 'idle';
const anySkillRunning = activeTicket
  ? Object.values(activeTicket.skillStatuses).some((s) => s === 'running')
  : false;
const draftReady      = activeTicket?.draftReady ?? false;
```

### Import Change

Add `CheckCircle` to the existing lucide-react import (lines 13-17):

```typescript
import {
  Zap, CreditCard, User,
  ChevronsLeft, ChevronsRight,
  MessageSquare, Sparkles, ListChecks, CheckCircle,
} from 'lucide-react';
```

### JSX Replacement (lines 186-195)

Replace the existing collapsed block:

```tsx
{convSize === 'collapsed' && (
  <div className="flex-1 flex flex-col items-center pt-3 gap-2">

    {/* AI activity icon — top of strip */}
    {skill7Status === 'running' && (
      <Sparkles className="w-3 h-3 text-amber-400 animate-pulse flex-shrink-0" />
    )}
    {activeTicket?.status === 'done' && draftReady && (
      <CheckCircle className="w-3 h-3 text-green-400 flex-shrink-0" />
    )}

    {/* Mini vertical skill progress — only while any skill is running */}
    {anySkillRunning && (
      <div className="flex flex-col items-center gap-0.5">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((id) => {
          const s = activeTicket?.skillStatuses?.[id] ?? 'idle';
          return (
            <div
              key={id}
              className={`w-3 h-1.5 rounded-sm transition-all ${
                s === 'done'    ? 'bg-green-400' :
                s === 'running' ? 'bg-blue-400 animate-pulse' :
                s === 'error'   ? 'bg-red-400' :
                s === 'skipped' ? 'bg-gray-200' :
                'bg-gray-100'
              }`}
            />
          );
        })}
      </div>
    )}

    {/* Ticket ID — existing vertical text */}
    <span
      className="text-[10px] font-mono text-gray-400 flex-shrink-0"
      style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', letterSpacing: '0.05em' }}
    >
      #{(bundle as unknown as { ticket?: { id?: string | number } }).ticket?.id ?? '—'}
    </span>
  </div>
)}
```

### Visual State Table

| Ticket Status | skill7Status | draftReady | anySkillRunning | Strip shows |
|--------------|-------------|-----------|----------------|-------------|
| queued | idle | false | false | Ticket ID only |
| running (skills 1–6) | idle | false | true | Skill dots (blue pulse on active) + Ticket ID |
| running (skill 7 active) | running | false | true | Sparkles (amber pulse) + skill dots + Ticket ID |
| done | done | true | false | CheckCircle (green) + Ticket ID |
| done | done | false | false | Ticket ID only (parse failure edge case) |
| error | — | false | false | Ticket ID only |

---

## Bug 2 — Draft Loading State + Queue Badge Premature "Done"

### Root Causes

**A.** `AgentGate.tsx` line 227 renders `<DraftEditor draft={draft} onChange={setDraft} />` unconditionally. During the entire duration of skill 7 streaming, `draft === ''` so the editor renders blank — looks broken.

**B.** `TicketQueuePanel` `StatusBadge` shows green "Done" immediately on `status === 'done'`. If `parseDraftAndCategory` fails silently (regex miss on malformed AI output), `draft` can be empty while the badge shows Done — a false signal.

**C.** No intermediate visual state between "skill 7 done" and "draft populated in editor" for the queue row.

---

### Step 1 — Add `draftReady` to Store

**File:** `frontend/src/store/ticketQueueStore.ts`

In `PerTicketState` interface, add after `querySummary` (line 39):
```typescript
draftReady: boolean;    // true once parseDraftAndCategory has successfully set the draft
```

In `makeInitialTicket()`, add after `querySummary: ''` (line 65):
```typescript
draftReady: false,
```

No other changes. `updateTicket` already accepts `Partial<PerTicketState>`.

---

### Step 2 — Set `draftReady: true` in parseDraftAndCategory

**File:** `frontend/src/hooks/useTicketQueue.ts`

**Call site 1 — variants path** (~lines 103-108):
```typescript
store.updateTicket(ticketId, {
  querySummary: summaryMatch ? summaryMatch[1].trim() : '',
  category: categoryMatch ? categoryMatch[1].trim() : '',
  draftVariants: variants,
  draft: variants[0].draft,
  draftReady: true,   // ADD
});
```

**Call site 2 — standard path** (~lines 121-126):
```typescript
store.updateTicket(ticketId, {
  querySummary: summaryMatch ? summaryMatch[1].trim() : '',
  category: categoryMatch ? categoryMatch[1].trim() : '',
  draftVariants: [],
  draft: draftMatch ? draftMatch[1].trim() : fallback,
  draftReady: true,   // ADD
});
```

**`injectConsentDemoVariants` function** (~lines 175-181):
```typescript
store.updateTicket(ticketId, {
  draftVariants: [...],
  draft: draftA,
  draftReady: true,   // ADD
});
```

**`regenDraft` reset patch** (~lines 482-487) — add `draftReady: false` so the loading skeleton reappears during regen:
```typescript
getStore().updateTicket(ticketId, {
  streamOutput: '',
  draft: '',
  draftVariants: [],
  querySummary: '',
  draftReady: false,    // ADD — restores skeleton during regen
  skillStatuses: { ...ticketState.skillStatuses, 7: 'running' },
});
```

---

### Step 3 — Update TicketQueuePanel StatusBadge

**File:** `frontend/src/components/ticket/TicketQueuePanel.tsx`

**Import change** — add `Sparkles` (currently line 1):
```typescript
import { CheckCircle, XCircle, Loader, Clock, Trash2, ListChecks, Sparkles } from 'lucide-react';
```

**Replace `StatusBadge` component** (currently lines 16-26):
```typescript
interface StatusBadgeProps {
  status: PerTicketState['status'];
  draftReady: boolean;
}

function StatusBadge({ status, draftReady }: StatusBadgeProps) {
  // Intermediate state: done but draft not yet parsed/ready (e.g. during regen)
  if (status === 'done' && !draftReady) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-600">
        <Sparkles className="w-2.5 h-2.5 animate-pulse" />
        Drafting
      </span>
    );
  }

  const { label, className } = STATUS_BADGE[status];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${className}`}>
      {status === 'running' && <Loader className="w-2.5 h-2.5 animate-spin" />}
      {status === 'done' && draftReady && <CheckCircle className="w-2.5 h-2.5" />}
      {status === 'error' && <XCircle className="w-2.5 h-2.5" />}
      {label}
    </span>
  );
}
```

**Update `QueueRow`** — pass `draftReady` to `StatusBadge` (~line 89):
```tsx
<StatusBadge status={ticket.status} draftReady={ticket.draftReady} />
```

**Update category display** (~lines 98-101) — gate on `draftReady`:
```tsx
{ticket.status === 'done' && ticket.draftReady && ticket.category && (
  <span className="inline-block mt-1 text-[10px] bg-amber-50 text-amber-700 border border-amber-100 rounded px-1.5 py-0.5">
    {ticket.category}
  </span>
)}
```

**Update `doneCount`** (~line 149) — progress bar advances only on real completion:
```typescript
const doneCount = sorted.filter((t) => t.status === 'done' && t.draftReady).length;
```

---

### Step 4 — Add Draft Loading Skeleton to AgentGate

**File:** `frontend/src/components/workflow/AgentGate.tsx`

**Add `draftReady` and `skill7Running`** (add after `isRunning` on line 35):
```typescript
const isRunning     = ticket?.status === 'running';
const draftReady    = ticket?.draftReady ?? false;
const skill7Running = (ticket?.skillStatuses?.[7] ?? 'idle') === 'running';
```

`skill7Running` is needed to correctly show the skeleton during `regenDraft` (where `status` stays `'done'` but skill 7 flips back to `'running'`).

**Replace the draft section** (currently lines 226-227):
```tsx
{/* ── Draft ───────────────────────────────────────────────────────── */}
{(isRunning && !draft) || (skill7Running && !draftReady) ? (
  // Loading skeleton while AI streams (also during regen)
  <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
    <div className="flex items-center px-4 py-2.5 border-b border-gray-100">
      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Draft Response</span>
    </div>
    <div className="p-4 space-y-2 animate-pulse">
      <div className="h-3 bg-gray-100 rounded-full w-full" />
      <div className="h-3 bg-gray-100 rounded-full w-5/6" />
      <div className="h-3 bg-gray-100 rounded-full w-4/5" />
      <div className="h-3 bg-gray-100 rounded-full w-full" />
      <div className="h-3 bg-gray-100 rounded-full w-3/4" />
      <div className="flex items-center gap-1.5 mt-3">
        <Sparkles className="w-3 h-3 text-brand animate-pulse" />
        <span className="text-xs text-gray-400 animate-pulse">Drafting your response…</span>
      </div>
    </div>
  </div>
) : !draftReady && !isRunning && !skill7Running ? (
  // Safety net: done but draft empty (parse failure or pre-run state)
  <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
    <div className="flex items-center px-4 py-2.5 border-b border-gray-100">
      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Draft Response</span>
    </div>
    <div className="p-4 text-xs text-gray-400 text-center py-6">
      {bundle
        ? 'Draft unavailable — try regenerating.'
        : 'Run the workflow to generate a draft.'}
    </div>
  </div>
) : (
  <DraftEditor draft={draft} onChange={setDraft} />
)}
```

**Design note:** The skeleton wraps itself in the same `bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm` as the `DraftEditor` container so layout does not shift — no jarring collapse/expand when the real editor appears.

---

## Execution Order

| Step | File | Depends On |
|------|------|-----------|
| 1 | `ticketQueueStore.ts` — add `draftReady` field | Nothing |
| 2 | `useTicketQueue.ts` — set `draftReady: true/false` | Step 1 (type must exist) |
| 3 | `TicketQueuePanel.tsx` — `StatusBadge` + `draftReady` gates | Step 1 |
| 4 | `AgentGate.tsx` — skeleton + `draftReady`/`skill7Running` | Step 1 |
| 5 | `TicketDesk.tsx` — collapsed strip AI indicator | Step 1 |

Steps 3, 4, 5 are independent of each other; all require Step 1 for the type.

After Step 1, run `npx tsc --noEmit` to find all TypeScript callsites that now require `draftReady`.

---

## Full Visual State Machine

```
Ticket submitted
      │
      ▼
┌─────────────┐  Queue panel:    [Queued] gray badge, no category
│  QUEUED     │  Collapsed strip: ticket ID only
│             │  AgentGate:      "Run the workflow to generate a draft."
└──────┬──────┘
       │ runSingle() starts
       ▼
┌─────────────┐  Queue panel:    [Running] blue spinner + skill bars
│  RUNNING    │  Collapsed strip: skill dots (blue pulse on active skill)
│  skills 1-6 │  AgentGate:      "Run the workflow to generate a draft."
└──────┬──────┘
       │ skill 7 starts
       ▼
┌─────────────┐  Queue panel:    [Running] blue spinner + all 8 skill dots
│  RUNNING    │  Collapsed strip: Sparkles (amber pulse) + skill dots + ID
│  skill7     │  AgentGate:      Loading skeleton "Drafting your response…"
│  streaming  │
└──────┬──────┘
       │ streamAnalysis() resolves
       │ skillStatuses[7] → 'done'
       │ parseDraftAndCategory() runs → draftReady: true, draft populated
       │ (status still 'running' briefly)
       ▼
┌─────────────┐  Queue panel:    [Running] (status:'running' still)
│  RUNNING    │  Collapsed strip: CheckCircle (green) + ticket ID
│  draftReady │  AgentGate:      DraftEditor with populated draft
│  = true     │
└──────┬──────┘
       │ Promise.allSettled resolves → status: 'done'
       ▼
┌─────────────┐  Queue panel:    [Done] green ✓ + category badge
│  DONE       │  Collapsed strip: CheckCircle (green) + ticket ID
│  draftReady │  AgentGate:      DraftEditor + Regenerate button visible
│  = true     │
└─────────────┘

── Regen flow (status stays 'done' throughout) ───────────────────────

User clicks Regenerate
      │ regenDraft() clears draft='', draftReady=false, skill7='running'
      ▼
┌─────────────┐  Queue panel:    [Drafting] amber + sparkles (done && !draftReady)
│  DONE       │  Collapsed strip: Sparkles (amber pulse) — skill7Running=true
│  draftReady │  AgentGate:      Loading skeleton (skill7Running && !draftReady)
│  = false    │
└──────┬──────┘
       │ parseDraftAndCategory() runs → draftReady: true, new draft set
       ▼
┌─────────────┐  Queue panel:    [Done] green ✓ + updated category
│  DONE       │  Collapsed strip: CheckCircle (green)
│  draftReady │  AgentGate:      DraftEditor with new draft
│  = true     │
└─────────────┘
```

---

## Edge Cases

| Scenario | Behavior | Acceptable? |
|----------|----------|-------------|
| Normal flow: parse always succeeds | `draftReady: true` set before `status: 'done'` — "Drafting" badge never visible | Yes |
| Parse failure (malformed AI output) | `draftReady` stays false; badge shows "Drafting"; AgentGate shows "Draft unavailable" | Yes — accurate |
| SSE stream error mid-flight | `skill7 → 'error'`, `status → 'error'` via catch block; `draftReady` stays false | Yes — error badge dominates |
| Ticket 12366 demo (injectConsentDemoVariants) | `draftReady: true` added to that updateTicket call | Covered in Step 2 |
| Regen flow | `draftReady: false` reset; skeleton shows via `skill7Running` condition | Covered in Step 4 |
| Batch mode (multiple parallel tickets) | Each ticket's `draftReady` is isolated in its own `PerTicketState` | No cross-ticket interference |
| Collapsed left QUEUE sidebar (`!queueOpen`) | Not in scope — shows "Queue (N)" count, no change | N/A |

---

## File Change Summary

| File | Lines Affected | Summary |
|------|---------------|---------|
| `frontend/src/store/ticketQueueStore.ts` | ~39, ~65 | Add `draftReady: boolean` to interface + init `false` |
| `frontend/src/hooks/useTicketQueue.ts` | ~103-108, ~121-126, ~175-181, ~482-487 | `draftReady: true` at 3 parse sites; `draftReady: false` at regen reset |
| `frontend/src/pages/TicketDesk.tsx` | ~13-17, ~43-44, ~186-195 | `CheckCircle` import; 3 derived vars; replace collapsed strip JSX |
| `frontend/src/components/ticket/TicketQueuePanel.tsx` | ~1, ~16-26, ~89, ~98-101, ~149 | `Sparkles` import; expand `StatusBadge`; pass `draftReady`; gate category; update `doneCount` |
| `frontend/src/components/workflow/AgentGate.tsx` | ~35, ~226-228 | Add `draftReady` + `skill7Running`; replace bare `<DraftEditor>` with conditional skeleton |

**Total:** 5 files modified, 0 new files, 0 backend changes.
