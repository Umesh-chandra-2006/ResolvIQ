"use client";

import { Contribution } from "@/lib/types";
import { CONTRIBUTION_LABELS } from "@/lib/fixtures/policy";

type Props = {
  contributions: Contribution[];
  confidence: number;
  hardRulesFired: string[];
};

/*
  The signature element: a horizontal evidence balance.
  One axis. Cardmember contributions extend left, merchant contributions
  extend right, each segment sized to its exact additive contribution to the
  scorecard's log-odds and tagged with its evidence ID. The beam tilts toward
  the calibrated confidence. When a hard rule fires, a lock pins the beam level
  and the balance visibly loses authority — the rule, not the score, decides.
*/
export function EvidenceBalance({ contributions, confidence, hardRulesFired }: Props) {
  const memberContribs = contributions
    .filter((c) => c.value > 0)
    .sort((a, b) => b.value - a.value);
  const merchantContribs = contributions
    .filter((c) => c.value < 0)
    .sort((a, b) => a.value - b.value);

  const maxAbsVal = Math.max(...contributions.map((c) => Math.abs(c.value)), 0.01);
  const totalPositive = memberContribs.reduce((s, c) => s + c.value, 0);
  const totalNegative = merchantContribs.reduce((s, c) => s + Math.abs(c.value), 0);
  const total = totalPositive + totalNegative || 1;

  const hasBlockingRule = hardRulesFired.some(
    (r) => r === "HR-1" || r === "HR-2" || r === "HR-3"
  );

  // Beam geometry. The fulcrum sits at centre; the beam tilts up to ±10° toward
  // the heavier side. A locked beam is forced level, however lopsided the pans.
  const memberShare = totalPositive / total; // 0..1 toward member
  const rawTilt = (memberShare - 0.5) * 2; // -1 (merchant) .. +1 (member)
  const tiltDeg = hasBlockingRule ? 0 : rawTilt * 10;

  // Equilibrium marker maps confidence to a position on the axis.
  const equilibriumPct = confidence * 100;

  return (
    <div className="bg-bg-secondary border border-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-display text-sm font-semibold text-text-primary">
          Evidence balance
        </h3>
        <div className="flex items-center gap-2">
          {hasBlockingRule && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-danger-dim text-danger text-[10px] font-semibold uppercase tracking-wider rounded border border-danger/40">
              <LockIcon /> Rule override
            </span>
          )}
          <span className="text-[10px] text-text-muted">
            Calibrated confidence{" "}
            <span className="text-text-primary font-mono font-semibold tnum">
              {(confidence * 100).toFixed(0)}%
            </span>
          </span>
        </div>
      </div>
      <p className="text-[10px] text-text-muted mb-4">
        Exact, additive contributions to the scorecard (log-odds)
      </p>

      {/* The beam */}
      <div className="relative h-24 mb-2 select-none">
        <svg viewBox="0 0 400 96" className="w-full h-full" role="img"
          aria-label={`Evidence balance tilted toward ${
            memberShare > 0.5 ? "cardmember" : "merchant"
          }${hasBlockingRule ? ", pinned level by a hard rule" : ""}`}>
          {/* base + column */}
          <rect x="180" y="86" width="40" height="6" rx="2" className="fill-[color:var(--color-border-bright)]" />
          <rect x="197" y="40" width="6" height="48" className="fill-[color:var(--color-border-bright)]" />
          {/* fulcrum */}
          <polygon points="200,30 210,44 190,44" className="fill-[color:var(--color-text-muted)]" />

          {/* beam group tilts about the fulcrum */}
          <g
            style={{
              transform: `rotate(${tiltDeg}deg)`,
              transformOrigin: "200px 34px",
              transition: "transform 700ms cubic-bezier(0.2,0.9,0.3,1)",
            }}
          >
            <rect x="40" y="31" width="320" height="6" rx="3"
              className={hasBlockingRule ? "fill-[color:var(--color-text-muted)]" : "fill-[color:var(--color-border-bright)]"} />
            {/* member pan (left) */}
            <line x1="90" y1="34" x2="90" y2="56" className="stroke-[color:var(--color-member)]" strokeWidth="1.5" />
            <path d="M64 56 A26 14 0 0 0 116 56 Z"
              className="fill-[color:var(--color-member)]" opacity={hasBlockingRule ? 0.25 : 0.85} />
            {/* merchant pan (right) */}
            <line x1="310" y1="34" x2="310" y2="56" className="stroke-[color:var(--color-merchant)]" strokeWidth="1.5" />
            <path d="M284 56 A26 14 0 0 0 336 56 Z"
              className="fill-[color:var(--color-merchant)]" opacity={hasBlockingRule ? 0.25 : 0.85} />
          </g>

          {/* lock pinning the beam */}
          {hasBlockingRule && (
            <g transform="translate(200,20)">
              <circle r="11" className="fill-[color:var(--color-danger-dim)] stroke-[color:var(--color-danger)]" strokeWidth="1.5" />
              <g transform="translate(-5,-5) scale(0.42)" className="fill-[color:var(--color-danger)]">
                <path d="M12 1a5 5 0 0 0-5 5v3H6a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2h-1V6a5 5 0 0 0-5-5zm-3 8V6a3 3 0 0 1 6 0v3H9z" />
              </g>
            </g>
          )}
        </svg>
        <div className="absolute inset-x-0 -bottom-1 flex justify-between text-[10px] font-semibold">
          <span className="text-member">◄ Cardmember</span>
          <span className="text-merchant">Merchant ►</span>
        </div>
      </div>

      {/* Segmented axis: each segment is one contribution, sized exactly */}
      <div className="mt-5">
        <div className="relative h-9 rounded-lg overflow-hidden border border-border bg-bg-tertiary flex">
          <div className="flex justify-end" style={{ width: `${(totalNegative / total) * 100}%` }}>
            {[...merchantContribs].reverse().map((c) => {
              const w = (Math.abs(c.value) / totalNegative) * 100 || 0;
              return (
                <div key={c.feature}
                  title={`${CONTRIBUTION_LABELS[c.feature] || c.feature} ${c.value.toFixed(2)}`}
                  className="h-full flex items-center justify-center border-r border-bg-primary/40"
                  style={{ width: `${w}%`, background: "color-mix(in srgb, var(--color-merchant) 32%, transparent)" }}>
                  {w > 9 && (
                    <span className="text-[9px] font-mono text-merchant">{c.evidenceIds[0]}</span>
                  )}
                </div>
              );
            })}
          </div>
          <div className="flex" style={{ width: `${(totalPositive / total) * 100}%` }}>
            {memberContribs.map((c) => {
              const w = (c.value / totalPositive) * 100 || 0;
              return (
                <div key={c.feature}
                  title={`${CONTRIBUTION_LABELS[c.feature] || c.feature} +${c.value.toFixed(2)}`}
                  className="h-full flex items-center justify-center border-r border-bg-primary/40 last:border-r-0"
                  style={{ width: `${w}%`, background: "color-mix(in srgb, var(--color-member) 32%, transparent)" }}>
                  {w > 9 && (
                    <span className="text-[9px] font-mono text-member">{c.evidenceIds[0]}</span>
                  )}
                </div>
              );
            })}
          </div>

          {/* equilibrium / confidence marker */}
          <div
            className={`absolute inset-y-0 z-10 ${hasBlockingRule ? "w-[3px] bg-danger" : "w-0.5 bg-text-primary"}`}
            style={{ left: `${equilibriumPct}%` }}
          >
            <div className={`absolute -top-1.5 -translate-x-1/2 w-2.5 h-2.5 rotate-45 ${hasBlockingRule ? "bg-danger" : "bg-text-primary"}`} />
          </div>
        </div>
        <div className="flex justify-between mt-1 text-[9px] text-text-muted font-mono">
          <span>merchant −{totalNegative.toFixed(2)}</span>
          <span>member +{totalPositive.toFixed(2)}</span>
        </div>
      </div>

      {/* Contribution ledgers */}
      <div className="grid grid-cols-2 gap-5 mt-5">
        <ContribColumn title="Cardmember" contribs={memberContribs} maxAbsVal={maxAbsVal} side="member" />
        <ContribColumn title="Merchant" contribs={merchantContribs} maxAbsVal={maxAbsVal} side="merchant" align="right" />
      </div>
    </div>
  );
}

