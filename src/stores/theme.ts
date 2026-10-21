import { computed, watch } from 'vue'
import { defineStore } from 'pinia'
import { useLocalStorage, usePreferredDark, usePreferredReducedMotion } from '@vueuse/core'

export const THEMES = ['light', 'dark', 'aurora', 'system'] as const
export type ThemePreference = (typeof THEMES)[number]
export type ResolvedTheme = Exclude<ThemePreference, 'system'>

/** Must match the key read by the inline bootstrap script in index.html. */
export const THEME_STORAGE_KEY = 'sa-theme'

/** Browser UI color (<meta name="theme-color">) for each visual theme. */
const THEME_COLORS: Record<ResolvedTheme, string> = {
  light: '#FAFAFA',
  dark: '#0A0A0A',
  aurora: '#B8CFD0',
}

const TRANSITION_MS = 300

export function isThemePreference(value: unknown): value is ThemePreference {
  return typeof value === 'string' && (THEMES as readonly string[]).includes(value)
}

export const useThemeStore = defineStore('theme', () => {
  const stored = useLocalStorage<string>(THEME_STORAGE_KEY, 'system')
  const prefersDark = usePreferredDark()
  const reducedMotion = usePreferredReducedMotion()

  const preference = computed<ThemePreference>({
    get: () => (isThemePreference(stored.value) ? stored.value : 'system'),
    set: (value) => {
      stored.value = value
    },
  })

  /** The theme actually painted; "system" follows the OS and updates live. */
  const resolved = computed<ResolvedTheme>(() => {
    if (preference.value === 'system') return prefersDark.value ? 'dark' : 'light'
    return preference.value
  })

  let transitionTimer: ReturnType<typeof setTimeout> | undefined

  function apply(theme: ResolvedTheme, animate: boolean) {
    const root = document.documentElement

    if (animate && reducedMotion.value !== 'reduce') {
      root.classList.add('theme-transition')
      clearTimeout(transitionTimer)
      transitionTimer = setTimeout(() => root.classList.remove('theme-transition'), TRANSITION_MS)
    }

    root.dataset.theme = theme
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLORS[theme])
  }

  watch(resolved, (theme, previous) => apply(theme, previous !== undefined), { immediate: true })

  function setTheme(value: ThemePreference) {
    preference.value = value
  }

  return { preference, resolved, setTheme }
})
