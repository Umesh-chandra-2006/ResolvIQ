"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { DemoControl } from "./DemoControl";
import { SlidersHorizontal, Database } from "lucide-react";
import { cn } from "@/lib/utils";

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
      <header className="h-16 glass border-b border-border flex items-center justify-between px-6 shrink-0 relative z-10">
        <div className="flex items-center gap-4">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-warning-dim/30 text-warning text-[10px] font-semibold uppercase tracking-widest rounded border border-warning/20">
            <span className="w-1.5 h-1.5 rounded-full bg-warning animate-pulse" />
            Demo data
          </div>
          <span className="text-xs text-text-muted hidden sm:inline-flex font-medium">
            Seeded fixtures — never real card data
          </span>
        </div>

        <div className="flex items-center gap-5">
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-text-muted uppercase tracking-widest hidden lg:inline font-semibold">
              View as
            </span>
            <div className="flex items-center gap-1 bg-bg-elevated/50 rounded-lg p-1 border border-border">
              {ROLES.map((role) => (
                <button
                  key={role}
                  onClick={() => setRole(role)}
                  aria-pressed={currentRole === role}
                  className={cn(
                    "px-3 py-1.5 text-xs rounded-md transition-colors duration-200 font-medium",
                    currentRole === role
                      ? "bg-bg-hover text-text-primary border border-border"
                      : "text-text-secondary hover:text-text-primary hover:bg-bg-tertiary border border-transparent"
                  )}
                >
                  {ROLE_LABELS[role]}
                </button>
              ))}
            </div>
          </div>

          <div className="w-[1px] h-6 bg-border" />

          <button
            onClick={() => setShowDemo(true)}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-xs bg-bg-elevated/30 text-text-secondary hover:text-text-primary hover:bg-bg-hover rounded-lg border border-border transition-colors duration-200 group"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-text-muted group-hover:text-accent transition-colors" />
            <span className="font-medium">Demo control</span>
          </button>
        </div>
      </header>

      <DemoControl open={showDemo} onClose={() => setShowDemo(false)} />
    </>
  );
}
