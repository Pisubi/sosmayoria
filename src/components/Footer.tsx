import { Logo } from './Logo'

interface FooterProps {
  onMethodology: () => void
}

/** Íconos Pisubí: contorno en papel y trazo en naranja, sobre la tinta del pie. */
const ICONO = {
  web: (
    <>
      <circle cx="18" cy="18" r="14" className="stroke-papel" strokeWidth="3" />
      <ellipse cx="18" cy="18" rx="5" ry="12" className="stroke-naranja" strokeWidth="2.2" />
      <path d="M5 18h26" className="stroke-naranja" strokeWidth="2.2" />
    </>
  ),
  mail: (
    <>
      <rect x="3.5" y="7.5" width="29" height="21" rx="4" className="stroke-papel" strokeWidth="3" />
      <path d="M9 14l9 7 9-7" className="stroke-naranja" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  instagram: (
    <>
      <rect x="3.5" y="3.5" width="29" height="29" rx="7" className="stroke-papel" strokeWidth="3" />
      <circle cx="17.5" cy="19" r="7" className="stroke-naranja" strokeWidth="3.5" />
      <circle cx="26" cy="9.5" r="2" className="fill-naranja" />
    </>
  ),
}

const CONTACTO = [
  { texto: 'pisubi.com', href: 'https://pisubi.com', icono: ICONO.web },
  { texto: 'contacto@pisubi.com', href: 'mailto:contacto@pisubi.com', icono: ICONO.mail },
  { texto: 'Instagram @pisubi.consultora', href: 'https://www.instagram.com/pisubi.consultora/', icono: ICONO.instagram },
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
                  className="group inline-flex items-center gap-3 font-bold text-papel"
                >
                  <svg viewBox="0 0 36 36" fill="none" aria-hidden className="size-9 shrink-0 transition-transform group-hover:-translate-y-0.5">
                    {c.icono}
                  </svg>
                  <span className="group-hover:underline group-hover:decoration-naranja group-hover:decoration-[3px] group-hover:underline-offset-4">
                    {c.texto}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  )
}
