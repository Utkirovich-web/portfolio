<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import BaseButton from '@/components/BaseButton.vue'
import BaseIcon from '@/components/BaseIcon.vue'
import GlowBackdrop from '@/components/GlowBackdrop.vue'

const { t } = useI18n()
</script>

<template>
  <section class="not-found" aria-labelledby="not-found-title">
    <GlowBackdrop variant="hero" />
    <div class="not-found__inner container">
      <p class="not-found__code" aria-hidden="true">404</p>
      <h1 id="not-found-title" class="not-found__title">{{ t('notFound.title') }}</h1>
      <p class="not-found__text">{{ t('notFound.text') }}</p>
      <BaseButton :to="{ name: 'home' }" size="lg" magnetic>
        <template #icon-left>
          <BaseIcon name="arrowRight" :size="18" class="not-found__back-icon" />
        </template>
        {{ t('notFound.back') }}
      </BaseButton>
    </div>
  </section>
</template>

<style scoped lang="scss">
.not-found {
  position: relative;
  isolation: isolate;
  display: grid;
  place-items: center;
  min-height: 100vh;
  min-height: 100svh;
  padding-block: calc(var(--nav-height) + var(--space-6)) var(--space-8);
  overflow: hidden;
}

.not-found__inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
  text-align: center;
}

.not-found__code {
  background: var(--gradient-text);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  font-family: var(--font-display);
  font-size: clamp(6rem, 22vw, 12rem);
  font-weight: 800;
  letter-spacing: -0.06em;
  line-height: 1;
}

.not-found__title {
  font-size: clamp(1.75rem, 4vw, 2.5rem);
}

.not-found__text {
  max-width: 28rem;
  margin-bottom: var(--space-2);
  color: var(--muted);
}

.not-found__back-icon {
  rotate: 180deg;
}
</style>
