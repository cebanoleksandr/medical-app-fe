import { useOutletContext } from 'react-router-dom'
import type { Analysis, CreateAnalysisRequest } from '../../../api/types'

export type InputMode = 'text' | 'file'

/** A file whose text the server has extracted; the file itself isn't kept. */
export interface UploadedFile {
  name: string
  size: number
  text: string
}

/**
 * What the wizard has collected so far. Kept in memory by DraftProvider (AppLayout)
 * only: the text is patient data, so it isn't written to browser storage.
 *
 * `text` is what gets analysed: the pasted text or the uploaded file's text,
 * whichever input is active, and only once it is valid.
 */
export type DeIdentifyDraft = Partial<CreateAnalysisRequest> & {
  inputMode?: InputMode
  pastedText?: string
  upload?: UploadedFile | null
  /** Result of "Analyze"; any other change to the draft discards it. */
  analysis?: Analysis
}

/** Fields to merge, or a function of the current draft returning them. */
export type DraftPatch = DeIdentifyDraft | ((draft: DeIdentifyDraft) => DeIdentifyDraft)

export interface DeIdentifyContext {
  /** Where StepFooter renders; null until the layout has mounted. */
  footerSlot: HTMLElement | null
  stepIndex: number
  draft: DeIdentifyDraft
  /** Merges `patch` into the draft. */
  updateDraft: (patch: DraftPatch) => void
  /** Clears everything, for a new analysis. */
  resetDraft: () => void
}

/** Wizard state for the step pages under DeIdentifyLayout. */
export function useDeIdentify() {
  return useOutletContext<DeIdentifyContext>()
}
