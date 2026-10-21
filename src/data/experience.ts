import type { IconName } from '@/assets/icons'

/**
 * Timeline entries, newest first.
 *
 * Text is translated in src/locales/*.json under `experience.items.<id>`:
 *   period, role, org and points.<pointId>
 */
export interface ExperienceEntry {
  id: string
  type: 'work' | 'education'
  icon: IconName
  /** Shows the "Current" badge and highlights the timeline marker. */
  current: boolean
  /** Keys of `experience.items.<id>.points.*`, in display order. */
  points: string[]
}

export const experience: ExperienceEntry[] = [
  {
    id: 'itc',
    type: 'work',
    icon: 'briefcase',
    current: true,
    points: ['websites', 'admin', 'team'],
  },
  {
    id: 'ttpu',
    type: 'education',
    icon: 'graduationCap',
    current: false,
    points: [],
  },
]
