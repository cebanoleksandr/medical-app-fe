import type { ParseKeys } from 'i18next'

/** Route `handle` for pages inside AppLayout; the deepest match wins. */
export interface RouteHandle {
  /** Keys in the `app` namespace. */
  title: ParseKeys<'app'>
  subtitle?: ParseKeys<'app'>
}
