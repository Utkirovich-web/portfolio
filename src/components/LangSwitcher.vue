<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import DropdownMenu from './DropdownMenu.vue'
import BaseIcon from './BaseIcon.vue'
import { useLocaleStore } from '@/stores/locale'
import { isAppLocale } from '@/plugins/i18n'
import type { DropdownOption } from '@/types/ui'

withDefaults(
  defineProps<{
    /** Show the language name next to the code (used in the mobile menu). */
    showLabel?: boolean
    align?: 'start' | 'end'
  }>(),
  { showLabel: false, align: 'end' },
)

const { t } = useI18n()
const localeStore = useLocaleStore()

// Language names are shown in their own language (Oʻzbekcha / English / Русский).
const options = computed<DropdownOption[]>(() =>
  localeStore.locales.map((code) => ({
    value: code,
    label: t(`lang.${code}`),
    hint: code.toUpperCase(),
    lang: code,
  })),
)

const currentName = computed(() => t(`lang.${localeStore.current}`))

function onSelect(value: string) {
  if (isAppLocale(value)) localeStore.setLocale(value)
}
</script>

<template>
  <DropdownMenu
    :options="options"
    :model-value="localeStore.current"
    :align="align"
    @update:model-value="onSelect"
  >
    <!-- Accessible name comes from the content ("Language: EN"), so it includes the visible text. -->
    <template #trigger>
      <BaseIcon name="globe" :size="16" />
      <span class="sr-only">{{ t('lang.label') }}:</span>
      <span class="lang-code">{{ localeStore.current.toUpperCase() }}</span>
      <span v-if="showLabel" class="lang-name">{{ currentName }}</span>
    </template>
  </DropdownMenu>
</template>

<style scoped>
.lang-code {
  font-family: var(--font-mono);
  font-size: 0.8125rem;
  letter-spacing: 0.02em;
}

.lang-name {
  margin-left: 0.125rem;
  color: var(--muted);
  font-weight: 500;
}
</style>
