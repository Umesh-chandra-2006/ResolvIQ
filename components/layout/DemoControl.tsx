"use client";

import { useAppStore } from "@/lib/store";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function DemoControl({ open, onClose }: Props) {
  const jumpToScenario = useAppStore((s) => s.jumpToScenario);
  const resetAll = useAppStore((s) => s.resetAll);
  const demoSpeed = useAppStore((s) => s.demoSpeed);
  const setDemoSpeed = useAppStore((s) => s.setDemoSpeed);
  const injectUnfaithful = useAppStore((s) => s.injectUnfaithful);
  const setInjectUnfaithful = useAppStore((s) => s.setInjectUnfaithful);
  const tamperedEntry = useAppStore((s) => s.tamperedEntry);
  const tamperLedgerEntry = useAppStore((s) => s.tamperLedgerEntry);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-80 bg-bg-secondary border-l border-border p-5 overflow-y-auto animate-fade-in-up">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-sm font-semibold text-text-primary">Demo Control</h2>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-primary text-lg"
          >
            ×
          </button>
        </div>

        <div className="space-y-5">
          <div>
            <label className="text-[10px] uppercase tracking-wider text-text-muted block mb-2">
              Jump to Scenario
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(["A", "B", "C", "D", "all"] as const).map((sc) => (
                <button
                  key={sc}
                  onClick={() => jumpToScenario(sc)}
                  className="px-3 py-2 text-xs bg-bg-tertiary text-text-secondary hover:bg-bg-hover hover:text-text-primary rounded border border-border transition-colors"
                >
                  {sc === "all" ? "Reset All" : `Scenario ${sc}`}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-wider text-text-muted block mb-2">
              Playback Speed
            </label>
            <div className="flex gap-2">
              {(["1x", "0.5x", "0.25x"] as const).map((speed) => (
                <button
                  key={speed}
                  onClick={() => setDemoSpeed(speed)}
                  className={`flex-1 px-2 py-1.5 text-xs rounded border transition-colors ${
                    demoSpeed === speed
                      ? "bg-accent text-bg-primary font-medium border-accent"
                      : "bg-bg-tertiary text-text-secondary border-border hover:bg-bg-hover"
                  }`}
                >
                  {speed}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-wider text-text-muted block mb-2">
              Faithfulness Guard
            </label>
            <button
              onClick={() => setInjectUnfaithful(!injectUnfaithful)}
              className={`w-full px-3 py-2 text-xs rounded border transition-colors ${
                injectUnfaithful
                  ? "bg-danger-dim text-danger border-danger"
                  : "bg-bg-tertiary text-text-secondary border-border hover:bg-bg-hover"
              }`}
            >
              {injectUnfaithful ? "Unfaithful Claim: ON" : "Inject Unfaithful Claim: OFF"}
            </button>
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-wider text-text-muted block mb-2">
              Ledger Tamper
            </label>
            <div className="space-y-2">
              <button
                onClick={() => tamperLedgerEntry(2)}
                className={`w-full px-3 py-2 text-xs rounded border transition-colors ${
                  tamperedEntry === 2
                    ? "bg-danger-dim text-danger border-danger"
                    : "bg-bg-tertiary text-text-secondary border-border hover:bg-bg-hover"
                }`}
              >
                {tamperedEntry === 2 ? "Entry #3 Tampered" : "Alter Entry #3"}
              </button>
              <button
                onClick={resetAll}
                className="w-full px-3 py-2 text-xs bg-bg-tertiary text-text-secondary border border-border hover:bg-bg-hover rounded transition-colors"
              >
                Reset All State
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
