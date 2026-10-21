import { createI18n } from 'vue-i18n'
import uz from '@/locales/uz.json'
import en from '@/locales/en.json'
import ru from '@/locales/ru.json'

export const SUPPORTED_LOCALES = ['uz', 'en', 'ru'] as const
export type AppLocale = (typeof SUPPORTED_LOCALES)[number]

export const DEFAULT_LOCALE: AppLocale = 'uz'
/** Must match the key read by the inline bootstrap script in index.html. */
export const LOCALE_STORAGE_KEY = 'sa-locale'

export function isAppLocale(value: unknown): value is AppLocale {
  return typeof value === 'string' && (SUPPORTED_LOCALES as readonly string[]).includes(value)
}

/** First supported language from the browser's preference list, falling back to Uzbek. */
export function detectBrowserLocale(): AppLocale {
  if (typeof navigator === 'undefined') return DEFAULT_LOCALE
  const preferred = navigator.languages?.length ? navigator.languages : [navigator.language]
  for (const tag of preferred) {
    const base = tag?.toLowerCase().split('-')[0]
    if (isAppLocale(base)) return base
  }
  return DEFAULT_LOCALE
}

function readStoredLocale(): AppLocale | null {
  try {
    const value = localStorage.getItem(LOCALE_STORAGE_KEY)
    return isAppLocale(value) ? value : null
  } catch {
    return null
  }
}

export const initialLocale: AppLocale = readStoredLocale() ?? detectBrowserLocale()

export const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  locale: initialLocale,
  fallbackLocale: 'en',
  messages: { uz, en, ru },
})
