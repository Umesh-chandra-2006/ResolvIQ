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
          <span className="px-2 py-0.5 bg-warning-dim text-warning text-[10px] font-bold uppercase tracking-wider rounded">
            DEMO DATA
          </span>
          <span className="text-xs text-text-muted">
            ResolvIQ Prototype — Not production data
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-bg-tertiary rounded p-0.5">
            {ROLES.map((role) => (
              <button
                key={role}
                onClick={() => setRole(role)}
                className={`px-2.5 py-1 text-xs rounded transition-colors ${
                  currentRole === role
                    ? "bg-accent text-white"
                    : "text-text-secondary hover:text-text-primary hover:bg-bg-hover"
                }`}
              >
                {ROLE_LABELS[role]}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowDemo(true)}
            className="px-3 py-1 text-xs bg-bg-tertiary text-text-secondary hover:text-text-primary hover:bg-bg-hover rounded border border-border transition-colors"
          >
            Demo Control
          </button>
        </div>
      </header>

      <DemoControl open={showDemo} onClose={() => setShowDemo(false)} />
    </>
  );
}
