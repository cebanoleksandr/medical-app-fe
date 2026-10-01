import type { EntityMethod, EntityType, Framework, IdentifierKey, RiskLevel } from '../../api/types'
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

export interface MethodInfo {
  label: string
  description: string
  /** Menu section in the method dropdown. */
  group: 'Remove' | 'Replace' | 'Protect' | 'Transform'
  icon: string
}

export const METHODS: Record<EntityMethod, MethodInfo> = {
  REDACT: {
    label: 'Redact — Remove entirely',
    description: 'Replaces detected data with [REDACTED]',
    group: 'Remove',
    icon: redactIcon,
  },
  PLACEHOLDER: {
    label: 'Replace — Use placeholder',
    description: 'Uses labels like [NAME], [DATE]',
    group: 'Replace',
    icon: placeholderIcon,
  },
  TOKEN: {
    label: 'Replace with token — Stable pseudonym',
    description: 'Assigns a consistent token, allows re-linking',
    group: 'Replace',
    icon: tokenIcon,
  },
  SYNTHETIC: {
    label: 'Synthetic — Generate fake values',
    description: 'Generates realistic fake values',
    group: 'Replace',
    icon: syntheticIcon,
  },
  MASK: {
    label: 'Mask — Hide partially',
    description: 'Hides parts of the value',
    group: 'Protect',
    icon: maskIcon,
  },
  HASH: {
    label: 'Hash — One-way encryption',
    description: 'Converts to irreversible hash, preserves uniqueness',
    group: 'Protect',
    icon: hashIcon,
  },
  GENERALISE: {
    label: 'Generalise — Reduce precision',
    description: 'Converts to broader category or range',
    group: 'Transform',
    icon: generaliseIcon,
  },
  PSEUDONYMISE: {
    label: 'Pseudonymise — Store mapping',
    description: 'Replaces with token, mapping stored securely',
    group: 'Transform',
    icon: pseudonymiseIcon,
  },
  NLP_REDACTION: {
    label: 'NLP redaction — Free text PHI',
    description: 'Applies NLP model to unstructured text',
    group: 'Transform',
    icon: nlpIcon,
  },
}

/** Dropdown order: grouped as in the design's menu. */
export const METHOD_ORDER = Object.keys(METHODS) as EntityMethod[]

// ---------- Entities ----------

export interface EntityInfo {
  type: EntityType
  label: string
  icon: string
  /** Special category data: only Remove is allowed. */
  special?: boolean
  /** Closest identifier the current backend knows, sent as `identifiers`. */
  identifier?: IdentifierKey
}

export interface EntityGroup {
  title: string
  special?: boolean
  entities: EntityInfo[]
}

export const ENTITY_GROUPS: EntityGroup[] = [
  {
    title: 'Identity',
    entities: [
      { type: 'PERSON', label: 'PERSON', icon: personIcon, identifier: 'names' },
      { type: 'ORGANIZATION', label: 'ORGANIZATION', icon: organizationIcon, identifier: 'organization' },
    ],
  },
  {
    title: 'Dates & Location',
    entities: [
      { type: 'LOCATION', label: 'LOCATION', icon: locationIcon, identifier: 'geographic' },
      { type: 'DATE_TIME', label: 'DATE/TIME', icon: dateTimeIcon, identifier: 'dates' },
      { type: 'IP', label: 'IP', icon: ipIcon, identifier: 'ip' },
      { type: 'GEOPOINT', label: 'GEOPOINT', icon: geopointIcon, identifier: 'geographic' },
    ],
  },
  {
    title: 'Sensitive identifiers',
    entities: [
      { type: 'NATIONAL_ID', label: 'NATIONAL_ID', icon: nationalIdIcon, identifier: 'ssn' },
      { type: 'ID_NUMBER', label: 'ID_NUMBER', icon: idNumberIcon, identifier: 'other' },
      { type: 'PASSPORT', label: 'PASSPORT', icon: passportIcon, identifier: 'license' },
      { type: 'CREDIT_CARD', label: 'CREDIT_CARD', icon: creditCardIcon, identifier: 'account' },
      { type: 'BANK_ACCOUNT', label: 'BANK_ACCOUNT', icon: bankAccountIcon, identifier: 'account' },
      { type: 'EMAIL', label: 'EMAIL', icon: emailIcon, identifier: 'email' },
      { type: 'PHONE', label: 'PHONE', icon: phoneIcon, identifier: 'phone' },
      { type: 'MEDICAL_RECORD_NUMBER', label: 'MEDICAL_RECORD_NUMBER', icon: medicalRecordIcon, identifier: 'mrn' },
      { type: 'DEVICE_ID', label: 'DEVICE_ID', icon: deviceIdIcon, identifier: 'device' },
    ],
  },
  {
    title: 'Unstructured data',
    entities: [{ type: 'FREE_TEXT', label: 'FREE_TEXT (PHI)', icon: freeTextIcon }],
  },
  {
    title: 'Special category',
    special: true,
    entities: [
      { type: 'BIOLOGICAL_DATA', label: 'BIOLOGICAL_DATA', icon: biologicalIcon, special: true, identifier: 'special_category' },
      { type: 'PHOTO', label: 'PHOTO / IMAGE', icon: photoIcon, special: true },
    ],
  },
]

