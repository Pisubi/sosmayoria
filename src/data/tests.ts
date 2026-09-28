import type { TestDefinition, TestId } from '../types'
import { argentina } from './argentina'
import { internacional } from './internacional'

export const tests: Record<TestId, TestDefinition> = { internacional, argentina }

export const TEST_ORDER: TestId[] = ['internacional', 'argentina']
