"use client";

import { DisputeCase } from "@/lib/types";
import { Badge } from "@/components/shared/Badge";
import { EvidenceChip } from "@/components/shared/EvidenceChip";

type Props = {
  disputeCase: DisputeCase;
};

export function MerchantCaseView({ disputeCase }: Props) {
  const decision = disputeCase.decision;

  return (
    <div className="bg-bg-secondary border border-border rounded-lg p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-xs text-text-muted font-mono">{disputeCase.id}</span>
          <h3 className="text-sm font-semibold text-text-primary mt-0.5">
            ${disputeCase.amount.toFixed(2)} — {disputeCase.reasonCode.replace(/_/g, " ")}
          </h3>
        </div>
        <Badge
          label={disputeCase.status.replace(/_/g, " ")}
          variant={disputeCase.status === "resolved" ? "success" : "info"}
        />
      </div>

      <div className="p-3 bg-accent-dim/20 rounded border border-accent/20 mb-4">
        <p className="text-xs text-text-secondary">
          <strong className="text-text-primary">Same timeline and rubric.</strong>{" "}
          Both the cardmember and merchant see identical case data and evaluation criteria. This symmetry is a core design principle.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-[10px] text-text-muted uppercase tracking-wider mb-2">
            🏪 Evidence (You Submitted)
          </p>
          <div className="space-y-1.5">
            {disputeCase.evidence
              .filter((e) => e.side === "merchant")
              .map((e) => (
                <EvidenceChip key={e.id} evidence={e} />
              ))}
            {disputeCase.evidence.filter((e) => e.side === "merchant").length === 0 && (
              <p className="text-xs text-text-muted italic">No evidence submitted yet</p>
            )}
          </div>
        </div>

        <div>
          <p className="text-[10px] text-text-muted uppercase tracking-wider mb-2">
            👤 Evidence (Cardmember Submitted)
          </p>
          <div className="space-y-1.5">
            {disputeCase.evidence
              .filter((e) => e.side === "member")
              .map((e) => (
                <EvidenceChip key={e.id} evidence={e} />
              ))}
            {disputeCase.evidence.filter((e) => e.side === "member").length === 0 && (
              <p className="text-xs text-text-muted italic">No evidence submitted yet</p>
            )}
          </div>
        </div>
      </div>

      <div>
        <p className="text-[10px] text-text-muted uppercase tracking-wider mb-2">
          ⚖️ System-Gathered Evidence
        </p>
        <div className="flex flex-wrap gap-1.5">
          {disputeCase.evidence
            .filter((e) => e.side === "neutral")
            .map((e) => (
              <EvidenceChip key={e.id} evidence={e} />
            ))}
        </div>
      </div>

      {decision && (
        <div className="mt-4 p-3 bg-bg-tertiary rounded border border-border">
          <p className="text-[10px] text-text-muted uppercase tracking-wider mb-1">Decision</p>
          <p className="text-sm text-text-secondary">{decision.narration}</p>
        </div>
      )}
    </div>
  );
}
