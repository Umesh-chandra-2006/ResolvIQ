"use client";

import { OpsDashboard } from "@/components/ops/OpsDashboard";

export default function OpsPage() {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-lg font-semibold text-text-primary">Operations Dashboard</h1>
        <p className="text-xs text-text-muted">Queue metrics, SLA tracking, and case management</p>
      </div>
      <OpsDashboard />
    </div>
  );
}
