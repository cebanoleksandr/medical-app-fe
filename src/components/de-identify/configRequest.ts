import type {
  CreateAnalysisRequest,
  EntityMethods,
  FrameworkOption,
  IdentifierKey,
  RiskLevel,
} from '../../api/types'
import type { DeIdentifyDraft } from '../layouts/de-identify/context'
import { ENTITIES, RISK_SENSITIVITY } from './entityConfig'

/** Methods each risk level starts from, as served by /analyses/options. */
export type RiskPresets = Record<RiskLevel, EntityMethods>

/** The draft's methods per entity, or the risk level's preset. */
export function entityMethodsOf(
  draft: DeIdentifyDraft,
  presets: RiskPresets,
): EntityMethods | undefined {
  if (!draft.riskLevel) return undefined
  return { ...presets[draft.riskLevel], ...draft.entityMethods }
}

export function isCustomized(draft: DeIdentifyDraft, presets: RiskPresets) {
  const methods = entityMethodsOf(draft, presets)
  if (!methods || !draft.riskLevel) return false
  const preset = presets[draft.riskLevel]
  return ENTITIES.some((entity) => methods[entity.type] !== preset[entity.type])
}

/**
 * The request "Analyze" sends, or null while a required choice is missing.
 * Settings only; the caller adds the text and framework.
 */
export type AnalysisSettings = Omit<CreateAnalysisRequest, 'text' | 'framework'>

/** HIPAA: method, identifiers (customizable methods), output mode, sensitivity. */
export function hipaaSettings(
  draft: DeIdentifyDraft,
  framework: FrameworkOption,
): AnalysisSettings | null {
  const method = framework.methods.find((item) => item.id === draft.method)
  if (!method || !draft.sensitivity) return null
  const identifiers = draft.identifiers ?? []
  if (method.customizable && identifiers.length === 0) return null
  return {
    method: method.id,
    identifiers: method.customizable ? identifiers : undefined,
    language: draft.language ?? 'en',
    outputMode: draft.outputMode ?? 'REDACT',
    sensitivity: draft.sensitivity,
  }
}

/**
 * GDPR, UK GDPR, FADP: a risk level and the user's overrides of its preset.
 * The method and identifiers record what was done for the history: the
 * preset is full anonymisation, any change makes it the custom method.
 */
export function dataProtectionSettings(
  draft: DeIdentifyDraft,
  framework: FrameworkOption,
  presets: RiskPresets,
): AnalysisSettings | null {
  const methods = entityMethodsOf(draft, presets)
  if (!draft.riskLevel || !methods) return null
  const customized = isCustomized(draft, presets)
  const method = framework.methods.find((item) => item.customizable === customized)
  if (!method) return null
  const known = new Set(method.identifiers.map((item) => item.key))
  const identifiers = [
    ...new Set(
      ENTITIES.map((entity) => entity.identifier).filter(
        (key): key is IdentifierKey => key !== undefined && known.has(key),
      ),
    ),
  ]
  return {
    method: method.id,
    identifiers: customized ? identifiers : undefined,
    language: draft.language ?? 'en',
    sensitivity: RISK_SENSITIVITY[draft.riskLevel],
    riskLevel: draft.riskLevel,
    // Only the overrides: the server owns the presets.
    entityMethods: overridesOf(methods, presets[draft.riskLevel]),
  }
}

function overridesOf(methods: EntityMethods, preset: EntityMethods): Partial<EntityMethods> {
  return Object.fromEntries(
    ENTITIES.filter((entity) => methods[entity.type] !== preset[entity.type]).map((entity) => [
      entity.type,
      methods[entity.type],
    ]),
  )
}
