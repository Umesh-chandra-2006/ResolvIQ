"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppStore } from "@/lib/store";

const NAV_ITEMS = [
  { href: "/cardmember", label: "Cardmember", icon: "👤" },
  { href: "/merchant", label: "Merchant", icon: "🏪" },
  { href: "/pipeline", label: "Pipeline", icon: "⚡" },
  { href: "/agent", label: "Agent", icon: "🔍" },
  { href: "/audit", label: "Audit", icon: "📋" },
  { href: "/ops", label: "Ops", icon: "📊" },
];

export function Sidebar() {
  const pathname = usePathname();
  const currentRole = useAppStore((s) => s.currentRole);

  return (
    <aside className="w-56 h-full bg-bg-secondary border-r border-border flex flex-col shrink-0">
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-accent flex items-center justify-center text-white font-bold text-sm">
            RQ
          </div>
          <div>
            <h1 className="text-sm font-semibold text-text-primary">ResolvIQ</h1>
            <p className="text-[10px] text-text-muted uppercase tracking-wider">Dispute Engine</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-2 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded text-sm transition-colors ${
                isActive
                  ? "bg-bg-elevated text-text-primary border border-border-bright"
                  : "text-text-secondary hover:bg-bg-tertiary hover:text-text-primary"
              }`}
            >
              <span className="text-base">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-border">
        <div className="text-[10px] text-text-muted uppercase tracking-wider mb-1">Active Role</div>
        <div className="text-xs text-accent font-mono">{currentRole}</div>
      </div>
    </aside>
  );
}