export const ENTITIES = ENTITY_GROUPS.flatMap((group) => group.entities)

// ---------- Risk levels ----------

export interface RiskLevelInfo {
  title: string
  /** Two lines under the title; the Medium one names the law. */
  lines: (law: LawInfo) => [string, string]
}

export const RISK_LEVELS: Record<RiskLevel, RiskLevelInfo> = {
  LOW: { title: 'Low', lines: () => ['Minimal anonymization.', 'Higher data utility.'] },
  MEDIUM: { title: 'Medium', lines: (law) => ['Balanced privacy and utility.', law.mediumNote] },
  HIGH: { title: 'High', lines: () => ['Maximum anonymization.', 'Reduced data usability.'] },
}

/** Risk level → the backend's detection sensitivity. */
export const RISK_SENSITIVITY = {
  LOW: 'CONSERVATIVE',
  MEDIUM: 'BALANCED',
  HIGH: 'AGGRESSIVE',
} as const

// ---------- Laws ----------

export interface LawInfo {
  /** "GDPR", "Swiss FADP": used in sentences. */
  name: string
  mediumNote: string
  /** "GDPR Art. 9": special category header and trigger text. */
  specialArticle: string
  /** "Art. 9": short form for "Removal mandatory under …". */
  articleShort: string
  /** "GDPR Article 9": the logic drawer's long form. */
  articleLong: string
}

export const LAWS: Partial<Record<Framework, LawInfo>> = {
  EU_GDPR: {
    name: 'GDPR',
    mediumNote: 'Meets standard GDPR guidelines.',
    specialArticle: 'GDPR Art. 9',
    articleShort: 'Art. 9',
    articleLong: 'GDPR Article 9',
  },
  UK_GDPR: {
    name: 'UK GDPR',
    mediumNote: 'Based on UK GDPR guidelines.',
    specialArticle: 'UK GDPR Art. 9',
    articleShort: 'Art. 9',
    articleLong: 'UK GDPR Article 9',
  },
  SWISS_FADP: {
    name: 'Swiss FADP',
    mediumNote: 'Based on Swiss FADP guidelines.',
    specialArticle: 'FADP Art. 5(c)',
    articleShort: 'Art. 5',
    articleLong: 'FADP Art. 5(c)',
  },
}

// ---------- Configuration logic drawer ----------

export interface LogicItem {
  entities: EntityType[]
  /** Short method name, e.g. "Generalise". */
  method: string
  rationale: string
}

/** The design's explanation of the Medium preset, grouped as in the drawer. */
export function mediumLogic(law: LawInfo): { title: string; special?: boolean; items: LogicItem[] }[] {
  return [
    {
      title: 'Identity',
      items: [
        { entities: ['PERSON'], method: 'Replace with stable token', rationale: 'Assigns a consistent token, allows re-linking if legally required' },
        { entities: ['ORGANIZATION'], method: 'Mask', rationale: 'Hides part of the value if organisation is considered sensitive' },
      ],
    },
    {
      title: 'Dates & Location',
      items: [
        { entities: ['DATE_TIME'], method: 'Generalise', rationale: 'Converts DOB to age range (e.g. 40–50). Timestamps rounded to month or quarter' },
        { entities: ['LOCATION'], method: 'Generalise', rationale: 'Reduces to region or 3-digit postcode. EDPB recommends geographic generalisation' },
        { entities: ['IP'], method: 'Generalise', rationale: 'Last segment of the IP address is removed. Only the network range is kept, making it impossible to identify the specific device or user.' },
        { entities: ['GEOPOINT'], method: 'Generalise', rationale: 'Exact coordinates rounded to city or regional centroid' },
      ],
    },
    {
      title: 'Sensitive identifiers',
      items: [
        { entities: ['NATIONAL_ID', 'ID_NUMBER', 'PASSPORT'], method: 'Remove', rationale: 'One-way removal. No plaintext mapping stored in dataset' },
        { entities: ['CREDIT_CARD', 'BANK_ACCOUNT'], method: 'Remove', rationale: 'Removes full numbers. BIN or last 4 digits may be kept only if business-necessary and documented.' },
        { entities: ['EMAIL', 'PHONE'], method: 'Redact', rationale: 'Full address and number removed. Domain may be preserved if business-necessary' },
        { entities: ['MEDICAL_RECORD_NUMBER'], method: 'Pseudonymise', rationale: 'Stable token assigned. Mapping stored server-side under access control' },
        { entities: ['DEVICE_ID'], method: 'Hash', rationale: 'One-way encryption with salt. Keys stored under strict access control' },
      ],
    },
    {
      title: 'Unstructured data',
      items: [
        { entities: ['FREE_TEXT'], method: 'NLP redaction', rationale: 'NLP model scans unstructured text. Manual QA recommended before sharing' },
      ],
    },
    {
      title: `Special category — ${law.specialArticle}`,
      special: true,
      items: [
        { entities: ['BIOLOGICAL_DATA'], method: 'Remove', rationale: 'Treated as highest-risk data. No alternative methods permitted' },
        { entities: ['PHOTO'], method: 'Remove', rationale: `Biometric data. Removal mandatory under ${law.articleShort}` },
      ],
    },
  ]
}
