// Mirrors the backend DTOs and responses (backend/src). `erasableSyntaxOnly`
// rules out TS enums, so enums are `as const` objects plus a union type.

export type Language = 'en' | 'uk'
/** ISO 8601 string: dates arrive as JSON strings. */
export type IsoDate = string

// ---------- Auth ----------

export interface User {
  id: string
  email: string
}

export interface AuthSession {
  accessToken: string
  user: User
}

export interface MessageResponse {
  message: string
}

// ---------- De-identification ----------

export const Framework = {
  HIPAA: 'HIPAA',
  EU_GDPR: 'EU_GDPR',
  UK_GDPR: 'UK_GDPR',
  SWISS_FADP: 'SWISS_FADP',
} as const
export type Framework = (typeof Framework)[keyof typeof Framework]

export const DeidMethod = {
  SAFE_HARBOR: 'SAFE_HARBOR',
  EXPERT_DETERMINATION: 'EXPERT_DETERMINATION',
  ANONYMISATION: 'ANONYMISATION',
  CUSTOM: 'CUSTOM',
} as const
export type DeidMethod = (typeof DeidMethod)[keyof typeof DeidMethod]

export const OutputMode = {
  REDACT: 'REDACT',
  MASK: 'MASK',
  PLACEHOLDER: 'PLACEHOLDER',
  PSEUDONYMIZE: 'PSEUDONYMIZE',
} as const
export type OutputMode = (typeof OutputMode)[keyof typeof OutputMode]

export const Sensitivity = {
  CONSERVATIVE: 'CONSERVATIVE',
  BALANCED: 'BALANCED',
  AGGRESSIVE: 'AGGRESSIVE',
} as const
export type Sensitivity = (typeof Sensitivity)[keyof typeof Sensitivity]

export type IdentifierKey =
  | 'names'
  | 'geographic'
  | 'dates'
  | 'phone'
  | 'fax'
  | 'email'
  | 'ssn'
  | 'mrn'
  | 'health_plan'
  | 'account'
  | 'license'
  | 'vehicle'
  | 'device'
  | 'url'
  | 'ip'
  | 'biometric'
  | 'photo'
  | 'other'
  | 'organization'
  | 'special_category'

export interface MethodOption {
  id: DeidMethod
  name: string
  description: string
  recommended: boolean
  /** When true the user picks from `identifiers`; otherwise all are applied. */
  customizable: boolean
  requiresReview: boolean
  identifiers: { key: IdentifierKey; label: string }[]
  defaultIdentifiers: IdentifierKey[]
}

export interface FrameworkOption {
  id: Framework
  name: string
  description: string
  region: string
  methods: MethodOption[]
}

export interface AnalysisOptions {
  frameworks: FrameworkOption[]
  outputModes: { id: OutputMode; name: string; description: string }[]
  sensitivities: Sensitivity[]
  languages: Language[]
  /** GDPR, UK GDPR, FADP: risk levels and their method per entity type. */
  entityConfig: EntityConfigOptions
}

export interface EntityConfigOptions {
  riskLevels: RiskLevel[]
  entityMethods: EntityMethod[]
  /** `detectable: false`: configurable, but no recognizer finds it yet. */
  entityTypes: { type: EntityType; special: boolean; detectable: boolean }[]
  riskPresets: Record<RiskLevel, EntityMethods>
}

export interface ExtractTextResponse {
  text: string
  characters: number
}

/** Text limits enforced by the backend (pasted text is capped lower in the UI). */
export const MIN_TEXT_LENGTH = 50
export const MAX_TEXT_LENGTH = 20_000
export const MAX_PASTED_TEXT_LENGTH = 5_000
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024
/** Entities scoring below this are flagged `lowConfidence`. */
export const LOW_CONFIDENCE_BELOW = 0.7

/** Data-protection frameworks (GDPR, UK GDPR, FADP): privacy risk preset. */
export const RiskLevel = { LOW: 'LOW', MEDIUM: 'MEDIUM', HIGH: 'HIGH' } as const
export type RiskLevel = (typeof RiskLevel)[keyof typeof RiskLevel]

