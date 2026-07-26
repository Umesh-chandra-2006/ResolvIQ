"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import {
  CreditCard,
  Store,
  Workflow,
  Headset,
  ShieldCheck,
  Settings2,
  Scale
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/cardmember", label: "Cardmember", icon: CreditCard },
  { href: "/merchant", label: "Merchant", icon: Store },
  { href: "/pipeline", label: "Pipeline", icon: Workflow },
  { href: "/agent", label: "Agent", icon: Headset },
  { href: "/audit", label: "Audit", icon: ShieldCheck },
  { href: "/ops", label: "Ops", icon: Settings2 },
];

const ROLE_LABELS: Record<string, string> = {
  cardmember: "Cardmember",
  merchant: "Merchant",
  agent: "Agent",
  auditor: "Auditor",
};

export function Sidebar() {
  const pathname = usePathname();
  const currentRole = useAppStore((s) => s.currentRole);

  return (
    <aside className="w-64 h-full glass border-r border-border flex flex-col shrink-0 relative z-20">
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          {/* Balance mark — a plain instrument glyph on a flat milled face. */}
          <div className="w-10 h-10 rounded-lg bg-bg-tertiary border border-border flex items-center justify-center">
            <Scale className="w-5 h-5 text-accent" strokeWidth={1.75} />
          </div>
          <div>
            <h1 className="font-display text-lg font-semibold text-text-primary leading-none tracking-tight">ResolvIQ</h1>
            <p className="text-[10px] text-text-muted font-mono uppercase tracking-[0.2em] mt-1.5">Forensic Ledger</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const IconCmp = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "group relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-300",
                isActive
                  ? "bg-accent/10 text-text-primary"
                  : "text-text-secondary hover:bg-bg-elevated/50 hover:text-text-primary"
              )}
            >
              {isActive && (
                <span className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full bg-accent animate-fade-in-up" />
              )}
              <IconCmp 
                className={cn(
                  "w-[18px] h-[18px] transition-colors duration-300", 
                  isActive ? "text-accent" : "text-text-muted group-hover:text-text-primary"
                )} 
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 rounded-full bg-bg-elevated flex items-center justify-center border border-border">
            <div className="w-2 h-2 rounded-full bg-accent" />
          </div>
          <div>
            <div className="text-[10px] text-text-muted uppercase tracking-wider font-semibold mb-0.5">Active Role</div>
            <div className="text-sm text-text-primary font-medium">{ROLE_LABELS[currentRole] ?? currentRole}</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
