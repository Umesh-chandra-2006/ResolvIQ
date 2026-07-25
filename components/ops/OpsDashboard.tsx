"use client";

import { useMemo } from "react";
import { useAppStore } from "@/lib/store";
import { Badge } from "@/components/shared/Badge";
import { RouteBadge } from "@/components/shared/RouteBadge";

export function OpsDashboard() {
  const cases = useAppStore((s) => s.cases);
  const filterRoute = useAppStore((s) => s.filterRoute);
  const setFilterRoute = useAppStore((s) => s.setFilterRoute);

  const allCases = useMemo(() => Object.values(cases), [cases]);
  const routedCases = useMemo(
    () => allCases.filter((c) => c.decision),
    [allCases]
  );

  const filteredCases = useMemo(() => {
    if (!filterRoute) return routedCases;
    return routedCases.filter((c) => c.decision?.route === filterRoute);
  }, [routedCases, filterRoute]);

  const metrics = useMemo(() => {
    const total = routedCases.length;
    if (total === 0) return { autoRate: 0, splitRate: 0, escalateRate: 0, avgConf: 0 };
    const auto = routedCases.filter((c) => c.decision?.route === "auto_resolve").length;
    const split = routedCases.filter((c) => c.decision?.route === "proposed_split").length;
    const esc = routedCases.filter((c) => c.decision?.route === "human_escalation").length;
    const avgConf = routedCases.reduce((s, c) => s + (c.decision?.confidence || 0), 0) / total;
    return {
      autoRate: Math.round((auto / total) * 100),
      splitRate: Math.round((split / total) * 100),
      escalateRate: Math.round((esc / total) * 100),
      avgConf: Math.round(avgConf * 100),
    };
  }, [routedCases]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-3">
        <div className="p-3 bg-bg-secondary border border-border rounded-lg">
          <p className="text-[10px] text-text-muted uppercase tracking-wider">Auto-Resolve Rate</p>
          <p className="text-2xl font-mono font-bold text-success mt-1">{metrics.autoRate}%</p>
        </div>
        <div className="p-3 bg-bg-secondary border border-border rounded-lg">
          <p className="text-[10px] text-text-muted uppercase tracking-wider">Split Rate</p>
          <p className="text-2xl font-mono font-bold text-warning mt-1">{metrics.splitRate}%</p>
        </div>
        <div className="p-3 bg-bg-secondary border border-border rounded-lg">
          <p className="text-[10px] text-text-muted uppercase tracking-wider">Escalation Rate</p>
          <p className="text-2xl font-mono font-bold text-danger mt-1">{metrics.escalateRate}%</p>
        </div>
        <div className="p-3 bg-bg-secondary border border-border rounded-lg">
          <p className="text-[10px] text-text-muted uppercase tracking-wider">Avg Confidence</p>
          <p className="text-2xl font-mono font-bold text-accent mt-1">{metrics.avgConf}%</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-[10px] text-text-muted uppercase tracking-wider">Filter:</span>
        {[
          { value: null, label: "All" },
          { value: "auto_resolve", label: "Auto Resolve" },
          { value: "proposed_split", label: "Split" },
          { value: "human_escalation", label: "Escalation" },
        ].map((f) => (
          <button
            key={f.label}
            onClick={() => setFilterRoute(f.value)}
            className={`px-2.5 py-1 text-[10px] rounded border transition-colors ${
              filterRoute === f.value
                ? "bg-accent text-bg-primary font-medium border-accent"
                : "bg-bg-tertiary text-text-secondary border-border hover:bg-bg-hover"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="bg-bg-secondary border border-border rounded-lg overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left p-3 text-[10px] text-text-muted uppercase tracking-wider">Case</th>
              <th className="text-left p-3 text-[10px] text-text-muted uppercase tracking-wider">Reason</th>
              <th className="text-left p-3 text-[10px] text-text-muted uppercase tracking-wider">Confidence</th>
              <th className="text-left p-3 text-[10px] text-text-muted uppercase tracking-wider">Route</th>
              <th className="text-left p-3 text-[10px] text-text-muted uppercase tracking-wider">Verdict</th>
              <th className="text-left p-3 text-[10px] text-text-muted uppercase tracking-wider">Reg Z</th>
            </tr>
          </thead>
          <tbody>
            {filteredCases.map((c) => {
              const daysLeft = Math.max(
                0,
                Math.ceil(
                  (new Date(c.regZ.resolveDeadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                )
              );
              const clockUrgency = daysLeft < 14 ? "danger" : daysLeft < 30 ? "warning" : "neutral";
              return (
                <tr key={c.id} className="border-b border-border hover:bg-bg-tertiary transition-colors">
                  <td className="p-3 font-mono text-text-primary">{c.id}</td>
                  <td className="p-3 text-text-secondary">{c.reasonCode.replace(/_/g, " ")}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-bg-tertiary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-accent rounded-full"
                          style={{ width: `${(c.decision?.confidence || 0) * 100}%` }}
                        />
                      </div>
                      <span className="font-mono text-text-primary">
                        {((c.decision?.confidence || 0) * 100).toFixed(0)}%
                      </span>
                    </div>
                  </td>
                  <td className="p-3">
                    {c.decision && <RouteBadge route={c.decision.route} />}
                  </td>
                  <td className="p-3">
                    <Badge
                      label={c.decision?.verdict || "—"}
                      variant={c.decision?.verdict === "member" ? "success" : c.decision?.verdict === "merchant" ? "warning" : "info"}
                    />
                  </td>
                  <td className="p-3">
                    <Badge label={`${daysLeft}d`} variant={clockUrgency as "danger" | "warning" | "neutral"} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filteredCases.length === 0 && (
          <p className="text-center text-text-muted text-xs py-6">
            No cases with decisions yet. Run a pipeline to generate data.
          </p>
        )}
      </div>
    </div>
  );
}
