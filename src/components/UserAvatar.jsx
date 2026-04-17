export default function UserAvatar({ emoji, size = 'md', ring = false }) {
  const sizes = { sm: 'w-8 h-8 text-lg', md: 'w-10 h-10 text-2xl', lg: 'w-16 h-16 text-4xl', xl: 'w-24 h-24 text-6xl' }
  return (
    <div className={`${sizes[size]} rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0 ${ring ? 'ring-2 ring-orange-500' : ''}`}>
      {emoji}
    </div>
  )
}
