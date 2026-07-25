"use client";

import { GuardClaim } from "@/lib/types";

type Props = {
  guardReport: GuardClaim[];
};

export function FaithfulnessCheck({ guardReport }: Props) {
  const traced = guardReport.filter((g) => g.tracedTo !== null).length;
  const total = guardReport.length;
  const allPass = traced === total;

  return (
    <div className="bg-bg-secondary border border-border rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted">
          Faithfulness Check
        </h3>
        <span
          className={`text-xs font-mono font-bold ${
            allPass ? "text-success" : "text-danger"
          }`}
        >
          {traced}/{total} claims traced
        </span>
      </div>

      <div className="space-y-1.5">
        {guardReport.map((g, i) => (
          <div
            key={i}
            className={`flex items-start gap-2 text-xs p-2 rounded ${
              g.tracedTo
                ? "bg-success-dim/30"
                : "bg-danger-dim/30"
            }`}
          >
            <span className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${g.tracedTo ? "bg-success" : "bg-danger"}`} />
            <div className="flex-1 min-w-0">
              <p className="text-text-secondary leading-relaxed">{g.claim}</p>
              <p className={`mt-0.5 font-mono text-[10px] ${g.tracedTo ? "text-success" : "text-danger"}`}>
                {g.tracedTo ? `→ ${g.tracedTo}` : "not traceable → regenerate"}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
