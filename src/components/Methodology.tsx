import { useState } from 'react'
import { TEST_ORDER, tests } from '../data/tests'
import { CORE_WEIGHT, VARIANT_SIZE } from '../engine/selection'
import type { TestId } from '../types'
import { allImages } from '../lib/images'
import { collecting } from '../lib/submit'
import { Eyebrow } from './Eyebrow'

interface MethodologyProps {
  onBack: () => void
  backLabel?: string
}

const SOURCES = [
  'Ostiguy, P. — Peronismo y antiperonismo: bases socioculturales de la identidad política en la Argentina (eje alto/bajo).',
  'Saiegh, S. (2015). Using joint scaling methods to study ideology and representation. Political Analysis.',
  'Observatorio Pulsar.UBA (2026). Creencias Sociales 2026.',
  'Morresi, S. y Ramos, H. (2023). La Libertad Avanza como derecha radical. Caderno CRH.',
  'Chapel Hill Expert Survey (CHES), Global Party Survey (Norris) y V-Party (V-Dem).',
  'Akkerman, Mudde y Zaslove (2014). How Populist Are the People? Comparative Political Studies.',
  'Louwerse y Rosema (2014). The design effects of voting advice applications. Acta Politica.',
  'Referencias de diseño: 8values (efectos multi-eje), 12axes (balance y catálogos), Wahl-O-Mat y Tu Voto (anclaje de perfiles).',
]

