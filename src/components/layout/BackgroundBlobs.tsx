'use client'

export function BackgroundBlobs() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none" style={{ opacity: 0.55 }}>
      <div className="blob absolute w-[80vw] h-[80vw] max-w-[420px] max-h-[420px] bg-marigold top-[-8%] left-[-6%] rounded-full blur-[70px]" style={{ animationDuration: '26s' }} />
      <div className="blob absolute w-[80vw] h-[80vw] max-w-[380px] max-h-[380px] bg-rose top-[10%] right-[-8%] rounded-full blur-[70px]" style={{ animationDuration: '20s', animationDelay: '-4s' }} />
      <div className="blob absolute w-[80vw] h-[80vw] max-w-[460px] max-h-[460px] bg-teal bottom-[-12%] left-[18%] rounded-full blur-[70px]" style={{ animationDuration: '30s', animationDelay: '-10s' }} />
      <div className="blob absolute w-[80vw] h-[80vw] max-w-[340px] max-h-[340px] bg-indigo bottom-[5%] right-[12%] rounded-full blur-[70px]" style={{ animationDuration: '24s', animationDelay: '-6s' }} />
    </div>
  )
}
