import { BackgroundBlobs } from '@/components/layout/BackgroundBlobs'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen flex items-center justify-center">
      <BackgroundBlobs />
      <div className="relative z-10 glass p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="font-deva text-3xl bg-gradient-to-r from-marigold to-rose bg-clip-text text-transparent">कर्मचारी</div>
          <div className="font-display font-semibold text-xl">KaramcharHR</div>
        </div>
        {children}
      </div>
    </div>
  )
}
