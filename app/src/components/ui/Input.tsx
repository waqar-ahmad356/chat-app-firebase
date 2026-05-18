import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/app/src/lib/utils/cn";
import { Label } from "./Label";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id, type = "text", ...props }, ref) => {
    const inputId = id ?? props.name;

    return (
      <div className="space-y-1.5">
        {label && <Label htmlFor={inputId}>{label}</Label>}
        <input
          ref={ref}
          id={inputId}
          type={type}
          className={cn(
            "w-full rounded-xl border bg-slate-900/60 px-4 py-2.5 text-sm text-white",
            "placeholder:text-slate-500 transition-colors",
            "focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500",
            error
              ? "border-red-500/60 focus:border-red-500 focus:ring-red-500/30"
              : "border-slate-700 hover:border-slate-600",
            className,
          )}
          aria-invalid={!!error}
          aria-describedby={
            error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
          }
          {...props}
        />
        {hint && !error && (
          <p id={`${inputId}-hint`} className="text-xs text-slate-500">
            {hint}
          </p>
        )}
        {error && (
          <p
            id={`${inputId}-error`}
            className="text-xs text-red-400"
            role="alert"
          >
            {error}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";
