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
  },
}

export const TEST_ORDER: TestId[] = ['intl', 'ar']
