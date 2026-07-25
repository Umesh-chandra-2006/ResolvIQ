"use client";

import { Contribution, HardRule } from "@/lib/types";
import { CONTRIBUTION_LABELS } from "@/lib/fixtures/policy";

type Props = {
  contributions: Contribution[];
  confidence: number;
  hardRulesFired: string[];
};

export function EvidenceBalance({ contributions, confidence, hardRulesFired }: Props) {
  const memberContribs = contributions.filter((c) => c.value > 0).sort((a, b) => b.value - a.value);
  const merchantContribs = contributions.filter((c) => c.value < 0).sort((a, b) => a.value - b.value);

  const maxAbsVal = Math.max(
    ...contributions.map((c) => Math.abs(c.value)),
    0.01
  );

  const totalPositive = memberContribs.reduce((s, c) => s + c.value, 0);
  const totalNegative = merchantContribs.reduce((s, c) => s + Math.abs(c.value), 0);
  const total = totalPositive + totalNegative;

  const balanceWidth = 100;
  const memberWidth = total > 0 ? (totalPositive / total) * balanceWidth : 50;
  const merchantWidth = total > 0 ? (totalNegative / total) * balanceWidth : 50;

  const equilibriumPos = (confidence) * balanceWidth;

  const hasBlockingRule = hardRulesFired.some((r) => r === "HR-1" || r === "HR-2" || r === "HR-3");

  return (
    <div className="bg-bg-secondary border border-border rounded-lg p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted">
          Evidence Balance
        </h3>
        <div className="flex items-center gap-2">
          {hasBlockingRule && (
            <span className="px-2 py-0.5 bg-danger-dim text-danger text-[10px] font-bold uppercase tracking-wider rounded border border-danger/30">
              🔒 Rule Override
            </span>
          )}
          <span className="text-[10px] text-text-muted">
            Confidence: <span className="text-text-primary font-mono font-bold">{(confidence * 100).toFixed(0)}%</span>
          </span>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between text-[10px] text-text-muted mb-1.5">
          <span className="text-member font-semibold">← CARDMEMBER</span>
          <span className="text-merchant font-semibold">MERCHANT →</span>
        </div>

        <div className="relative h-10 bg-bg-tertiary rounded-lg overflow-hidden border border-border">
          <div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-member/40 to-member/20 transition-all duration-500"
            style={{ width: `${memberWidth}%` }}
          >
            <div className="absolute inset-0 flex items-center">
              {memberContribs.map((c, i) => {
                const width = total > 0 ? (c.value / totalPositive) * 100 : 0;
                return (
                  <div
                    key={c.feature}
                    className="h-full flex items-center justify-center border-r border-bg-primary/30 last:border-r-0"
                    style={{ width: `${width}%` }}
                  >
                    {width > 8 && (
                      <span className="text-[9px] font-mono text-white/80 truncate px-1">
                        {c.evidenceIds[0] || ""}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div
            className="absolute inset-y-0 right-0 bg-gradient-to-l from-merchant/40 to-merchant/20 transition-all duration-500"
            style={{ width: `${merchantWidth}%` }}
          >
            <div className="absolute inset-0 flex items-center">
              {merchantContribs.map((c, i) => {
                const width = total > 0 ? (Math.abs(c.value) / totalNegative) * 100 : 0;
                return (
                  <div
                    key={c.feature}
                    className="h-full flex items-center justify-center border-r border-bg-primary/30 last:border-r-0"
                    style={{ width: `${width}%` }}
                  >
                    {width > 8 && (
                      <span className="text-[9px] font-mono text-white/80 truncate px-1">
                        {c.evidenceIds[0] || ""}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {hasBlockingRule && (
            <div
              className="absolute inset-y-0 w-1 bg-danger z-10"
              style={{ left: `${equilibriumPos}%` }}
            >
              <div className="absolute -top-1 -left-1.5 w-4 h-4 bg-danger rounded-full flex items-center justify-center text-[8px]">
                🔒
              </div>
            </div>
          )}

          {!hasBlockingRule && (
            <div
              className="absolute inset-y-0 w-0.5 bg-white/60 z-10"
              style={{ left: `${equilibriumPos}%` }}
            >
              <div className="absolute -top-1 -left-1 w-3 h-3 bg-white rounded-full" />
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="text-[10px] text-text-muted uppercase tracking-wider mb-2">
            Cardmember Contributions
          </div>
          <div className="space-y-1">
            {memberContribs.map((c) => (
              <div key={c.feature} className="flex items-center gap-2 text-xs">
                <span className="font-mono text-accent text-[10px] w-12 shrink-0">
                  {c.evidenceIds.join(",")}
                </span>
                <div className="flex-1 h-3 bg-bg-tertiary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-member/60 rounded-full transition-all duration-500"
                    style={{ width: `${(Math.abs(c.value) / maxAbsVal) * 100}%` }}
                  />
                </div>
                <span className="text-text-secondary text-[10px] w-20 truncate">
                  {CONTRIBUTION_LABELS[c.feature] || c.feature}
                </span>
                <span className="text-member font-mono text-[10px] w-10 text-right">
                  +{c.value.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="text-[10px] text-text-muted uppercase tracking-wider mb-2">
            Merchant Contributions
          </div>
          <div className="space-y-1">
            {merchantContribs.map((c) => (
              <div key={c.feature} className="flex items-center gap-2 text-xs">
                <span className="text-merchant font-mono text-[10px] w-10 text-right">
                  {c.value.toFixed(2)}
                </span>
                <span className="text-text-secondary text-[10px] w-20 truncate">
                  {CONTRIBUTION_LABELS[c.feature] || c.feature}
                </span>
                <div className="flex-1 h-3 bg-bg-tertiary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-merchant/60 rounded-full transition-all duration-500 ml-auto"
                    style={{ width: `${(Math.abs(c.value) / maxAbsVal) * 100}%` }}
                  />
                </div>
                <span className="font-mono text-accent text-[10px] w-12 shrink-0 text-right">
                  {c.evidenceIds.join(",")}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
