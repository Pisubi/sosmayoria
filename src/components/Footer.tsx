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
    <footer className="bg-noche text-marfil">
      <div className="mx-auto grid max-w-5xl gap-10 px-4 py-12 text-sm leading-6 sm:grid-cols-[1.4fr_1fr] sm:px-6">
        <div>
          <a href="https://pisubi.com" target="_blank" rel="noopener" className="inline-block">
            <img src="/pisubi.webp" alt="Pisubí" width={480} height={137} className="h-9 w-auto" />
          </a>
          <p className="mt-4 max-w-sm text-marfil/60">
            La Mayoría es un proyecto de Pisubí, consultora de análisis de datos, opinión pública y
            estrategia. Buenos Aires, Argentina.
          </p>
          <p className="mt-4 max-w-md text-marfil/45">
            Es un juego: la mayoría de cada carta sale de una encuesta publicada, citada con su
            fuente; lo que eligen quienes juegan no es una encuesta representativa.
          </p>
          <button
            type="button"
            onClick={onMethodology}
            className="mt-3 font-semibold text-marfil underline decoration-naranja decoration-2 underline-offset-4"
          >
            Cómo funciona, fuentes y privacidad
          </button>
        </div>
        <div>
          <p className="text-xs font-semibold tracking-[0.18em] text-naranja uppercase">Contacto</p>
          <ul className="mt-4 grid gap-3">
            {CONTACTO.map((c) => (
              <li key={c.href}>
                <a
                  href={c.href}
                  target={c.href.startsWith('http') ? '_blank' : undefined}
                  rel="noopener"
                  className="text-marfil/70 hover:text-marfil"
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
