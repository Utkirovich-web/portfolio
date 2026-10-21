<script setup lang="ts">
import { useSafeId } from '@/composables/useSafeId'

withDefaults(defineProps<{ size?: number }>(), { size: 36 })

const gradientId = useSafeId('logo-gradient')
</script>

<template>
  <span class="logo-mark" :style="{ width: `${size}px`, height: `${size}px` }" aria-hidden="true">
    <svg viewBox="0 0 64 64" width="100%" height="100%">
      <defs>
        <linearGradient
          :id="gradientId"
          x1="8"
          y1="8"
          x2="56"
          y2="56"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" class="logo-mark__stop logo-mark__stop--start" />
          <stop offset="1" class="logo-mark__stop logo-mark__stop--end" />
        </linearGradient>
      </defs>
      <g
        fill="none"
        :stroke="`url(#${gradientId})`"
        stroke-width="4.75"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path
          d="M29.5 23.5C28 20.6 25.4 19 21.8 19 17.3 19 14 21.4 14 25.2c0 3.8 3.2 5.4 7.9 6.5 5 1.2 8.1 3 8.1 6.9 0 4-3.4 6.4-8.1 6.4-4 0-7-1.7-8.5-4.7"
        />
        <path d="M34.5 45 43 19l8.5 26M37.6 36h10.8" />
      </g>
    </svg>
  </span>
</template>

<style scoped>
.logo-mark {
  display: inline-grid;
  place-items: center;
  flex-shrink: 0;
  padding: 2px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--surface);
  box-shadow: var(--shadow-sm);
  -webkit-backdrop-filter: var(--surface-blur);
  backdrop-filter: var(--surface-blur);
}

.logo-mark__stop--start {
  stop-color: var(--text);
}

.logo-mark__stop--end {
  stop-color: var(--accent);
}
</style>
