<script setup lang="ts">
import { computed } from 'vue'
import type { CoverPalette } from '@/data/projects'
import { useSafeId } from '@/composables/useSafeId'

/**
 * Generated cover art (no screenshots):
 * - "website": abstract browser window with the site's domain.
 * - "admin":   abstract dashboard pattern behind a lock — used for confidential systems.
 * Colors come from theme tokens + the project palette, so covers adapt to every theme.
 */
const props = defineProps<{
  variant: 'website' | 'admin'
  palette: CoverPalette
  /** Varies the generated shapes per project. */
  seed: string
  domain?: string
}>()

const dotsId = useSafeId('cover-dots')
const fadeId = useSafeId('cover-fade')
const maskId = useSafeId('cover-mask')

/** Small deterministic PRNG so each project gets stable, unique shapes. */
function random(seed: string) {
  let hash = 2166136261
  for (const char of seed) {
    hash ^= char.charCodeAt(0)
    hash = Math.imul(hash, 16777619)
  }
  return () => {
    hash ^= hash << 13
    hash ^= hash >>> 17
    hash ^= hash << 5
    return ((hash >>> 0) % 1000) / 1000
  }
}

const shapes = computed(() => {
  const next = random(props.seed)
  return {
    bars: Array.from({ length: 8 }, (_, index) => ({
      x: 152 + index * 22,
      height: Math.round(22 + next() * 62),
    })),
    rows: Array.from({ length: 5 }, (_, index) => ({
      y: 154 + index * 18,
      width: Math.round(36 + next() * 34),
    })),
    activeNav: Math.floor(next() * 5),
  }
})
</script>

<template>
  <div class="cover" :class="[`cover--${palette}`, `cover--${variant}`]" aria-hidden="true">
    <svg
      class="cover__svg"
      viewBox="0 0 480 270"
      preserveAspectRatio="xMidYMid slice"
      focusable="false"
    >
      <defs>
        <pattern :id="dotsId" width="16" height="16" patternUnits="userSpaceOnUse">
          <circle cx="1.5" cy="1.5" r="1" class="cover__dot" />
        </pattern>
        <linearGradient :id="fadeId" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0.55" stop-color="#fff" stop-opacity="1" />
          <stop offset="1" stop-color="#fff" stop-opacity="0" />
        </linearGradient>
        <mask :id="maskId">
          <rect width="480" height="270" :fill="`url(#${fadeId})`" />
        </mask>
      </defs>

      <rect width="480" height="270" :fill="`url(#${dotsId})`" />

      <!-- Public website: browser window -->
      <g v-if="variant === 'website'" class="cover__scene" :mask="`url(#${maskId})`">
        <rect x="56" y="36" width="368" height="260" rx="12" class="cover__frame" />
        <line x1="56" y1="66" x2="424" y2="66" class="cover__divider" />
        <circle cx="74" cy="51" r="4" class="cover__light" />
        <circle cx="88" cy="51" r="4" class="cover__light" />
        <circle cx="102" cy="51" r="4" class="cover__light" />
        <rect x="170" y="42" width="140" height="18" rx="9" class="cover__url" />
        <text x="240" y="54.5" text-anchor="middle" class="cover__url-text">{{ domain }}</text>

        <rect x="80" y="88" width="58" height="10" rx="5" class="cover__accent-soft" />
        <rect x="80" y="108" width="176" height="14" rx="5" class="cover__ink" />
        <rect x="80" y="128" width="132" height="14" rx="5" class="cover__ink" />
        <rect x="80" y="152" width="196" height="6" rx="3" class="cover__ink-soft" />
        <rect x="80" y="164" width="164" height="6" rx="3" class="cover__ink-soft" />
        <rect x="80" y="184" width="74" height="22" rx="7" class="cover__accent" />
        <rect x="162" y="184" width="64" height="22" rx="7" class="cover__ghost" />

        <g class="cover__orb">
          <circle cx="348" cy="142" r="56" class="cover__orb-1" />
          <circle cx="348" cy="142" r="38" class="cover__orb-2" />
          <circle cx="348" cy="142" r="18" class="cover__orb-3" />
        </g>

        <rect x="80" y="226" width="100" height="56" rx="8" class="cover__card" />
        <rect x="190" y="226" width="100" height="56" rx="8" class="cover__card" />
        <rect x="300" y="226" width="100" height="56" rx="8" class="cover__card" />
      </g>

      <!-- Confidential admin panel: abstract dashboard + lock -->
      <template v-else>
        <g class="cover__scene cover__dashboard" :mask="`url(#${maskId})`">
          <rect x="40" y="32" width="84" height="250" rx="10" class="cover__panel" />
          <rect x="54" y="48" width="40" height="8" rx="4" class="cover__accent" />
          <rect
            x="48"
            :y="68 + shapes.activeNav * 18"
            width="68"
            height="14"
            rx="5"
            class="cover__accent-soft"
          />
          <rect
            v-for="index in 5"
            :key="`nav-${index}`"
            x="56"
            :y="72 + (index - 1) * 18"
            :width="index % 2 ? 48 : 38"
            height="6"
            rx="3"
            class="cover__ink-soft"
          />

          <rect x="136" y="32" width="304" height="28" rx="8" class="cover__panel" />
          <rect x="148" y="43" width="72" height="6" rx="3" class="cover__ink-soft" />
          <circle cx="424" cy="46" r="7" class="cover__accent-soft" />

          <g v-for="index in 3" :key="`kpi-${index}`">
            <rect
              :x="136 + (index - 1) * 105"
              y="72"
              width="94"
              height="52"
              rx="8"
              class="cover__panel"
            />
            <rect
              :x="148 + (index - 1) * 105"
              y="84"
              width="40"
              height="5"
              rx="2.5"
              class="cover__ink-soft"
            />
            <rect
              :x="148 + (index - 1) * 105"
              y="98"
              :width="index === 1 ? 52 : 44"
              height="12"
              rx="4"
              :class="index === 1 ? 'cover__accent' : 'cover__ink'"
            />
          </g>

          <rect x="136" y="136" width="200" height="120" rx="8" class="cover__panel" />
          <rect
            v-for="bar in shapes.bars"
            :key="`bar-${bar.x}`"
            :x="bar.x"
            :y="240 - bar.height"
            width="12"
            :height="bar.height"
            rx="3"
            class="cover__bar"
          />

          <rect x="346" y="136" width="94" height="120" rx="8" class="cover__panel" />
          <rect
            v-for="row in shapes.rows"
            :key="`row-${row.y}`"
            x="358"
            :y="row.y"
            :width="row.width"
            height="6"
            rx="3"
            class="cover__ink-soft"
          />
        </g>

        <g class="cover__lock" transform="translate(240 135)">
          <circle r="44" class="cover__lock-halo" />
          <circle r="30" class="cover__lock-bg" />
          <g transform="translate(-14.4 -14.4) scale(1.2)" class="cover__lock-icon">
            <rect width="18" height="11" x="3" y="11" rx="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </g>
        </g>
      </template>
    </svg>
  </div>