function ContribColumn({
  title,
  contribs,
  maxAbsVal,
  side,
  align = "left",
}: {
  title: string;
  contribs: Contribution[];
  maxAbsVal: number;
  side: "member" | "merchant";
  align?: "left" | "right";
}) {
  const barColor = side === "member" ? "bg-member/70" : "bg-merchant/70";
  const valColor = side === "member" ? "text-member" : "text-merchant";
  return (
    <div>
      <div className={`text-[10px] text-text-muted uppercase tracking-wider mb-2 ${align === "right" ? "text-right" : ""}`}>
        {title} contributions
      </div>
      <div className="space-y-1.5">
        {contribs.map((c) => (
          <div key={c.feature} className="flex items-center gap-2 text-xs">
            {align === "right" && (
              <span className={`${valColor} font-mono text-[10px] w-11 text-right tnum`}>
                {c.value.toFixed(2)}
              </span>
            )}
            <span className="text-text-secondary text-[10px] flex-1 truncate">
              {CONTRIBUTION_LABELS[c.feature] || c.feature}
            </span>
            <div className={`w-16 h-1.5 bg-bg-tertiary rounded-full overflow-hidden ${align === "right" ? "order-first" : ""}`}>
              <div
                className={`h-full ${barColor} rounded-full transition-all duration-500 ${align === "right" ? "ml-auto" : ""}`}
                style={{ width: `${(Math.abs(c.value) / maxAbsVal) * 100}%` }}
              />
            </div>
            <span className="font-mono text-accent text-[10px] w-14 shrink-0">
              {c.evidenceIds.join(",")}
            </span>
            {align === "left" && (
              <span className={`${valColor} font-mono text-[10px] w-11 text-right tnum`}>
                +{c.value.toFixed(2)}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function LockIcon() {
  return (
    <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 1a5 5 0 0 0-5 5v3H6a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2h-1V6a5 5 0 0 0-5-5zm-3 8V6a3 3 0 0 1 6 0v3H9z" />
    </svg>
  );
}
