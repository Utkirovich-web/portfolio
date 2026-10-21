import type { IconName } from '@/assets/icons'

export interface DropdownOption {
  value: string
  label: string
  icon?: IconName
  /** Short secondary text shown before the label (e.g. a language code). */
  hint?: string
  /** BCP-47 language of the label, for screen readers (e.g. "ru" for "Русский"). */
  lang?: string
}
