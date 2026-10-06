import { useTranslation } from 'react-i18next'
import type { DeidMethod, Framework, IdentifierKey, Language, OutputMode } from '../api/types'

/**
 * Labels of the backend catalogue (frameworks, methods, identifiers, output
 * modes) by id. The server sends English text; it is the fallback when a
 * language has no entry for an id the server added later.
 */
export function useCatalog() {
  const { t } = useTranslation('common')
  return {
    framework: (f: { id: Framework; name?: string; description?: string; region?: string }) => ({
      name: t(`catalog.frameworks.${f.id}.name`, { defaultValue: f.name ?? f.id }),
      description: t(`catalog.frameworks.${f.id}.description`, { defaultValue: f.description ?? '' }),
      region: t(`catalog.frameworks.${f.id}.region`, { defaultValue: f.region ?? '' }),
    }),
    method: (m: { id: DeidMethod; name?: string; description?: string }, framework?: Framework) => ({
      name: t(`catalog.methods.${m.id}.name`, { defaultValue: m.name ?? m.id }),
      description: t(`catalog.methods.${m.id}.description`, {
        defaultValue: m.description ?? '',
        law: framework && framework !== 'HIPAA' ? t(`catalog.laws.${framework}`) : '',
      }),
    }),
    outputMode: (o: { id: OutputMode; name?: string; description?: string }) => ({
      name: t(`catalog.outputModes.${o.id}.name`, { defaultValue: o.name ?? o.id }),
      description: t(`catalog.outputModes.${o.id}.description`, { defaultValue: o.description ?? '' }),
    }),
    identifier: (i: { key: IdentifierKey; label?: string }) =>
      t(`catalog.identifiers.${i.key}`, { defaultValue: i.label ?? i.key }),
    language: (code: Language) => t(`languages.${code}`, { defaultValue: code }),
  }
}
