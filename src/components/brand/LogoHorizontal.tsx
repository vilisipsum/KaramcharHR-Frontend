import { LogoMark } from './LogoMark'

export function LogoHorizontal({ size = 'md', showTagline = true, className = '' }: {
  size?: 'sm' | 'md' | 'lg'
  showTagline?: boolean
  className?: string
}) {
  const dimensions = { sm: 28, md: 36, lg: 48 }
  const pix = dimensions[size]
  const textSize = { sm: 'text-sm', md: 'text-xl', lg: 'text-2xl' }[size]
  const devaSize = { sm: 'text-base', md: 'text-2xl', lg: 'text-3xl' }[size]
  const gap = { sm: 'gap-2', md: 'gap-3', lg: 'gap-4' }[size]

  return (
    <div className={`flex items-center ${gap} ${className}`}>
      <LogoMark size={pix} />
      <div className="flex flex-col leading-tight">
        <span className={`${devaSize} font-deva bg-gradient-to-r from-marigold to-rose bg-clip-text text-transparent`}>
          कर्मचारी
        </span>
        <span className={`${textSize} font-display font-semibold text-foreground`}>
          KaramcharHR
        </span>
        {showTagline && size !== 'sm' && (
          <span className="text-[10px] font-mono text-muted-foreground tracking-wider uppercase">
            Employee-first HRMS for India
          </span>
        )}
      </div>
    </div>
  )
}
