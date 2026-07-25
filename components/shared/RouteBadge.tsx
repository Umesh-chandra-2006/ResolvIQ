"use client";

import { Badge } from "./Badge";

type Props = {
  route: string;
};

const ROUTE_STYLES: Record<string, { label: string; variant: "success" | "warning" | "danger" | "info" }> = {
  auto_resolve: { label: "Auto Resolve", variant: "success" },
  proposed_split: { label: "Proposed Split", variant: "warning" },
  human_escalation: { label: "Human Escalation", variant: "danger" },
};

export function RouteBadge({ route }: Props) {
  const style = ROUTE_STYLES[route] || { label: route, variant: "info" as const };
  return <Badge label={style.label} variant={style.variant} />;
}
