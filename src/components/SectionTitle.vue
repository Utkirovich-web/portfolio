<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import GlowBackdrop from './GlowBackdrop.vue'

const props = withDefaults(
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

// The heading is revealed word by word, each word sliding up from behind a mask.
const words = computed(() => props.title.split(' '))

const heading = ref<HTMLElement | null>(null)
// Words are only hidden once JS knows the heading is below the fold → no flash, no-JS safe.
const armed = ref(false)
const revealed = ref(false)
let observer: IntersectionObserver | null = null

onMounted(() => {
  const el = heading.value
  if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  if (el.getBoundingClientRect().top < window.innerHeight) return

  armed.value = true
  observer = new IntersectionObserver(
    ([entry]) => {
      if (!entry?.isIntersecting) return
      revealed.value = true
      observer?.disconnect()
    },
    { rootMargin: '0px 0px -12% 0px' },
  )
  observer.observe(el)
})

onBeforeUnmount(() => observer?.disconnect())
</script>

<template>
  <header class="section-title" :class="`section-title--${align}`">
    <GlowBackdrop variant="section" />
    <p class="section-title__eyebrow" data-reveal>
      <span class="section-title__line" aria-hidden="true" />
      {{ eyebrow }}
    </p>
    <h2
      :id="titleId"
      ref="heading"
      class="section-title__heading"
      :class="{ 'is-armed': armed, 'is-revealed': revealed }"
    >
      <template v-for="(word, index) in words" :key="`${title}-${index}`">
        <span class="section-title__mask">
          <span class="section-title__word" :style="{ '--i': index }">{{ word }}</span>
        </span>
        {{ index < words.length - 1 ? ' ' : '' }}
      </template>
    </h2>
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

.section-title__mask {
  display: inline-block;
  overflow: hidden;
  vertical-align: bottom;
  // room for descenders and the negative letter-spacing overhang
  padding: 0 0.04em 0.12em;
  margin: 0 -0.04em -0.12em;
}

.section-title__word {
  display: inline-block;
  transition:
    transform 1s var(--ease-out),
    opacity 1s var(--ease-out);
  transition-delay: calc(var(--i) * 70ms);
}

.is-armed:not(.is-revealed) .section-title__word {
  opacity: 0;
  transform: translateY(105%) rotate(4deg);
  transform-origin: left bottom;
}

.section-title__subtitle {
  max-width: 38rem;
  color: var(--muted);
  font-size: clamp(1rem, 1.4vw, 1.125rem);
}
</style>
