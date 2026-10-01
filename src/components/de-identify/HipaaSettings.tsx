import type { ReactNode } from 'react'
import LabelOutlinedIcon from '@mui/icons-material/LabelOutlined'
import PasswordOutlinedIcon from '@mui/icons-material/PasswordOutlined'
import ShuffleOutlinedIcon from '@mui/icons-material/ShuffleOutlined'
import { styled } from '@mui/material/styles'
import type {
  AnalysisOptions,
  DeidMethod,
  FrameworkOption,
  Language,
  MethodOption,
  OutputMode,
  Sensitivity,
} from '../../api/types'
import hideSourceIcon from '../../assets/configuration/hide-source.svg'
import languageIcon from '../../assets/configuration/language.svg'
import warningIcon from '../../assets/configuration/warning.svg'
import { colors, typography } from '../../theme'
import type { DeIdentifyDraft, DraftPatch } from '../layouts/de-identify/context'
import { Dropdown, MaskIcon, type DropdownOption } from '../ui'
import { Banner, Cards, Description, NARROW, Rail, Section, Stack } from './configStyles'
import { IdentifierPicker } from './IdentifierPicker'
import { LANGUAGE_NAMES } from './languages'
import { OptionCard } from './OptionCard'

export interface HipaaSettingsProps {
  framework: FrameworkOption
  options: AnalysisOptions
  draft: DeIdentifyDraft
  updateDraft: (patch: DraftPatch) => void
}

const CardText = styled('span')({ ...typography.bodyL, color: colors.neutral[700] })
const CardHint = styled('span')({ ...typography.bodyM, color: colors.neutral[500] })
const CardNote = styled('span')({ ...typography.labelM, color: colors.neutral[500] })

const ReviewNote = styled('span')({
  ...typography.bodyM,
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  color: colors.warning,
  '& > span': { fontSize: 14 },
})

const Dropdowns = styled('div')({
  display: 'flex',
  gap: 16,
  '& > :first-of-type': { flex: 1, minWidth: 0 },
  '& > :last-of-type': { flex: '0 0 367px' },
  [NARROW]: { flexDirection: 'column', '& > :last-of-type': { flex: 'none' } },
})

const SensitivityHelp = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
  marginTop: -12,
  '& strong': { ...typography.bodyL, color: colors.neutral[700] },
  '& span': { ...typography.bodyS, color: colors.neutral[500] },
})

const OUTPUT_ICONS: Record<OutputMode, ReactNode> = {
  REDACT: <MaskIcon src={hideSourceIcon} />,
  MASK: <PasswordOutlinedIcon />,
  PLACEHOLDER: <LabelOutlinedIcon />,
  PSEUDONYMIZE: <ShuffleOutlinedIcon />,
}

const SENSITIVITY: Record<Sensitivity, { title: string; note: string; help: [string, string] }> = {
  CONSERVATIVE: {
    title: 'Conservative',
    note: 'Fewer false alerts',
    help: [
      'Conservative flags only confident matches.',
      'Fewer false positives, but some identifiers may be missed.',
    ],
  },
  BALANCED: {
    title: 'Balanced',
    note: 'Recommended for most documents',
    help: [
      'Balanced is recommended for most documents.',
      'Detects most sensitive entities while keeping false positives manageable.',
    ],
  },
  AGGRESSIVE: {
    title: 'Aggressive',
    note: 'Catches potentially sensitive data',
    help: [
      'Aggressive flags anything that might be sensitive.',
      'Misses the least, but expect more false positives to review.',
    ],
  },
}

/** Second line of a method card that needs no review. */
function methodHint(method: DeidMethod, frameworkName: string) {
  return method === 'SAFE_HARBOR'
    ? `Best for standard ${frameworkName} workflows`
    : 'Best for sharing data outside your organisation'
}

