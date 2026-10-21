<script setup lang="ts">
import { icons, type IconName } from '@/assets/icons'

withDefaults(
  defineProps<{
    name: IconName
    size?: number | string
    strokeWidth?: number
  }>(),
  { size: 20, strokeWidth: 1.75 },
)
</script>

<template>
  <!-- Icon markup is static and trusted (src/assets/icons.ts), never user input. -->
  <!-- eslint-disable vue/no-v-html -->
  <svg
    class="icon"
    xmlns="http://www.w3.org/2000/svg"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    :stroke-width="strokeWidth"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    focusable="false"
    v-html="icons[name]"
  />
</template>

<style scoped>
.icon {
  display: inline-block;
  flex-shrink: 0;
  vertical-align: middle;
}
</style>
