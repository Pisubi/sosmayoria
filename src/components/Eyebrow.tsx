interface EyebrowProps {
  children: React.ReactNode
}

export function Eyebrow({ children }: EyebrowProps) {
  return (
    <p className="flex items-center gap-3 text-xs font-medium tracking-[0.12em] text-naranja uppercase">
      <span aria-hidden className="h-0.5 w-7 bg-naranja" />
      {children}
    </p>
  )
}

export function Index({ n }: { n: number }) {
  return (
    <span className="font-semibold text-naranja tabular-nums">
      {String(n).padStart(2, '0')}
    </span>
  )
}
