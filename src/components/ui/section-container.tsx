import type { ReactNode } from "react";

type SectionContainerProps = Readonly<{
  children: ReactNode;
  className?: string;
  id?: string;
  labelledBy?: string;
}>;

export function SectionContainer({
  children,
  className = "",
  id,
  labelledBy,
}: SectionContainerProps) {
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      className={`mx-auto w-full max-w-7xl px-5 py-14 sm:px-8 lg:px-10 lg:py-20 ${className}`}
    >
      {children}
    </section>
  );
}
