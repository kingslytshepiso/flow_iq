import { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "outline";
  isLoading?: boolean;
}

export function Button({
  children,
  variant = "primary",
  isLoading = false,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles =
    "px-4 py-2 rounded-md font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";

  const variants = {
    primary:
      "bg-[var(--primary)] text-white hover:bg-[var(--primary)]/90 focus:ring-[var(--primary)]",
    secondary:
      "bg-[var(--accent)] text-white hover:bg-[var(--accent)]/90 focus:ring-[var(--accent)]",
    outline:
      "border-2 border-[var(--border)] text-[var(--text)] hover:bg-[var(--border)]/10 focus:ring-[var(--border)]",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${
        disabled || isLoading ? "opacity-50 cursor-not-allowed" : ""
      } ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <div className="flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        children
      )}
    </button>
  );
}
