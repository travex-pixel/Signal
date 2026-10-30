import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost";

const styles: Record<Variant, string> = {
  primary:
    "btn-primary text-white",
  secondary:
    "bg-surface text-navy border border-hairline-strong shadow-1 hover:border-navy-200 hover:bg-surface-2 hover:shadow-2 active:bg-navy-100",
  ghost: "text-navy hover:bg-navy-100 active:bg-navy-200/60",
};

const base =
  "inline-flex items-center justify-center gap-1.5 h-11 sm:h-9 px-4 sm:px-3.5 rounded-md font-sans text-[14px] sm:text-[13.5px] font-semibold whitespace-nowrap transition-[background-color,border-color,box-shadow,transform] duration-150 active:translate-y-px disabled:opacity-50 disabled:pointer-events-none";

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
