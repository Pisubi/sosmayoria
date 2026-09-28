import type { Axis, Catalog, Profile, Question, TestDefinition, TestId } from '../types'
import arAxes from './ar/axes.json'
import arProfiles from './ar/profiles.json'
import arQuestions from './ar/questions.json'
import intlAxes from './intl/axes.json'
import intlProfiles from './intl/profiles.json'
import intlQuestions from './intl/questions.json'

const active = (questions: Question[]) => questions.filter((q) => !q.retired)

export const tests: Record<TestId, TestDefinition> = {
  ar: {
    id: 'ar',
    version: arAxes.version,
    name: 'Argentina',
    tagline: 'De Rosas a Milei',
    description:
      'Los grandes debates argentinos —economía, instituciones, estilo político, seguridad y memoria— y comparación con tradiciones y figuras del país.',
    axes: arAxes.axes as unknown as Axis[],
    questions: active(arQuestions.questions as unknown as Question[]),
    layout: arQuestions.questions.map((q) => q.id),
    catalogs: arProfiles.catalogs as unknown as Catalog[],
    profiles: arProfiles.profiles as unknown as Profile[],
    planes: [
      ['ECO', 'POP'],
      ['ECO', 'SOC'],
      ['INS', 'MEM'],
    ],
    dimensions: [
      { label: 'En economía', axes: ['ECO', 'EXT'] },
      { label: 'En valores y seguridad', axes: ['SOC', 'SEG', 'MEM'] },
      { label: 'En instituciones y estilo', axes: ['INS', 'POP', 'FED'] },
    ],
    draw: {
      // Mundo va casi a la par de Economía entre los perfiles; Territorio es el tema más independiente.
      core: { ECO: 4, SOC: 3, INS: 3, POP: 3, SEG: 3, MEM: 2, EXT: 2, FED: 3, IDN: 2 },
      detail: {
        full: { ECO: 4, SOC: 3, INS: 3, POP: 3, SEG: 3, MEM: 2, EXT: 2, FED: 3, IDN: 2 },
        deep: { ECO: 12, SOC: 9, INS: 9, POP: 9, SEG: 9, MEM: 8, EXT: 8, FED: 7, IDN: 4 },
      },
    },
  },
  intl: {
    id: 'intl',
    version: intlAxes.version,
    name: 'Internacional',
    tagline: 'De Stalin a Merkel',
    description:
      'Los grandes debates del mundo y comparación con ideologías, figuras históricas y actuales —argentinas incluidas— y partidos de hoy.',
    axes: intlAxes.axes as unknown as Axis[],
    questions: active(intlQuestions.questions as unknown as Question[]),
    layout: intlQuestions.questions.map((q) => q.id),
    catalogs: intlProfiles.catalogs as unknown as Catalog[],
    profiles: intlProfiles.profiles as unknown as Profile[],
    planes: [
      ['ECO', 'AUT'],
      ['ECO', 'SOC'],
      ['NAC', 'DEM'],
    ],
    dimensions: [
      { label: 'En economía', axes: ['ECO', 'COM', 'ECOL'] },
      { label: 'En lo social', axes: ['SOC', 'REL', 'AUT', 'MIG'] },
      { label: 'En lo político', axes: ['DEM', 'POP', 'NAC', 'MIL'] },
    ],
    draw: {
      core: { ECO: 3, COM: 2, AUT: 3, DEM: 2, SOC: 3, REL: 2, NAC: 2, MIL: 2, MIG: 2, ECOL: 2, POP: 2 },
      detail: {
        full: { ECO: 3, COM: 2, AUT: 3, DEM: 2, SOC: 3, REL: 2, NAC: 2, MIL: 2, MIG: 2, ECOL: 2, POP: 2 },
        deep: { ECO: 7, COM: 6, AUT: 7, DEM: 6, SOC: 7, REL: 6, NAC: 8, MIL: 6, MIG: 8, ECOL: 6, POP: 8 },
      },
    },
  },
}

export const TEST_ORDER: TestId[] = ['intl', 'ar']
