<script setup lang="ts">
import BaseIcon from './BaseIcon.vue'
import StatusBadge from './StatusBadge.vue'
import type { IconName } from '@/assets/icons'

withDefaults(
  defineProps<{
    period: string
    role: string
    organization: string
    typeLabel: string
    icon: IconName
    points?: string[]
    current?: boolean
    currentLabel?: string
  }>(),
  { points: () => [], current: false },
)
</script>

<template>
  <li class="timeline-item" :class="{ 'is-current': current }" data-reveal>
    <span class="timeline-item__marker" aria-hidden="true">
      <BaseIcon :name="icon" :size="18" />
    </span>

    <article class="timeline-item__card surface-card">
      <header class="timeline-item__header">
        <div class="timeline-item__meta">
          <span class="timeline-item__period">{{ period }}</span>
          <span class="timeline-item__type">{{ typeLabel }}</span>
          <StatusBadge v-if="current && currentLabel" :label="currentLabel" size="sm" />
        </div>
        <h3 class="timeline-item__role">{{ role }}</h3>
        <p class="timeline-item__org">{{ organization }}</p>
      </header>

      <ul v-if="points.length" class="timeline-item__points" role="list">
        <li v-for="point in points" :key="point">{{ point }}</li>
      </ul>
    </article>
  </li>
</template>

<style scoped lang="scss">
.timeline-item {
  position: relative;
  display: grid;
  grid-template-columns: 2.5rem minmax(0, 1fr);
  gap: var(--space-2);

  @include up(sm) {
    gap: var(--space-3);
  }
}

.timeline-item__marker {
  position: relative;
  z-index: 1;
  display: grid;
  place-items: center;
  width: 2.5rem;
  height: 2.5rem;
  margin-top: 1.25rem;
  border: 1px solid var(--border);
  border-radius: 50%;
  background: var(--bg);
  color: var(--muted);

  .is-current & {
    border-color: var(--accent);
    color: var(--accent);
    box-shadow:
      0 0 0 4px var(--accent-soft),
      var(--button-glow);
  }
}

.timeline-item__card {
  padding: var(--space-3);
  transition:
    border-color 0.3s ease,
    box-shadow 0.3s ease;

  @include up(md) {
    padding: var(--space-4);
  }

  @include hover {
    border-color: var(--border-strong);
    box-shadow: var(--card-hover-shadow);
  }
}

.timeline-item__header {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.timeline-item__meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem 0.75rem;
}

.timeline-item__period {
  color: var(--accent);
  font-family: var(--font-mono);
  font-size: 0.8125rem;
  font-weight: 600;
}

.timeline-item__type {
  padding: 0.125rem 0.5rem;
  border: 1px solid var(--border);
  border-radius: var(--radius-full);
  color: var(--muted);
  font-size: 0.75rem;
  font-weight: 500;
}

.timeline-item__role {
  font-size: clamp(1.25rem, 2.2vw, 1.5rem);
}

.timeline-item__org {
  color: var(--muted);
  font-size: 0.9375rem;
}

.timeline-item__points {
  display: grid;
  gap: 0.75rem;
  margin-top: var(--space-3);
  padding-top: var(--space-3);
  border-top: 1px solid var(--border);
  color: var(--text-2);
  font-size: 0.9375rem;

  li {
    position: relative;
    padding-left: 1.5rem;

    &::before {
      content: '';
      position: absolute;
      top: 0.6em;
      left: 0.25rem;
      width: 0.375rem;
      height: 0.375rem;
      border-radius: 2px;
      background: var(--accent);
      rotate: 45deg;
    }
  }
}
</style>
