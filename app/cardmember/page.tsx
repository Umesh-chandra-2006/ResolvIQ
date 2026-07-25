"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { FileDispute } from "@/components/cardmember/FileDispute";
import { CaseTracker } from "@/components/cardmember/CaseTracker";
import { DecisionView } from "@/components/cardmember/DecisionView";

export default function CardmemberPage() {
  const cases = useAppStore((s) => s.cases);
  const activeCaseId = useAppStore((s) => s.activeCaseId);
  const setActiveCase = useAppStore((s) => s.setActiveCase);
  const [showFile, setShowFile] = useState(false);

  const activeCase = activeCaseId ? cases[activeCaseId] : null;
  const myCases = Object.values(cases).filter(
    (c) => c.status !== "filed" || c.evidence.length > 0
  );

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-semibold text-text-primary">Cardmember Portal</h1>
          <p className="text-xs text-text-muted">File and track your dispute</p>
        </div>
        <button
          onClick={() => setShowFile(!showFile)}
          className="px-4 py-2 text-xs bg-accent text-bg-primary font-medium rounded hover:bg-accent/80 transition-colors"
        >
          {showFile ? "View Cases" : "File a Dispute"}
        </button>
      </div>

      {showFile ? (
        <FileDispute onFiled={() => setShowFile(false)} />
      ) : activeCase ? (
        <div className="space-y-4">
          <button
            onClick={() => setActiveCase("")}
            className="text-xs text-text-muted hover:text-text-primary"
          >
            ← Back to all cases
          </button>
          <CaseTracker disputeCase={activeCase} />
          {activeCase.decision && <DecisionView disputeCase={activeCase} />}
        </div>
      ) : (
        <div className="space-y-2">
          {myCases.length === 0 ? (
            <div className="text-center py-12 text-text-muted text-sm">
              No active cases. File a dispute to get started.
            </div>
          ) : (
            myCases.map((c) => (
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
                    c.status === "resolved"
                      ? "bg-success-dim text-success"
                      : c.status === "escalated"
                        ? "bg-danger-dim text-danger"
                        : "bg-bg-tertiary text-text-secondary"
                  }`}>
                    {c.status.replace(/_/g, " ")}
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
