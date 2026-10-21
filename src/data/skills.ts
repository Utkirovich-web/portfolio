import type { IconName } from '@/assets/icons'

/**
 * A skill is either a plain technology name (shown as-is in every language)
 * or `{ key }` pointing at a translated label in src/locales/*.json.
 */
export type SkillItem = string | { key: string }

export interface SkillGroup {
  /** Title / description come from `skills.categories.<id>` and `skills.descriptions.<id>`. */
  id: 'frontend' | 'ecosystem' | 'tools' | 'learning'
  icon: IconName
  items: SkillItem[]
  /** Styled as "in progress". */
  learning?: boolean
}

export const skillGroups: SkillGroup[] = [
  {
    id: 'frontend',
    icon: 'code',
    items: ['Vue 3', 'TypeScript', 'JavaScript', 'HTML5', 'CSS3 / SCSS', 'Tailwind CSS'],
  },
  {
    id: 'ecosystem',
    icon: 'layers',
    items: ['Pinia', 'Vue Router', 'vue-i18n', 'Ant Design Vue', 'Axios'],
  },
  {
    id: 'tools',
    icon: 'wrench',
    items: ['Vite', 'Git', 'GitLab', 'CI/CD'],
  },
  {
    id: 'learning',
    icon: 'sprout',
    learning: true,
    items: [
      'Next.js',
      'Nuxt.js',
      { key: 'skills.items.backend' },
      { key: 'skills.items.cybersecurity' },
    ],
  },
]
