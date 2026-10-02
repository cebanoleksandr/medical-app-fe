import { useCallback, useMemo, useState, type ReactNode } from 'react'
import type { DeIdentifyDraft, DraftPatch } from './context'
import { DraftContext, type DraftStore } from './draftStore'

/**
 * Holds the de-identify draft for the signed-in app. Memory only: the text
 * is patient data, so it is never written to browser storage or the server.
 * Sign-out unmounts AppLayout, which drops it.
 */
export function DraftProvider({ children }: { children: ReactNode }) {
  const [draft, setDraft] = useState<DeIdentifyDraft>({})
  const updateDraft = useCallback(
    (patch: DraftPatch) =>
      setDraft((prev) => {
        const changes = typeof patch === 'function' ? patch(prev) : patch
        // An analysis only matches the settings it was run with.
        return { ...prev, ...changes, analysis: changes.analysis }
      }),
    [],
  )
  const resetDraft = useCallback(() => setDraft({}), [])
  const store = useMemo<DraftStore>(
    () => ({ draft, updateDraft, resetDraft }),
    [draft, updateDraft, resetDraft],
  )

  return <DraftContext.Provider value={store}>{children}</DraftContext.Provider>
}
