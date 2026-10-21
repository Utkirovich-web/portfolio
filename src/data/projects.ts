/**
 * Projects shown in the Projects section.
 *
 * Titles and descriptions are translated in src/locales/*.json under
 * `projects.items.<id>` — add a matching entry there when you add a project here.
 * All projects are systems of the Ministry of Economy and Finance of the Republic of Uzbekistan.
 */

export type ProjectCategory = 'public' | 'admin'
export type CoverPalette = 'green' | 'blue' | 'amber' | 'violet'

interface ProjectBase {
  id: string
  tags: readonly string[]
  /** Color family of the generated cover visual. */
  palette: CoverPalette
}

/** Public website — has a live link, a description and a browser-style cover. */
export interface PublicProject extends ProjectBase {
  category: 'public'
  url: string
  domain: string
}

/**
 * Confidential internal admin panel. Intentionally has no link, screenshot or
 * description field: cards only show the title, a generic confidentiality note,
 * tech tags and an "Internal system" badge.
 */
export interface AdminProject extends ProjectBase {
  category: 'admin'
}

export type Project = PublicProject | AdminProject

export const PROJECT_STACK = [
  'Vue 3',
  'TypeScript',
  'Pinia',
  'Vue Router',
  'vue-i18n',
  'Ant Design Vue',
  'Axios',
  'Vite',
] as const

export const projects: Project[] = [
  {
    id: 'green',
    category: 'public',
    url: 'https://green.imv.uz/',
    domain: 'green.imv.uz',
    tags: PROJECT_STACK,
    palette: 'green',
  },
  {
    id: 'audit',
    category: 'public',
    url: 'https://audit.imv.uz/',
    domain: 'audit.imv.uz',
    tags: PROJECT_STACK,
    palette: 'blue',
  },
  { id: 'greenAdmin', category: 'admin', tags: PROJECT_STACK, palette: 'green' },
  { id: 'auditAdmin', category: 'admin', tags: PROJECT_STACK, palette: 'blue' },
  { id: 'breedAdmin', category: 'admin', tags: PROJECT_STACK, palette: 'amber' },
  { id: 'monitoringAdmin', category: 'admin', tags: PROJECT_STACK, palette: 'violet' },
]

export const projectFilters = ['all', 'public', 'admin'] as const
export type ProjectFilter = (typeof projectFilters)[number]
