"use client";

import { useAppStore } from "@/lib/store";
import { RespondWindow } from "@/components/merchant/RespondWindow";
import { MerchantCaseView } from "@/components/merchant/CaseView";

export default function MerchantPage() {
  const cases = useAppStore((s) => s.cases);
  const activeCaseId = useAppStore((s) => s.activeCaseId);
  const setActiveCase = useAppStore((s) => s.setActiveCase);

  const activeCase = activeCaseId ? cases[activeCaseId] : null;
  const allCases = Object.values(cases);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-semibold text-text-primary">Merchant Portal</h1>
          <p className="text-xs text-text-muted">Respond to disputes and view case details</p>
        </div>
      </div>

      {activeCase ? (
        <div className="space-y-4">
          <button
            onClick={() => setActiveCase("")}
            className="text-xs text-text-muted hover:text-text-primary"
          >
            ← Back to all cases
          </button>

          {activeCase.decision?.route === "proposed_split" && activeCase.status !== "resolved" && (
            <RespondWindow disputeCase={activeCase} />
          )}

          <MerchantCaseView disputeCase={activeCase} />
        </div>
      ) : (
        <div className="space-y-2">
          {allCases.length === 0 ? (
            <div className="text-center py-12 text-text-muted text-sm">
              No cases available.
            </div>
          ) : (
            allCases.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveCase(c.id)}
                className="w-full flex items-center justify-between p-4 bg-bg-secondary border border-border rounded-lg hover:border-border-bright text-left transition-colors"
              >
                <div>
                  <span className="text-xs text-text-muted font-mono">{c.id}</span>
                  <p className="text-sm text-text-primary mt-0.5">
                    {c.reasonCode.replace(/_/g, " ")}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-mono text-text-primary">${c.amount.toFixed(2)}</p>
                  <span className={`text-[10px] px-2 py-0.5 rounded ${
                    c.decision?.route === "proposed_split"
                      ? "bg-warning-dim text-warning"
                      : c.status === "resolved"
                        ? "bg-success-dim text-success"
                        : "bg-bg-tertiary text-text-secondary"
                  }`}>
                    {c.decision?.route?.replace(/_/g, " ") || c.status}
                  </span>
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
