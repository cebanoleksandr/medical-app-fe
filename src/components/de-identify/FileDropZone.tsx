import { useRef, useState, type DragEvent } from 'react'
import CircularProgress from '@mui/material/CircularProgress'
import { styled } from '@mui/material/styles'
import closeIcon from '../../assets/data-input/close.svg'
import errorIcon from '../../assets/data-input/error.svg'
import successIcon from '../../assets/data-input/success.svg'
import uploadIcon from '../../assets/data-input/upload.svg'
import { colors, shadows, typography } from '../../theme'
import type { UploadedFile } from '../layouts/de-identify/context'
import { Button, MaskIcon } from '../ui'
import {
  UPLOAD_ACCEPT,
  fileKind,
  formatCount,
  formatFileSize,
  type UploadProblem,
} from './dataInput'

export type DropZoneState =
  | { status: 'idle' }
  | { status: 'reading'; name: string }
  | { status: 'ready'; file: UploadedFile }
  | { status: 'error'; problem: UploadProblem }

export interface FileDropZoneProps {
  state: DropZoneState
  onFile: (file: File) => void
  onRemove: () => void
}

type Look = DropZoneState['status'] | 'dragging'

const Root = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
  width: 720,
  maxWidth: '100%',
  marginInline: 'auto',
})

const Zone = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: 349,
  padding: 40,
  border: `2px dashed ${colors.neutral[300]}`,
  borderRadius: 12,
  backgroundColor: colors.white,
  textAlign: 'center',
  transition: 'border-color 150ms, background-color 150ms, box-shadow 150ms',
  '&[data-look="dragging"]': {
    borderColor: colors.accent[400],
    backgroundColor: 'rgba(224, 247, 244, 0.2)',
    boxShadow: shadows.md,
  },
  '&[data-look="ready"]': {
    borderStyle: 'solid',
    borderColor: 'rgba(22, 163, 74, 0.6)',
    backgroundColor: 'rgba(22, 163, 74, 0.02)',
  },
  '&[data-look="error"]': {
    borderStyle: 'solid',
    borderColor: 'rgba(220, 38, 38, 0.3)',
    backgroundColor: 'rgba(220, 38, 38, 0.02)',
  },
  '@media (max-width: 720px)': { height: 'auto', minHeight: 349, padding: '24px 16px' },
})

const Content = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 16,
  width: '100%',
  padding: 32,
  '&[data-gap="wide"]': { gap: 32 },
  '@media (max-width: 720px)': { padding: 0 },
})

const Group = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 16,
})

const BigIcon = styled(MaskIcon)({ fontSize: 56 })

const Heading = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 8,
  '& h3': {
    margin: 0,
    fontSize: 24,
    lineHeight: '32px',
    fontWeight: 500,
    color: 'inherit',
  },
  '& p': { ...typography.bodyL, margin: 0 },
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
})

const Helper = styled('p')({
  ...typography.bodyS,
  margin: 0,
  color: colors.neutral[400],
})

const FileRow = styled('div')({
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'center',
  gap: 16,
  maxWidth: '100%',
})

const FileInfo = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 4,
  minWidth: 0,
  '& strong': {
    ...typography.bodyL,
    maxWidth: '100%',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    color: colors.neutral[900],
  },
  '& span': { ...typography.bodyS, color: colors.neutral[500] },
})

const RemoveButton = styled('button')({
  display: 'flex',
  flexShrink: 0,
  padding: 0,
  border: 0,
  borderRadius: 4,
  background: 'none',
  color: colors.neutral[500],
  fontSize: 24,
  cursor: 'pointer',
  '&:hover': { color: colors.neutral[900] },
  '&:focus-visible': { outline: `2px solid ${colors.accent[400]}`, outlineOffset: 2 },
})

const Note = styled('p')({
  ...typography.bodyS,
  minHeight: 16,
  margin: 0,
  padding: '0 16px',
  textAlign: 'right',
  color: colors.neutral[400],
  '&[data-invalid]': { color: colors.error },
})

const ButtonIcon = styled(MaskIcon)({ fontSize: 24 })

