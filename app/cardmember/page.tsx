"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { FileDispute } from "@/components/cardmember/FileDispute";
import { CaseTracker } from "@/components/cardmember/CaseTracker";
import { DecisionView } from "@/components/cardmember/DecisionView";
import { Plus, ArrowLeft, ChevronRight, Activity, CheckCircle2, AlertTriangle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export default function CardmemberPage() {
  const cases = useAppStore((s) => s.cases);
  const activeCaseId = useAppStore((s) => s.activeCaseId);
  const setActiveCase = useAppStore((s) => s.setActiveCase);
  const [showFile, setShowFile] = useState(false);

  const activeCase = activeCaseId ? cases[activeCaseId] : null;
  const myCases = Object.values(cases).filter(
    (c) => c.status !== "filed" || c.evidence.length > 0
  );

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "resolved":
        return { color: "text-success", bg: "bg-success/10", border: "border-success/20", icon: CheckCircle2 };
      case "escalated":
        return { color: "text-danger", bg: "bg-danger/10", border: "border-danger/20", icon: AlertTriangle };
      default:
        return { color: "text-text-secondary", bg: "bg-bg-tertiary", border: "border-border", icon: Clock };
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-4 animate-fade-in-up">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl font-semibold text-text-primary tracking-tight">Cardmember Portal</h1>
          <p className="text-sm text-text-muted mt-1">File and track your disputes seamlessly</p>
        </div>
        <button
          onClick={() => setShowFile(!showFile)}
          className="group inline-flex items-center gap-2 px-4 py-2.5 bg-accent text-white font-semibold text-sm rounded-lg hover:bg-accent/90 transition-colors duration-200"
        >
          {showFile ? (
            <>View Cases</>
          ) : (
            <>
              <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
              File a Dispute
            </>
          )}
        </button>
      </div>

      {showFile ? (
        <div className="glass-panel rounded-xl p-6">
          <FileDispute onFiled={() => setShowFile(false)} />
        </div>
      ) : activeCase ? (
        <div className="space-y-6">
          <button
            onClick={() => setActiveCase("")}
            className="group inline-flex items-center gap-2 text-sm text-text-muted hover:text-text-primary transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to all cases
          </button>
          
          <div className="glass-panel rounded-xl p-6">
            <CaseTracker disputeCase={activeCase} />
          </div>

          {activeCase.decision && (
            <div className="glass-panel rounded-xl p-6">
              <DecisionView disputeCase={activeCase} />
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-text-muted uppercase tracking-widest mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Active Cases
          </h2>
          
          {myCases.length === 0 ? (
            <div className="glass-panel rounded-xl p-12 text-center flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-bg-tertiary flex items-center justify-center mb-4 border border-border">
                <Clock className="w-8 h-8 text-text-muted" />
              </div>
              <h3 className="text-lg font-medium text-text-primary mb-2">No active cases</h3>
              <p className="text-sm text-text-muted max-w-sm">
                You haven't filed any disputes yet. If you have an unrecognized or fraudulent charge, you can file a dispute here.
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {myCases.map((c) => {
                const statusConfig = getStatusConfig(c.status);
                const StatusIcon = statusConfig.icon;
                
                return (
                  <button
                    key={c.id}
                    onClick={() => setActiveCase(c.id)}
                    className="group flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 glass-panel rounded-xl hover:border-border-bright hover:bg-bg-elevated/40 transition-all duration-300 text-left"
                  >
                    <div className="flex-1 min-w-0 pr-4">
                      <div className="flex items-center gap-3 mb-1.5">
                        <span className="text-xs text-mono text-text-muted font-mono tracking-wider bg-bg-tertiary px-2 py-0.5 rounded border border-border">
                          {c.id}
                        </span>
                        <div className={cn(
                          "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border",
                          statusConfig.bg, statusConfig.color, statusConfig.border
                        )}>
                          <StatusIcon className="w-3 h-3" />
                          {c.status.replace(/_/g, " ")}
                        </div>
                      </div>
                      <p className="text-base text-text-primary font-medium truncate">
                        {c.reasonCode.replace(/_/g, " ")}
                      </p>
                    </div>
                    
                    <div className="mt-4 sm:mt-0 flex items-center gap-6 self-end sm:self-auto">
                      <div className="text-right">
                        <p className="text-[10px] text-text-muted uppercase tracking-widest mb-1 font-semibold">Amount</p>
                        <p className="text-lg font-mono text-text-primary font-medium tracking-tight">
                          ${c.amount.toFixed(2)}
                        </p>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-bg-tertiary flex items-center justify-center border border-border group-hover:bg-accent group-hover:border-accent transition-colors duration-300 shadow-sm">
                        <ChevronRight className="w-4 h-4 text-text-muted group-hover:text-white transition-colors" />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
