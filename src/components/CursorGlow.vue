<script setup lang="ts">
/**
 * Soft accent-colored light that trails the pointer behind the page content.
 * - Eased with requestAnimationFrame; only `transform` is animated (no layout).
 * - The loop stops once the light has caught up with the pointer.
 * - Disabled on touch devices and for reduced motion.
 */
import { onBeforeUnmount, onMounted, ref } from 'vue'

const glow = ref<HTMLDivElement | null>(null)
const enabled = ref(false)

let x = 0
let y = 0
let targetX = 0
let targetY = 0
let rafId = 0

function render() {
  x += (targetX - x) * 0.12
  y += (targetY - y) * 0.12
  if (glow.value) glow.value.style.transform = `translate3d(${x}px, ${y}px, 0)`

  rafId = Math.abs(targetX - x) + Math.abs(targetY - y) > 0.5 ? requestAnimationFrame(render) : 0
}

function onPointerMove(e: PointerEvent) {
  if (e.pointerType !== 'mouse') return
  targetX = e.clientX
  targetY = e.clientY
  if (glow.value && !glow.value.classList.contains('is-active')) {
    // First move: jump straight to the pointer instead of flying in from the corner
    x = targetX
    y = targetY
    glow.value.classList.add('is-active')
  }
  if (!rafId) rafId = requestAnimationFrame(render)
}

function onPointerLeave() {
  glow.value?.classList.remove('is-active')
}

onMounted(() => {
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (!finePointer || reduced) return

  enabled.value = true
  window.addEventListener('pointermove', onPointerMove, { passive: true })
  document.documentElement.addEventListener('pointerleave', onPointerLeave)
})

onBeforeUnmount(() => {
  cancelAnimationFrame(rafId)
  window.removeEventListener('pointermove', onPointerMove)
  document.documentElement.removeEventListener('pointerleave', onPointerLeave)
})
</script>

<template>
  <div v-if="enabled" class="cursor-glow" aria-hidden="true">
    <div ref="glow" class="cursor-glow__light" />
  </div>
</template>

<style scoped lang="scss">
.cursor-glow {
  position: fixed;
  inset: 0;
  z-index: -1;
  overflow: hidden;
  pointer-events: none;
}

.cursor-glow__light {
  position: absolute;
  top: -300px;
  left: -300px;
  width: 600px;
  height: 600px;
  border-radius: 50%;
  background: radial-gradient(
    circle,
    color-mix(in srgb, var(--accent) 16%, transparent) 0%,
    color-mix(in srgb, var(--accent-2) 8%, transparent) 40%,
    transparent 70%
  );
  opacity: 0;
  transition: opacity 0.4s ease;
  will-change: transform;

  &.is-active {
    opacity: 1;
  }
}
</style>
