<script setup lang="ts">
import GlowBackdrop from './GlowBackdrop.vue'

withDefaults(
  defineProps<{
    /** id of the <h2>, referenced by the section's aria-labelledby. */
    titleId: string
    eyebrow: string
    title: string
    subtitle?: string
    align?: 'start' | 'center'
  }>(),
  { align: 'start' },
)
</script>

<template>
  <header class="section-title" :class="`section-title--${align}`">
    <GlowBackdrop variant="section" />
    <p class="section-title__eyebrow" data-reveal>
      <span class="section-title__line" aria-hidden="true" />
      {{ eyebrow }}
    </p>
    <h2 :id="titleId" class="section-title__heading" data-reveal>{{ title }}</h2>
    <p v-if="subtitle" class="section-title__subtitle" data-reveal>{{ subtitle }}</p>
  </header>
</template>

<style scoped lang="scss">
.section-title {
  position: relative;
  isolation: isolate;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  max-width: 44rem;
  margin-bottom: clamp(2.5rem, 5vw, 4rem);
}

.section-title--center {
  align-items: center;
  margin-inline: auto;
  text-align: center;
}

.section-title__eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  color: var(--accent);
  font-family: var(--font-mono);
  font-size: 0.8125rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.section-title__line {
  width: 1.5rem;
  height: 1px;
  background: currentColor;
}

.section-title__heading {
  font-size: clamp(2rem, 4.5vw, 3.25rem);
  font-weight: 800;
  letter-spacing: -0.035em;
}

.section-title__subtitle {
  max-width: 38rem;
  color: var(--muted);
  font-size: clamp(1rem, 1.4vw, 1.125rem);
}
</style>
