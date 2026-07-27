"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { ReasonCode } from "@/lib/types";
import { REASON_CODE_LABELS } from "@/lib/fixtures/policy";

const REASON_OPTIONS: { code: ReasonCode; label: string; description: string }[] = [
  { code: "C08_goods_not_received", label: "Goods not received", description: "My order never arrived" },
  { code: "C31_not_as_described", label: "Not as described", description: "Product differs from what was advertised" },
  { code: "F29_unrecognised_charge", label: "Unrecognised charge", description: "I don't recognise this transaction" },
  { code: "C05_cancelled_merchandise", label: "Cancelled merchandise", description: "I returned or cancelled but was still charged" },
];

const MOCK_TRANSACTIONS = [
  { id: "TXN-99821", amount: 184.5, merchant: "TechGear Store", date: "2026-07-20" },
  { id: "TXN-99830", amount: 92.0, merchant: "Fashion Hub", date: "2026-07-22" },
  { id: "TXN-99845", amount: 340.0, merchant: "Home Essentials", date: "2026-07-23" },
  { id: "TXN-99850", amount: 76.2, merchant: "EATWELL CAFE", date: "2026-07-24" },
];

type Step = 1 | 2 | 3;

export function FileDispute({ onFiled }: { onFiled: () => void }) {
  const [step, setStep] = useState<Step>(1);
  const [selectedTxn, setSelectedTxn] = useState<string | null>(null);
  const [reasonCode, setReasonCode] = useState<ReasonCode | null>(null);
  const [claim, setClaim] = useState("");
  const [filing, setFiling] = useState(false);

  const fileDispute = useAppStore((s) => s.fileDispute);
  const runPipeline = useAppStore((s) => s.runPipeline);

  const selected = MOCK_TRANSACTIONS.find((t) => t.id === selectedTxn);

  const handleFile = async () => {
    if (!selected || !reasonCode || !claim.trim()) return;
    setFiling(true);
    const caseId = await fileDispute({
      txnId: selected.id,
      reasonCode,
      amount: selected.amount,
      merchantId: "MERCH-SYNTH",
      claim: claim.trim(),
    });
    await runPipeline(caseId);
    setFiling(false);
    onFiled();
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                step >= s
                  ? "bg-accent text-white font-medium"
                  : "bg-bg-tertiary text-text-muted border border-border"
              }`}
            >
              {s}
            </div>
            {s < 3 && (
              <div
                className={`w-12 h-0.5 ${
                  step > s ? "bg-accent" : "bg-bg-tertiary"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {step === 1 && (
        <div className="animate-fade-in-up">
          <h3 className="text-sm font-semibold text-text-primary mb-3">
            Select a transaction
          </h3>
          <div className="space-y-2">
            {MOCK_TRANSACTIONS.map((txn) => (
              <button
                key={txn.id}
                onClick={() => {
                  setSelectedTxn(txn.id);
                  setStep(2);
                }}
                className={`w-full flex items-center justify-between p-3 rounded border text-left transition-colors ${
                  selectedTxn === txn.id
                    ? "bg-accent-dim border-accent"
                    : "bg-bg-secondary border-border hover:border-border-bright"
                }`}
              >
                <div>
                  <span className="text-xs text-text-muted font-mono">{txn.id}</span>
                  <p className="text-sm text-text-primary">{txn.merchant}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-mono text-text-primary">${txn.amount.toFixed(2)}</p>
                  <p className="text-[10px] text-text-muted">{txn.date}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="animate-fade-in-up">
          <h3 className="text-sm font-semibold text-text-primary mb-1">
            What is the issue?
          </h3>
          <p className="text-xs text-text-muted mb-4">
            Transaction: {selectedTxn} — ${selected?.amount.toFixed(2)}
          </p>
          <div className="space-y-2">
            {REASON_OPTIONS.map((opt) => (
              <button
                key={opt.code}
                onClick={() => {
                  setReasonCode(opt.code);
                  setStep(3);
                }}
                className="w-full flex flex-col p-3 rounded border border-border bg-bg-secondary hover:border-border-bright text-left transition-colors"
              >
                <span className="text-sm text-text-primary font-medium">{opt.label}</span>
                <span className="text-xs text-text-muted mt-0.5">{opt.description}</span>
                <span className="text-[10px] text-text-muted font-mono mt-1">{opt.code}</span>
              </button>
            ))}
          </div>
          <button
            onClick={() => setStep(1)}
            className="mt-4 text-xs text-text-muted hover:text-text-primary"
          >
            ← Back to transactions
          </button>
        </div>
      )}

      {step === 3 && (
        <div className="animate-fade-in-up">
          <h3 className="text-sm font-semibold text-text-primary mb-1">
            Describe the issue
          </h3>
          <p className="text-xs text-text-muted mb-4">
            Reason: {reasonCode && REASON_CODE_LABELS[reasonCode]}
          </p>
          <textarea
            value={claim}
            onChange={(e) => setClaim(e.target.value)}
            placeholder="Describe what happened with your purchase..."
            className="w-full h-32 p-3 bg-bg-secondary border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted resize-none focus:outline-none focus:border-accent"
          />
          <div className="mt-3 p-3 bg-bg-tertiary rounded-lg border border-border">
            <div className="flex items-center gap-2 text-xs text-text-muted">
              <span className="px-2 py-0.5 bg-bg-elevated rounded text-text-secondary">📎</span>
              <span>Upload receipt (simulated)</span>
              <span className="px-1.5 py-0.5 bg-warning-dim text-warning text-[9px] rounded">OCR extracted</span>
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button
              onClick={() => setStep(2)}
              className="px-4 py-2 text-xs bg-bg-tertiary text-text-secondary border border-border rounded hover:bg-bg-hover transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleFile}
              disabled={!claim.trim() || filing}
              className="flex-1 px-4 py-2 text-xs bg-accent text-white font-medium rounded hover:bg-accent/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {filing ? "Filing..." : "Submit Dispute"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
