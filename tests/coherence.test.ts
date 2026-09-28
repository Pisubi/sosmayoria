import { describe, expect, it } from 'vitest'
import { tests } from '../src/data/tests'
import { rankProfiles } from '../src/engine/matching'
import { scoreAxes } from '../src/engine/scoring'
import { drawQuestions } from '../src/engine/selection'
import type { AxisScore, Profile, Response, TestDefinition, TestId } from '../src/types'
import { normal, rng, simulate } from './helpers'

/** [eje, más hacia el polo B, menos hacia el polo B]: órdenes que no están en discusión. */
const ORDER: Record<TestId, [string, string, string][]> = {
  ar: [
    ['ECO', 'milei', 'macri'], ['ECO', 'macri', 'massa'], ['ECO', 'massa', 'kicillof'],
    ['ECO', 'kicillof', 'bregman'], ['ECO', 'espert', 'larreta'], ['ECO', 'bullrich', 'cfk'],
    ['ECO', 'menem', 'alfonsin'], ['ECO', 'alsogaray', 'peron'], ['ECO', 'domingo_cavallo', 'antonio_cafiero'],
    ['ECO', 'lla', 'kirchnerismo'], ['ECO', 'pro', 'peronismo_ortodoxo'], ['ECO', 'liberalismo_alberdiano', 'fitu'],
    ['SOC', 'laje', 'bregman'], ['SOC', 'villarruel', 'cfk'], ['SOC', 'nacionalismo_catolico', 'socialismo_ps'],
    ['SOC', 'milei', 'lousteau'],
    ['SEG', 'bullrich', 'cfk'], ['SEG', 'sergio_berni', 'kicillof'], ['SEG', 'villarruel', 'estela_de_carlotto'],
    ['SEG', 'bullrich', 'bregman'], ['SEG', 'pro', 'kirchnerismo'],
    ['MEM', 'villarruel', 'estela_de_carlotto'], ['MEM', 'menem', 'nestor'], ['MEM', 'milei', 'cfk'],
    ['MEM', 'villarruel', 'bullrich'], ['MEM', 'lla', 'kirchnerismo'],
    ['INS', 'cfk', 'carrio'], ['INS', 'milei', 'carrio'], ['INS', 'menem', 'alfonsin'], ['INS', 'peron', 'illia'],
    ['INS', 'kirchnerismo', 'coalicion_civica'],
    ['POP', 'milei', 'larreta'], ['POP', 'cfk', 'lousteau'], ['POP', 'peron', 'alfonsin'], ['POP', 'kirchnerismo', 'ucr'],
    ['EXT', 'milei', 'cfk'], ['EXT', 'macri', 'kicillof'], ['EXT', 'menem', 'peron'], ['EXT', 'pro', 'kirchnerismo'],
    ['IDN', 'macri', 'cfk'], ['IDN', 'alfonsin', 'peron'], ['IDN', 'carrio', 'massa'],
  ],
  intl: [
    ['ECO', 'thatcher', 'merkel'], ['ECO', 'reagan', 'fdr'], ['ECO', 'milei_intl', 'lula'], ['ECO', 'trump', 'sanders'],
    ['ECO', 'macron', 'melenchon'], ['ECO', 'merkel', 'stalin'], ['ECO', 'gop_p', 'dem_p'], ['ECO', 'pp_p', 'psoe_p'],
    ['ECO', 'cdu_p', 'spd'], ['ECO', 'neoliberalismo', 'socialdemocracia'], ['ECO', 'socialdemocracia', 'marxismo_leninismo'],
    ['AUT', 'putin', 'zelenski'], ['AUT', 'xi', 'macron'], ['AUT', 'bolsonaro', 'lula'], ['AUT', 'bukele', 'boric'],
    ['AUT', 'franco', 'churchill'], ['AUT', 'stalin', 'gorbachov'], ['AUT', 'fascismo', 'liberalismo_clasico'],
    ['AUT', 'orban', 'merz'], ['AUT', 'kim_jong_un', 'sanchez'], ['AUT', 'pcch', 'grunen_p'],
    ['COM', 'milei_intl', 'trump'], ['COM', 'merkel', 'trump'], ['COM', 'neoliberalismo', 'nacionalismo_desarrollista'],
    ['COM', 'macron', 'le_pen'],
    ['DEM', 'putin', 'macron'], ['DEM', 'xi', 'merkel'], ['DEM', 'stalin', 'churchill'], ['DEM', 'fascismo', 'liberalismo_social'],
    ['DEM', 'kim_jong_un', 'boric'], ['DEM', 'franco', 'felipe_gonzalez'],
    ['REL', 'jomeini', 'obama'], ['REL', 'bolsonaro', 'lula'], ['REL', 'islamismo_politico', 'marxismo_leninismo'],
    ['REL', 'vox_p', 'psoe_p'], ['REL', 'peron', 'alfonsin'], ['REL', 'peronismo_ideologia', 'socialdemocracia'],
    ['SOC', 'bolsonaro', 'lula'], ['SOC', 'meloni', 'sanchez'], ['SOC', 'vox_p', 'podemos_es'], ['SOC', 'kast', 'boric'],
    ['SOC', 'putin', 'macron'], ['SOC', 'jomeini', 'obama'], ['SOC', 'islamismo_politico', 'ecologismo_verde'],
    ['SOC', 'tradicionalismo_reaccionario', 'liberalismo_social'],
    ['NAC', 'le_pen', 'macron'], ['NAC', 'trump', 'biden'], ['NAC', 'farage', 'sanchez'], ['NAC', 'rn_p', 'renaissance_p'],
    ['NAC', 'afd', 'grunen_p'], ['NAC', 'nacionalconservadurismo', 'liberalismo_social'],
    ['MIL', 'putin', 'sanders'], ['MIL', 'george_w_bush', 'obama'], ['MIL', 'netanyahu', 'sanchez'],
    ['MIL', 'neoconservadurismo', 'ecologismo_verde'],
    ['MIG', 'trump', 'biden'], ['MIG', 'afd', 'grunen_p'], ['MIG', 'meloni', 'sanchez'], ['MIG', 'vox_p', 'psoe_p'],
    ['MIG', 'le_pen', 'melenchon'], ['MIG', 'derecha_radical_populista', 'liberalismo_social'],
    ['ECOL', 'trump', 'biden'], ['ECOL', 'bolsonaro', 'lula'], ['ECOL', 'cdu_p', 'grunen_p'],
    ['ECOL', 'neoliberalismo', 'ecologismo_verde'], ['ECOL', 'milei_intl', 'petro'],
    ['POP', 'trump', 'biden'], ['POP', 'chavez', 'merkel'], ['POP', 'milei_intl', 'macron'], ['POP', 'bukele', 'macron'],
    ['POP', 'populismo_izquierda', 'socialdemocracia'], ['POP', 'derecha_radical_populista', 'conservadurismo_liberal'],
  ],
}

