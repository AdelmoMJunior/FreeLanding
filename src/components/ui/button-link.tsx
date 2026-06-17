import type { AnchorHTMLAttributes, ReactNode } from "react";

type ButtonLinkProps = Readonly<
  AnchorHTMLAttributes<HTMLAnchorElement> & {
    children: ReactNode;
    variant?: "primary" | "secondary" | "ghost";
  }
>;

const variants = {
  primary:
    "bg-[var(--brand-color)] text-[var(--brand-contrast)] shadow-[0_16px_36px_var(--brand-shadow)] hover:brightness-110 focus-visible:outline-[var(--brand-color)]",
  secondary:
    "border border-white/15 bg-white/10 text-white hover:bg-white/15 focus-visible:outline-white",
  ghost:
    "border border-slate-200 bg-white text-slate-900 shadow-sm hover:border-[var(--brand-color)] hover:text-slate-950 focus-visible:outline-[var(--brand-color)]",
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
