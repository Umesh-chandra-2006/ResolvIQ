"use client";

import { DisputeCase } from "@/lib/types";
import { Badge } from "@/components/shared/Badge";
import { FaithfulnessCheck } from "@/components/shared/FaithfulnessCheck";
import { useAppStore } from "@/lib/store";

type Props = {
  disputeCase: DisputeCase;
};

export function DecisionView({ disputeCase }: Props) {
  const decision = disputeCase.decision;
  const appealCase = useAppStore((s) => s.appealCase);

  if (!decision) return null;

  const verdictLabel =
    decision.verdict === "member"
      ? "In favor of cardmember"
      : decision.verdict === "merchant"
        ? "In favor of merchant"
        : "Split decision";

  const verdictVariant =
    decision.verdict === "member"
      ? "success"
      : decision.verdict === "merchant"
        ? "warning"
        : "info";

  return (
    <div className="space-y-4">
      <div className="bg-bg-secondary border border-border rounded-lg p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-[10px] text-text-muted uppercase tracking-wider">Decision</span>
            <h3 className="text-lg font-semibold text-text-primary mt-0.5">{verdictLabel}</h3>
          </div>
          <Badge label={decision.route.replace(/_/g, " ")} variant={verdictVariant} />
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="p-2 bg-bg-tertiary rounded border border-border text-center">
            <p className="text-[10px] text-text-muted uppercase tracking-wider">Confidence</p>
            <p className="text-xl font-mono font-bold text-text-primary">{(decision.confidence * 100).toFixed(0)}%</p>
          </div>
          <div className="p-2 bg-bg-tertiary rounded border border-border text-center">
            <p className="text-[10px] text-text-muted uppercase tracking-wider">Cardmember</p>
            <p className="text-xl font-mono font-bold text-member">{decision.distribution.member}%</p>
          </div>
          <div className="p-2 bg-bg-tertiary rounded border border-border text-center">
            <p className="text-[10px] text-text-muted uppercase tracking-wider">Merchant</p>
            <p className="text-xl font-mono font-bold text-merchant">{decision.distribution.merchant}%</p>
          </div>
        </div>

        <div className="p-3 bg-bg-tertiary rounded border border-border mb-4">
          <p className="text-[10px] text-text-muted uppercase tracking-wider mb-2">Narration</p>
          <p className="text-sm text-text-secondary leading-relaxed">{decision.narration}</p>
        </div>

        {decision.hardRulesFired.length > 0 && (
          <div className="p-3 bg-danger-dim/30 rounded border border-danger/20 mb-4">
            <p className="text-[10px] text-danger uppercase tracking-wider mb-1">Hard Rules Fired</p>
            <div className="flex flex-wrap gap-2">
              {decision.hardRulesFired.map((r) => (
                <span key={r} className="px-2 py-0.5 bg-danger-dim text-danger text-[10px] font-mono rounded border border-danger/30">
                  {r}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[10px] text-text-muted">
            <span>Scorecard: {decision.scorecardAgreement ? "✓ Agrees" : "✗ Disagrees"}</span>
            <span>·</span>
            <span>Model version: scorer-v0.3</span>
          </div>
          {decision.route !== "human_escalation" && (
            <button
              onClick={() => appealCase(disputeCase.id)}
              className="px-3 py-1.5 text-xs bg-bg-tertiary text-text-secondary border border-border rounded hover:bg-bg-hover transition-colors"
            >
              Appeal (7 days remaining)
            </button>
          )}
        </div>
      </div>

      <FaithfulnessCheck guardReport={decision.guardReport} />
    </div>
  );
}
