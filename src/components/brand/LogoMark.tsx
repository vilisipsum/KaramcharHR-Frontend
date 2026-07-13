export function LogoMark({ size = 48, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="KaramcharHR logo"
    >
      <defs>
        <linearGradient id="brand-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#F5A623" />
          <stop offset="100%" stopColor="#E8577B" />
        </linearGradient>
      </defs>
      <path
        d="M24 4L4 12v12c0 10 8.5 19.5 20 24 11.5-4.5 20-14 20-24V12L24 4z"
        fill="url(#brand-grad)"
      />
      <g fill="white" fillOpacity="0.95">
        <path d="M24 18a5 5 0 1 0 0-10 5 5 0 0 0 0 10z" />
        <path d="M24 21c-6.7 0-10 3.3-10 6.7h20c0-3.4-3.3-6.7-10-6.7z" />
      </g>
    </svg>
  )
}
