import analyses from './locales/en/analyses.json'
import app from './locales/en/app.json'
import auth from './locales/en/auth.json'
import common from './locales/en/common.json'
import dashboard from './locales/en/dashboard.json'
import deIdentify from './locales/en/deIdentify.json'
import landing from './locales/en/landing.json'
import synthetic from './locales/en/synthetic.json'

/** To add a language: copy locales/en, translate it and list it here. */
export const LANGUAGES = ['en'] as const
export type AppLanguage = (typeof LANGUAGES)[number]

export const DEFAULT_NS = 'common'

const en = { common, app, auth, landing, dashboard, analyses, deIdentify, synthetic }

export const NAMESPACES = Object.keys(en) as (keyof typeof en)[]

export const resources = { en } satisfies Record<AppLanguage, typeof en>
