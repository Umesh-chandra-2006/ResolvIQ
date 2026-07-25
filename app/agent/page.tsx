"use client";

import { useAppStore } from "@/lib/store";
import { AgentCaseView } from "@/components/agent/AgentCaseView";

export default function AgentPage() {
  const cases = useAppStore((s) => s.cases);
  const activeCaseId = useAppStore((s) => s.activeCaseId);
  const setActiveCase = useAppStore((s) => s.setActiveCase);

  const activeCase = activeCaseId ? cases[activeCaseId] : null;
  const escalationCases = Object.values(cases).filter(
    (c) => c.decision?.route === "human_escalation" || c.status === "escalated"
  );

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-lg font-semibold text-text-primary">Agent View</h1>
        <p className="text-xs text-text-muted">Review escalated cases and make decisions</p>
      </div>

      {activeCase ? (
        <div className="space-y-4">
          <button
            onClick={() => setActiveCase("")}
            className="text-xs text-text-muted hover:text-text-primary"
          >
            ← Back to escalation queue
          </button>
          <AgentCaseView disputeCase={activeCase} />
        </div>
      ) : (
        <div className="space-y-2">
          {escalationCases.length === 0 ? (
            <div className="text-center py-12 text-text-muted text-sm">
              No escalated cases. Run Scenario B from Demo Control to see escalations.
            </div>
          ) : (
            escalationCases.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveCase(c.id)}
                className="w-full flex items-center justify-between p-4 bg-bg-secondary border border-border rounded-lg hover:border-border-bright text-left transition-colors"
              >
                <div>
                  <span className="text-xs text-text-muted font-mono">{c.id}</span>
                  <p className="text-sm text-text-primary mt-0.5">
                    {c.reasonCode.replace(/_/g, " ")} — ${c.amount.toFixed(2)}
                  </p>
                  <p className="text-[10px] text-text-muted mt-0.5">
                    Rules fired: {c.decision?.hardRulesFired.join(", ") || "none"}
                  </p>
                </div>
                <span className="px-2 py-0.5 bg-danger-dim text-danger text-[10px] rounded border border-danger/30">
                  Escalated
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