</template>

<style scoped lang="scss">
.cover {
  --c1: #3b82f6;
  --c2: #6366f1;

  position: relative;
  overflow: hidden;
  aspect-ratio: 16 / 9;
  background:
    radial-gradient(
      120% 90% at 90% 0%,
      color-mix(in srgb, var(--c1) 26%, transparent),
      transparent 60%
    ),
    radial-gradient(
      90% 80% at 0% 100%,
      color-mix(in srgb, var(--c2) 20%, transparent),
      transparent 60%
    ),
    var(--surface-2);
}

.cover--admin {
  aspect-ratio: 16 / 8;
}

.cover--green {
  --c1: #10b981;
  --c2: #2dd4bf;
}

.cover--blue {
  --c1: #3b82f6;
  --c2: #6366f1;
}

.cover--amber {
  --c1: #f59e0b;
  --c2: #f97316;
}

.cover--violet {
  --c1: #8b5cf6;
  --c2: #ec4899;
}

.cover__svg {
  width: 100%;
  height: 100%;
}

.cover__scene {
  transition: transform 0.6s var(--ease-out);
}

.cover__dashboard {
  opacity: 0.7;
}

.cover__dot {
  fill: var(--border-strong);
}

.cover__frame,
.cover__panel {
  fill: var(--surface-elevated);
  stroke: var(--border);
}

.cover__divider {
  stroke: var(--border);
}

.cover__light {
  fill: var(--border-strong);
}

.cover__url {
  fill: var(--surface-2);
  stroke: var(--border);
}

.cover__url-text {
  fill: var(--muted);
  font-family: var(--font-mono);
  font-size: 9px;
  font-weight: 600;
}

.cover__ink {
  fill: var(--text);
  opacity: 0.82;
}

.cover__ink-soft {
  fill: var(--muted);
  opacity: 0.35;
}

.cover__accent {
  fill: var(--c1);
}

.cover__accent-soft {
  fill: color-mix(in srgb, var(--c1) 28%, transparent);
}

.cover__ghost {
  fill: none;
  stroke: var(--border-strong);
}

.cover__card {
  fill: var(--surface-2);
  stroke: var(--border);
}

.cover__bar {
  fill: color-mix(in srgb, var(--c1) 70%, var(--c2));
  opacity: 0.75;
}

.cover__orb {
  transform-box: fill-box;
  transform-origin: center;
  transition: transform 0.8s var(--ease-out);
}

.cover__orb-1 {
  fill: color-mix(in srgb, var(--c1) 14%, transparent);
}

.cover__orb-2 {
  fill: color-mix(in srgb, var(--c2) 24%, transparent);
}

.cover__orb-3 {
  fill: var(--c1);
  opacity: 0.85;
}

.cover__lock-halo {
  fill: color-mix(in srgb, var(--c1) 14%, transparent);
  transform-box: fill-box;
  transform-origin: center;
  transition: transform 0.6s var(--ease-out);
}

.cover__lock-bg {
  fill: var(--surface-elevated);
  stroke: color-mix(in srgb, var(--c1) 55%, transparent);
  stroke-width: 1.5;
}

.cover__lock-icon {
  fill: none;
  stroke: var(--c1);
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}
</style>