/** Entity types configured one by one under data-protection frameworks. */
export type EntityType =
  | 'PERSON'
  | 'ORGANIZATION'
  | 'LOCATION'
  | 'DATE_TIME'
  | 'IP'
  | 'GEOPOINT'
  | 'NATIONAL_ID'
  | 'ID_NUMBER'
  | 'PASSPORT'
  | 'CREDIT_CARD'
  | 'BANK_ACCOUNT'
  | 'EMAIL'
  | 'PHONE'
  | 'MEDICAL_RECORD_NUMBER'
  | 'DEVICE_ID'
  | 'FREE_TEXT'
  | 'BIOLOGICAL_DATA'
  | 'PHOTO'

/** How one entity type is processed. */
export const EntityMethod = {
  REDACT: 'REDACT',
  PLACEHOLDER: 'PLACEHOLDER',
  TOKEN: 'TOKEN',
  SYNTHETIC: 'SYNTHETIC',
  MASK: 'MASK',
  HASH: 'HASH',
  GENERALISE: 'GENERALISE',
  PSEUDONYMISE: 'PSEUDONYMISE',
  NLP_REDACTION: 'NLP_REDACTION',
} as const
export type EntityMethod = (typeof EntityMethod)[keyof typeof EntityMethod]
export type EntityMethods = Record<EntityType, EntityMethod>

export interface CreateAnalysisRequest {
  text: string
  language: Language
  framework: Framework
  method: DeidMethod
  /** Only for customizable methods; defaults to the method's default set. */
  identifiers?: IdentifierKey[]
  outputMode?: OutputMode
  sensitivity?: Sensitivity
  /**
   * Data-protection frameworks only: a method per entity type instead of
   * `outputMode`. `entityMethods` overrides the risk level's preset.
   */
  riskLevel?: RiskLevel
  entityMethods?: Partial<EntityMethods>
}

export interface DetectedEntity {
  id: string
  /** Presidio entity type, e.g. PERSON, DATE_TIME. */
  type: string
  identifier: IdentifierKey | undefined
  text: string
  start: number
  end: number
  score: number
  lowConfidence: boolean
  included: boolean
  replacement: string | null
  /** Analyses run with a risk level: the entity type that set its method. */
  entityType?: EntityType
}

export interface Analysis {
  id: string
  createdAt: IsoDate
  framework: Framework
  method: DeidMethod
  identifiers: IdentifierKey[]
  outputMode: OutputMode
  language: Language
  sensitivity: Sensitivity
  riskLevel: RiskLevel | null
  entityMethods: EntityMethods | null
  stats: {
    detected: number
    processed: number
    avgConfidence: number | null
    processingMs: number
  }
  entities: DetectedEntity[]
  deidentifiedText: string
}

/**
 * The server keeps no text, so render and source-from-analysis requests carry
 * the original text and entity choices back. Entities can be sent exactly as
 * the analysis returned them (DetectedEntity): the server ignores and
 * recomputes `text`, `identifier`, `lowConfidence` and `replacement`.
 */
export interface EntityState {
  id: string
  type: string
  start: number
  end: number
  score: number
  included: boolean
  text?: string
  identifier?: string
  lowConfidence?: boolean
  replacement?: string | null
  entityType?: string
}

export interface RenderAnalysisRequest {
  text: string
  /** Required for output-mode analyses (HIPAA). */
  outputMode?: OutputMode
  /** Risk-level analyses: new overrides of the preset. */
  entityMethods?: Partial<EntityMethods>
  entities: EntityState[]
}

// ---------- Synthetic data ----------

export const DatasetType = {
  PATIENT_RECORDS: 'PATIENT_RECORDS',
  CLINICAL_NOTES: 'CLINICAL_NOTES',
  LAB_RESULTS: 'LAB_RESULTS',
  PRESCRIPTIONS: 'PRESCRIPTIONS',
} as const
export type DatasetType = (typeof DatasetType)[keyof typeof DatasetType]

