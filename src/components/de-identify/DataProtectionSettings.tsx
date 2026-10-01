import { useState } from 'react'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import { styled } from '@mui/material/styles'
import type { AnalysisOptions, EntityMethod, EntityType, Language, RiskLevel } from '../../api/types'
import infoIcon from '../../assets/configuration/info.svg'
import languageIcon from '../../assets/configuration/language.svg'
import warningIcon from '../../assets/configuration/warning.svg'
import { colors, typography } from '../../theme'
import type { DeIdentifyDraft, DraftPatch } from '../layouts/de-identify/context'
import { ConfirmPopup } from '../popups/ConfirmPopup'
import { Button, Dropdown, MaskIcon, type DropdownOption } from '../ui'
import { Banner, Cards, Description, NARROW, Rail, Section, Stack } from './configStyles'
import { entityMethodsOf, isCustomized } from './configRequest'
import { EntityConfigTable } from './EntityConfigTable'
import { RISK_LEVELS, type LawInfo } from './entityConfig'
import { LogicDrawer } from './LogicDrawer'
import { LANGUAGE_NAMES } from './languages'
import { OptionCard } from './OptionCard'

export interface DataProtectionSettingsProps {
  law: LawInfo
  options: AnalysisOptions
  draft: DeIdentifyDraft
  updateDraft: (patch: DraftPatch) => void
}

const LEVELS: RiskLevel[] = ['LOW', 'MEDIUM', 'HIGH']

const CardNote = styled('span')({ ...typography.labelM, color: colors.neutral[500] })

const Controls = styled('div')({
  display: 'flex',
  alignItems: 'flex-start',
  gap: 24,
  '& > :first-child': { flex: 1, minWidth: 0 },
  '& > :last-child': { flex: '0 0 241px' },
  [NARROW]: { flexDirection: 'column-reverse', alignItems: 'stretch', '& > :last-child': { flex: 'none' } },
})

/** GDPR, UK GDPR, FADP: privacy risk level and a method per entity type. */
export function DataProtectionSettings({ law, options, draft, updateDraft }: DataProtectionSettingsProps) {
  const [logicOpen, setLogicOpen] = useState(false)
  // Level whose defaults the user is asked to confirm; replaces their changes.
  const [confirmLevel, setConfirmLevel] = useState<RiskLevel | null>(null)
  const level = draft.riskLevel
  const presets = options.entityConfig.riskPresets
  const methods = entityMethodsOf(draft, presets)
  const customized = isCustomized(draft, presets)

  const applyLevel = (next: RiskLevel) => updateDraft({ riskLevel: next, entityMethods: undefined })

  const selectLevel = (next: RiskLevel) => {
    if (next === level) return
    if (customized) setConfirmLevel(next)
    else applyLevel(next)
  }

  const changeMethod = (type: EntityType, method: EntityMethod) =>
    updateDraft((current) => ({
      entityMethods: { ...entityMethodsOf(current, presets)!, [type]: method },
    }))

  const languageOptions: DropdownOption<Language>[] = options.languages.map((code) => ({
    value: code,
    label: LANGUAGE_NAMES[code] ?? code,
    icon: <MaskIcon src={languageIcon} />,
  }))

  return (
    <>
      <Section aria-labelledby="risk-heading">
        <h3 id="risk-heading">1. Choose privacy risk level</h3>
        <Rail>
          <Cards role="radiogroup" aria-labelledby="risk-heading" data-size="small">
            {LEVELS.map((item) => {
              const [first, second] = RISK_LEVELS[item].lines(law)
              return (
                <OptionCard
                  key={item}
                  compact
                  name="risk-level"
                  value={item}
                  title={RISK_LEVELS[item].title}
                  badge={item === 'MEDIUM' ? 'Recommended' : undefined}
                  checked={item === level}
                  onChange={() => selectLevel(item)}
                >
                  <CardNote>
                    {first}
                    <br />
                    {second}
                  </CardNote>
                </OptionCard>
              )
            })}
          </Cards>
        </Rail>
      </Section>

      {level === 'LOW' && (
        <Banner role="note">
          <MaskIcon src={warningIcon} aria-hidden />
          <div>
            <strong>Low risk may not fully protect sensitive health data.</strong>
            <p>Biological data and photos will still be removed ({law.articleShort}).</p>
          </div>
        </Banner>
      )}

      <Banner data-tone="info">
        <MaskIcon src={infoIcon} aria-hidden />
        <div>
          <strong>How this configuration works</strong>
          <p>
            Methods are automatically selected based on {law.name} risk guidelines and entity
            sensitivity levels. You can review or override any setting below.
          </p>
        </div>
        <Button
          variant="ghost"
          size="medium"
          endIcon={<ArrowForwardIcon />}
          onClick={() => setLogicOpen(true)}
        >
          View logic
        </Button>
      </Banner>

      <Section aria-labelledby="entities-heading" data-locked={!level || undefined}>
        <h3 id="entities-heading">2. Entity Configuration</h3>
        {level && methods && (
          <Rail>
            <Stack>
              <Description>
                <strong>Choose which identifiers to remove from your document.</strong>
                <span>Methods follow the risk level. Customize any entity type below.</span>
              </Description>
              <Controls>
                <EntityConfigTable
                  law={law}
                  value={methods}
                  customized={customized}
                  onChange={changeMethod}
                  onReset={() => setConfirmLevel(level)}
                />
                <Dropdown
                  options={languageOptions}
                  value={draft.language ?? 'en'}
                  onChange={(next) => updateDraft({ language: next })}
                  aria-label="Document language"
                />
              </Controls>
            </Stack>
          </Rail>
        )}
      </Section>

      <LogicDrawer
        open={logicOpen}
        onClose={() => setLogicOpen(false)}
        law={law}
        level={level}
        presets={presets}
      />

      <ConfirmPopup
        isVisible={confirmLevel !== null}
        onClose={() => setConfirmLevel(null)}
        onConfirm={() => {
          if (confirmLevel) applyLevel(confirmLevel)
          setConfirmLevel(null)
        }}
        title={`Reset to ${RISK_LEVELS[confirmLevel ?? level ?? 'MEDIUM'].title} defaults?`}
        description="Your custom settings will be lost."
        confirmLabel="Reset"
      />
    </>
  )
}
