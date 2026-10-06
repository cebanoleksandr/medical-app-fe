import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'
import { DEFAULT_NS, LANGUAGES, NAMESPACES, resources } from './resources'

// Resources are bundled, so init is synchronous and nothing suspends.
void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    ns: NAMESPACES,
    defaultNS: DEFAULT_NS,
    supportedLngs: LANGUAGES,
    fallbackLng: 'en',
    // "en-GB" from the browser resolves to "en".
    nonExplicitSupportedLngs: true,
    load: 'languageOnly',
    initAsync: false,
    // React already escapes what it renders.
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'deid.language',
      caches: ['localStorage'],
    },
  })

const syncHtmlLang = (language: string) => {
  document.documentElement.lang = language
}
syncHtmlLang(i18n.resolvedLanguage ?? 'en')
i18n.on('languageChanged', syncHtmlLang)

export default i18n
