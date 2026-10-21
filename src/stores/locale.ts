import { computed, watch } from 'vue'
import { defineStore } from 'pinia'
import { useLocalStorage } from '@vueuse/core'
import {
  i18n,
  initialLocale,
  isAppLocale,
  LOCALE_STORAGE_KEY,
  SUPPORTED_LOCALES,
  type AppLocale,
} from '@/plugins/i18n'

function setMeta(attribute: 'name' | 'property', key: string, content: string) {
  document.head.querySelector(`meta[${attribute}="${key}"]`)?.setAttribute('content', content)
}

export const useLocaleStore = defineStore('locale', () => {
  // Only written when the user explicitly picks a language, so first visits keep auto-detecting.
  const stored = useLocalStorage<string>(LOCALE_STORAGE_KEY, initialLocale, {
    writeDefaults: false,
  })
  const { locale, t } = i18n.global

  const current = computed<AppLocale>(() => (isAppLocale(locale.value) ? locale.value : 'uz'))

  function setLocale(next: AppLocale) {
    stored.value = next
    locale.value = next
  }

  function syncDocument() {
    const title = t('meta.title')
    const description = t('meta.description')

    document.documentElement.lang = current.value
    document.title = title
    setMeta('name', 'description', description)
    setMeta('property', 'og:title', title)
    setMeta('property', 'og:description', description)
    setMeta('property', 'og:locale', t('meta.ogLocale'))
    setMeta('name', 'twitter:title', title)
    setMeta('name', 'twitter:description', description)
  }

  watch(current, syncDocument, { immediate: true })

  return { current, locales: SUPPORTED_LOCALES, setLocale }
})