export const SourceDatasetType = {
  FROM_FILE: 'FROM_FILE',
  FROM_DOCUMENT: 'FROM_DOCUMENT',
} as const
export type SourceDatasetType =
  (typeof SourceDatasetType)[keyof typeof SourceDatasetType]

export type AnyDatasetType = DatasetType | SourceDatasetType

export const OutputFormat = {
  CSV: 'CSV',
  JSON: 'JSON',
  XLSX: 'XLSX',
} as const
export type OutputFormat = (typeof OutputFormat)[keyof typeof OutputFormat]

export const MAX_RECORDS = 100_000

export interface ColumnDefinition {
  key: string
  label: string
  type: 'string' | 'number' | 'boolean' | 'date' | 'text'
  role?: 'id' | 'code'
}

export interface SyntheticOptions {
  datasetTypes: {
    id: DatasetType
    name: string
    description: string
    columns: ColumnDefinition[]
    previewColumns: string[]
  }[]
  frameworks: { id: Framework; name: string; description: string }[]
  formats: OutputFormat[]
  languages: Language[]
  maxRecords: number
  /** Estimated bytes per record: bytesPerRecord[datasetType][format]. */
  bytesPerRecord: Record<DatasetType, Record<OutputFormat, number>>
}

/** Give either a built-in `datasetType` or a `sourceId`. */
export type CreateDatasetRequest = {
  framework: Framework
  recordCount: number
  format: OutputFormat
  /** Ignored for document sources, which keep the document's language. */
  language?: Language
} & (
  | { datasetType: DatasetType; sourceId?: never }
  | { sourceId: string; datasetType?: never }
)

export interface Dataset {
  id: string
  datasetType: AnyDatasetType
  sourceId: string | null
  framework: Framework
  language: Language
  format: OutputFormat
  records: number
  fields: number
  columns: ColumnDefinition[]
  previewColumns: string[]
  estimatedBytes: number
  createdAt: IsoDate
  /** After this the dataset answers 410 Gone and must be regenerated. */
  expiresAt: IsoDate
}

export type CellValue = string | number | boolean | null
export type RecordQuality = 'GOOD' | 'FAIR'

export interface DatasetRecord {
  recordId: string
  quality: RecordQuality
  issues: string[]
  values: Record<string, CellValue>
}

export interface ListRecordsParams {
  offset?: number
  /** 1–100, default 8. */
  limit?: number
  /** Column keys; defaults to the dataset's preview columns. */
  columns?: string[]
}

export interface RecordsPage {
  total: number
  offset: number
  limit: number
  columns: string[]
  rows: DatasetRecord[]
}

export type Level3 = 'HIGH' | 'MEDIUM' | 'LOW'

export interface ValidationCheck {
  id:
    | 'dates_transformed'
    | 'free_text_checked'
    | 'export_format_validated'
    | 'synthetic_identifiers_generated'
    | 'direct_identifiers_removed'
  label: string
  passed: boolean
  detail: string
}

export interface ValidationReport {
  datasetId: string
  compliance: {
    framework: Framework
    riskLevel: Level3
    riskFactors: string[]
    directIdentifiers: 'DETECTED' | 'NOT_DETECTED'
  }
  quality: {
    quality: 'GOOD' | 'FAIR' | 'POOR'
    consistency: Level3
    consistencyRate: number
    fidelity: number | null
    warnings: number
  }
  lowConfidenceFields: { field: string; reason: string }[]
  checks: ValidationCheck[]
  findings: { recordId: string | null; field: string; entityType: string }[]
  sampleSize: { consistency: number; scan: number }
}

// ---------- Synthetic sources ----------

export const SourceKind = {
  FILE: 'FILE',
  DOCUMENT: 'DOCUMENT',
} as const
export type SourceKind = (typeof SourceKind)[keyof typeof SourceKind]

