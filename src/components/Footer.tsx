interface FooterProps {
  onMethodology: () => void
}

export function Footer({ onMethodology }: FooterProps) {
  return (
    <footer className="border-t border-azul/14 bg-marfil">
      <div className="mx-auto max-w-5xl px-4 py-10 text-sm leading-6 text-azul/60 sm:px-6">
        <p className="max-w-2xl">
          La Mayoría es un juego. Los datos reales de cada carta vienen de encuestas publicadas,
          citadas con su fuente; lo que eligen quienes juegan se muestra aparte y no es una
          encuesta representativa.
        </p>
        <button
          type="button"
          onClick={onMethodology}
          className="mt-3 font-semibold text-azul underline decoration-naranja decoration-2 underline-offset-4"
        >
          Cómo funciona, fuentes y privacidad
        </button>
      </div>
    </footer>
  )
}
