import type { ReactNode } from "react";
import { cn } from "@/app/src/lib/utils/cn";

type AlertVariant = "error" | "success" | "info";

interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  children: ReactNode;
  className?: string;
}

const variantStyles: Record<AlertVariant, string> = {
  error: "border-red-500/30 bg-red-500/10 text-red-200",
  success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-200",
  info: "border-indigo-500/30 bg-indigo-500/10 text-indigo-200",
};

export function Alert({
  variant = "info",
  title,
  children,
  className,
}: AlertProps) {
  return (
    <div
      role="alert"
      className={cn(
        "rounded-xl border px-4 py-3 text-sm",
        variantStyles[variant],
        className,
      )}
    >
      {title && <p className="mb-1 font-medium">{title}</p>}
      <p className="text-sm opacity-90">{children}</p>
    </div>
  );
}