/**
 * Figura y su espacio: tomando a la figura como respuesta, su espacio sale entre los 3 más cercanos.
 * Quedan afuera pares con diferencias reales: Trotski en el poder frente al trotskismo actual,
 * Delcy Rodríguez en la transición de 2026 frente al PSUV, Thatcher frente al neoliberalismo
 * como doctrina solo económica.
 */
const OWN_SPACE: Record<TestId, [string, string][]> = {
  ar: [
    ['milei', 'lla'], ['macri', 'pro'], ['cfk', 'kirchnerismo'], ['bregman', 'fitu'], ['carrio', 'coalicion_civica'],
    ['massa', 'frente_renovador'], ['alfonsin', 'alfonsinismo'], ['menem', 'menemismo'], ['peron', 'peronismo_ortodoxo'],
    ['frondizi', 'desarrollismo'], ['hugo_moyano', 'cgt'], ['maximo_kirchner', 'kirchnerismo'], ['lousteau', 'ucr'],
    ['pullaro', 'provincias_unidas'], ['chacho_alvarez', 'frepaso'],
  ],
  intl: [
    ['trump', 'gop_p'], ['biden', 'dem_p'], ['lula', 'pt_p'], ['bolsonaro', 'pl_p'], ['sanchez', 'psoe_p'],
    ['meloni', 'fratelli_ditalia'], ['le_pen', 'rn_p'], ['macron', 'renaissance_p'], ['melenchon', 'lfi'], ['merz', 'cdu_p'],
    ['orban', 'fidesz'], ['modi', 'bjp'], ['xi', 'pcch'], ['putin', 'rusia_unida'], ['netanyahu', 'likud'],
    ['sheinbaum', 'morena_p'], ['milei_intl', 'lla_p'], ['cfk_intl', 'uxp_p'], ['macri_intl', 'pro_p'], ['farage', 'reform_uk'],
    ['petro', 'pacto_historico'], ['alvaro_uribe', 'centro_democratico'], ['evo_morales', 'mas_bo'],
    ['keiko_fujimori', 'fuerza_popular'], ['orsi', 'frente_amplio_uy'], ['boric', 'fa_cl_p'],     ['santiago_pena', 'partido_colorado_py'], ['chavez', 'psuv'],
    ['stalin', 'marxismo_leninismo'], ['mao', 'maoismo'], ['leon_trotski', 'marxismo_leninismo'], ['mussolini', 'fascismo'],
    ['chavez', 'bolivarianismo'], ['peron', 'peronismo_ideologia'], ['tony_blair', 'tercera_via'],
    ['jomeini', 'islamismo_politico'], ['sanders', 'socialismo_democratico'], ['thatcher', 'conservadurismo_liberal'],
  ],
}

