import { useRef, useState, type DragEvent } from 'react'
import CircularProgress from '@mui/material/CircularProgress'
import { styled } from '@mui/material/styles'
import closeIcon from '../../assets/data-input/close.svg'
import errorIcon from '../../assets/synthetic/error.svg'
import uploadIcon from '../../assets/synthetic/upload.svg'
import { colors, typography } from '../../theme'
import { fileKind, formatFileSize } from '../de-identify/dataInput'
import { Button, MaskIcon } from '../ui'
import { SOURCE_ACCEPT, type SourceFileProblem } from './generationSettings'

export type SourceDropZoneState =
  | { status: 'idle' }
  | { status: 'uploading'; name: string }
  | { status: 'ready'; name: string; size: number }
  | { status: 'error'; problem: SourceFileProblem }

export interface SourceDropZoneProps {
  state: SourceDropZoneState
  onFile: (file: File) => void
  onRemove: () => void
}

type Look = SourceDropZoneState['status'] | 'dragging'

const Zone = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: 140,
  padding: 16,
  border: `2px dashed ${colors.neutral[300]}`,
  borderRadius: 12,
  backgroundColor: colors.neutral[50],
  textAlign: 'center',
  transition: 'border-color 150ms, background-color 150ms',
  // The other looks have a 1px border; padding keeps the content in place.
  '&:not([data-look="idle"])': { borderWidth: 1, padding: 17 },
  '&[data-look="dragging"]': {
    borderColor: colors.accent[400],
    backgroundColor: 'rgba(224, 247, 244, 0.2)',
  },
  '&[data-look="ready"]': {
    borderStyle: 'solid',
    borderColor: 'rgba(22, 163, 74, 0.6)',
    backgroundColor: 'rgba(22, 163, 74, 0.02)',
  },
  '&[data-look="error"]': {
    borderStyle: 'solid',
    borderColor: colors.error,
    backgroundColor: 'rgba(220, 38, 38, 0.08)',
  },
  '&[data-look="uploading"]': { borderStyle: 'solid', borderColor: colors.neutral[200] },
})

const Content = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 8,
  width: '100%',
  minWidth: 0,
})

const Row = styled('div')({
  ...typography.bodyS,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
  color: colors.neutral[500],
  '& > span:first-of-type': { fontSize: 24 },
})

const Divider = styled('div')({
  ...typography.bodyS,
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  width: '100%',
  color: colors.neutral[400],
  '&::before, &::after': {
    content: '""',
    flex: 1,
    height: 1,
    backgroundColor: colors.neutral[100],
  },
  '&[data-plain]': {
    '&::before': { backgroundColor: colors.neutral[200] },
    '&::after': { display: 'none' },
  },
})

const Helper = styled('p')({
  ...typography.bodyS,
  maxWidth: '100%',
  margin: 0,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  color: colors.neutral[400],
})

// Ghost button in the design's darkest navy.
const ZoneButton = styled(Button)({ color: colors.primary[800] })

const FileRow = styled('div')({
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'center',
  gap: 16,
  maxWidth: '100%',
  padding: 8,
})

const FileInfo = styled('div')({
  ...typography.bodyS,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 4,
  minWidth: 0,
  color: colors.neutral[500],
  '& strong': {
    maxWidth: '100%',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontWeight: 400,
    color: colors.neutral[900],
  },
})

const RemoveButton = styled('button')({
  display: 'flex',
  flexShrink: 0,
  padding: 0,
  border: 0,
  borderRadius: 999,
  background: 'none',
  color: colors.neutral[500],
  fontSize: 24,
  cursor: 'pointer',
  '&:hover': { color: colors.neutral[900] },
  '&:focus-visible': { outline: `2px solid ${colors.accent[400]}`, outlineOffset: 2 },
})

const Problem = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 4,
  '& > span': { fontSize: 16, color: colors.error },
  '& strong': { ...typography.labelM, color: colors.error },
  '& p': { ...typography.bodyS, margin: 0, color: colors.neutral[900] },
})

/** "Upload your file": a compact drop zone for .xlsx, .csv and .json sources. */
export function SourceDropZone({ state, onFile, onRemove }: SourceDropZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const busy = state.status === 'uploading'
  const look: Look = dragging ? 'dragging' : state.status

  const browse = () => inputRef.current?.click()

  const onDragOver = (event: DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = busy ? 'none' : 'copy'
    if (!busy) setDragging(true)
  }

  const onDragLeave = (event: DragEvent) => {
    // Leaving for a child element isn't leaving the zone.
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDragging(false)
  }

  const onDrop = (event: DragEvent) => {
    event.preventDefault()
    setDragging(false)
    const file = event.dataTransfer.files[0]
    if (file && !busy) onFile(file)
  }

  const replaceButton = (
    <ZoneButton variant="ghostSecondary" size="medium" onClick={browse}>
      Replace file
    </ZoneButton>
  )

  let content
  if (look === 'dragging') {
    content = (
      <Row sx={{ color: colors.accent[500] }}>
        <MaskIcon src={uploadIcon} aria-hidden />
        Drag &amp; drop
      </Row>
    )
  } else if (state.status === 'uploading') {
    content = (
      <Content>
        <CircularProgress size={24} thickness={4} sx={{ color: colors.accent[400] }} />
        <FileInfo>
          <strong title={state.name}>{state.name}</strong>
          Reading columns…
        </FileInfo>
      </Content>
    )
  } else if (state.status === 'ready') {
    content = (
      <Content sx={{ height: '100%', justifyContent: 'space-between' }}>
        <FileRow>
          <FileInfo>
            <strong title={state.name}>{state.name}</strong>
            {formatFileSize(state.size)} · {fileKind(state.name)}
          </FileInfo>
          <RemoveButton type="button" aria-label={`Remove ${state.name}`} onClick={onRemove}>
            <MaskIcon src={closeIcon} />
          </RemoveButton>
        </FileRow>
        <Divider data-plain aria-hidden />
        {replaceButton}
      </Content>
    )
  } else if (state.status === 'error') {
    content = (
      <Content sx={{ gap: '16px', padding: '8px' }}>
        <Problem role="alert">
          <MaskIcon src={errorIcon} aria-hidden />
          <strong>{state.problem.title}</strong>
          <p>{state.problem.message}</p>
        </Problem>
        {replaceButton}
      </Content>
    )
  } else {
    content = (
      <Content>
        <Row>
          <MaskIcon src={uploadIcon} aria-hidden />
          Drag &amp; drop
        </Row>
        <Divider>or</Divider>
        <Content sx={{ gap: 0 }}>
          <ZoneButton variant="ghostSecondary" size="medium" onClick={browse}>
            Browse file
          </ZoneButton>
          <Helper>Supported formats: .xlsx, .csv, .json — max 5 MB</Helper>
        </Content>
      </Content>
    )
  }

  return (
    <>
      <Zone
        data-look={look}
        aria-busy={busy}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        {content}
      </Zone>
      <input
        ref={inputRef}
        type="file"
        accept={SOURCE_ACCEPT}
        hidden
        aria-label="Upload your file"
        onChange={(event) => {
          const file = event.target.files?.[0]
          // Cleared so picking the same file again still fires onChange.
          event.target.value = ''
          if (file) onFile(file)
        }}
      />
    </>
  )
}
