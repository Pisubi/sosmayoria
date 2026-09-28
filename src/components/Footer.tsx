interface FooterProps {
  onMethodology: () => void
}

export function Footer({ onMethodology }: FooterProps) {
  return (
    <footer className="border-t border-azul/14 bg-marfil">
      <div className="mx-auto max-w-5xl px-4 py-10 text-sm leading-6 text-azul/60 sm:px-6">
        <p className="max-w-2xl">
          Brújula es una herramienta educativa de lectura comparativa, no un diagnóstico
          científico. La cercanía con un perfil no indica filiación, recomendación de voto ni
          evaluación moral. Las posiciones de los perfiles son una codificación documentada, no
          una medición, y el test todavía no está validado psicométricamente.
        </p>
        <button
          type="button"
          onClick={onMethodology}
          className="mt-3 font-semibold text-azul underline decoration-naranja decoration-2 underline-offset-4"
        >
          Ver metodología, ítems y perfiles
        </button>
      </div>
    </footer>
  )
}
