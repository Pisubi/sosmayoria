/** El signo de Pisubí: tilde y punto naranjas, como una "í" invertida. */
export function Signo({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 164 226" aria-hidden className={className}>
      <path d="M12 78 87 0h75L88 78z" fill="currentColor" />
      <circle cx="65" cy="162" r="64" fill="currentColor" />
    </svg>
  )
}

/** "La Mayoría" con la letra de Pisubí: trazo grueso y la tilde de la í en naranja. */
export function LaMayoria({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex items-baseline gap-[0.28em] font-extrabold tracking-tight ${className}`}>
      <Signo className="h-[0.64em] w-auto text-naranja" />
      <span>
        La Mayor
        <span className="relative">
          ı
          <span
            aria-hidden
            className="absolute top-[0.18em] left-[0.03em] h-[0.16em] w-[0.14em] origin-bottom-left -skew-x-[47deg] bg-naranja"
          />
        </span>
        a
      </span>
    </span>
  )
}
