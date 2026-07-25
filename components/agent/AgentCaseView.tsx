"use client";

import { useState } from "react";
import { DisputeCase } from "@/lib/types";
import { EvidenceBalance } from "@/components/shared/EvidenceBalance";
import { FaithfulnessCheck } from "@/components/shared/FaithfulnessCheck";
import { Badge } from "@/components/shared/Badge";
import { RouteBadge } from "@/components/shared/RouteBadge";
import { CONTRIBUTION_LABELS } from "@/lib/fixtures/policy";
import { useAppStore } from "@/lib/store";

type Props = {
  disputeCase: DisputeCase;
};

export function AgentCaseView({ disputeCase }: Props) {
  const [overrideReason, setOverrideReason] = useState("");
  const [showOverride, setShowOverride] = useState(false);
  const overrideDecision = useAppStore((s) => s.overrideDecision);
  const decision = disputeCase.decision;

  if (!decision) {
    return (
      <div className="p-8 text-center text-text-muted">
        No decision yet for this case.
      </div>
    );
  }

  const handleOverride = async () => {
    if (!overrideReason.trim()) return;
    await overrideDecision(disputeCase.id, overrideReason.trim());
    setShowOverride(false);
    setOverrideReason("");
  };

  return (
    <div className="space-y-4">
      <div className="bg-bg-secondary border border-border rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <div>
            <span className="text-xs text-text-muted font-mono">{disputeCase.id}</span>
            <h3 className="text-sm font-semibold text-text-primary mt-0.5">
              ${disputeCase.amount.toFixed(2)} — {disputeCase.reasonCode.replace(/_/g, " ")}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <RouteBadge route={decision.route} />
            <Badge
              label={decision.verdict}
              variant={decision.verdict === "member" ? "success" : decision.verdict === "merchant" ? "warning" : "info"}
            />
          </div>
        </div>
        <div className="flex items-center gap-4 text-[10px] text-text-muted">
          <span>Confidence: <span className="text-text-primary font-mono">{(decision.confidence * 100).toFixed(0)}%</span></span>
          <span>Scorecard: {decision.scorecardAgreement ? "✓ Agrees" : "✗ Disagrees"}</span>
          <span>Model: scorer-v0.3</span>
        </div>
      </div>

      <EvidenceBalance
        contributions={decision.contributions}
        confidence={decision.confidence}
        hardRulesFired={decision.hardRulesFired}
      />

      <div className="bg-bg-secondary border border-border rounded-lg p-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-3">
          Feature Values
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {decision.contributions.map((c) => {
            const label = CONTRIBUTION_LABELS[c.feature] || c.feature;
            return (
              <div key={c.feature} className="flex items-center justify-between p-2 bg-bg-tertiary rounded text-xs">
                <span className="text-text-secondary">{label}</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-accent text-[10px]">{c.evidenceIds.join(", ")}</span>
                  <span className={`font-mono font-bold ${c.value > 0 ? "text-member" : "text-merchant"}`}>
                    {c.value > 0 ? "+" : ""}{c.value.toFixed(2)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-bg-secondary border border-border rounded-lg p-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-3">
          Hard Rule Evaluation
        </h3>
        <div className="space-y-2">
          {[
            { id: "HR-1", desc: "Delivery signature + device fingerprint match (goods_not_received)", fired: decision.hardRulesFired.includes("HR-1") },
            { id: "HR-2", desc: "Amount > $2,500", fired: decision.hardRulesFired.includes("HR-2") },
            { id: "HR-3", desc: "Member dispute rate z > 3.0", fired: decision.hardRulesFired.includes("HR-3") },
            { id: "HR-4", desc: "Model-scorecard disagreement > 0.25", fired: decision.hardRulesFired.includes("HR-4") },
          ].map((hr) => (
            <div key={hr.id} className={`flex items-center justify-between p-2 rounded text-xs ${hr.fired ? "bg-danger-dim/30 border border-danger/20" : "bg-bg-tertiary border border-border"}`}>
              <div className="flex items-center gap-2">
                <span className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold ${hr.fired ? "bg-danger text-white" : "bg-bg-elevated text-text-muted"}`}>
                  {hr.id}
                </span>
                <span className="text-text-secondary">{hr.desc}</span>
              </div>
              <Badge label={hr.fired ? "FIRED" : "passed"} variant={hr.fired ? "danger" : "neutral"} />
            </div>
          ))}
        </div>
      </div>

      <FaithfulnessCheck guardReport={decision.guardReport} />

      <div className="bg-bg-secondary border border-border rounded-lg p-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-3">
          Recommended Action
        </h3>
        <p className="text-sm text-text-secondary mb-4">{decision.narration}</p>

        <div className="flex gap-3">
          <button
            onClick={() => overrideDecision(disputeCase.id, "Approved as recommended")}
            className="flex-1 px-4 py-2.5 text-xs bg-success text-white rounded hover:bg-success/80 transition-colors font-medium"
          >
            Approve Verdict
          </button>
          <button
            onClick={() => setShowOverride(true)}
            className="flex-1 px-4 py-2.5 text-xs bg-danger text-white rounded hover:bg-danger/80 transition-colors font-medium"
          >
            Override
          </button>
        </div>

        {showOverride && (
          <div className="mt-3 p-3 bg-bg-tertiary rounded border border-border animate-fade-in-up">
            <p className="text-[10px] text-text-muted uppercase tracking-wider mb-2">
              Override Reason (required — writes to ledger)
            </p>
            <textarea
              value={overrideReason}
              onChange={(e) => setOverrideReason(e.target.value)}
              placeholder="Explain why you are overriding this decision..."
              className="w-full h-20 p-2 bg-bg-secondary border border-border rounded text-xs text-text-primary placeholder:text-text-muted resize-none focus:outline-none focus:border-accent"
            />
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => { setShowOverride(false); setOverrideReason(""); }}
                className="px-3 py-1.5 text-xs bg-bg-elevated text-text-secondary rounded border border-border hover:bg-bg-hover transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleOverride}
                disabled={!overrideReason.trim()}
                className="px-3 py-1.5 text-xs bg-danger text-white rounded hover:bg-danger/80 transition-colors disabled:opacity-50"
              >
                Confirm Override
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
