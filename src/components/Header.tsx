interface HeaderProps {
  onHome: () => void
  onMethodology: () => void
}

export function Header({ onHome, onMethodology }: HeaderProps) {
  return (
    <header className="border-b border-azul/14 bg-marfil">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
        <button type="button" onClick={onHome} className="flex items-baseline gap-2 text-left">
          <span className="text-xl font-bold tracking-tight text-azul">Brújula</span>
          <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-naranja" />
        </button>
        <nav className="flex items-center gap-5 text-sm font-medium text-azul/70">
          <button type="button" onClick={onHome} className="hover:text-azul">
            Tests
          </button>
          <button type="button" onClick={onMethodology} className="hover:text-azul">
            Metodología
          </button>
        </nav>
      </div>
    </header>
  )
}
