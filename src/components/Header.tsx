import { Logo } from './Logo'

interface HeaderProps {
  onHome: () => void
  onMethodology: () => void
}

export function Header({ onHome, onMethodology }: HeaderProps) {
  return (
    <header className="bg-marfil">
      <div className="mx-auto max-w-5xl px-4 pt-4 sm:px-6">
        <div className="flex items-center justify-between gap-4 border-b-[3px] border-azul pb-3">
          <button type="button" onClick={onHome} className="flex items-center gap-3 text-left">
            <Logo className="text-[2rem]" />
            <span className="etiqueta hidden sm:inline-block">La Mayoría</span>
          </button>
          <nav className="flex items-center gap-5 text-sm font-bold">
            <button type="button" onClick={onHome} className="hover:underline hover:decoration-[3px] hover:underline-offset-4">
              Jugar
            </button>
            <button type="button" onClick={onMethodology} className="hover:underline hover:decoration-[3px] hover:underline-offset-4">
              Cómo funciona
            </button>
          </nav>
        </div>
      </div>
    </header>
  )
}
