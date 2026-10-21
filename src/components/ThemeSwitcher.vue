<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import DropdownMenu from './DropdownMenu.vue'
import BaseIcon from './BaseIcon.vue'
import { isThemePreference, THEMES, useThemeStore, type ThemePreference } from '@/stores/theme'
import type { IconName } from '@/assets/icons'
import type { DropdownOption } from '@/types/ui'

withDefaults(
  defineProps<{
    /** Show the theme name next to the icon (used in the mobile menu). */
    showLabel?: boolean
    align?: 'start' | 'end'
  }>(),
  { showLabel: false, align: 'end' },
)

const THEME_ICONS: Record<ThemePreference, IconName> = {
  light: 'sun',
  dark: 'moon',
  aurora: 'sparkles',
  system: 'monitor',
}

const { t } = useI18n()
const theme = useThemeStore()

const options = computed<DropdownOption[]>(() =>
  THEMES.map((value) => ({ value, label: t(`theme.${value}`), icon: THEME_ICONS[value] })),
)

const currentLabel = computed(() => t(`theme.${theme.preference}`))

function onSelect(value: string) {
  if (isThemePreference(value)) theme.setTheme(value)
}
</script>

<template>
  <DropdownMenu
    :options="options"
    :model-value="theme.preference"
    :label="t('a11y.themeButton', { theme: currentLabel })"
    :align="align"
    @update:model-value="onSelect"
  >
    <template #trigger>
      <BaseIcon :name="THEME_ICONS[theme.preference]" :size="18" />
      <span v-if="showLabel">{{ currentLabel }}</span>
    </template>
  </DropdownMenu>
</template>
