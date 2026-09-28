import type { Question } from '../types'

// Por eje: [afirmación, dirección]. +1 = acuerdo empuja hacia poleB; -1 = hacia poleA.
// El orden alterna +1/-1 para que el modo rápido (dos primeras) tome una de cada polo.
const bank: Record<string, [string, 1 | -1][]> = {
  economia: [
    ['Los precios deberían fijarse libremente por la oferta y la demanda, sin controles del Estado.', 1],
    ['El Estado debe tener empresas propias en sectores estratégicos como la energía, el agua o el transporte.', -1],
    ['Las empresas públicas que dan pérdida deberían privatizarse.', 1],
    ['Sin regulación estatal, los mercados tienden a concentrarse y perjudicar a los consumidores.', -1],
  ],
  fiscal: [
    ['Bajar impuestos es más importante que ampliar los programas sociales.', 1],
    ['Quienes más ganan deberían pagar una proporción claramente mayor de impuestos.', -1],
    ['El equilibrio fiscal debe mantenerse aunque implique recortar el gasto social.', 1],
    ['La salud y la educación deben ser públicas, gratuitas y universales, aunque eso exija más impuestos.', -1],
  ],
  comercio: [
    ['Bajar aranceles a las importaciones beneficia a los consumidores y a la economía.', 1],
    ['Hay que proteger a la industria nacional de los productos importados, aunque sean más baratos.', -1],
    ['Los tratados de libre comercio, como el acuerdo Mercosur–Unión Europea, son positivos para el país.', 1],
    ['Los aranceles son una herramienta legítima para defender el empleo local.', -1],
  ],
  trabajo: [
    ['Las leyes laborales deberían flexibilizarse para facilitar la contratación.', 1],
    ['Los sindicatos son fundamentales para defender a los trabajadores.', -1],
    ['Las indemnizaciones por despido altas desalientan la creación de empleo formal.', 1],
    ['El Estado debe fijar un salario mínimo que alcance para vivir dignamente, aunque encarezca la contratación.', -1],
  ],
  seguridad: [
    ['Hay que bajar la edad de imputabilidad penal.', 1],
    ['Garantizar el debido proceso es más importante que endurecer las penas.', -1],
    ['Las fuerzas de seguridad deberían tener más libertad de acción para enfrentar el delito.', 1],
    ['La inseguridad se combate sobre todo con políticas sociales y educación, no con más cárceles.', -1],
  ],
  valores: [
    ['El aborto debería estar prohibido, salvo en casos excepcionales.', 1],
    ['Las parejas del mismo sexo deben tener los mismos derechos que las demás, incluida la adopción.', -1],
    ['La familia tradicional es la base de la sociedad y el Estado debería protegerla especialmente.', 1],
    ['La educación sexual integral con perspectiva de género debe ser obligatoria en las escuelas.', -1],
  ],
  religion: [
    ['Los valores religiosos deberían orientar las leyes y las políticas públicas.', 1],
    ['El Estado no debería financiar a ninguna religión.', -1],
    ['Un país con más fe religiosa es un país con mejores valores.', 1],
    ['Los líderes religiosos no deberían intervenir en los debates políticos.', -1],
  ],
  migracion: [
    ['Habría que endurecer los requisitos para que los extranjeros se radiquen en el país.', 1],
    ['La inmigración enriquece cultural y económicamente al país.', -1],
    ['Los extranjeros no residentes deberían pagar por usar la salud y la educación públicas.', 1],
    ['Los inmigrantes en situación irregular deberían poder regularizarse en lugar de ser deportados.', -1],
  ],
  soberania: [
    ['Los organismos internacionales, como la ONU o la OMS, tienen demasiada influencia sobre las decisiones de cada país.', 1],
    ['Los grandes problemas, como el cambio climático o las pandemias, solo se resuelven con acuerdos entre países.', -1],
    ['Cada país debería priorizar sus propios intereses aunque eso implique salir de acuerdos internacionales.', 1],
    ['Los fallos de los tribunales internacionales de derechos humanos deberían ser obligatorios para el país.', -1],
  ],
  ambiente: [
    ['El crecimiento económico debe priorizarse aunque tenga costos ambientales.', 1],
    ['El cambio climático es una emergencia que exige cambios profundos en cómo producimos y consumimos.', -1],
    ['La explotación de petróleo, gas y minerales debe expandirse todo lo posible.', 1],
    ['Deberían prohibirse actividades que dañen glaciares o bosques nativos, aunque generen empleo.', -1],
  ],
  poder: [
    ['Un país necesita un líder fuerte que pueda decidir sin demoras del Congreso o la Justicia.', 1],
    ['La independencia de la Justicia y de la prensa importa más que la eficacia de un gobierno.', -1],
    ['En situaciones de crisis se justifica gobernar por decreto.', 1],
    ['Un presidente no debería poder ser reelegido indefinidamente.', -1],
  ],
}

export const questions: Question[] = Object.entries(bank).flatMap(([axisId, items]) =>
  items.map(([text, direction], i) => ({
    id: `${axisId}-${i + 1}`,
    axisId,
    text,
    direction,
  })),
)
