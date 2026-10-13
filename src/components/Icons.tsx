import type { ReactNode } from "react";

type IconProps = {
  size?: number;
  className?: string;
};

function Svg({
  size = 16,
  className,
  children,
}: IconProps & { children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  );
}

export const IconDashboard = (p: IconProps) => (
  <Svg {...p}>
    <rect x="3" y="3" width="7" height="9" rx="1.5" />
    <rect x="14" y="3" width="7" height="5" rx="1.5" />
    <rect x="14" y="12" width="7" height="9" rx="1.5" />
    <rect x="3" y="16" width="7" height="5" rx="1.5" />
  </Svg>
);

export const IconMailIn = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3 8.5 12 3l9 5.5" />
    <rect x="3" y="8" width="18" height="12" rx="2" />
    <path d="M12 11v5m0 0-2-2m2 2 2-2" />
  </Svg>
);

export const IconMailOut = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3 8.5 12 3l9 5.5" />
    <rect x="3" y="8" width="18" height="12" rx="2" />
    <path d="M12 16v-5m0 0-2 2m2-2 2 2" />
  </Svg>
);

export const IconDisposition = (p: IconProps) => (
  <Svg {...p}>
    <path d="M9 3h6a1 1 0 0 1 1 1v2H8V4a1 1 0 0 1 1-1Z" />
    <path d="M8 5H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
    <path d="M8 13h8M8 17h5" />
  </Svg>
);

export const IconTag = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3 12V5a2 2 0 0 1 2-2h7l9 9-9 9-9-9Z" />
    <circle cx="8" cy="8" r="1.4" />
  </Svg>
);

export const IconUsers = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="9" cy="8" r="3.2" />
    <path d="M2.5 20a6.5 6.5 0 0 1 13 0" />
    <path d="M16 5.2a3.2 3.2 0 0 1 0 6" />
    <path d="M18 14.4a6.5 6.5 0 0 1 3.5 5.6" />
  </Svg>
);

export const IconSettings = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" />
  </Svg>
);

export const IconSearch = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.6-3.6" />
  </Svg>
);

export const IconFilter = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3 5h18l-7 8v6l-4 2v-8L3 5Z" />
  </Svg>
);

export const IconBell = (p: IconProps) => (
  <Svg {...p}>
    <path d="M18 8a6 6 0 1 0-12 0c0 6-2 7-2 7h16s-2-1-2-7" />
    <path d="M10.5 20a2 2 0 0 0 3 0" />
  </Svg>
);

export const IconChevronRight = (p: IconProps) => (
  <Svg {...p}>
    <path d="m9 6 6 6-6 6" />
  </Svg>
);

export const IconChevronDown = (p: IconProps) => (
  <Svg {...p}>
    <path d="m6 9 6 6 6-6" />
  </Svg>
);

export const IconPlus = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 5v14M5 12h14" />
  </Svg>
);

export const IconDownload = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 3v12m0 0 4-4m-4 4-4-4" />
    <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
  </Svg>
);

export const IconPrint = (p: IconProps) => (
  <Svg {...p}>
    <path d="M7 9V3h10v6" />
    <rect x="3" y="9" width="18" height="8" rx="2" />
    <path d="M7 15h10v6H7z" />
  </Svg>
);

export const IconTrash = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 7h16M9 7V5h6v2M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13" />
  </Svg>
);

export const IconEye = (p: IconProps) => (
  <Svg {...p}>
    <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
    <circle cx="12" cy="12" r="3" />
  </Svg>
);

export const IconQr = (p: IconProps) => (
  <Svg {...p}>
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <path d="M14 14h3v3h-3zM20 14v3M17 20h4M14 20h.01" />
  </Svg>
);

export const IconWhatsapp = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3.5 20.5 5 16.3A8.2 8.2 0 1 1 8.2 19L3.5 20.5Z" />
    <path d="M8.6 8.4c.3-.6 1.1-.5 1.4 0l.6 1.1c.2.4.1.8-.2 1.1l-.4.4c.5 1 1.3 1.8 2.3 2.3l.4-.4c.3-.3.7-.4 1.1-.2l1.1.6c.5.3.6 1.1 0 1.4-1.9 1.1-4.9-1.4-6-3.3-.4-.8-.6-2.4-.3-3Z" />
  </Svg>
);

export const IconCheck = (p: IconProps) => (
  <Svg {...p}>
    <path d="m5 13 4.5 4.5L19 7" />
  </Svg>
);

export const IconAlert = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 3.5 21 19H3l9-15.5Z" />
    <path d="M12 9.5v4M12 16.5h.01" />
  </Svg>
);

export const IconInfo = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11v5M12 8h.01" />
  </Svg>
);

export const IconClock = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </Svg>
);

export const IconShield = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 3 5 6v5.5c0 4.3 2.9 7.6 7 9.5 4.1-1.9 7-5.2 7-9.5V6l-7-3Z" />
    <path d="m9 12 2 2 4-4" />
  </Svg>
);

export const IconFile = (p: IconProps) => (
  <Svg {...p}>
    <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z" />
    <path d="M14 3v5h5" />
  </Svg>
);

export const IconUpload = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 16V4m0 0-4 4m4-4 4 4" />
    <path d="M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" />
  </Svg>
);

export const IconLink = (p: IconProps) => (
  <Svg {...p}>
    <path d="M10 13a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1" />
    <path d="M14 11a4 4 0 0 0-5.7 0l-3 3A4 4 0 0 0 11 19.7l1-1" />
  </Svg>
);

export const IconPhone = (p: IconProps) => (
  <Svg {...p}>
    <path d="M6 3h3l1.7 4.3-2 1.4a12 12 0 0 0 5.6 5.6l1.4-2L20 15v3a2 2 0 0 1-2.2 2A16 16 0 0 1 4 6.2 2 2 0 0 1 6 3Z" />
  </Svg>
);

export const IconArrowLeft = (p: IconProps) => (
  <Svg {...p}>
    <path d="M19 12H5m0 0 6-6m-6 6 6 6" />
  </Svg>
);

export const IconClose = (p: IconProps) => (
  <Svg {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </Svg>
);

export const IconMenu = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 6h16M4 12h16M4 18h16" />
  </Svg>
);

export const IconTrendUp = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 17 10 11l4 4 6-7" />
    <path d="M14 8h6v6" />
  </Svg>
);
