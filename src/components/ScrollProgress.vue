<script setup lang="ts">
/**
 * Thin gradient bar at the top of the viewport showing how far the page is scrolled.
 * Updates at most once per frame and only animates `transform`.
 */
import { onBeforeUnmount, onMounted, ref } from 'vue'

const bar = ref<HTMLDivElement | null>(null)
let rafId = 0

function update() {
  rafId = 0
  const max = document.documentElement.scrollHeight - window.innerHeight
  const progress = max > 0 ? Math.min(window.scrollY / max, 1) : 0
  if (bar.value) bar.value.style.transform = `scaleX(${progress})`
}

function onScroll() {
  if (!rafId) rafId = requestAnimationFrame(update)
}

onMounted(() => {
  update()
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onScroll, { passive: true })
})

onBeforeUnmount(() => {
  cancelAnimationFrame(rafId)
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('resize', onScroll)
})
</script>

<template>
  <div class="scroll-progress" aria-hidden="true">
    <div ref="bar" class="scroll-progress__bar" />
  </div>
</template>

<style scoped lang="scss">
.scroll-progress {
  position: fixed;
  inset: 0 0 auto;
  z-index: 60;
  height: 3px;
  pointer-events: none;
}

.scroll-progress__bar {
  height: 100%;
  background: linear-gradient(90deg, var(--accent), var(--accent-2));
  transform: scaleX(0);
  transform-origin: left center;
}
</style>
