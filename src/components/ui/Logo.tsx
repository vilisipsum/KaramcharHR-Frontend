import React from 'react'

export function Logo({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 80 80"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="logoTorso" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFA827" />
          <stop offset="100%" stopColor="#E8577B" />
        </linearGradient>
        <linearGradient id="logoSwoosh" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4B3AA4" />
          <stop offset="100%" stopColor="#1AD3C7" />
        </linearGradient>
      </defs>

      {/* Left vertical torso */}
      <path d="M16,22 C16,16 22,14 30,16 C30,16 24,23 24,33 C24,40 29,45 29,45 L29,72 C29,76 23,78 16,76 L16,22 Z" fill="url(#logoTorso)" />
      
      {/* Inner head dot */}
      <circle cx="30" cy="33" r="5" fill="url(#logoTorso)" />

      {/* Right K arms */}
      <path d="M35,33 C35,24 46,16 60,16 C60,16 44,30 44,46 C44,60 60,72 60,72 C46,72 35,63 35,54 L35,33 Z" fill="url(#logoSwoosh)" />
      
      {/* Top head dot */}
      <circle cx="38" cy="10" r="5.5" fill="#FFA827" />
    </svg>
  )
}
