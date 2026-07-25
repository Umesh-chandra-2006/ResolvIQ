"use client";

import { AuditBrowser } from "@/components/audit/AuditBrowser";

export default function AuditPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-lg font-semibold text-text-primary">Audit Browser</h1>
        <p className="text-xs text-text-muted">Hash-chained ledger — tamper-evident audit trail</p>
      </div>
      <AuditBrowser />
    </div>
  );
}
