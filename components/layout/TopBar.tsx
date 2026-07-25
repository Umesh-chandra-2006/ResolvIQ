"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { DemoControl } from "./DemoControl";

const ROLES = ["cardmember", "merchant", "agent", "auditor"] as const;
const ROLE_LABELS: Record<string, string> = {
  cardmember: "Cardmember",
  merchant: "Merchant",
  agent: "Agent",
  auditor: "Auditor",
};

export function TopBar() {
  const [showDemo, setShowDemo] = useState(false);
  const currentRole = useAppStore((s) => s.currentRole);
  const setRole = useAppStore((s) => s.setRole);

  return (
    <>
      <header className="h-12 border-b border-border bg-bg-secondary flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-warning-dim text-warning text-[10px] font-semibold uppercase tracking-wider rounded border border-warning/30">
            <span className="w-1.5 h-1.5 rounded-full bg-warning animate-pulse" />
            Demo data
          </span>
          <span className="text-xs text-text-muted">
            Seeded fixtures — never real card data
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[10px] text-text-muted uppercase tracking-wider hidden sm:inline">
            View as
          </span>
          <div className="flex items-center gap-0.5 bg-bg-tertiary rounded-md p-0.5 border border-border">
            {ROLES.map((role) => (
              <button
                key={role}
                onClick={() => setRole(role)}
                aria-pressed={currentRole === role}
                className={`px-2.5 py-1 text-xs rounded transition-colors ${
                  currentRole === role
                    ? "bg-accent text-bg-primary font-medium"
                    : "text-text-secondary hover:text-text-primary hover:bg-bg-hover"
                }`}
              >
                {ROLE_LABELS[role]}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowDemo(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1 text-xs bg-bg-tertiary text-text-secondary hover:text-text-primary hover:bg-bg-hover rounded-md border border-border transition-colors"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2"/></svg>
            Demo control
          </button>
        </div>
      </header>

      <DemoControl open={showDemo} onClose={() => setShowDemo(false)} />
    </>
  );
}