/**
 * "Upload File" panel: drop a file or browse for one. The parent reads the
 * file and passes the outcome back in `state`.
 */
export function FileDropZone({ state, onFile, onRemove }: FileDropZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const reading = state.status === 'reading'
  const look: Look = dragging ? 'dragging' : state.status

  const browse = () => inputRef.current?.click()

  const onDragOver = (event: DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = reading ? 'none' : 'copy'
    if (!reading) setDragging(true)
  }

  const onDragLeave = (event: DragEvent) => {
    // Leaving for a child element isn't leaving the zone.
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDragging(false)
  }

  const onDrop = (event: DragEvent) => {
    event.preventDefault()
    setDragging(false)
    const file = event.dataTransfer.files[0]
    if (file && !reading) onFile(file)
  }

  const replaceButton = (
    <Button
      variant="primary"
      size="medium"
      startIcon={<ButtonIcon src={uploadIcon} />}
      onClick={browse}
    >
      Replace file
    </Button>
  )

  let content
  if (look === 'dragging') {
    content = (
      <Content>
        <BigIcon src={uploadIcon} sx={{ color: colors.accent[500] }} />
        <Heading sx={{ color: colors.accent[500] }}>
          <h3>Upload your file</h3>
          <p>Drag &amp; drop</p>
        </Heading>
      </Content>
    )
  } else if (state.status === 'reading') {
    content = (
      <Content>
        <CircularProgress size={48} thickness={3} sx={{ color: colors.accent[400] }} />
        <Heading sx={{ color: colors.neutral[700] }}>
          <h3>Reading your file…</h3>
          <p>{state.name}</p>
        </Heading>
      </Content>
    )
  } else if (state.status === 'ready') {
    const { file } = state
    content = (
      <Content data-gap="wide">
        <Group>
          <BigIcon src={successIcon} sx={{ color: colors.success }} />
          <FileRow>
            <FileInfo>
              <strong title={file.name}>{file.name}</strong>
              <span>
                {formatFileSize(file.size)} · {fileKind(file.name)}
              </span>
            </FileInfo>
            <RemoveButton type="button" aria-label={`Remove ${file.name}`} onClick={onRemove}>
              <MaskIcon src={closeIcon} />
            </RemoveButton>
          </FileRow>
        </Group>
        {replaceButton}
      </Content>
    )
  } else if (state.status === 'error') {
    content = (
      <Content data-gap="wide">
        <Group>
          <BigIcon src={errorIcon} sx={{ color: colors.error }} />
          <Heading>
            <h3 style={{ color: colors.error }}>{state.problem.title}</h3>
            <p style={{ color: colors.neutral[900] }}>{state.problem.message}</p>
          </Heading>
        </Group>
        {replaceButton}
      </Content>
    )
  } else {
    content = (
      <Content>
        <BigIcon src={uploadIcon} sx={{ color: colors.neutral[900] }} />
        <Heading>
          <h3 style={{ color: colors.neutral[700] }}>Upload your file</h3>
          <p style={{ color: colors.neutral[500] }}>Drag &amp; drop</p>
        </Heading>
        <Divider>or</Divider>
        <Group sx={{ gap: '12px' }}>
          <Button variant="primary" size="medium" onClick={browse}>
            Browse file
          </Button>
          <Helper>Supported formats: .txt, .pdf, .docx — max 5 MB</Helper>
        </Group>
      </Content>
    )
  }

  const note =
    state.status === 'error'
      ? state.problem.note
      : state.status === 'ready'
        ? `${formatCount(state.file.text.length)} characters extracted`
        : state.status === 'idle'
          ? 'Upload a file to continue'
          : ''

  return (
    <Root>
      <Zone
        data-look={look}
        aria-busy={reading}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        {content}
      </Zone>
      <Note role="status" data-invalid={state.status === 'error' ? '' : undefined}>
        {note}
      </Note>
      <input
        ref={inputRef}
        type="file"
        accept={UPLOAD_ACCEPT}
        hidden
        onChange={(event) => {
          const file = event.target.files?.[0]
          // Cleared so picking the same file again still fires onChange.
          event.target.value = ''
          if (file) onFile(file)
        }}
      />
    </Root>
  )
}
