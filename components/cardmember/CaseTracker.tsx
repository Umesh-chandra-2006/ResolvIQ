"use client";

import { DisputeCase } from "@/lib/types";
import { Badge } from "@/components/shared/Badge";
import { EvidenceChip } from "@/components/shared/EvidenceChip";

type Props = {
  disputeCase: DisputeCase;
};

const STATUS_ORDER = ["filed", "evidence_collected", "scoring", "narrated", "routed", "resolved"];

const STATUS_LABELS: Record<string, string> = {
  filed: "Filed",
  evidence_collected: "Evidence Collected",
  scoring: "Scoring",
  narrated: "Narration",
  routed: "Routed",
  resolved: "Resolved",
  escalated: "Escalated",
  appealed: "Appealed",
};

export function CaseTracker({ disputeCase }: Props) {
  const statusIdx = STATUS_ORDER.indexOf(disputeCase.status);
  const ackDate = new Date(disputeCase.regZ.ackDeadline);
  const resolveDate = new Date(disputeCase.regZ.resolveDeadline);
  const now = new Date();
  const daysUntilAck = Math.max(0, Math.ceil((ackDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  const daysUntilResolve = Math.max(0, Math.ceil((resolveDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

  return (
    <div className="bg-bg-secondary border border-border rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-xs text-text-muted font-mono">{disputeCase.id}</span>
          <h3 className="text-sm font-semibold text-text-primary mt-0.5">
            ${disputeCase.amount.toFixed(2)} — {disputeCase.reasonCode.replace(/_/g, " ")}
          </h3>
        </div>
        <Badge
          label={STATUS_LABELS[disputeCase.status] || disputeCase.status}
          variant={disputeCase.status === "resolved" ? "success" : disputeCase.status === "escalated" ? "danger" : "info"}
        />
      </div>

      <div className="flex items-center gap-1 mb-4">
        {STATUS_ORDER.map((s, i) => (
          <div key={s} className="flex items-center">
            <div
              className={`h-1.5 flex-1 rounded-full ${
                i <= statusIdx ? "bg-accent" : "bg-bg-tertiary"
              }`}
            />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="p-2 bg-bg-tertiary rounded border border-border">
          <p className="text-[10px] text-text-muted uppercase tracking-wider">Reg Z Acknowledgment</p>
          <p className="text-sm font-mono text-text-primary mt-0.5">
            {daysUntilAck > 0 ? `${daysUntilAck}d remaining` : "Due"}
          </p>
          <p className="text-[10px] text-text-muted">Statutory limit: 30 days</p>
        </div>
        <div className="p-2 bg-bg-tertiary rounded border border-border">
          <p className="text-[10px] text-text-muted uppercase tracking-wider">Reg Z Resolution</p>
          <p className="text-sm font-mono text-text-primary mt-0.5">
            {daysUntilResolve}d remaining
          </p>
          <p className="text-[10px] text-text-muted">2 billing cycles, max 90 days</p>
        </div>
      </div>

      {disputeCase.evidence.length > 0 && (
        <div>
          <p className="text-[10px] text-text-muted uppercase tracking-wider mb-2">Evidence</p>
          <div className="flex flex-wrap gap-1.5">
            {disputeCase.evidence.map((e) => (
              <EvidenceChip key={e.id} evidence={e} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
