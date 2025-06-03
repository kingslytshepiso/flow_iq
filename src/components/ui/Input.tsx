import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = "", ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-[var(--text)] mb-1">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`
            w-full px-3 py-2 rounded-md
            bg-[var(--card)] text-[var(--text)]
            border border-[var(--border)]
            focus:outline-none focus:ring-2 focus:ring-[var(--primary)]
            placeholder:text-[var(--text)]/50
            ${error ? "border-[var(--error)]" : ""}
            ${className}
          `}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-[var(--error)]">{error}</p>}
      </div>
    );
  }
);
