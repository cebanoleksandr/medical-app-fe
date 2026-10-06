import 'i18next'
import type { DEFAULT_NS, resources } from './resources'

// Typed keys: t('common:actions.cancel') is checked, a typo fails tsc.
declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: typeof DEFAULT_NS
    resources: (typeof resources)['en']
  }
}
