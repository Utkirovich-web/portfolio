import type { IconName } from '@/assets/icons'

/**
 * Personal details that don't need translation.
 * Translated text (name, role, bio, facts…) lives in src/locales/*.json.
 */

export interface AvatarSource {
  /** Optional modern formats, served first when the browser supports them. */
  avif?: string
  webp?: string
  /** Required JPEG/PNG fallback. */
  fallback: string
  width: number
  height: number
}

export interface ProfileFact {
  /** Text comes from `about.facts.<id>.title` / `.detail` in the locale files. */
  id: 'projects' | 'position' | 'education'
  icon: IconName
}

/*
 * ── Adding your photo ───────────────────────────────────────────────────────
 * 1. Put your photo into src/assets/images/ (e.g. avatar.avif, avatar.webp, avatar.jpg).
 *    Square or 4:5 portrait crops of ~800px work best.
 * 2. Import the files here:
 *      import avatarAvif from '@/assets/images/avatar.avif'
 *      import avatarWebp from '@/assets/images/avatar.webp'
 *      import avatarJpg from '@/assets/images/avatar.jpg'
 * 3. Replace `avatar: null` below with:
 *      avatar: { avif: avatarAvif, webp: avatarWebp, fallback: avatarJpg, width: 800, height: 1000 },
 * ────────────────────────────────────────────────────────────────────────────
 */
export const profile = {
  initials: 'SA',
  openToOffers: true,
  copyrightYear: 2026,
  avatar: null as AvatarSource | null,
  facts: [
    { id: 'projects', icon: 'layers' },
    { id: 'position', icon: 'briefcase' },
    { id: 'education', icon: 'graduationCap' },
  ] satisfies ProfileFact[],
}
