import { Logo } from './Logo'

interface FooterProps {
  onMethodology: () => void
}

export function Footer({ onMethodology }: FooterProps) {
  return (
    <footer className="bg-marfil">
      <div className="mx-auto max-w-5xl px-4 pb-10 sm:px-6">
        <div className="border-t-[3px] border-azul pt-8 text-sm leading-6">
          <Logo className="text-xl" />
          <p className="mt-4 max-w-2xl text-azul/80">
            La Mayoría es un juego. La mayoría de cada carta sale de una encuesta publicada,
            citada con su fuente; lo que eligen quienes juegan no es una encuesta
            representativa.
          </p>
          <button
            type="button"
            onClick={onMethodology}
            className="mt-3 font-bold underline decoration-[3px] underline-offset-4"
          >
            Cómo funciona, fuentes y privacidad
          </button>
        </div>
      </div>
    </footer>
  )
}
