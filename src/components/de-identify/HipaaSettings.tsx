import type { ReactNode } from 'react'
import LabelOutlinedIcon from '@mui/icons-material/LabelOutlined'
import PasswordOutlinedIcon from '@mui/icons-material/PasswordOutlined'
import ShuffleOutlinedIcon from '@mui/icons-material/ShuffleOutlined'
import { styled } from '@mui/material/styles'
import { useTranslation } from 'react-i18next'
import type {
  AnalysisOptions,
  FrameworkOption,
  Language,
  MethodOption,
  OutputMode,
} from '../../api/types'
import hideSourceIcon from '../../assets/configuration/hide-source.svg'
import languageIcon from '../../assets/configuration/language.svg'
import warningIcon from '../../assets/configuration/warning.svg'
import { useCatalog } from '../../i18n/useCatalog'
import { colors, typography } from '../../theme'
import type { DeIdentifyDraft, DraftPatch } from '../layouts/de-identify/context'
import { Dropdown, MaskIcon, type DropdownOption } from '../ui'
import { Banner, Cards, Description, NARROW, Rail, Section, Stack } from './configStyles'
import { IdentifierPicker } from './IdentifierPicker'
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

// Texts are `deIdentify:hipaa.sensitivity.<level>`.


/** HIPAA: method, identifiers and output settings. */
export function HipaaSettings({ framework, options, draft, updateDraft }: HipaaSettingsProps) {
  const { t } = useTranslation(['deIdentify', 'common'])
  const catalog = useCatalog()
  const method = framework.methods.find((item) => item.id === draft.method)
  const identifiers = draft.identifiers ?? []
  const identifiersReady = method && (!method.customizable || identifiers.length > 0)

  const selectMethod = (next: MethodOption) => {
    // Customizable methods start with nothing ticked, as the design says.
    updateDraft({ method: next.id, identifiers: next.customizable ? [] : undefined })
  }

  const outputOptions: DropdownOption<OutputMode>[] = options.outputModes.map((mode) => ({
    value: mode.id,
    label: catalog.outputMode(mode).name,
    description: catalog.outputMode(mode).description,
    icon: OUTPUT_ICONS[mode.id],
  }))
  const languageOptions: DropdownOption<Language>[] = options.languages.map((code) => ({
    value: code,
    label: catalog.language(code),
    icon: <MaskIcon src={languageIcon} />,
  }))
  const sensitivityLevel = draft.sensitivity ?? 'BALANCED'

  return (
    <>
      <Section aria-labelledby="method-heading">
        <h3 id="method-heading">{t('hipaa.method')}</h3>
        <Rail>
          <Cards role="radiogroup" aria-labelledby="method-heading">
            {framework.methods.map((item) => (
              <OptionCard
                key={item.id}
                name="method"
                value={item.id}
                title={catalog.method(item).name}
                badge={item.recommended ? t('common:recommended') : undefined}
                checked={item.id === draft.method}
                onChange={() => selectMethod(item)}
              >
                <CardText>{catalog.method(item).description}</CardText>
                {item.requiresReview ? (
                  <ReviewNote>
                    <MaskIcon src={warningIcon} aria-hidden />
                    {t('hipaa.requiresReview')}
                  </ReviewNote>
                ) : (
                  <CardHint>
                    {item.id === 'SAFE_HARBOR'
                      ? t('hipaa.hintSafeHarbor', { framework: catalog.framework(framework).name })
                      : t('hipaa.hintOther')}
                  </CardHint>
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
            <strong>{t('hipaa.reviewTitle')}</strong>
            <p>{t('hipaa.reviewText')}</p>
          </div>
        </Banner>
      )}

      <Section aria-labelledby="identifiers-heading" data-locked={!method || undefined}>
        <h3 id="identifiers-heading">{t('hipaa.identifiers')}</h3>
        {method && (
          <Rail>
            <Stack>
              <Description>
                <strong>
                  {method.customizable ? t('hipaa.chooseIdentifiers') : t('hipaa.fixedIdentifiers')}
                </strong>
                <span>
                  {method.customizable ? t('hipaa.chooseHint') : t('hipaa.fixedHint')}
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
        <h3 id="output-heading">{t('hipaa.output')}</h3>
        {identifiersReady && (
          <Rail>
            <Stack sx={{ gap: '32px' }}>
              <Stack>
                <Description>
                  <strong>{t('hipaa.settingsTitle')}</strong>
                  <span>{t('hipaa.settingsText')}</span>
                </Description>
                <Dropdowns>
                  <Dropdown
                    options={outputOptions}
                    value={draft.outputMode ?? 'REDACT'}
                    onChange={(next) => updateDraft({ outputMode: next })}
                    aria-label={t('configuration.outputMode')}
                  />
                  <Dropdown
                    options={languageOptions}
                    value={draft.language ?? 'en'}
                    onChange={(next) => updateDraft({ language: next })}
                    aria-label={t('configuration.documentLanguage')}
                  />
                </Dropdowns>
              </Stack>

              <Stack>
                <Description>
                  <strong id="sensitivity-heading">{t('hipaa.sensitivityTitle')}</strong>
                  <span>{t('hipaa.sensitivityText')}</span>
                </Description>
                <Cards role="radiogroup" aria-labelledby="sensitivity-heading" data-size="small">
                  {options.sensitivities.map((level) => (
                    <OptionCard
                      key={level}
                      compact
                      name="sensitivity"
                      value={level}
                      title={t(`hipaa.sensitivity.${level}.title`)}
                      badge={level === 'BALANCED' ? t('common:recommended') : undefined}
                      checked={draft.sensitivity === level}
                      onChange={() => updateDraft({ sensitivity: level })}
                    >
                      <CardNote>{t(`hipaa.sensitivity.${level}.note`)}</CardNote>
                    </OptionCard>
                  ))}
                </Cards>
                <SensitivityHelp aria-live="polite">
                  <strong>{t(`hipaa.sensitivity.${sensitivityLevel}.help`)}</strong>
                  <span>{t(`hipaa.sensitivity.${sensitivityLevel}.detail`)}</span>
                </SensitivityHelp>
              </Stack>
            </Stack>
          </Rail>
        )}
      </Section>
    </>
  )
}
