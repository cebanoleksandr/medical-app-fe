import type { IdentifierKey, MethodOption } from '../../api/types'

/**
 * How the identifier picker groups and names identifiers. The backend sends
 * long legal labels ("Telephone numbers"); the design uses short ones.
 */
const GROUPS: { title: string; items: Partial<Record<IdentifierKey, string>> }[] = [
  { title: 'Personal Information', items: { names: 'Names', dates: 'Dates' } },
  { title: 'Contact Information', items: { fax: 'Fax', email: 'Email', phone: 'Phone' } },
  { title: 'Location Data', items: { geographic: 'Address & geographic data' } },
  { title: 'Financial Information', items: { ssn: 'SSN', account: 'Account number' } },
  { title: 'Medical Identifiers', items: { mrn: 'Medical record', health_plan: 'Health plan' } },
  { title: 'Technical Identifiers', items: { ip: 'IP address', device: 'Device ID', url: 'URL' } },
  {
    title: 'Biometric & Unique',
    items: {
      biometric: 'Fingerprints',
      photo: 'Face photos',
      vehicle: 'Vehicle ID',
      license: 'Certificate',
      other: 'Other unique IDs',
    },
  },
  {
    title: 'Context',
    items: { organization: 'Organizations', special_category: 'Nationality, religion, politics' },
  },
]

export interface IdentifierGroup {
  title: string
  items: { key: IdentifierKey; label: string }[]
}

/** The method's identifiers in display groups; unknown keys go to "Other". */
export function groupIdentifiers(identifiers: MethodOption['identifiers']): IdentifierGroup[] {
  const available = new Map(identifiers.map((item) => [item.key, item.label]))
  const grouped = new Set<IdentifierKey>()
  const groups: IdentifierGroup[] = GROUPS.map(({ title, items }) => ({
    title,
    items: (Object.entries(items) as [IdentifierKey, string][])
      .filter(([key]) => available.has(key))
      .map(([key, label]) => {
        grouped.add(key)
        return { key, label }
      }),
  }))
  // Anything the backend adds later still shows up, with its own label.
  groups.push({
    title: 'Other',
    items: identifiers.filter((item) => !grouped.has(item.key)),
  })
  return groups.filter((group) => group.items.length > 0)
}
