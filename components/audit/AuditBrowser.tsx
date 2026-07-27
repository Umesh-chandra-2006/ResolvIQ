"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { Badge } from "@/components/shared/Badge";

export function AuditBrowser() {
  const ledgerEntries = useAppStore((s) => s.ledgerEntries);
  const tamperedEntry = useAppStore((s) => s.tamperedEntry);
  const tamperLedgerEntry = useAppStore((s) => s.tamperLedgerEntry);
  const resetLedgerTamper = useAppStore((s) => s.resetLedgerTamper);
  const cases = useAppStore((s) => s.cases);

  const [chainValid, setChainValid] = useState<boolean | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<number | null>(null);

  const verifyChain = async () => {
    const { globalLedger } = await import("@/lib/engine/ledger");
    const result = await globalLedger.verifyChain();
    setChainValid(result.valid);
  };

  const selected = selectedEntry !== null ? ledgerEntries[selectedEntry] : null;

  return (
    <div className="space-y-4">
      <div className="bg-bg-secondary border border-border rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted">
            Hash-Chained Audit Ledger
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={verifyChain}
              className="px-3 py-1.5 text-xs bg-accent text-white font-medium rounded hover:bg-accent/80 transition-colors"
            >
              Verify Chain
            </button>
            <button
              onClick={() => tamperLedgerEntry(2)}
              className="px-3 py-1.5 text-xs bg-danger-dim text-danger border border-danger/30 rounded hover:bg-danger/20 transition-colors"
            >
              Tamper Entry #3
            </button>
            <button
              onClick={resetLedgerTamper}
              className="px-3 py-1.5 text-xs bg-bg-tertiary text-text-secondary border border-border rounded hover:bg-bg-hover transition-colors"
            >
              Reset
            </button>
          </div>
        </div>

        {chainValid !== null && (
          <div className={`mb-4 p-3 rounded border ${chainValid ? "bg-success-dim/30 border-success/20" : "bg-danger-dim/30 border-danger/20"}`}>
            <p className={`text-xs font-medium ${chainValid ? "text-success" : "text-danger"}`}>
              {chainValid ? "✓ Chain integrity verified — all entries valid" : "✗ Chain BROKEN — tampering detected"}
            </p>
          </div>
        )}

        {ledgerEntries.length === 0 ? (
          <p className="text-xs text-text-muted text-center py-8">
            No ledger entries yet. Run a dispute pipeline to generate entries.
          </p>
        ) : (
          <div className="relative">
            <div className="absolute left-[18px] top-0 bottom-0 w-0.5 bg-border" />

            <div className="space-y-1">
              {ledgerEntries.map((entry, i) => {
                const isTampered = tamperedEntry === i;
                const isDownstreamBroken = tamperedEntry !== null && i > tamperedEntry;
                const isBroken = isTampered || isDownstreamBroken;

                return (
                  <div key={i}>
                    <div
                      className={`relative flex items-start gap-3 p-3 rounded cursor-pointer transition-colors ${
                        isTampered
                          ? "bg-danger-dim/30 border border-danger/30"
                          : isDownstreamBroken
                            ? "bg-warning-dim/20 border border-warning/20 opacity-70"
                            : selectedEntry === i
                              ? "bg-bg-elevated border border-border-bright"
                              : "hover:bg-bg-tertiary border border-transparent"
                      }`}
                      onClick={() => setSelectedEntry(selectedEntry === i ? null : i)}
                    >
                      <div className={`relative z-10 w-9 h-9 rounded-full flex items-center justify-center text-[10px] font-mono font-bold shrink-0 ${
                        isTampered
                          ? "bg-danger text-white"
                          : isDownstreamBroken
                            ? "bg-warning text-white"
                            : "bg-bg-elevated text-text-secondary border border-border"
                      }`}>
                        {entry.seq}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-text-muted font-mono">{entry.ts}</span>
                          <Badge
                            label={entry.action.replace(/_/g, " ")}
                            variant={isTampered ? "danger" : isDownstreamBroken ? "warning" : "neutral"}
                          />
                        </div>
                        <p className="text-xs text-text-secondary mt-0.5 truncate">
                          {entry.actor} · {entry.caseId}
                        </p>
                      </div>

                      <div className="shrink-0 text-right">
                        <p className="text-[9px] font-mono text-text-muted truncate max-w-[120px]">
                          {entry.entryHash.substring(0, 16)}...
                        </p>
                      </div>
                    </div>

                    {i < ledgerEntries.length - 1 && (
                      <div className="flex justify-center py-0.5">
                        <div className={`w-0.5 h-3 ${isBroken ? "bg-danger" : "bg-border"}`} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {selected && (
        <div className="bg-bg-secondary border border-border rounded-lg p-4 animate-fade-in-up">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-3">
            Entry #{selected.seq} Detail
          </h3>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <p className="text-text-muted mb-0.5">Timestamp</p>
              <p className="font-mono text-text-primary">{selected.ts}</p>
            </div>
            <div>
              <p className="text-text-muted mb-0.5">Case</p>
              <p className="font-mono text-text-primary">{selected.caseId}</p>
            </div>
            <div>
              <p className="text-text-muted mb-0.5">Actor</p>
              <p className="font-mono text-text-primary">{selected.actor}</p>
            </div>
            <div>
              <p className="text-text-muted mb-0.5">Action</p>
              <p className="font-mono text-text-primary">{selected.action}</p>
            </div>
            <div className="col-span-2">
              <p className="text-text-muted mb-0.5">Payload</p>
              <pre className="p-2 bg-bg-tertiary rounded text-[10px] font-mono text-text-secondary overflow-x-auto">
                {JSON.stringify(selected.payload, null, 2)}
              </pre>
            </div>
            <div>
              <p className="text-text-muted mb-0.5">Prev Hash</p>
              <p className="font-mono text-[9px] text-text-muted break-all">{selected.prevHash}</p>
            </div>
            <div>
              <p className="text-text-muted mb-0.5">Entry Hash</p>
              <p className="font-mono text-[9px] text-mono break-all">{selected.entryHash}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
