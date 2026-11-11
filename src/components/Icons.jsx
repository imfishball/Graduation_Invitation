/** Icon SVG nội tuyến tối giản dùng cho toàn trang thiệp mời. */

const base = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': 'true',
  focusable: 'false',
}

export function MailIcon({ size = 18 }) {
  return (
    <svg {...base} width={size} height={size}>
      <rect x="2.5" y="5" width="19" height="14" rx="3" />
      <path d="m3.5 7 8.5 6 8.5-6" />
    </svg>
  )
}

export function MapPinIcon({ size = 18 }) {
  return (
    <svg {...base} width={size} height={size} strokeWidth={1.8}>
      <path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  )
}

export function ChevronLeftIcon({ size = 18 }) {
  return (
    <svg {...base} width={size} height={size} strokeWidth={1.8}>
      <path d="m15 18-6-6 6-6" />
    </svg>
  )
}

export function ChevronRightIcon({ size = 18 }) {
  return (
    <svg {...base} width={size} height={size} strokeWidth={1.8}>
      <path d="m9 18 6-6-6-6" />
    </svg>
  )
}

export function ChevronDownIcon({ size = 16 }) {
  return (
    <svg {...base} width={size} height={size} strokeWidth={1.8}>
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}

export function EyeIcon({ size = 14 }) {
  return (
    <svg {...base} width={size} height={size}>
      <path d="M2.5 12S6 5.8 12 5.8 21.5 12 21.5 12 18 18.2 12 18.2 2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

export function HeartIcon({ size = 14 }) {
  return (
    <svg {...base} width={size} height={size}>
      <path d="M12 19.5s-7.2-4.2-7.2-9A4.3 4.3 0 0 1 12 7.6a4.3 4.3 0 0 1 7.2 2.9c0 4.8-7.2 9-7.2 9Z" />
    </svg>
  )
}

export function ClockIcon({ size = 18 }) {
  return (
    <svg {...base} width={size} height={size} strokeWidth={1.8}>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
}

export function FeatherPenIcon({ size = 16 }) {
  return (
    <svg {...base} width={size} height={size} strokeWidth={1.7}>
      <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z" />
      <line x1="16" y1="8" x2="2" y2="22" />
      <line x1="17.5" y1="15" x2="9" y2="15" />
    </svg>
  )
}

export function PaperclipIcon({ size = 24 }) {
  return (
    <svg {...base} width={size} height={size} strokeWidth={1.75}>
      <path d="m18.5 8.5-7.8 7.8a3.2 3.2 0 0 1-4.5-4.5l8.4-8.4a2 2 0 0 1 2.8 2.8L9 14.6a1 1 0 0 1-1.4-1.4l7-7" />
    </svg>
  )
}

export function OutlineStarIcon({ size = 15 }) {
  return (
    <svg {...base} width={size} height={size} strokeWidth={1.6}>
      <polygon points="12 2.5 14.9 8.5 21.5 9.4 16.7 14 17.9 20.5 12 17.4 6.1 20.5 7.3 14 2.5 9.4 9.1 8.5 12 2.5" />
    </svg>
  )
}

export function WavyLineSvg() {
  return (
    <svg
      viewBox="0 0 240 10"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path d="M2 5c10-5 20 5 30 0s20 5 30 0 20 5 30 0 20 5 30 0 20 5 30 0 20 5 30 0 20 5 30 0 20 5 28 0" />
    </svg>
  )
}

export function NoteDoodleIcon({ variant = 'star', size = 14 }) {
  if (variant === 'heart') {
    return (
      <svg {...base} width={size} height={size} strokeWidth={1.55}>
        <path d="M12 20s-7-4.5-7-10.2A4.2 4.2 0 0 1 12 6.8a4.2 4.2 0 0 1 7 3c0 5.7-7 10.2-7 10.2Z" />
      </svg>
    )
  }
  if (variant === 'flower') {
    return (
      <svg {...base} width={size} height={size} strokeWidth={1.5}>
        <circle cx="12" cy="12" r="2.1" />
        <circle cx="12" cy="6.8" r="2.1" />
        <circle cx="12" cy="17.2" r="2.1" />
        <circle cx="6.8" cy="12" r="2.1" />
        <circle cx="17.2" cy="12" r="2.1" />
      </svg>
    )
  }
  if (variant === 'sparkle') {
    return (
      <svg {...base} width={size} height={size} strokeWidth={1.55}>
        <path d="M12 3c.6 5.2 3.8 8.4 9 9-5.2.6-8.4 3.8-9 9-.6-5.2-3.8-8.4-9-9 5.2-.6 8.4-3.8 9-9Z" />
      </svg>
    )
  }
  return <OutlineStarIcon size={size} />
}

export function CalendarIcon({ size = 18 }) {
  return (
    <svg {...base} width={size} height={size}>
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  )
}

export function DirectionsIcon({ size = 18 }) {
  return (
    <svg {...base} width={size} height={size}>
      <polygon points="3 11 22 2 13 21 11 13 3 11" />
    </svg>
  )
}

export function GraduationCapIcon({ size = 20 }) {
  return (
    <svg {...base} width={size} height={size}>
      <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
      <path d="M6 12v5c3 3 9 3 12 0v-5" />
    </svg>
  )
}

export function CheckIcon({ size = 18 }) {
  return (
    <svg {...base} width={size} height={size} strokeWidth={2}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

export function BusIcon({ size = 18 }) {
  return (
    <svg {...base} width={size} height={size} strokeWidth={1.8}>
      <path d="M8 6v6M16 6v6M2 12h20M4 3h16a2 2 0 0 1 2 2v10a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V5a2 2 0 0 1 2-2Z" />
      <path d="M6 18v2M18 18v2" />
    </svg>
  )
}

export function CarIcon({ size = 18 }) {
  return (
    <svg {...base} width={size} height={size}>
      <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
      <circle cx="7" cy="17" r="2" />
      <path d="M9 17h6" />
      <circle cx="17" cy="17" r="2" />
    </svg>
  )
}

export function Volume2Icon({ size = 18 }) {
  return (
    <svg {...base} width={size} height={size}>
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07M19.07 4.93a10 10 0 0 1 0 14.14" />
    </svg>
  )
}

export function VolumeXIcon({ size = 18 }) {
  return (
    <svg {...base} width={size} height={size}>
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <line x1="22" y1="9" x2="16" y2="15" />
      <line x1="16" y1="9" x2="22" y2="15" />
    </svg>
  )
}

export function XIcon({ size = 18 }) {
  return (
    <svg {...base} width={size} height={size}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

export function CopyIcon({ size = 16 }) {
  return (
    <svg {...base} width={size} height={size}>
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  )
}

export function LinkIcon({ size = 16 }) {
  return (
    <svg {...base} width={size} height={size}>
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  )
}

export function ArrowLeftIcon({ size = 16 }) {
  return (
    <svg {...base} width={size} height={size} strokeWidth={1.8}>
      <path d="M20 12H5m0 0 5.5-5.5M5 12l5.5 5.5" />
    </svg>
  )
}

export function TrashIcon({ size = 15 }) {
  return (
    <svg {...base} width={size} height={size}>
      <path d="M3 6h18" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  )
}

export function EditPenIcon({ size = 14 }) {
  return (
    <svg {...base} width={size} height={size} strokeWidth={1.8}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 1 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  )
}

export function LockIcon({ size = 16 }) {
  return (
    <svg {...base} width={size} height={size} strokeWidth={1.8}>
      <rect x="4" y="11" width="16" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  )
}

export function EyeOffIcon({ size = 15 }) {
  return (
    <svg {...base} width={size} height={size} strokeWidth={1.7}>
      <path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-6 0-9.5-7-9.5-7a18.2 18.2 0 0 1 4.11-4.95" />
      <path d="M9.9 5.24A10.5 10.5 0 0 1 12 5c6 0 9.5 7 9.5 7a18.5 18.5 0 0 1-2.16 3.19" />
      <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
      <line x1="2" y1="2" x2="22" y2="22" />
    </svg>
  )
}