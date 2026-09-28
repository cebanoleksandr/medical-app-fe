import type { ListRecordsParams } from './types'

// Hierarchical keys: invalidating a prefix (e.g. queryKeys.activity.all)
// refreshes everything under it.
export const queryKeys = {
  auth: {
    session: ['auth', 'session'] as const,
    me: ['auth', 'me'] as const,
  },
  health: ['health'] as const,
  analyses: {
    options: ['analyses', 'options'] as const,
  },
  synthetic: {
    options: ['synthetic', 'options'] as const,
    dataset: (id: string) => ['synthetic', 'datasets', id] as const,
    validation: (id: string) =>
      ['synthetic', 'datasets', id, 'validation'] as const,
    records: (id: string, params: ListRecordsParams = {}) =>
      ['synthetic', 'datasets', id, 'records', params] as const,
    record: (id: string, recordId: string) =>
      ['synthetic', 'datasets', id, 'record', recordId] as const,
    source: (id: string) => ['synthetic', 'sources', id] as const,
  },
  activity: {
    all: ['activity'] as const,
    list: (limit: number) => ['activity', 'list', limit] as const,
    dashboard: ['activity', 'dashboard'] as const,
  },
}
