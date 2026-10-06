import { useTranslation } from 'react-i18next'
import type { EntityMethod, EntityType, Framework, IdentifierKey } from '../../api/types'
import bankAccountIcon from '../../assets/entities/bank-account.svg'
import biologicalIcon from '../../assets/entities/biological.svg'
import creditCardIcon from '../../assets/entities/credit-card.svg'
import dateTimeIcon from '../../assets/entities/date-time.svg'
import deviceIdIcon from '../../assets/entities/device-id.svg'
import emailIcon from '../../assets/entities/email.svg'
import freeTextIcon from '../../assets/entities/free-text.svg'
import geopointIcon from '../../assets/entities/geopoint.svg'
import idNumberIcon from '../../assets/entities/id-number.svg'
import ipIcon from '../../assets/entities/ip.svg'
import locationIcon from '../../assets/entities/location.svg'
import medicalRecordIcon from '../../assets/entities/medical-record.svg'
import nationalIdIcon from '../../assets/entities/national-id.svg'
import organizationIcon from '../../assets/entities/organization.svg'
import passportIcon from '../../assets/entities/passport.svg'
import personIcon from '../../assets/entities/person.svg'
import phoneIcon from '../../assets/entities/phone.svg'
import photoIcon from '../../assets/entities/photo.svg'
import redactIcon from '../../assets/configuration/hide-source.svg'
import generaliseIcon from '../../assets/methods/generalise.svg'
import hashIcon from '../../assets/methods/hash.svg'
import maskIcon from '../../assets/methods/mask.svg'
import nlpIcon from '../../assets/methods/nlp.svg'
import placeholderIcon from '../../assets/methods/placeholder.svg'
import pseudonymiseIcon from '../../assets/methods/pseudonymise.svg'
import syntheticIcon from '../../assets/methods/synthetic.svg'
import tokenIcon from '../../assets/methods/token.svg'

// ---------- Methods ----------
// Texts: `deIdentify:methods.<method>` (label, short, description) and
// `deIdentify:methodGroups.<group>`.

export type MethodGroup = 'remove' | 'replace' | 'protect' | 'transform'

export interface MethodInfo {
  /** Menu section in the method dropdown. */
  group: MethodGroup
  icon: string
}

export const METHODS: Record<EntityMethod, MethodInfo> = {
  REDACT: { group: 'remove', icon: redactIcon },
  PLACEHOLDER: { group: 'replace', icon: placeholderIcon },
  TOKEN: { group: 'replace', icon: tokenIcon },
  SYNTHETIC: { group: 'replace', icon: syntheticIcon },
  MASK: { group: 'protect', icon: maskIcon },
  HASH: { group: 'protect', icon: hashIcon },
  GENERALISE: { group: 'transform', icon: generaliseIcon },
  PSEUDONYMISE: { group: 'transform', icon: pseudonymiseIcon },
  NLP_REDACTION: { group: 'transform', icon: nlpIcon },
}

/** Dropdown order: grouped as in the design's menu. */
export const METHOD_ORDER = Object.keys(METHODS) as EntityMethod[]

// ---------- Entities ----------
// Labels: `deIdentify:entities.<type>`; group titles: `deIdentify:entityGroups.<id>`.

export interface EntityInfo {
  type: EntityType
  icon: string
  /** Special category data: only Remove is allowed. */
  special?: boolean
  /** Closest identifier the current backend knows, sent as `identifiers`. */
  identifier?: IdentifierKey
}

export type EntityGroupId = 'identity' | 'datesLocation' | 'sensitive' | 'unstructured' | 'special'

export interface EntityGroup {
  id: EntityGroupId
  special?: boolean
  entities: EntityInfo[]
}

export const ENTITY_GROUPS: EntityGroup[] = [
  {
    id: 'identity',
    entities: [
      { type: 'PERSON', icon: personIcon, identifier: 'names' },
      { type: 'ORGANIZATION', icon: organizationIcon, identifier: 'organization' },
    ],
  },
  {
    id: 'datesLocation',
    entities: [
      { type: 'LOCATION', icon: locationIcon, identifier: 'geographic' },
      { type: 'DATE_TIME', icon: dateTimeIcon, identifier: 'dates' },
      { type: 'IP', icon: ipIcon, identifier: 'ip' },
      { type: 'GEOPOINT', icon: geopointIcon, identifier: 'geographic' },
    ],
  },
  {
    id: 'sensitive',
    entities: [
      { type: 'NATIONAL_ID', icon: nationalIdIcon, identifier: 'ssn' },
      { type: 'ID_NUMBER', icon: idNumberIcon, identifier: 'other' },
      { type: 'PASSPORT', icon: passportIcon, identifier: 'license' },
      { type: 'CREDIT_CARD', icon: creditCardIcon, identifier: 'account' },
      { type: 'BANK_ACCOUNT', icon: bankAccountIcon, identifier: 'account' },
      { type: 'EMAIL', icon: emailIcon, identifier: 'email' },
      { type: 'PHONE', icon: phoneIcon, identifier: 'phone' },
      { type: 'MEDICAL_RECORD_NUMBER', icon: medicalRecordIcon, identifier: 'mrn' },
      { type: 'DEVICE_ID', icon: deviceIdIcon, identifier: 'device' },
    ],
  },
  {
    id: 'unstructured',
    entities: [{ type: 'FREE_TEXT', icon: freeTextIcon }],
  },
  {
    id: 'special',
    special: true,
    entities: [
      { type: 'BIOLOGICAL_DATA', icon: biologicalIcon, special: true, identifier: 'special_category' },
      { type: 'PHOTO', icon: photoIcon, special: true },
    ],
  },
]

