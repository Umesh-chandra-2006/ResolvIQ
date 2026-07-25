# Assumptions & Constraints

## What's Mocked and Why

| Component | Status | Why |
|-----------|--------|-----|
| Card network / transaction data | Mocked (seeded JSON) | No API access to card networks in prototype |
| Carrier / delivery tracking | Mocked (seeded JSON, artificial latency) | Parallel fan-out must be visible in demo |
| Merchant systems | Mocked (seeded JSON) | No merchant API integration in scope |
| OCR | Pre-extracted fields | Show "OCR extracted" chip; real Tesseract/Document AI in production |
| Payment execution | State change + toast only | Never claim money moved; payment rails require PCI scope |
| LLM narration | Deterministic template engine | No API key needed; reproducible for recording; same output every time |
| Auth | Role switcher in top bar | No login screens; judges trust honest disclosure |

All mocked sources carry a visible `MOCK` badge on every screen where they appear.

## Model / Weights

- **Scoring weights are hand-set**, not trained on data. No public dispute-resolution dataset exists (only fraud-detection sets). Production would train on held-out synthetic cases per §8 of the proposal.
- **Platt calibration constants** (A=-1.15, B=0.05) are fixed for the prototype. Production would calibrate on held-out data.
- **Monotonic tree stand-in** uses thresholded rules as a stand-in for a monotonic GBM. Production would use XGBoost with monotonicity constraints.

## Data

- No real card data is used anywhere. All transaction data is synthetic.
- Background cases (20) are generated with random but realistic distributions.
- The 4 main scenarios (A-D) are hand-crafted to demonstrate specific routing behaviors.

## Architecture Constraints

- **Single-region**: no geographic distribution in prototype scope.
- **Prototype scale**: 24 seeded cases, no concurrent users, no load testing.
- **Client-side only**: all state in Zustand store, no backend service, no database.
- **No API keys required**: default path works without any external service credentials.

## Regulatory

- **Reg Z** (12 CFR §1026.13) is the primary compliance framework for credit card billing disputes.
- **Reg E** (12 CFR §1005.11) is supported by the same engine but out of demo scope (applies to EFT/debit, not credit card disputes).
- Reg Z dates are computed from the actual regulation rules, not typed in.

## Production Path for Each Mocked Component

| Component | Production Path |
|-----------|-----------------|
| Intake NLP | Fine-tuned DistilBERT over Amex reason-code taxonomy |
| OCR | Google Document AI |
| Evidence connectors | AfterShip (carrier), merchant API integrations |
| Narration | Single LLM call with RAG grounding + faithfulness guard |
| Scoring | XGBoost with monotonicity constraints + SHAP |
| Data store | PostgreSQL + pgvector |
| Queue | Celery + Redis |
| Deployment | Vercel (frontend) + AWS (backend) |
