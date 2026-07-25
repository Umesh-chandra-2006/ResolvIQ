"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppStore } from "@/lib/store";

type IconProps = { className?: string };

const Icon = {
  cardmember: (p: IconProps) => (
    <svg viewBox="0 0 24 24" className={p.className} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21a8 8 0 0 0-16 0" /><circle cx="12" cy="7" r="4" />
    </svg>
  ),
  merchant: (p: IconProps) => (
    <svg viewBox="0 0 24 24" className={p.className} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l1-5h16l1 5" /><path d="M4 9v10a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V9" /><path d="M3 9a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0" />
    </svg>
  ),
  pipeline: (p: IconProps) => (
    <svg viewBox="0 0 24 24" className={p.className} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8z" />
    </svg>
  ),
  agent: (p: IconProps) => (
    <svg viewBox="0 0 24 24" className={p.className} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" />
    </svg>
  ),
  audit: (p: IconProps) => (
    <svg viewBox="0 0 24 24" className={p.className} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v18" /><path d="M6 8 3 15h6L6 8z" /><path d="M18 8l-3 7h6l-3-7z" /><path d="M4 6h4l4-2 4 2h4" />
    </svg>
  ),
  ops: (p: IconProps) => (
    <svg viewBox="0 0 24 24" className={p.className} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3v18h18" /><rect x="7" y="12" width="3" height="6" /><rect x="12" y="8" width="3" height="10" /><rect x="17" y="5" width="3" height="13" />
    </svg>
  ),
};

const NAV_ITEMS: { href: string; label: string; icon: keyof typeof Icon }[] = [
  { href: "/cardmember", label: "Cardmember", icon: "cardmember" },
  { href: "/merchant", label: "Merchant", icon: "merchant" },
  { href: "/pipeline", label: "Pipeline", icon: "pipeline" },
  { href: "/agent", label: "Agent", icon: "agent" },
  { href: "/audit", label: "Audit", icon: "audit" },
  { href: "/ops", label: "Ops", icon: "ops" },
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
    <aside className="w-56 h-full bg-bg-secondary border-r border-border flex flex-col shrink-0">
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2.5">
          {/* Balance-beam mark — the product's own signature, not a wordmark. */}
          <div className="w-9 h-9 rounded-lg bg-bg-elevated border border-border-bright flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="var(--color-accent)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3v18" /><path d="M6 6 3 12h6L6 6z" /><path d="M18 6l-3 6h6l-3-6z" /><path d="M4 21h16" /><path d="M5 6h4l3-1 3 1h4" />
            </svg>
          </div>
          <div>
            <h1 className="font-display text-base font-semibold text-text-primary leading-none">ResolvIQ</h1>
            <p className="text-[10px] text-text-muted uppercase tracking-[0.14em] mt-1">Adjudication console</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-2 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const IconCmp = Icon[item.icon];
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={`relative flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                isActive
                  ? "bg-bg-elevated text-text-primary"
                  : "text-text-secondary hover:bg-bg-tertiary hover:text-text-primary"
              }`}
            >
              {isActive && (
                <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-full bg-accent" />
              )}
              <IconCmp className={`w-[18px] h-[18px] ${isActive ? "text-accent" : ""}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-border">
        <div className="text-[10px] text-text-muted uppercase tracking-wider mb-1">Active role</div>
        <div className="text-xs text-accent font-mono">{ROLE_LABELS[currentRole] ?? currentRole}</div>
      </div>
    </aside>
  );
}
