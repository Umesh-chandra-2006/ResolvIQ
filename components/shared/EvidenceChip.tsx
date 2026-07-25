"use client";

import { EvidenceItem } from "@/lib/types";

type Props = {
  evidence: EvidenceItem;
  onClick?: () => void;
};

export function EvidenceChip({ evidence, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-bg-tertiary border border-border rounded text-[11px] font-mono text-text-secondary hover:bg-bg-hover hover:text-text-primary transition-colors cursor-pointer"
    >
      <span className="text-accent font-semibold">{evidence.id}</span>
      <span className="text-text-muted">·</span>
      <span>{evidence.label}</span>
      {evidence.mocked && (
        <span className="px-1 py-0 bg-warning-dim text-warning text-[9px] rounded ml-1">MOCK</span>
      )}
    </button>
  );
}
