import { BackgroundBlobs } from '@/components/layout/BackgroundBlobs'
import { LogoHorizontal } from '@/components/brand/LogoHorizontal'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen flex items-center justify-center">
      <BackgroundBlobs />
      <div className="relative z-10 glass p-8 w-full max-w-md">
        <div className="text-center mb-8 flex justify-center">
          <LogoHorizontal size="md" showTagline={false} />
        </div>
        {children}
      </div>
    </div>
  )
}
