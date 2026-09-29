import { LaMayoria } from './Marca'

interface HeaderProps {
  onHome: () => void
  onMethodology: () => void
}

export function Header({ onHome, onMethodology }: HeaderProps) {
  return (
    <header className="border-b border-azul/14 bg-marfil">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
        <button type="button" onClick={onHome} className="text-left" aria-label="La Mayoría, inicio">
          <LaMayoria className="text-xl text-azul" />
        </button>
        <nav className="flex items-center gap-5 text-sm font-medium text-azul/70">
          <button type="button" onClick={onHome} className="hover:text-azul">
            Jugar
          </button>
          <button type="button" onClick={onMethodology} className="hover:text-azul">
            Cómo funciona
          </button>
        </nav>
      </div>
    </header>
  )
}
