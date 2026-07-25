"use client";

import { useState, useEffect } from "react";
import { DisputeCase } from "@/lib/types";
import { Badge } from "@/components/shared/Badge";
import { useAppStore } from "@/lib/store";

type Props = {
  disputeCase: DisputeCase;
};

export function RespondWindow({ disputeCase }: Props) {
  const [countdown, setCountdown] = useState(24 * 60 * 60);
  const acceptSplit = useAppStore((s) => s.acceptSplit);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((c) => Math.max(0, c - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = Math.floor(countdown / 3600);
  const minutes = Math.floor((countdown % 3600) / 60);
  const seconds = countdown % 60;

  return (
    <div className="bg-bg-secondary border border-border rounded-lg p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-[10px] text-text-muted uppercase tracking-wider">Pre-Adjudication Window</span>
          <h3 className="text-sm font-semibold text-text-primary mt-0.5">
            Respond to dispute {disputeCase.id}
          </h3>
        </div>
        <Badge label="24h Window" variant="warning" />
      </div>

      <div className="p-4 bg-bg-tertiary rounded-lg border border-border mb-4 text-center">
        <p className="text-[10px] text-text-muted uppercase tracking-wider mb-1">Time Remaining</p>
        <p className="text-3xl font-mono font-bold text-warning">
          {String(hours).padStart(2, "0")}:{String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
        </p>
      </div>

      <div className="p-3 bg-accent-dim/30 rounded border border-accent/20 mb-4">
        <p className="text-xs text-text-secondary">
          <strong className="text-text-primary">Resolving here typically costs $20–30</strong> versus $110–450 as a chargeback.
          You can accept the proposed split or contest with evidence.
        </p>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => acceptSplit(disputeCase.id, "merchant")}
          className="flex-1 px-4 py-2.5 text-xs bg-success text-white rounded hover:bg-success/80 transition-colors font-medium"
        >
          Refund Now
        </button>
        <button className="flex-1 px-4 py-2.5 text-xs bg-bg-tertiary text-text-secondary border border-border rounded hover:bg-bg-hover transition-colors">
          Contest with Evidence
        </button>
      </div>
    </div>
  );
}
