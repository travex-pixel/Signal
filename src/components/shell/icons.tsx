import type { SVGProps } from "react";

/** One icon set, one stroke weight. Authored inline so nothing is loaded from a library. */
const base: SVGProps<SVGSVGElement> = {
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
  focusable: false,
};

export function IconToday(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </svg>
  );
}

export function IconRegions(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M3.5 12h17M12 3.5c2.5 2.6 2.5 14.4 0 17M12 3.5c-2.5 2.6-2.5 14.4 0 17" />
    </svg>
  );
}

export function IconBrief(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M6 3.5h8l4 4v13H6z" />
      <path d="M14 3.5v4h4M9 12h6M9 15.5h6" />
    </svg>
  );
}

export function IconLearn(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M4 6.5c2.5-1 5-1 8 .5 3-1.5 5.5-1.5 8-.5v12c-2.5-1-5-1-8 .5-3-1.5-5.5-1.5-8-.5z" />
      <path d="M12 7v12" />
    </svg>
  );
}

export function IconSources(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M5 5.5h14M5 12h14M5 18.5h9" />
      <circle cx="19" cy="18.5" r="1.25" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconTune(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M4 7h10M18 7h2M4 17h4M12 17h8M4 12h2M10 12h10" />
      <circle cx="16" cy="7" r="2" />
      <circle cx="10" cy="17" r="2" />
      <circle cx="7" cy="12" r="2" />
    </svg>
  );
}

export function IconArrow(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} width={16} height={16} {...props}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export function IconExternal(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} width={14} height={14} {...props}>
      <path d="M14 4h6v6M20 4l-9 9M19 14v5H5V5h5" />
    </svg>
  );
}

export function IconCheck(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} width={16} height={16} {...props}>
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  );
}

export function IconAlert(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} width={16} height={16} {...props}>
      <path d="M12 4l9 16H3z" />
      <path d="M12 10v4M12 17v.5" />
    </svg>
  );
}

export function IconPrint(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} width={16} height={16} {...props}>
      <path d="M7 8V4h10v4M7 17H4v-6h16v6h-3" />
      <path d="M7 14h10v6H7z" />
    </svg>
  );
}

export function IconClose(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

export function IconCalendar(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <rect x="4" y="5.5" width="16" height="14.5" rx="2.5" />
      <path d="M4 10h16M8.5 3.5v3.5M15.5 3.5v3.5" />
    </svg>
  );
}

export function IconChevron(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M9.5 6l6 6-6 6" />
    </svg>
  );
}

export function IconCopy(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <rect x="8.5" y="8.5" width="11" height="11" rx="2" />
      <path d="M15.5 8.5V6a1.5 1.5 0 0 0-1.5-1.5H6A1.5 1.5 0 0 0 4.5 6v8A1.5 1.5 0 0 0 6 15.5h2.5" />
    </svg>
  );
}
