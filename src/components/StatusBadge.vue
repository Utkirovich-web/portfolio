<script setup lang="ts">
withDefaults(
  defineProps<{
    label: string
    tone?: 'success' | 'accent'
    pulse?: boolean
    size?: 'sm' | 'md'
  }>(),
  { tone: 'success', pulse: true, size: 'md' },
)
</script>

<template>
  <span class="status-badge" :class="[`status-badge--${tone}`, `status-badge--${size}`]">
    <span class="status-badge__dot" :class="{ 'is-pulsing': pulse }" aria-hidden="true" />
    <span class="status-badge__label">{{ label }}</span>
  </span>
</template>

<style scoped lang="scss">
.status-badge {
  --dot: var(--success);

  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  height: 2rem;
  padding-inline: 0.75rem 0.875rem;
  border: 1px solid var(--border);
  border-radius: var(--radius-full);
  background: var(--surface);
  color: var(--text-2);
  font-size: 0.8125rem;
  font-weight: 600;
  line-height: 1;
  white-space: nowrap;
  -webkit-backdrop-filter: var(--surface-blur);
  backdrop-filter: var(--surface-blur);
  box-shadow: var(--shadow-sm);
}

.status-badge--accent {
  --dot: var(--accent);
}

.status-badge--sm {
  height: 1.5rem;
  gap: 0.375rem;
  padding-inline: 0.5rem 0.625rem;
  font-size: 0.75rem;
}

.status-badge__dot {
  position: relative;
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  background: var(--dot);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--dot) 20%, transparent);

  &.is-pulsing::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background: var(--dot);
    animation: pulse 2s cubic-bezier(0, 0, 0.2, 1) infinite;
  }
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 0.7;
  }
  75%,
  100% {
    transform: scale(3);
    opacity: 0;
  }
}
</style>