export const ENTITIES = ENTITY_GROUPS.flatMap((group) => group.entities)

// ---------- Risk levels ----------
// Texts: `deIdentify:risk.<level>`.

/** Risk level → the backend's detection sensitivity. */
export const RISK_SENSITIVITY = {
  LOW: 'CONSERVATIVE',
  MEDIUM: 'BALANCED',
  HIGH: 'AGGRESSIVE',
} as const

// ---------- Laws ----------

export type LawId = 'EU_GDPR' | 'UK_GDPR' | 'SWISS_FADP'

export interface LawInfo {
  id: LawId
}

/** Frameworks configured by risk level; their texts are `deIdentify:laws.<id>`. */
export const LAWS: Partial<Record<Framework, LawInfo>> = {
  EU_GDPR: { id: 'EU_GDPR' },
  UK_GDPR: { id: 'UK_GDPR' },
  SWISS_FADP: { id: 'SWISS_FADP' },
}

/** A law's wording in the current language. */
export function useLawText(law: LawInfo) {
  const { t } = useTranslation('deIdentify')
  return {
    /** "GDPR", "Swiss FADP": used in sentences. */
    name: t(`laws.${law.id}.name`),
    mediumNote: t(`laws.${law.id}.mediumNote`),
    /** "GDPR Art. 9": special category header and trigger text. */
    specialArticle: t(`laws.${law.id}.specialArticle`),
    /** "Art. 9": short form for "Removal mandatory under …". */
    articleShort: t(`laws.${law.id}.articleShort`),
    /** "GDPR Article 9": the logic drawer's long form. */
    articleLong: t(`laws.${law.id}.articleLong`),
  }
}

// ---------- Configuration logic drawer ----------

/** Entity types whose Medium-preset explanation exists in `deIdentify:logic.medium`. */
export type LogicKey =
  | 'PERSON'
  | 'ORGANIZATION'
  | 'DATE_TIME'
  | 'LOCATION'
  | 'IP'
  | 'GEOPOINT'
  | 'NATIONAL_ID'
  | 'CREDIT_CARD'
  | 'EMAIL'
  | 'MEDICAL_RECORD_NUMBER'
  | 'DEVICE_ID'
  | 'FREE_TEXT'
  | 'BIOLOGICAL_DATA'
  | 'PHOTO'

export interface LogicItem {
  entities: EntityType[]
  /** The explanation's key: method and rationale. */
  key: LogicKey
}

/** The design's explanation of the Medium preset, grouped as in the drawer. */
export const MEDIUM_LOGIC: { group: EntityGroupId; special?: boolean; items: LogicItem[] }[] = [
  {
    group: 'identity',
    items: [
      { entities: ['PERSON'], key: 'PERSON' },
      { entities: ['ORGANIZATION'], key: 'ORGANIZATION' },
    ],
  },
  {
    group: 'datesLocation',
    items: [
      { entities: ['DATE_TIME'], key: 'DATE_TIME' },
      { entities: ['LOCATION'], key: 'LOCATION' },
      { entities: ['IP'], key: 'IP' },
      { entities: ['GEOPOINT'], key: 'GEOPOINT' },
    ],
  },
  {
    group: 'sensitive',
    items: [
      { entities: ['NATIONAL_ID', 'ID_NUMBER', 'PASSPORT'], key: 'NATIONAL_ID' },
      { entities: ['CREDIT_CARD', 'BANK_ACCOUNT'], key: 'CREDIT_CARD' },
      { entities: ['EMAIL', 'PHONE'], key: 'EMAIL' },
      { entities: ['MEDICAL_RECORD_NUMBER'], key: 'MEDICAL_RECORD_NUMBER' },
      { entities: ['DEVICE_ID'], key: 'DEVICE_ID' },
    ],
  },
  {
    group: 'unstructured',
    items: [{ entities: ['FREE_TEXT'], key: 'FREE_TEXT' }],
  },
  {
    group: 'special',
    special: true,
    items: [
      { entities: ['BIOLOGICAL_DATA'], key: 'BIOLOGICAL_DATA' },
      { entities: ['PHOTO'], key: 'PHOTO' },
    ],
  },
]
