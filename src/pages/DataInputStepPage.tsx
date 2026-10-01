import { useState } from 'react'
import { styled } from '@mui/material/styles'
import { AnimatePresence, motion } from 'framer-motion'
import type { ApiError } from '../api/errors'
import { FileDropZone, type DropZoneState } from '../components/de-identify/FileDropZone'
import { InputModeTabs } from '../components/de-identify/InputModeTabs'
import { PastedTextInput } from '../components/de-identify/PastedTextInput'
import { checkFile, isValidPastedText, type UploadProblem } from '../components/de-identify/dataInput'
import { StepFooter } from '../components/layouts/de-identify/StepFooter'
import {
  useDeIdentify,
  type DeIdentifyDraft,
  type InputMode,
} from '../components/layouts/de-identify/context'
import { useExtractText } from '../hooks'
import { colors, typography } from '../theme'

const NARROW = '@media (max-width: 720px)'

const Root = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  padding: '24px 48px 40px',
  [NARROW]: { padding: '24px 16px 32px' },
})

const Header = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
  '& h2': { ...typography.h3, margin: 0, color: colors.neutral[900] },
  '& p': { ...typography.bodyM, margin: 0, color: colors.neutral[500] },
})

const Tabs = styled('div')({ paddingTop: 48, paddingBottom: 16, [NARROW]: { paddingTop: 32 } })

const panelMotion = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.2 },
} as const

/** The text that will be analysed, or undefined while the active input isn't usable. */
function activeText(draft: DeIdentifyDraft) {
  if (draft.inputMode === 'file') return draft.upload?.text
  const pasted = draft.pastedText ?? ''
  return isValidPastedText(pasted) ? pasted : undefined
}

function describeUploadError(error: ApiError): UploadProblem {
  if (error.isRateLimited) {
    return {
      title: 'Too many uploads',
      message: 'Please wait a minute and try again',
      note: 'Upload limit reached',
    }
  }
  if (error.isNetworkError || error.status >= 500) {
    return {
      title: 'Upload failed',
      message: error.isNetworkError
        ? "Couldn't reach the server. Check your connection"
        : 'Something went wrong on our side. Please try again',
      note: 'The file was not uploaded',
    }
  }
  // 422 from text extraction: unreadable, scanned, too long, not UTF-8.
  return { title: "Couldn't read the file", message: error.message, note: 'Try a different file' }
}

const DataInputStepPage = () => {
  const { draft, updateDraft } = useDeIdentify()
  const extract = useExtractText()
  const [problem, setProblem] = useState<UploadProblem | null>(null)
  const [readingName, setReadingName] = useState<string | null>(null)
  const mode: InputMode = draft.inputMode ?? 'text'

  // Functional, so a file finishing after a tab switch sees the current draft.
  const update = (patch: DeIdentifyDraft) => {
    updateDraft((current) => ({ ...patch, text: activeText({ ...current, ...patch }) }))
  }

  const upload = (file: File) => {
    const invalid = checkFile(file)
    setProblem(invalid)
    if (invalid) {
      extract.reset()
      setReadingName(null)
      update({ upload: null })
      return
    }
    setReadingName(file.name)
    extract.mutate(file, {
      onSuccess: ({ text }) => update({ upload: { name: file.name, size: file.size, text } }),
      onError: (error) => {
        setProblem(describeUploadError(error))
        update({ upload: null })
      },
      onSettled: () => setReadingName(null),
    })
  }

  const removeFile = () => {
    setProblem(null)
    update({ upload: null })
  }

  const dropZoneState: DropZoneState = readingName
    ? { status: 'reading', name: readingName }
    : problem
      ? { status: 'error', problem }
      : draft.upload
        ? { status: 'ready', file: draft.upload }
        : { status: 'idle' }

  return (
    <Root>
      <Header>
        <h2>Enter Your Data</h2>
        <p>Paste text or upload a file to anonymize</p>
      </Header>

      <Tabs>
        <InputModeTabs
          idPrefix="data-input"
          value={mode}
          onChange={(inputMode) => update({ inputMode })}
        />
      </Tabs>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={mode}
          role="tabpanel"
          id={`data-input-${mode}-panel`}
          aria-labelledby={`data-input-${mode}`}
          {...panelMotion}
        >
          {mode === 'text' ? (
            <PastedTextInput
              defaultValue={draft.pastedText ?? ''}
              onChange={(pastedText) => update({ pastedText })}
            />
          ) : (
            <FileDropZone state={dropZoneState} onFile={upload} onRemove={removeFile} />
          )}
        </motion.div>
      </AnimatePresence>

      <StepFooter continueDisabled={!draft.text || Boolean(readingName)} />
    </Root>
  )
}

export default DataInputStepPage;
