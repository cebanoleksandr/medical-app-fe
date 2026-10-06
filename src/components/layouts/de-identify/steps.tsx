import complianceIcon from '../../../assets/icons/compliance.svg'
import dataInputIcon from '../../../assets/icons/data-input.svg'
import previewIcon from '../../../assets/icons/preview.svg'
import tuneIcon from '../../../assets/icons/tune.svg'
import type { ParseKeys } from 'i18next'
import type { ReactNode } from 'react'
import { MaskIcon } from '../../ui'

export interface WizardStep {
  /** Route segment under /app/de-identify. */
  path: string
  /** Key in the `app` namespace. */
  label: ParseKeys<'app'>
  icon: ReactNode
}

export const DE_IDENTIFY_BASE = '/app/de-identify'

export const steps: WizardStep[] = [
  { path: 'compliance', label: 'steps.compliance', icon: <MaskIcon src={complianceIcon} /> },
  { path: 'input', label: 'steps.input', icon: <MaskIcon src={dataInputIcon} /> },
  { path: 'configuration', label: 'steps.configuration', icon: <MaskIcon src={tuneIcon} /> },
  { path: 'review', label: 'steps.review', icon: <MaskIcon src={previewIcon} /> },
]

export const stepUrl = (index: number) => `${DE_IDENTIFY_BASE}/${steps[index].path}`
