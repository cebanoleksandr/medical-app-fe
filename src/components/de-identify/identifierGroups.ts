import type { IdentifierKey, MethodOption } from '../../api/types'

/**
 * How the identifier picker groups identifiers. The backend sends long legal
 * labels ("Telephone numbers"); the design uses short ones, which are
 * `deIdentify:identifierPicker.short.<key>`. Group titles are
 * `deIdentify:identifierPicker.groups.<id>`.
 */
const GROUPS = [
  { id: 'personal', items: ['names', 'dates'] },
  { id: 'contact', items: ['fax', 'email', 'phone'] },
  { id: 'location', items: ['geographic'] },
  { id: 'financial', items: ['ssn', 'account'] },
  { id: 'medical', items: ['mrn', 'health_plan'] },
  { id: 'technical', items: ['ip', 'device', 'url'] },
  { id: 'biometric', items: ['biometric', 'photo', 'vehicle', 'license', 'other'] },
  { id: 'context', items: ['organization', 'special_category'] },
] as const satisfies { id: string; items: IdentifierKey[] }[]

export type IdentifierGroupId = (typeof GROUPS)[number]['id'] | 'other'

export interface IdentifierGroup {
  id: IdentifierGroupId
  /** `label` is the server's, for keys this list doesn't know yet. */
  items: { key: IdentifierKey; label?: string }[]
}

/** The method's identifiers in display groups; unknown keys go to "Other". */
export function groupIdentifiers(identifiers: MethodOption['identifiers']): IdentifierGroup[] {
  const available = new Set(identifiers.map((item) => item.key))
  const grouped = new Set<IdentifierKey>()
  const groups: IdentifierGroup[] = GROUPS.map(({ id, items }) => ({
    id,
    items: items
      .filter((key) => available.has(key))
      .map((key) => {
        grouped.add(key)
        return { key }
      }),
  }))
  // Anything the backend adds later still shows up, with its own label.
  groups.push({ id: 'other', items: identifiers.filter((item) => !grouped.has(item.key)) })
  return groups.filter((group) => group.items.length > 0)
}
