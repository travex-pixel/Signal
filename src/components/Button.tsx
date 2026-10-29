import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost";

const styles: Record<Variant, string> = {
  primary:
    "bg-navy text-white hover:bg-navy-700 active:bg-navy-800 shadow-1",
  secondary:
    "bg-surface text-navy border border-hairline-strong hover:border-navy-200 hover:bg-surface-2 active:bg-navy-100",
  ghost: "text-navy hover:bg-navy-100 active:bg-navy-200/60",
};

const base =
  "inline-flex items-center justify-center gap-1.5 h-9 px-3.5 rounded-md text-[13.5px] font-semibold whitespace-nowrap transition-colors duration-150 disabled:opacity-50 disabled:pointer-events-none";

export function ButtonLink({ variant = "secondary", className = "", children, ...rest }: ComponentProps<typeof Link> & { variant?: Variant; children: ReactNode }) {
  return (
    <Link className={`${base} ${styles[variant]} ${className}`} {...rest}>
      {children}
    </Link>
  );
}

export function Button({ variant = "secondary", className = "", children, ...rest }: ComponentProps<"button"> & { variant?: Variant; children: ReactNode }) {
  return (
    <button className={`${base} ${styles[variant]} ${className}`} {...rest}>
      {children}
    </button>
  );
}
