import type { IconName } from '@/assets/icons'

export type ContactId = 'email' | 'telegram' | 'instagram' | 'github'

export interface Contact {
  /** Label comes from `contact.cards.<id>` in the locale files. */
  id: ContactId
  icon: IconName
  href: string
  /** Visible handle / address (not translated). */
  handle: string
  /** External links open in a new tab. */
  external: boolean
}

export const EMAIL = 'shohjahonabdusamadov07@gmail.com'

/** Order used by the contact cards. */
export const contacts: Contact[] = [
  { id: 'email', icon: 'mail', href: `mailto:${EMAIL}`, handle: EMAIL, external: false },
  {
    id: 'telegram',
    icon: 'send',
    href: 'https://t.me/shoh_01',
    handle: '@shoh_01',
    external: true,
  },
  {
    id: 'instagram',
    icon: 'instagram',
    href: 'https://instagram.com/utkirov1ch__',
    handle: '@utkirov1ch__',
    external: true,
  },
  {
    id: 'github',
    icon: 'github',
    href: 'https://github.com/Utkirovich-web',
    handle: 'Utkirovich-web',
    external: true,
  },
]

/** Order of the icon links in the footer. */
export const footerSocials: ContactId[] = ['telegram', 'instagram', 'github', 'email']
