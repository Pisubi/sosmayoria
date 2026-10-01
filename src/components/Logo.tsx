/** Firma Pisubí: signo (punto con acento) + nombre en Archivo Black. El naranja del signo es fijo. */
export function Logo({ claro, className = '' }: { claro?: boolean; className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 leading-none ${claro ? 'text-papel' : 'text-azul'} ${className}`}
      aria-label="Pisubí"
    >
      <svg viewBox="0 0 20 28" className="h-[1.05em] w-auto" aria-hidden>
        <path d="M6 1h13l-4 8H2z" fill="#E37A29" />
        <circle cx="8" cy="20" r="6.5" fill="#E37A29" />
      </svg>
      <span aria-hidden className="font-black tracking-[-0.03em]">
        Pisubí
      </span>
    </span>
  )
}
