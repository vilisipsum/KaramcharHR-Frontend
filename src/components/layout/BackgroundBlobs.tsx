'use client'

export function BackgroundBlobs() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none" style={{ opacity: 0.55 }}>
      <div className="blob absolute w-[420px] h-[420px] bg-marigold top-[-8%] left-[-6%] rounded-full blur-[70px]" style={{ animationDuration: '26s' }} />
      <div className="blob absolute w-[380px] h-[380px] bg-rose top-[10%] right-[-8%] rounded-full blur-[70px]" style={{ animationDuration: '20s', animationDelay: '-4s' }} />
      <div className="blob absolute w-[460px] h-[460px] bg-teal bottom-[-12%] left-[18%] rounded-full blur-[70px]" style={{ animationDuration: '30s', animationDelay: '-10s' }} />
      <div className="blob absolute w-[340px] h-[340px] bg-indigo bottom-[5%] right-[12%] rounded-full blur-[70px]" style={{ animationDuration: '24s', animationDelay: '-6s' }} />
    </div>
  )
}
