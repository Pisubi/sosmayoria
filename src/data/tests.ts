import type { Axis, Catalog, Profile, Question, TestDefinition, TestId } from '../types'
import arAxes from './ar/axes.json'
import arProfiles from './ar/profiles.json'
import arQuestions from './ar/questions.json'
import intlAxes from './intl/axes.json'
import intlProfiles from './intl/profiles.json'
import intlQuestions from './intl/questions.json'

export const tests: Record<TestId, TestDefinition> = {
  ar: {
    id: 'ar',
    version: arAxes.version,
    name: 'Argentina',
    tagline: 'De Rosas a Milei',
    description:
      'Los grandes debates argentinos —economía, instituciones, estilo político, seguridad y memoria— y comparación con tradiciones y figuras del país.',
    axes: arAxes.axes as unknown as Axis[],
    questions: arQuestions.questions as unknown as Question[],
    catalogs: arProfiles.catalogs as unknown as Catalog[],
    profiles: arProfiles.profiles as unknown as Profile[],
    planes: [
      ['ECO', 'POP'],
      ['ECO', 'SOC'],
      ['INS', 'SEG'],
    ],
    draw: {
      core: { ECO: 3, SOC: 3, INS: 3, POP: 3, SEG: 3, EXT: 3, FED: 3, IDN: 4 },
      detail: {
        full: { ECO: 5, SOC: 3, INS: 3, POP: 3, SEG: 3, EXT: 3, FED: 3, IDN: 2 },
        deep: { ECO: 17, SOC: 9, INS: 9, POP: 9, SEG: 11, EXT: 9, FED: 9, IDN: 2 },
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
    questions: intlQuestions.questions as unknown as Question[],
    catalogs: intlProfiles.catalogs as unknown as Catalog[],
    profiles: intlProfiles.profiles as unknown as Profile[],
    planes: [
      ['ECO', 'AUT'],
      ['ECO', 'SOC'],
      ['NAC', 'MIG'],
    ],
    draw: {
      core: { ECO: 4, AUT: 3, SOC: 3, NAC: 3, MIL: 3, MIG: 3, ECOL: 3, POP: 3 },
      detail: {
        full: { ECO: 4, AUT: 3, SOC: 3, NAC: 3, MIL: 3, MIG: 3, ECOL: 3, POP: 3 },
        deep: { ECO: 12, AUT: 9, SOC: 9, NAC: 9, MIL: 9, MIG: 9, ECOL: 9, POP: 9 },
      },
    },
  },
}

export const TEST_ORDER: TestId[] = ['intl', 'ar']
