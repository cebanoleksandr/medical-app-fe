import complianceIcon from '../../../assets/icons/compliance.svg'
import dataInputIcon from '../../../assets/icons/data-input.svg'
import previewIcon from '../../../assets/icons/preview.svg'
import tuneIcon from '../../../assets/icons/tune.svg'
import { MaskIcon, type StepperStep } from '../../ui'

export interface WizardStep extends StepperStep {
  /** Route segment under /app/de-identify. */
  path: string
}

export const DE_IDENTIFY_BASE = '/app/de-identify'

export const steps: WizardStep[] = [
  { path: 'compliance', label: 'Compliance', icon: <MaskIcon src={complianceIcon} /> },
  { path: 'input', label: 'Data Input', icon: <MaskIcon src={dataInputIcon} /> },
  { path: 'configuration', label: 'Configuration', icon: <MaskIcon src={tuneIcon} /> },
  { path: 'review', label: 'Review & Run', icon: <MaskIcon src={previewIcon} /> },
]

export const stepUrl = (index: number) => `${DE_IDENTIFY_BASE}/${steps[index].path}`