/** La misma figura en los dos tests: Economía, Valores y Estilo miden lo mismo. */
const SAME_PERSON: [string, string][] = [
  ['milei', 'milei_intl'], ['cfk', 'cfk_intl'], ['macri', 'macri_intl'], ['peron', 'peron'], ['alfonsin', 'alfonsin'],
  ['menem', 'menem'],
]
const SHARED_AXES = ['ECO', 'SOC', 'POP']

const byId = (test: TestDefinition, id: string): Profile => {
  const p = test.profiles.find((x) => x.id === id)
  if (!p) throw new Error(`no existe ${test.id}:${id}`)
  return p
}
const asScores = (test: TestDefinition, p: Profile): AxisScore[] =>
  test.axes.map((a) => ({ axisId: a.id, score: p.coords[a.id], coverage: 1 }))

describe.each(Object.values(tests))('coherencia $name', (test) => {
  it('órdenes indiscutibles entre perfiles en cada tema', () => {
    const wrong = ORDER[test.id].flatMap(([axis, hi, lo]) => {
      const a = byId(test, hi).coords[axis]
      const b = byId(test, lo).coords[axis]
      return a == null || b == null || a > b ? [] : [`${axis}: ${hi} (${a}) debería superar a ${lo} (${b})`]
    })
    expect(wrong).toEqual([])
  })

  it('cada figura tiene a su partido, tradición o ideología entre los 3 más cercanos', () => {
    const wrong = OWN_SPACE[test.id].flatMap(([fig, space]) => {
      const f = byId(test, fig)
      const s = byId(test, space)
      const top = rankProfiles(asScores(test, f), test.axes, test.profiles.filter((p) => p.catalog === s.catalog && p.id !== f.id))
        .slice(0, 3)
        .map((m) => m.profile.id)
      return top.includes(space) ? [] : [`${fig} → ${top.join(', ')} (falta ${space})`]
    })
    expect(wrong).toEqual([])
  })

  it('con personas coherentes simuladas, ningún perfil sale primero para más del 15%', () => {
    const next = rng(9)
    const L: Response[] = [-1, -0.5, 0, 0.5, 1]
    const wins = new Map<string, number>()
    const N = 1500
    for (let i = 0; i < N; i++) {
      const base = test.profiles[Math.floor(next() * test.profiles.length)]
      const pos = Object.fromEntries(
        test.axes.map((a) => [a.id, Math.max(-100, Math.min(100, (base.coords[a.id] ?? 0) + normal(next) * 35))]),
      )
      const qs = drawQuestions(test, 'full', i + 1)
      const answers = Object.fromEntries(
        qs.map((q) => {
          const x = (Math.sign(q.effects[q.primaryAxis]) * pos[q.primaryAxis]) / 100 + normal(next) * 0.35
          return [q.id, L.reduce((b, l) => (Math.abs(l - x) < Math.abs(b - x) ? l : b), 0 as number) as Response]
        }),
      )
      const scores = scoreAxes(test.axes, qs, answers)
      for (const c of test.catalogs) {
        const top = rankProfiles(scores, test.axes, test.profiles.filter((p) => p.catalog === c.id))[0]
        wins.set(top.profile.id, (wins.get(top.profile.id) ?? 0) + 1)
      }
    }
    const magnets = [...wins].filter(([, n]) => n / N > 0.15).map(([id, n]) => `${id} ${Math.round((100 * n) / N)}%`)
    expect(magnets).toEqual([])
  })

  it('si una persona juega dos veces la completa, lo primero de una sale entre los 3 primeros de la otra en el 80%', () => {
    const next = rng(33)
    const L: Response[] = [-1, -0.5, 0, 0.5, 1]
    let hits = 0
    let n = 0
    for (let i = 0; i < 300; i++) {
      const base = test.profiles[Math.floor(next() * test.profiles.length)]
      const pos = Object.fromEntries(
        test.axes.map((a) => [a.id, Math.max(-100, Math.min(100, (base.coords[a.id] ?? 0) + normal(next) * 35))]),
      )
      const play = (seed: number) => {
        const qs = drawQuestions(test, 'full', seed)
        const answers = Object.fromEntries(
          qs.map((q) => {
            const x = (Math.sign(q.effects[q.primaryAxis]) * pos[q.primaryAxis]) / 100 + normal(next) * 0.35
            return [q.id, L.reduce((b, l) => (Math.abs(l - x) < Math.abs(b - x) ? l : b), 0 as number) as Response]
          }),
        )
        return scoreAxes(test.axes, qs, answers)
      }
      const first = play(2 * i + 1)
      const second = play(2 * i + 2)
      for (const c of test.catalogs) {
        const pool = test.profiles.filter((p) => p.catalog === c.id)
        const top = rankProfiles(first, test.axes, pool)[0].profile.id
        n++
        if (rankProfiles(second, test.axes, pool).slice(0, 3).some((m) => m.profile.id === top)) hits++
      }
    }
    expect(hits / n).toBeGreaterThanOrEqual(0.8)
  })

  it('personas que responden con intensidad media (0,6) igual encuentran su perfil entre los 3 primeros en el 85%', () => {
    // La mayoría responde "de acuerdo" donde una figura respondería "muy de acuerdo".
    const next = rng(44)
    const L: Response[] = [-1, -0.5, 0, 0.5, 1]
    let hits = 0
    let n = 0
    for (const profile of test.profiles) {
      for (let r = 0; r < 3; r++) {
        const qs = drawQuestions(test, 'full', Math.floor(next() * 2 ** 31))
        const answers = Object.fromEntries(
          qs.map((q) => {
            const v = profile.coords[q.primaryAxis]
            if (v == null) return [q.id, null]
            const x = (0.6 * Math.sign(q.effects[q.primaryAxis]) * v) / 100 + normal(next) * 0.25
            return [q.id, L.reduce((b, l) => (Math.abs(l - x) < Math.abs(b - x) ? l : b), 0 as number) as Response]
          }),
        )
        const pool = test.profiles.filter((p) => p.catalog === profile.catalog)
        const ranked = rankProfiles(scoreAxes(test.axes, qs, answers), test.axes, pool)
        n++
        if (ranked.slice(0, 3).some((m) => m.profile.id === profile.id)) hits++
      }
    }
    expect(hits / n).toBeGreaterThanOrEqual(0.85)
  })

  it('en la versión corta, cada perfil sale entre los 3 primeros de su catálogo en al menos el 70% de las partidas', () => {
    const next = rng(21)
    const RUNS = 20
    const wrong: string[] = []
    for (const profile of test.profiles) {
      const pool = test.profiles.filter((p) => p.catalog === profile.catalog)
      let hits = 0
      for (let i = 0; i < RUNS; i++) {
        const qs = drawQuestions(test, 'short', Math.floor(next() * 2 ** 31))
        const ranked = rankProfiles(scoreAxes(test.axes, qs, simulate(profile, qs, next)), test.axes, pool)
        if (ranked.slice(0, 3).some((m) => m.profile.id === profile.id)) hits++
      }
      if (hits / RUNS < 0.7) wrong.push(`${profile.id} ${Math.round((100 * hits) / RUNS)}%`)
    }
    expect(wrong).toEqual([])
  })
})

it('la misma figura en los dos tests coincide en Economía, Valores y Estilo (±30)', () => {
  const wrong = SAME_PERSON.flatMap(([arId, intlId]) =>
    SHARED_AXES.flatMap((axis) => {
      const a = byId(tests.ar, arId).coords[axis]
      const b = byId(tests.intl, intlId).coords[axis]
      return a == null || b == null || Math.abs(a - b) <= 30 ? [] : [`${arId} ${axis}: ${a} (AR) vs ${b} (intl)`]
    }),
  )
  expect(wrong).toEqual([])
})
