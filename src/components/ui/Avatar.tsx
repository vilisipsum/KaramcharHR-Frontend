const gradients = [
  'linear-gradient(135deg, #4B3AA4, #E8577B)',
  'linear-gradient(135deg, #2FD4B0, #4B3AA4)',
  'linear-gradient(135deg, #F5A623, #E8577B)',
  'linear-gradient(135deg, #F5A623, #2FD4B0)',
  'linear-gradient(135deg, #E8577B, #4B3AA4)',
]

const sizes = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-11 h-11 text-sm',
  lg: 'w-14 h-14 text-lg',
}

export function Avatar({ initials, index = 0, size = 'md', className = '' }: {
  initials: string
  index?: number
  size?: keyof typeof sizes
  className?: string
}) {
  return (
    <div
      className={`${sizes[size]} rounded-full flex items-center justify-center font-bold text-white border-2 border-white/65 dark:border-white/13 flex-shrink-0 ${className}`}
      style={{ background: gradients[index % gradients.length] }}
    >
      {initials}
    </div>
  )
}
