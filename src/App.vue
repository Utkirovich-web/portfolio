<script setup lang="ts">
import { computed } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import AppNavbar from '@/components/layout/AppNavbar.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import CursorGlow from '@/components/CursorGlow.vue'
import ScrollProgress from '@/components/ScrollProgress.vue'
import { useThemeStore } from '@/stores/theme'
import { useLocaleStore } from '@/stores/locale'
import { allSectionsRendered } from '@/composables/useProgressiveSections'
import { useSmoothScroll } from '@/composables/useSmoothScroll'

// Instantiating the stores applies the theme and syncs <html lang>, title and meta tags.
useThemeStore()
useLocaleStore()
useSmoothScroll()

const { t } = useI18n()
const route = useRoute()

// On the home page the footer joins once the progressively rendered sections are in place.
const showFooter = computed(() => route.name !== 'home' || allSectionsRendered.value)
</script>

<template>
  <a class="skip-link" href="#main">{{ t('a11y.skipToContent') }}</a>
  <CursorGlow />
  <ScrollProgress />
  <AppNavbar />
  <main id="main" tabindex="-1">
    <RouterView />
  </main>
  <AppFooter v-if="showFooter" />
</template>
