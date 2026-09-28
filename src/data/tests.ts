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
      ['INS', 'MEM'],
    ],
    draw: {
      core: { ECO: 4, SOC: 3, INS: 3, POP: 3, SEG: 3, MEM: 2, EXT: 3, FED: 2, IDN: 2 },
      detail: {
        full: { ECO: 4, SOC: 3, INS: 3, POP: 3, SEG: 3, MEM: 2, EXT: 3, FED: 2, IDN: 2 },
        deep: { ECO: 12, SOC: 9, INS: 9, POP: 9, SEG: 9, MEM: 8, EXT: 9, FED: 6, IDN: 4 },
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
      ['NAC', 'DEM'],
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
