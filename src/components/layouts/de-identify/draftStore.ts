import { createContext, useContext } from 'react'
import type { DeIdentifyDraft, DraftPatch } from './context'
import { DE_IDENTIFY_BASE } from './steps'

/** The de-identify wizard's draft, kept by AppLayout so leaving the wizard keeps it. */
export interface DraftStore {
  draft: DeIdentifyDraft
  /** Merges `patch` into the draft; any change other than `analysis` drops the analysis. */
  updateDraft: (patch: DraftPatch) => void
  /** Clears everything, for a new analysis. */
  resetDraft: () => void
}

export const DraftContext = createContext<DraftStore | null>(null)

export function useDraftStore(): DraftStore {
  const store = useContext(DraftContext)
  if (!store) throw new Error('useDraftStore must be used inside DraftProvider')
  return store
}

/** The furthest step the draft can open: where the wizard resumes. */
export function resumeUrl(draft: DeIdentifyDraft) {
  const step = draft.analysis
    ? 'review'
    : draft.text
      ? 'configuration'
      : draft.framework
        ? 'input'
        : 'compliance'
  return `${DE_IDENTIFY_BASE}/${step}`
}
