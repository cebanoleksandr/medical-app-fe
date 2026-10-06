import i18n from './index'
import type { AppLanguage } from './resources'

// Intl locale per UI language; "en" keeps US formats (1,385 · Apr 5, 2026).
const INTL_LOCALES: Record<AppLanguage, string> = { en: 'en-US' }

/** The Intl locale of the current UI language. */
export const intlLocale = () =>
  INTL_LOCALES[(i18n.resolvedLanguage ?? 'en') as AppLanguage] ?? 'en-US'

export const formatNumber = (value: number, options?: Intl.NumberFormatOptions) =>
  new Intl.NumberFormat(intlLocale(), options).format(value)

export const formatDate = (value: Date | string | number, options?: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat(intlLocale(), options).format(new Date(value))

// Chart axes put the day first ("01 Apr", from the design), even in English.
const DAY_MONTH_LOCALES: Record<AppLanguage, string> = { en: 'en-GB' }

/** "01 Apr": a short day label for chart axes. */
export const formatDayMonth = (value: Date | string | number) =>
  new Intl.DateTimeFormat(
    DAY_MONTH_LOCALES[(i18n.resolvedLanguage ?? 'en') as AppLanguage] ?? intlLocale(),
    { day: '2-digit', month: 'short' },
  ).format(new Date(value))
