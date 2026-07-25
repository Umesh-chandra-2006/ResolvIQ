# ResolvIQ — Dispute Resolution Engine

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
- Hash chain (SHA-256 via Web Crypto) — real hashing, real chain verification
- Reg Z clock arithmetic — real date math from 12 CFR §1026.13

**Mocked (clearly labeled):**
- Card network / transaction data — seeded JSON fixtures
- Carrier / delivery tracking — seeded JSON with artificial latency
- Merchant systems — seeded JSON
- OCR — pre-extracted fields (show "OCR extracted" badge)
- Payment execution — state change + toast only
- LLM narration — deterministic template engine (no API key needed)
- Auth — role switcher in the top bar

## Scenarios

| ID | Description | Expected |
|----|-------------|----------|
| A · D-2026-0847 | Clean member win, goods not received | member, conf 0.91, auto_resolve |
| B · D-2026-0848 | Friendly-fraud pattern | HR-1+HR-3 fire, human_escalation |
| C · D-2026-0849 | Genuine ambiguity, not as described | split 68/32, proposed_split |
| D · D-2026-0850 | Unrecognised charge, pre-adjudication | 24h window active |

Use the **Demo Control** panel (top right) to jump between scenarios.

## Architecture

6-layer architecture: Intake → Evidence Assembly → Scoring Engine → Reasoning → Routing → Portals, with a cross-cutting hash-chained audit ledger.
