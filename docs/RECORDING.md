# Recording Script — 90-Second Demo

## Demo Control Settings
- Speed: **1×** (default)
- Inject Unfaithful Claim: **OFF**
- Tampered Entry: **None** (until tamper step)

## Script

| Time | Beat | Screen | Click Target |
|------|------|--------|--------------|
| 0:00–0:10 | Member files goods-not-received, uploads receipt | Cardmember | "File a Dispute" → select TXN-99821 → "Goods not received" → type claim → "Submit Dispute" |
| 0:10–0:25 | Five connectors fire in parallel, clock running, evidence cards land | Pipeline | Auto-navigated after filing |
| 0:25–0:40 | Balance renders; no delivery scan dominates; conf 0.91; scorecard agrees | Agent (Scenario A) | Click the case in Agent view, or navigate to Agent |
| 0:40–0:50 | Narration with faithfulness check 12/12 claims traced | Agent | Scroll to Faithfulness Check panel |
| 0:50–1:00 | Auto-resolve; both portals update; ledger entries chain | Cardmember + Merchant | Show decision view in Cardmember portal, then Merchant portal |
| 1:00–1:20 | Scenario B — signed delivery + device match, HR-1 fires, system refuses | Agent (Scenario B) | Demo Control → "Scenario B" → navigate to Agent view |
| 1:20–1:30 | Tamper — alter ledger entry #3, verify, chain breaks on screen | Audit | Demo Control → "Tamper Entry #3" → navigate to Audit → "Verify Chain" |

## Key Moments

1. **System refuses to pay** (1:00–1:20): Scenario B, HR-1 fires, the model leaned toward member but the hard rule blocks auto-credit. The agent view must show the rule log clearly.

2. **Chain refuses to be edited** (1:20–1:30): Tamper entry #3, verify chain, entries 1-2 green, 3 red, 4+ broken downstream. The visual break must be unmistakable.

## Pre-Recording Checklist

- [ ] All state reset (Demo Control → "Reset All State")
- [ ] Speed set to 1×
- [ ] Inject Unfaithful Claim OFF
- [ ] No tampered entries
- [ ] Fresh recording (clear browser cache)
- [ ] Browser at 1600×1000 minimum
- [ ] Second laptop ready as backup
- [ ] Offline backup video recorded on Day 13

## Scenario B Detailed Steps

1. Open Demo Control → click "Scenario B"
2. Navigate to Agent view
3. See D-2026-0848 in the escalation queue
4. Click to open
5. Evidence Balance shows rule override (lock icon)
6. Hard Rule Evaluation panel shows HR-1 FIRED, HR-3 FIRED
7. Model vs Scorecard: model leaned member, rules blocked
8. Agent clicks "Approve Verdict" or "Override" (override requires typed reason)

## Tamper Demo Detailed Steps

1. Open Demo Control → click "Alter Entry #3"
2. Navigate to Audit
3. Click "Verify Chain" button
4. Entries 1-2 show green checkmarks
5. Entry 3 shows red (broken)
6. Entries 4+ show orange (broken downstream)
7. Click "Reset" to restore chain integrity
