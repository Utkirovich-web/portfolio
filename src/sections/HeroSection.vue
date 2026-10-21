<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import BaseButton from '@/components/BaseButton.vue'
import BaseIcon from '@/components/BaseIcon.vue'
import StatusBadge from '@/components/StatusBadge.vue'
import GlowBackdrop from '@/components/GlowBackdrop.vue'
import { profile } from '@/data/profile'
import { useSectionNav } from '@/composables/useSectionNav'

const { t, locale } = useI18n()
const { goTo } = useSectionNav()

// Each word is revealed separately (CSS-only, so it never delays the first paint).
const nameWords = computed(() => t('profile.name').split(' '))

// Scroll parallax: exposes 0 → 1 as the hero scrolls out, consumed in CSS via --hero-progress.
const hero = ref<HTMLElement | null>(null)
let rafId = 0

function updateProgress() {
  rafId = 0
  const el = hero.value
  if (!el) return
  const progress = Math.min(Math.max(window.scrollY / el.offsetHeight, 0), 1)
  el.style.setProperty('--hero-progress', progress.toFixed(3))
}

function onScroll() {
  if (!rafId) rafId = requestAnimationFrame(updateProgress)
}

onMounted(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  updateProgress()
  window.addEventListener('scroll', onScroll, { passive: true })
})

onBeforeUnmount(() => {
  cancelAnimationFrame(rafId)
  window.removeEventListener('scroll', onScroll)
})
</script>

<template>
  <section id="top" ref="hero" class="hero" aria-labelledby="hero-title" tabindex="-1">
    <div class="hero__bg" aria-hidden="true">
      <div class="hero__grid" />
      <GlowBackdrop variant="hero" />
    </div>

    <div class="hero__inner container">
      <StatusBadge
        v-if="profile.openToOffers"
        :label="t('hero.status')"
        class="hero-in"
        style="--delay: 0ms"
      />

      <!-- Keyed by locale so the reveal replays when the language changes -->
      <h1 id="hero-title" :key="locale" class="hero__title">
        <template v-for="(word, index) in nameWords" :key="index">
          <span class="hero__mask">
            <span
              class="hero__word"
              :class="{ 'hero__word--accent': index === nameWords.length - 1 }"
              :style="{ '--i': index }"
              >{{ word }}</span
            >
          </span>
          {{ index < nameWords.length - 1 ? ' ' : '' }}
        </template>
      </h1>

      <p class="hero__role hero-in" style="--delay: 160ms">
        <span>{{ t('hero.role') }}</span>
        <span class="hero__sep" aria-hidden="true" />
        <span class="hero__stack">{{ t('hero.stack') }}</span>
      </p>

      <p class="hero__value hero-in" style="--delay: 220ms">{{ t('hero.value') }}</p>

      <div class="hero__actions hero-in" style="--delay: 280ms">
        <BaseButton href="#projects" size="lg" magnetic @click.prevent="goTo('projects')">
          {{ t('hero.ctaProjects') }}
          <template #icon-right>
            <BaseIcon name="arrowRight" :size="18" />
          </template>
        </BaseButton>
        <BaseButton
          href="#contact"
          variant="secondary"
          size="lg"
          magnetic
          @click.prevent="goTo('contact')"
        >
          {{ t('hero.ctaContact') }}
        </BaseButton>
      </div>

      <p class="hero__location hero-in" style="--delay: 340ms">
        <BaseIcon name="mapPin" :size="16" />
        {{ t('profile.location') }}
      </p>
    </div>

    <a
      href="#about"
      class="hero__scroll hero-in"
      style="--delay: 600ms"
      @click.prevent="goTo('about')"
    >
      <span class="hero__mouse" aria-hidden="true"><span /></span>
      <span class="hero__scroll-label">{{ t('hero.scrollHint') }}</span>
    </a>
  </section>
</template>