/** HIPAA: method, identifiers and output settings. */
export function HipaaSettings({ framework, options, draft, updateDraft }: HipaaSettingsProps) {
  const method = framework.methods.find((item) => item.id === draft.method)
  const identifiers = draft.identifiers ?? []
  const identifiersReady = method && (!method.customizable || identifiers.length > 0)

  const selectMethod = (next: MethodOption) => {
    // Customizable methods start with nothing ticked, as the design says.
    updateDraft({ method: next.id, identifiers: next.customizable ? [] : undefined })
  }

  const outputOptions: DropdownOption<OutputMode>[] = options.outputModes.map((mode) => ({
    value: mode.id,
    label: mode.name,
    description: mode.description,
    icon: OUTPUT_ICONS[mode.id],
  }))
  const languageOptions: DropdownOption<Language>[] = options.languages.map((code) => ({
    value: code,
    label: LANGUAGE_NAMES[code] ?? code,
    icon: <MaskIcon src={languageIcon} />,
  }))
  const sensitivityHelp = SENSITIVITY[draft.sensitivity ?? 'BALANCED'].help

  return (
    <>
      <Section aria-labelledby="method-heading">
        <h3 id="method-heading">1. Choose Method</h3>
        <Rail>
          <Cards role="radiogroup" aria-labelledby="method-heading">
            {framework.methods.map((item) => (
              <OptionCard
                key={item.id}
                name="method"
                value={item.id}
                title={item.name}
                badge={item.recommended ? 'Recommended' : undefined}
                checked={item.id === draft.method}
                onChange={() => selectMethod(item)}
              >
                <CardText>{item.description}</CardText>
                {item.requiresReview ? (
                  <ReviewNote>
                    <MaskIcon src={warningIcon} aria-hidden />
                    Requires expert review before use
                  </ReviewNote>
                ) : (
                  <CardHint>{methodHint(item.id, framework.name)}</CardHint>
                )}
              </OptionCard>
            ))}
          </Cards>
        </Rail>
      </Section>

      {method?.requiresReview && (
        <Banner role="note">
          <MaskIcon src={warningIcon} aria-hidden />
          <div>
            <strong>Expert review required</strong>
            <p>Results must be validated by a qualified statistician before use in production</p>
          </div>
        </Banner>
      )}

      <Section aria-labelledby="identifiers-heading" data-locked={!method || undefined}>
        <h3 id="identifiers-heading">2. Applied Identifiers</h3>
        {method && (
          <Rail>
            <Stack>
              <Description>
                <strong>
                  {method.customizable
                    ? 'Choose which identifiers to remove from your document.'
                    : 'These identifiers are removed from your document.'}
                </strong>
                <span>
                  {method.customizable
                    ? 'All categories are deselected by default'
                    : 'Switch to a customizable method to pick them yourself'}
                </span>
              </Description>
              <IdentifierPicker
                key={method.id}
                method={method}
                value={identifiers}
                onChange={(next) => updateDraft({ identifiers: next })}
              />
            </Stack>
          </Rail>
        )}
      </Section>

      <Section aria-labelledby="output-heading" data-locked={!identifiersReady || undefined}>
        <h3 id="output-heading">3. Output Settings</h3>
        {identifiersReady && (
          <Rail>
            <Stack sx={{ gap: '32px' }}>
              <Stack>
                <Description>
                  <strong>De-Identification Settings</strong>
                  <span>Configure how to handle sensitive information</span>
                </Description>
                <Dropdowns>
                  <Dropdown
                    options={outputOptions}
                    value={draft.outputMode ?? 'REDACT'}
                    onChange={(next) => updateDraft({ outputMode: next })}
                    aria-label="Output mode"
                  />
                  <Dropdown
                    options={languageOptions}
                    value={draft.language ?? 'en'}
                    onChange={(next) => updateDraft({ language: next })}
                    aria-label="Document language"
                  />
                </Dropdowns>
              </Stack>

              <Stack>
                <Description>
                  <strong id="sensitivity-heading">Detection sensitivity</strong>
                  <span>Controls how carefully the system detects sensitive data.</span>
                </Description>
                <Cards role="radiogroup" aria-labelledby="sensitivity-heading" data-size="small">
                  {options.sensitivities.map((level) => (
                    <OptionCard
                      key={level}
                      compact
                      name="sensitivity"
                      value={level}
                      title={SENSITIVITY[level].title}
                      badge={level === 'BALANCED' ? 'Recommended' : undefined}
                      checked={draft.sensitivity === level}
                      onChange={() => updateDraft({ sensitivity: level })}
                    >
                      <CardNote>{SENSITIVITY[level].note}</CardNote>
                    </OptionCard>
                  ))}
                </Cards>
                <SensitivityHelp aria-live="polite">
                  <strong>{sensitivityHelp[0]}</strong>
                  <span>{sensitivityHelp[1]}</span>
                </SensitivityHelp>
              </Stack>
            </Stack>
          </Rail>
        )}
      </Section>
    </>
  )
}