export interface SourceColumnSummary {
  key: string
  kind: 'identifier' | 'number' | 'date' | 'age' | 'boolean' | 'category' | 'excluded'
  /** Why the column was replaced or dropped. */
  reason?: string
  lowConfidence: string[]
}

export interface FileSourceSummary {
  rows: number
  columns: SourceColumnSummary[]
}

export interface DocumentSourceSummary {
  analysisId: string
  framework: Framework
  method: DeidMethod
  requiresReview: boolean | undefined
  identifiersReplaced: number
  lowConfidenceSlots: number
  excludedEntities: number
}

interface SourceBase {
  id: string
  language: Language
  createdAt: IsoDate
  expiresAt: IsoDate
}

export type Source =
  | (SourceBase & { kind: 'FILE'; summary: FileSourceSummary })
  | (SourceBase & { kind: 'DOCUMENT'; summary: DocumentSourceSummary })

export interface SourceFromAnalysisRequest {
  analysisId: string
  text: string
  entities: EntityState[]
}

// ---------- Contact ----------

/** Backend limits for the landing page contact form (after trimming). */
export const CONTACT_LIMITS = {
  firstName: 100,
  lastName: 100,
  company: 200,
  email: 254,
  message: 5000,
} as const

export interface ContactMessageRequest {
  firstName: string
  lastName: string
  company?: string
  email: string
  message?: string
  /**
   * Honeypot: render as a hidden input and leave empty. A filled value makes
   * the backend drop the message while still answering 202.
   */
  website?: string
}

// ---------- Activity / dashboard ----------

export const AuditAction = {
  LOGIN: 'auth.login',
  LOGOUT: 'auth.logout',
  REFRESH_TOKEN_REUSE: 'auth.refresh_token_reuse',
  ANALYSIS_CREATED: 'analysis.created',
  TEXT_EXTRACTED: 'document.text_extracted',
  SOURCE_CREATED: 'synthetic.source_created',
  DATASET_CREATED: 'synthetic.dataset_created',
  DATASET_DOWNLOADED: 'synthetic.dataset_downloaded',
} as const
export type AuditAction = (typeof AuditAction)[keyof typeof AuditAction]

export interface ActivityEvent {
  id: string
  action: AuditAction
  resourceId: string | null
  metadata: Record<string, string | number | boolean | null>
  createdAt: IsoDate
}

export interface ListActivityParams {
  /** 1–100, default 20. */
  limit?: number
  /** Cursor: `createdAt` of the last event from the previous page. */
  before?: IsoDate
}

/** Without `from` totals cover all time and the chart the last 7 days. */
export interface DashboardParams {
  from?: IsoDate
  to?: IsoDate
  framework?: Framework
  /** IANA zone the chart's days are counted in. */
  tz?: string
}

/** One past analysis: settings and counts only, the server keeps no text. */
export interface AnalysisSummary {
  id: string
  createdAt: IsoDate
  framework: Framework
  method: DeidMethod
  riskLevel: RiskLevel | null
  language: Language
  characters: number
  detected: number
  /** Entities still anonymized after review. */
  processed: number
}

export interface ListAnalysesParams {
  /** 1–100, default 20. */
  limit?: number
  /** Cursor: `createdAt` of the last analysis from the previous page. */
  before?: IsoDate
  framework?: Framework
}

export interface Dashboard {
  analyses: {
    count: number
    entitiesDetected: number
    entitiesProcessed: number
    /** processed / detected; null without detected entities. */
    anonymizationRate: number | null
  }
  datasets: { count: number; recordsGenerated: number; active: number }
  /** One point per day of the period, empty days included. */
  activity: { date: string; documents: number; entities: number }[]
  frameworks: { framework: Framework; count: number }[]
  /** Every entity type, largest first; unknown detector types by their own name. */
  entityTypes: { type: EntityType | string; count: number }[]
  /** Detected entities per method, every method listed. */
  methods: { method: EntityMethod; count: number }[]
  /** Latest 5, filtered by framework but not by period. */
  recentAnalyses: AnalysisSummary[]
  recentActivity: ActivityEvent[]
}
