"use client";

type BadgeVariant = "success" | "warning" | "danger" | "info" | "neutral";

type Props = {
  label: string;
  variant?: BadgeVariant;
  className?: string;
};

const VARIANT_STYLES: Record<BadgeVariant, string> = {
  success: "bg-success-dim text-success border-success/30",
  warning: "bg-warning-dim text-warning border-warning/30",
  danger: "bg-danger-dim text-danger border-danger/30",
  info: "bg-accent-dim text-accent border-accent/30",
  neutral: "bg-bg-tertiary text-text-secondary border-border",
};

export function Badge({ label, variant = "neutral", className = "" }: Props) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider rounded border ${VARIANT_STYLES[variant]} ${className}`}
    >
      {label}
    </span>
  );
}