<style scoped lang="scss">
.hero {
  position: relative;
  isolation: isolate;
  display: flex;
  align-items: center;
  min-height: 100vh;
  min-height: 100svh;
  padding-block: calc(var(--nav-height) + var(--space-8)) var(--space-12);
  overflow: hidden;
}

.hero__bg {
  position: absolute;
  inset: 0;
  z-index: -1;
  // Background moves slower than the page and gently zooms → depth
  transform: translateY(calc(var(--hero-progress, 0) * 30%))
    scale(calc(1 + var(--hero-progress, 0) * 0.12));
}

.hero__grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(var(--grid-line) 1px, transparent 1px),
    linear-gradient(90deg, var(--grid-line) 1px, transparent 1px);
  background-size: 64px 64px;
  background-position: center top;
  mask-image: radial-gradient(ellipse 70% 60% at 50% 40%, #000 25%, transparent 75%);
}

.hero__inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
  text-align: center;
  // Content lifts away and fades as the hero scrolls out
  opacity: calc(1 - var(--hero-progress, 0) * 1.4);
  transform: translateY(calc(var(--hero-progress, 0) * -80px));
}

.hero__title {
  max-width: 100%;
  margin-top: var(--space-1);
  font-size: clamp(2.5rem, 9.5vw, 7.5rem);
  font-weight: 800;
  letter-spacing: -0.045em;
  line-height: 1;
}

// Each word slides up from behind a mask
.hero__mask {
  display: inline-block;
  overflow: hidden;
  vertical-align: bottom;
  // room for descenders (j, y) and the negative letter-spacing overhang
  padding: 0 0.04em 0.12em;
  margin: 0 -0.04em -0.12em;
}

.hero__word {
  display: inline-block;
  animation: word-up 0.9s var(--ease-out) both;
  animation-delay: calc(var(--i) * 90ms + 40ms);
}

.hero__word--accent {
  background: var(--gradient-text);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.hero__role {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 0.5rem 0.875rem;
  color: var(--text);
  font-family: var(--font-display);
  font-size: clamp(1.125rem, 2.4vw, 1.5rem);
  font-weight: 700;
  letter-spacing: -0.02em;
}

.hero__sep {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--accent);
}

.hero__stack {
  color: var(--muted);
  font-weight: 600;
}

.hero__value {
  max-width: 34rem;
  color: var(--muted);
  font-size: clamp(1.0625rem, 1.8vw, 1.25rem);
  line-height: 1.55;
}

.hero__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.75rem;
  margin-top: var(--space-1);
}

.hero__location {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  color: var(--muted);
  font-size: 0.875rem;
}

.hero__scroll {
  position: absolute;
  bottom: var(--space-4);
  left: 50%;
  display: none;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.5rem;
  border-radius: var(--radius-sm);
  color: var(--muted);
  font-size: 0.75rem;
  font-weight: 500;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  translate: -50% 0;

  @media (min-width: 768px) and (min-height: 760px) {
    display: flex;
  }
}

.hero__mouse {
  display: flex;
  justify-content: center;
  width: 22px;
  height: 34px;
  padding-top: 6px;
  border: 1.5px solid var(--border-strong);
  border-radius: 12px;

  span {
    width: 3px;
    height: 7px;
    border-radius: 2px;
    background: var(--accent);
    animation: scroll-dot 1.8s var(--ease-in-out) infinite;
  }
}

.hero-in {
  animation: hero-in 0.7s var(--ease-out) both;
  animation-delay: var(--delay, 0ms);
}

@keyframes word-up {
  from {
    transform: translateY(110%);
  }
  to {
    transform: none;
  }
}

@keyframes hero-in {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

@keyframes scroll-dot {
  0% {
    transform: translateY(0);
    opacity: 1;
  }
  70% {
    transform: translateY(10px);
    opacity: 0;
  }
  100% {
    transform: translateY(0);
    opacity: 0;
  }
}
</style>
