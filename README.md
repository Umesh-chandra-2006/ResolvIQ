# ResolvIQ — Frictionless Dispute & Chargeback Resolution

Click-through demo prototype for the American Express CodeStreet 2026 hackathon.

## Quick Start

```bash
npm install
npm run dev
```

No API keys required. All data is seeded/synthetic.

## What's Real vs Mocked

**Real (genuine computation, no faking):**
- Scoring engine (`lib/engine/score.ts`) — deterministic, same inputs → same output
- Hard-rule gate (HR-1–HR-4) — visibly overrides model on Scenario B
- Contribution attribution — exact additive contributions from the linear scorecard
- Faithfulness guard — real string/ID validation over narration output
- Hash chain (SHA-256 via Web Crypto) — real hashing, real chain verification, real tamper detection
- Reg Z clock arithmetic — real date math from 12 CFR §1026.13

**Mocked (clearly labeled with `MOCK` badge):**
- Card network / transaction data — seeded JSON fixtures
- Carrier / delivery tracking — seeded JSON with artificial 400–900ms latency
- Merchant systems — seeded JSON
- OCR — pre-extracted fields (show "OCR extracted" chip)
- Payment execution — state change + toast only. Never claim money moved
- LLM narration — deterministic template engine (no API key needed, reproducible)
- Auth — role switcher in the top bar. No login screens

## Scenarios

| ID | Description | Expected Route |
|----|-------------|----------------|
| A · D-2026-0847 | Clean member win, goods not received | member, conf 0.91, auto_resolve |
| B · D-2026-0848 | Friendly-fraud pattern (signed delivery + device match) | HR-1 + HR-3 fire, human_escalation |
| C · D-2026-0849 | Genuine ambiguity, not as described | split ≈68/32, proposed_split |
| D · D-2026-0850 | Unrecognised charge, pre-adjudication | 24h merchant window active |

Use the **Demo Control** panel (top right) to jump between scenarios.

## Architecture

```
┌──────────────────────────────────────────────────┐
│  LAYER 6 · PORTALS & DASHBOARDS                  │
│  Cardmember · Merchant · Agent · Audit · Ops     │
├──────────────────────────────────────────────────┤
│  LAYER 5 · ROUTING & COMPLIANCE                  │
│  Auto-resolve / proposed split / escalation       │
│  Reg Z clocks (12 CFR §1026.13)                  │
├──────────────────────────────────────────────────┤
│  LAYER 4 · TRANSPARENT REASONING                 │
│  Single LLM narration · RAG-grounded · guard     │
├──────────────────────────────────────────────────┤
│  LAYER 3 · FAIR-WEIGHING SCORING ENGINE          │
│  Hard rules + scorecard + monotonic tree + SHAP   │
├──────────────────────────────────────────────────┤
│  LAYER 2 · EVIDENCE ASSEMBLY (<60s)              │
│  5 parallel typed connectors                     │
├──────────────────────────────────────────────────┤
│  LAYER 1 · INTAKE & CLASSIFICATION               │
│  Multi-channel · Reason-code mapping              │
├──────────────────────────────────────────────────┤
│  CROSS-CUTTING · HASH-CHAINED AUDIT LEDGER       │
└──────────────────────────────────────────────────┘
```

## Project Structure

```
├── app/                      # Next.js App Router pages
│   ├── cardmember/           # File dispute, case tracker, decision view
│   ├── merchant/             # Respond window, symmetric case view
│   ├── agent/                # Escalation queue, contributions, override
│   ├── audit/                # Ledger spine, chain verification, tamper
│   ├── ops/                  # Queue table, metric tiles
│   └── pipeline/             # Full-screen fan-out visualization
├── components/               # React components
│   ├── layout/               # Sidebar, TopBar, DemoControl
│   ├── cardmember/           # FileDispute, CaseTracker, DecisionView
│   ├── merchant/             # RespondWindow, CaseView
│   ├── agent/                # AgentCaseView
│   ├── audit/                # AuditBrowser
│   ├── ops/                  # OpsDashboard
│   ├── pipeline/             # PipelineView
│   └── shared/               # Badge, EvidenceBalance, FaithfulnessCheck
├── lib/
│   ├── engine/
│   │   ├── score.ts          # Deterministic scoring engine (core thesis)
│   │   ├── narrate.ts        # Template narration + faithfulness guard
│   │   └── ledger.ts         # SHA-256 hash-chained ledger
│   ├── fixtures/
│   │   ├── cases.ts          # 4 scenarios + 20 background cases
│   │   └── policy.ts         # Reason-code policy text + labels
│   ├── store.ts              # Zustand state management
│   └── types.ts              # TypeScript type definitions
└── docs/
    ├── ASSUMPTIONS.md        # All assumptions and constraints
    ├── RECORDING.md          # 90-second recording script
    └── flows/                # Mermaid flow diagrams
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js (App Router) + React + TypeScript + Tailwind v4 |
| State | Zustand (in-memory, no database) |
| Scoring | Deterministic linear scorecard + monotonic tree stand-in |
| Hashing | Web Crypto API (SHA-256) |
| Narration | Deterministic template engine |
| Styling | Dark UI, institutional palette, no Amex branding |

## Documentation

- [Assumptions & Constraints](docs/ASSUMPTIONS.md)
- [Recording Script](docs/RECORDING.md)
- [Dispute Lifecycle Flow](docs/flows/dispute-lifecycle.mmd)
- [Evidence Assembly Flow](docs/flows/evidence-fanout.mmd)
- [Decision/Routing Flow](docs/flows/decision-routing.mmd)
- [Ledger Verification Flow](docs/flows/ledger-verify.mmd)