export function Methodology({ onBack, backLabel = 'Volver a los tests' }: MethodologyProps) {
  const [tab, setTab] = useState<TestId>('intl')
  const test = tests[tab]
  const axisIds = test.axes.map((a) => a.id)

  return (
    <main className="mx-auto max-w-5xl px-4 py-14 sm:px-6 sm:py-20">
      <Eyebrow>Metodología</Eyebrow>
      <h1 className="mt-6 text-4xl font-bold sm:text-5xl">Cómo funciona Brújula</h1>
      <p className="mt-6 max-w-2xl leading-7 text-azul/75">
        Todo el cálculo ocurre en tu navegador. Los ítems, sus efectos, los perfiles y sus fuentes
        están publicados abajo para que se puedan revisar.
      </p>

      <Block title="Qué afirmaciones te tocan">
        <p>
          Cada partida sortea sus afirmaciones de un banco más grande, así que no siempre salen
          las mismas, y las muestra en orden aleatorio. Las {VARIANT_SIZE.short} de la versión corta
          son el núcleo: salen de las afirmaciones centrales de cada tema y pesan el triple. La
          completa suma {VARIANT_SIZE.full - VARIANT_SIZE.short} afirmaciones de detalle y la a
          fondo, {VARIANT_SIZE.deep - VARIANT_SIZE.short}.
        </p>
        <p>
          Cada tema tiene afirmaciones en los dos sentidos. En la corta, los temas con tres
          afirmaciones quedan 2 a 1, alternando el sentido entre temas; en la completa y la a
          fondo, el detalle compensa esa diferencia y cada tema queda equilibrado.
        </p>
      </Block>

      <Block title="Escala y puntaje">
        <p>
          Cada afirmación se responde de "muy en desacuerdo" (−1) a "muy de acuerdo" (+1), con
          valores intermedios de ±0,5 y 0. "No sé" se excluye y no cuenta como neutral. Cada ítem
          tiene un efecto principal (±1) sobre un eje y, a veces, efectos secundarios más chicos
          sobre otros.
        </p>
        <Formula>{`puntaje_eje = 100 · Σ (peso · respuesta · efecto) / Σ peso · |efecto|   (peso ${CORE_WEIGHT} para el núcleo en su tema principal, 1 en el resto)`}</Formula>
        <p>
          Si respondiste menos de la mitad del peso de un eje, queda indeterminado y no entra en
          las comparaciones. Cada eje tiene la misma cantidad de afirmaciones hacia cada polo, así
          que responder lo mismo a todo lleva al centro; si lo detectamos, te avisamos.
        </p>
      </Block>

      <Block title="Cercanía con perfiles">
        <Formula>{'k = Σ vos·perfil / Σ vos²  (entre 1 y 2)      d = √( Σ (k·vos − perfil)² / temas )      cercanía = 100 · (1 − d / 100)'}</Formula>
        <p>
          Mucha gente responde "de acuerdo" donde una figura respondería "muy de acuerdo": sus
          puntajes quedan más cerca del centro aunque piense en la misma dirección. Por eso, antes
          de comparar, tus puntajes se pueden estirar hasta el doble (el factor k que mejor te
          acerca a cada perfil): cuenta sobre todo hacia dónde van tus posiciones. Una diferencia
          media de 100 puntos por tema es 0% de cercanía; 80% o más es muy cerca y menos de 50%,
          lejos.
        </p>
        <p>
          Se comparan los ejes donde tenés puntaje. Si el perfil no tiene dato en alguno, ese eje
          cuenta como tu distancia al centro, con un mínimo de 40 puntos, para que un perfil con
          pocos ejes no se parezca a cualquiera. Si el perfil tiene dato en menos del 60% de los ejes, la
          comparación se marca como parcial. Los catálogos (ideologías o tradiciones,
          figuras históricas, figuras actuales y partidos) se rankean por separado y nunca se
          mezclan. En el test argentino, la identidad peronista o antiperonista se muestra aparte
          y también cuenta en la cercanía: es lo que más distingue, por ejemplo, a un votante
          kirchnerista de uno de la izquierda trotskista.
        </p>
        <p>
          En algunos temas la gente no se expresa como actúan sus referentes: quien apoya a un
          gobierno que gobierna por decreto o confronta con la Justicia rara vez está de acuerdo
          con frases que lo digan explícitamente. En Instituciones y Estilo (test argentino) y en
          Libertades, Democracia y Estilo (internacional), el valor de cada perfil hacia ese polo
          se compara a la mitad, que es lo que sus votantes efectivamente expresan.
        </p>
      </Block>

      <Block title="Perfiles y límites">
        <p>
          Las coordenadas de figuras, partidos e ideologías son semillas editoriales, no
          mediciones: se basan en decisiones de gobierno, leyes, programas y declaraciones, y en
          figuras históricas son de época (null cuando un eje no aplica). Cada perfil indica su
          nivel de confianza. El paso siguiente previsto es calibrarlos con varios codificadores
          que respondan el cuestionario "como" cada figura.
        </p>
        <p>
          Algunas figuras del mismo espacio tienen perfiles casi idénticos (por ejemplo, Cristina y
          Máximo Kirchner): el test no puede distinguirlas y
          aparecen juntas en el ranking. Cada perfil se valida simulando respuestas "como" esa
          figura con ruido: tiene que salir primero en al menos el 80% de los casos, o entre los
          primeros (hasta el tercero) si tiene perfiles gemelos.
        </p>
        <p>
          Las figuras de dictaduras y totalitarismos se incluyen como cualquier otro perfil, y sus
          descripciones mencionan los crímenes documentados. Parecerse en algunos ejes no implica
          compartir sus métodos. Quedan excluidos Adolf Hitler, el nazismo, Augusto Pinochet,
          Alfredo Stroessner, Slobodan Milošević y la cúpula de la última dictadura argentina.
        </p>
        <p>
          El test todavía no pasó una validación psicométrica (piloto, fiabilidad, análisis
          factorial). Es una herramienta educativa: la cercanía no indica filiación, recomendación
          de voto ni evaluación moral.
        </p>
      </Block>

      <Block title="Privacidad">
        {collecting ? (
          <p>
            Al terminar te pedimos, de forma opcional, edad, género y nivel educativo. Esos datos
            y tus respuestas se guardan de forma anónima, sin nombre, mail ni ningún otro dato que
            te identifique, solo con fines estadísticos. Si tenés menos de 16 años no se guarda
            nada.
          </p>
        ) : (
          <p>No se guarda nada en ningún servidor.</p>
        )}
        <p>
          El progreso queda en tu navegador para que puedas retomar, y el enlace para compartir
          contiene solo tus puntajes por tema.
        </p>
      </Block>

      <div className="mt-16 flex flex-wrap items-end justify-between gap-4 border-t border-azul/14 pt-10">
        <div>
          <Eyebrow>Datos publicados</Eyebrow>
          <h2 className="mt-4 text-3xl font-bold">
            {test.name} <span className="text-lg font-normal text-azul/60">· {test.version}</span>
          </h2>
        </div>
        <div role="tablist" className="inline-flex rounded-md border border-azul/20 p-1">
          {TEST_ORDER.map((id) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={tab === id}
              onClick={() => setTab(id)}
              className={`rounded px-4 py-2 text-sm font-semibold ${
                tab === id ? 'bg-azul text-marfil' : 'text-azul/70 hover:text-azul'
              }`}
            >
              {tests[id].name}
            </button>
          ))}
        </div>
      </div>

      <details className="mt-8 rounded-xl border border-azul/14 p-5">
        <summary className="cursor-pointer font-semibold">
          Banco de afirmaciones ({test.questions.length}; {test.questions.filter((q) => q.core).length} elegibles para el núcleo)
        </summary>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[40rem] text-left text-sm">
            <thead className="text-xs tracking-[0.08em] text-azul/60 uppercase">
              <tr>
                <th className="py-2 pr-3 font-medium">ID</th>
                <th className="py-2 pr-3 font-medium">Afirmación</th>
                <th className="py-2 pr-3 font-medium">Efectos</th>
                <th className="py-2 font-medium">Rol</th>
              </tr>
            </thead>
            <tbody>
              {test.questions.map((q) => (
                <tr key={q.id} className="border-t border-azul/14 align-top">
                  <td className="py-2 pr-3 whitespace-nowrap text-azul/60 tabular-nums">{q.id}</td>
                  <td className="py-2 pr-3">
                    {q.text}
                    {q.volatile && <span className="ml-1 text-xs text-naranja">(coyuntural)</span>}
                  </td>
                  <td className="py-2 pr-3 whitespace-nowrap tabular-nums">
                    {Object.entries(q.effects)
                      .map(([a, e]) => `${a} ${e > 0 ? '+' : ''}${e}`)
                      .join(', ')}
                  </td>
                  <td className="py-2 text-azul/60">{q.core ? 'núcleo' : 'detalle'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>

      <details className="mt-4 rounded-xl border border-azul/14 p-5">
        <summary className="cursor-pointer font-semibold">Perfiles ({test.profiles.length})</summary>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[60rem] text-left text-xs">
            <thead className="tracking-[0.08em] text-azul/60 uppercase">
              <tr>
                <th className="py-2 pr-3 font-medium">Perfil</th>
                {axisIds.map((id) => (
                  <th key={id} className="py-2 pr-2 text-right font-medium">{id}</th>
                ))}
                <th className="py-2 pl-3 font-medium">Confianza</th>
                <th className="py-2 pl-3 font-medium">Fundamento</th>
              </tr>
            </thead>
            <tbody>
              {test.catalogs.map((catalog) => (
                <CatalogRows key={catalog.id} catalogId={catalog.id} name={catalog.name} testId={tab} />
              ))}
            </tbody>
          </table>
        </div>
      </details>

      <ImageCredits testId={tab} />

      <Block title="Fuentes y antecedentes">
        <ul className="list-disc space-y-1 pl-5">
          {SOURCES.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
      </Block>

      <button
        type="button"
        onClick={onBack}
        className="mt-12 rounded-md bg-azul px-8 py-3.5 text-sm font-semibold text-marfil hover:bg-noche"
      >
        {backLabel}
      </button>
    </main>
  )
}

function CatalogRows({ catalogId, name, testId }: { catalogId: string; name: string; testId: TestId }) {
  const test = tests[testId]
  const profiles = test.profiles.filter((p) => p.catalog === catalogId)
  return (
    <>
      <tr>
        <td colSpan={test.axes.length + 3} className="pt-5 pb-1 text-sm font-bold">
          {name}
        </td>
      </tr>
      {profiles.map((p) => (
        <tr key={p.id} className="border-t border-azul/14 align-top">
          <td className="py-1.5 pr-3 font-medium whitespace-nowrap">
            {p.name}
          </td>
          {test.axes.map((a) => (
            <td key={a.id} className="py-1.5 pr-2 text-right tabular-nums text-azul/75">
              {p.coords[a.id] ?? '—'}
            </td>
          ))}
          <td className="py-1.5 pl-3">{p.confidence}</td>
          <td className="py-1.5 pl-3 text-azul/60">{p.basis}</td>
        </tr>
      ))}
    </>
  )
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-12 max-w-3xl">
      <h2 className="text-2xl font-bold">{title}</h2>
      <div className="mt-4 space-y-4 leading-7 text-azul/80">{children}</div>
    </section>
  )
}

function Formula({ children }: { children: React.ReactNode }) {
  return (
    <pre className="overflow-x-auto rounded-lg bg-linea/70 px-4 py-3 font-mono text-sm text-azul">
      {children}
    </pre>
  )
}

function ImageCredits({ testId }: { testId: TestId }) {
  const test = tests[testId]
  const credits = allImages(testId)
  if (credits.length === 0) return null
  const nameOf = (id: string) => test.profiles.find((p) => p.id === id)?.name ?? id
  return (
    <details className="mt-4 rounded-xl border border-azul/14 p-5">
      <summary className="cursor-pointer font-semibold">Créditos de imágenes ({credits.length})</summary>
      <p className="mt-3 text-sm text-azul/70">
        Fotos, logos y símbolos de Wikimedia Commons, con licencias libres. Se muestran reducidos.
      </p>
      <ul className="mt-4 space-y-1.5 text-xs leading-5 text-azul/75">
        {credits
          .sort(([a], [b]) => nameOf(a).localeCompare(nameOf(b), 'es'))
          .map(([id, c]) => (
            <li key={id}>
              <span className="font-semibold text-azul">{nameOf(id)}</span>:{' '}
              <a href={c.sourceUrl} target="_blank" rel="noreferrer" className="underline">
                {c.author || 'Autor desconocido'}
              </a>{' '}
              ·{' '}
              {c.licenseUrl ? (
                <a href={c.licenseUrl} target="_blank" rel="noreferrer" className="underline">
                  {c.license}
                </a>
              ) : (
                c.license
              )}
            </li>
          ))}
      </ul>
    </details>
  )
}
