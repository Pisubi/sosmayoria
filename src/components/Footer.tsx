import { Logo } from './Logo'

interface FooterProps {
  onMethodology: () => void
}

const CONTACTO = [
  { texto: 'pisubi.com', href: 'https://pisubi.com' },
  { texto: 'contacto@pisubi.com', href: 'mailto:contacto@pisubi.com' },
  { texto: 'Instagram @pisubi.consultora', href: 'https://www.instagram.com/pisubi.consultora/' },
]

export function Footer({ onMethodology }: FooterProps) {
  return (
    <footer className="bg-azul text-papel">
      <div className="mx-auto grid max-w-5xl gap-10 px-4 py-12 text-sm leading-6 sm:grid-cols-[1.4fr_1fr] sm:px-6">
        <div>
          <a href="https://pisubi.com" target="_blank" rel="noopener" className="inline-block" aria-label="Pisubí">
            <Logo claro className="text-4xl" />
          </a>
          <p className="mt-4 max-w-sm text-papel/80">
            La Mayoría es un proyecto de Pisubí, consultora de análisis de datos, opinión pública y
            estrategia. Buenos Aires, Argentina.
          </p>
          <p className="mt-4 max-w-md text-papel/70">
            Es un juego: la mayoría de cada carta sale de una encuesta publicada, citada con su
            fuente; lo que eligen quienes juegan no es una encuesta representativa.
          </p>
          <button
            type="button"
            onClick={onMethodology}
            className="mt-3 font-bold underline decoration-naranja decoration-[3px] underline-offset-4"
          >
            Cómo funciona, fuentes y privacidad
          </button>
        </div>
        <div>
          <p className="etiqueta !bg-naranja !text-azul">Contacto</p>
          <ul className="mt-4 grid gap-3">
            {CONTACTO.map((c) => (
              <li key={c.href}>
                <a
                  href={c.href}
                  target={c.href.startsWith('http') ? '_blank' : undefined}
                  rel="noopener"
                  className="font-bold text-papel hover:underline hover:decoration-naranja hover:decoration-[3px] hover:underline-offset-4"
                >
                  {c.texto}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  )
}
