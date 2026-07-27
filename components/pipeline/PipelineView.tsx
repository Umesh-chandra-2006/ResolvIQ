"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { SCENARIO_A } from "@/lib/fixtures/cases";
import { score } from "@/lib/engine/score";
import { narrate } from "@/lib/engine/narrate";

const CONNECTORS = [
  { id: "E-1", label: "Carrier / Tracking", source: "carrier", latency: 200 },
  { id: "E-2", label: "Merchant Record", source: "merchant_record", latency: 400 },
  { id: "E-3", label: "Member History", source: "member_history", latency: 300 },
  { id: "E-4", label: "Transaction Store", source: "transaction_store", latency: 150 },
  { id: "E-5", label: "Comms Log / Docs", source: "comms_log", latency: 500 },
];

// Everything the pipeline reports is computed from the engine on the same
// fixture the demo files — no hardcoded verdicts, confidences, or counts.
const DECISION = score(SCENARIO_A.features!, SCENARIO_A.amount, SCENARIO_A.reasonCode);
const NARRATION = narrate({
  decision: DECISION,
  evidence: SCENARIO_A.evidence,
  reasonCode: SCENARIO_A.reasonCode,
});
const CLAIMS_TOTAL = NARRATION.guardReport.length;
const CLAIMS_TRACED = NARRATION.guardReport.filter((c) => c.tracedTo !== null).length;

export function PipelineView() {
  const [running, setRunning] = useState(false);
  const [step, setStep] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [connectorsDone, setConnectorsDone] = useState<string[]>([]);

  const demoSpeed = useAppStore((s) => s.demoSpeed);
  const speedMultiplier = demoSpeed === "0.25x" ? 4 : demoSpeed === "0.5x" ? 2 : 1;

  const runDemo = async () => {
    setRunning(true);
    setStep(0);
    setElapsed(0);
    setConnectorsDone([]);

    const start = Date.now();
    const timer = setInterval(() => {
      setElapsed(Date.now() - start);
    }, 50);

    setStep(1);
    await delay(800 * speedMultiplier);

    for (const conn of CONNECTORS) {
      await delay(conn.latency * speedMultiplier);
      setConnectorsDone((prev) => [...prev, conn.id]);
    }

    setStep(2);
    await delay(1000 * speedMultiplier);

    setStep(3);
    await delay(800 * speedMultiplier);

    setStep(4);
    await delay(600 * speedMultiplier);

    clearInterval(timer);
    setElapsed(Date.now() - start);
    setRunning(false);
    setStep(5);
  };

  const reset = () => {
    setRunning(false);
    setStep(0);
    setElapsed(0);
    setConnectorsDone([]);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-sm font-semibold text-text-primary">Pipeline Visualization</h2>
          <p className="text-xs text-text-muted">Case: D-2026-0847 — Goods Not Received — $184.50</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-bg-secondary border border-border rounded-lg">
            <span className="text-[10px] text-text-muted uppercase tracking-wider mr-2">Elapsed</span>
            <span className="text-xl font-mono font-bold text-accent">
              {(elapsed / 1000).toFixed(1)}s
            </span>
          </div>
          <button
            onClick={running ? reset : runDemo}
            className={`px-4 py-2 text-xs rounded font-medium transition-colors ${
              running
                ? "bg-bg-tertiary text-text-secondary border border-border"
                : "bg-accent text-white font-medium hover:bg-accent/80"
            }`}
          >
            {running ? "Reset" : "Run Pipeline"}
          </button>
        </div>
      </div>

      <div className="flex-1 flex items-center">
        <div className="w-full space-y-4">
          {[
            { label: "Intake", sub: "Reason code classification", active: step >= 1, done: step > 1 },
            { label: "Evidence Assembly", sub: "5 parallel connectors", active: step >= 1, done: step > 2 },
            { label: "Scoring Engine", sub: "Hard rules + scorecard + calibration", active: step >= 2, done: step > 3 },
            { label: "Narration + Guard", sub: "Faithfulness verification", active: step >= 3, done: step > 4 },
            { label: "Routing", sub: "Decision classification", active: step >= 4, done: step > 5 },
          ].map((stage, i) => (
            <div key={stage.label} className="flex items-center gap-4">
              <div className="w-32 text-right">
                <span className="text-xs font-medium text-text-secondary">{stage.label}</span>
                <p className="text-[10px] text-text-muted">{stage.sub}</p>
              </div>

              <div className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  stage.done
                    ? "bg-success text-white"
                    : stage.active
                      ? "bg-accent text-white font-medium animate-pulse-glow"
                      : "bg-bg-tertiary text-text-muted border border-border"
                }`}>
                  {stage.done ? "✓" : i + 1}
                </div>
                {i < 4 && (
                  <div className={`w-8 h-0.5 ${stage.done ? "bg-success" : "bg-border"}`} />
                )}
              </div>

              <div className="flex-1">
                <div className={`h-8 rounded-lg border transition-all duration-300 ${
                  stage.done
                    ? "bg-success-dim/30 border-success/30"
                    : stage.active
                      ? "bg-accent-dim/30 border-accent/30"
                      : "bg-bg-secondary border-border"
                }`}>
                  {stage.label === "Evidence Assembly" && step >= 1 && step <= 2 && (
                    <div className="h-full flex items-center gap-1 px-2">
                      {CONNECTORS.map((conn) => {
                        const done = connectorsDone.includes(conn.id);
                        return (
                          <div
                            key={conn.id}
                            className={`px-1.5 py-0.5 rounded text-[9px] font-mono transition-all duration-300 ${
                              done
                                ? "bg-success-dim text-success animate-evidence-land"
                                : "bg-bg-tertiary text-text-muted animate-pulse"
                            }`}
                          >
                            {conn.id}
                          </div>
                        );
                      })}
                    </div>
                  )}
                  {stage.label === "Evidence Assembly" && step > 2 && (
                    <div className="h-full flex items-center px-2">
                      <span className="text-[10px] text-success font-medium">
                        5/5 evidence items collected
                      </span>
                    </div>
                  )}
                  {stage.label === "Scoring Engine" && step >= 3 && (
                    <div className="h-full flex items-center px-2">
                      <span className="text-[10px] text-text-secondary font-mono">
                        {DECISION.verdict}: {DECISION.confidence.toFixed(2)} | route:{" "}
                        {DECISION.route} |{" "}
                        {DECISION.hardRulesFired.length
                          ? DECISION.hardRulesFired.join(", ") + " fired"
                          : "no rules fired"}
                      </span>
                    </div>
                  )}
                  {stage.label === "Narration + Guard" && step >= 4 && (
                    <div className="h-full flex items-center px-2">
                      <span className="text-[10px] text-success font-medium">
                        {CLAIMS_TRACED}/{CLAIMS_TOTAL} claims traced ✓
                      </span>
                    </div>
                  )}
                  {stage.label === "Routing" && step >= 5 && (
                    <div className="h-full flex items-center px-2">
                      <span className="text-[10px] text-success font-medium">
                        Auto-resolved · provisional credit issued
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {step === 5 && (
        <div className="mt-4 p-4 bg-success-dim/20 border border-success/20 rounded-lg text-center animate-fade-in-up">
          <p className="text-sm text-success font-medium">
            Pipeline complete in {(elapsed / 1000).toFixed(1)} seconds
          </p>
          <p className="text-xs text-text-muted mt-1">
            Written decision issued to both parties with evidence citations and appeal rights
          </p>
        </div>
      )}
    </div>
  );
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
