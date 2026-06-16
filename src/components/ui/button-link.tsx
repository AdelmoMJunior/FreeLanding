import type { AnchorHTMLAttributes, ReactNode } from "react";

type ButtonLinkProps = Readonly<
  AnchorHTMLAttributes<HTMLAnchorElement> & {
    children: ReactNode;
    variant?: "primary" | "secondary" | "ghost";
  }
>;

const variants = {
  primary:
    "bg-emerald-500 text-slate-950 shadow-[0_16px_36px_rgba(16,185,129,0.32)] hover:bg-emerald-400 focus-visible:outline-emerald-200",
  secondary:
    "border border-white/15 bg-white/10 text-white hover:bg-white/15 focus-visible:outline-white",
  ghost:
    "border border-slate-200 bg-white text-slate-900 shadow-sm hover:border-emerald-300 hover:text-emerald-800 focus-visible:outline-emerald-600",
};

export function ButtonLink({
  children,
  className = "",
  variant = "primary",
  ...props
}: ButtonLinkProps) {
  return (
    <a
      className={`inline-flex min-h-12 items-center justify-center rounded-full px-6 text-sm font-bold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </a>
  );
}
