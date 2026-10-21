<script setup lang="ts">
/**
 * Lightweight 3D dot globe for the hero (plain Canvas 2D, no libraries).
 * - ~500 points on a sphere, rotated in JS and projected with simple perspective.
 * - Tilts toward the pointer, colors come from the active theme (--accent / --accent-2).
 * - Pauses when off-screen or when the tab is hidden; static frame with reduced motion.
 */
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { usePreferredReducedMotion } from '@vueuse/core'
import { useThemeStore } from '@/stores/theme'

const canvas = ref<HTMLCanvasElement | null>(null)
const theme = useThemeStore()
const reducedMotion = usePreferredReducedMotion()

const POINTS = 520
const FPS = 40
const FRAME_MS = 1000 / FPS

type Point = { x: number; y: number; z: number; mix: number }
let points: Point[] = []
let ctx: CanvasRenderingContext2D | null = null
let width = 0
let height = 0
let dpr = 1
type RGB = [number, number, number]
let colorA: RGB = [37, 99, 235]
let colorB: RGB = [124, 58, 237]

let rafId = 0
let lastTime = 0
let angleY = 0
let tiltX = 0
let tiltY = 0
let targetTiltX = 0
let targetTiltY = 0
// Extra spin from pointer movement (radians per ms), decays back to the idle speed
let spin = 0
let lastPointerX: number | null = null
let visible = true
let observer: IntersectionObserver | null = null
let resizeObserver: ResizeObserver | null = null

/** Evenly spread points on a unit sphere (Fibonacci lattice). */
function createPoints() {
  const golden = Math.PI * (3 - Math.sqrt(5))
  points = Array.from({ length: POINTS }, (_, i) => {
    const y = 1 - (i / (POINTS - 1)) * 2
    const r = Math.sqrt(1 - y * y)
    const theta = golden * i
    return { x: Math.cos(theta) * r, y, z: Math.sin(theta) * r, mix: (y + 1) / 2 }
  })
}

function parseColor(value: string, fallback: RGB): RGB {
  const hex = value.trim().replace('#', '')
  if (/^[0-9a-f]{6}$/i.test(hex)) {
    const n = (i: number) => parseInt(hex.slice(i, i + 2), 16)
    return [n(0), n(2), n(4)]
  }
  const nums = value.match(/\d+/g)
  return nums && nums.length >= 3 ? [Number(nums[0]), Number(nums[1]), Number(nums[2])] : fallback
}

function readColors() {
  const styles = getComputedStyle(document.documentElement)
  colorA = parseColor(styles.getPropertyValue('--accent'), colorA)
  colorB = parseColor(styles.getPropertyValue('--accent-2'), colorB)
}

function resize() {
  const el = canvas.value
  if (!el) return
  // Cap the pixel ratio — sharp enough, but half the work on 3x screens.
  dpr = Math.min(window.devicePixelRatio || 1, 1.5)
  width = el.clientWidth
  height = el.clientHeight
  el.width = Math.round(width * dpr)
  el.height = Math.round(height * dpr)
  ctx?.setTransform(dpr, 0, 0, dpr, 0, 0)
}

function draw() {
  if (!ctx) return
  ctx.clearRect(0, 0, width, height)

  const radius = Math.min(width, height) * 0.36
  // Slight parallax: the globe drifts toward the pointer
  const cx = width / 2 + tiltY * width * 0.05
  const cy = height / 2 - tiltX * height * 0.05
  const camera = 2.6

  const cosY = Math.cos(angleY + tiltY)
  const sinY = Math.sin(angleY + tiltY)
  const cosX = Math.cos(tiltX)
  const sinX = Math.sin(tiltX)

  for (const p of points) {
    // Rotate around Y, then X
    const x1 = p.x * cosY - p.z * sinY
    const z1 = p.x * sinY + p.z * cosY
    const y2 = p.y * cosX - z1 * sinX
    const z2 = p.y * sinX + z1 * cosX

    const scale = camera / (camera - z2)
    const sx = cx + x1 * radius * scale
    const sy = cy + y2 * radius * scale

    // Front points are bigger and brighter → depth
    const depth = (z2 + 1) / 2
    const size = 0.6 + depth * 1.8
    const alpha = 0.12 + depth * 0.78

    const r = Math.round(colorA[0] + (colorB[0] - colorA[0]) * p.mix)
    const g = Math.round(colorA[1] + (colorB[1] - colorA[1]) * p.mix)
    const b = Math.round(colorA[2] + (colorB[2] - colorA[2]) * p.mix)

    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`
    ctx.beginPath()
    ctx.arc(sx, sy, size, 0, Math.PI * 2)
    ctx.fill()
  }
}

function loop(time: number) {
  rafId = requestAnimationFrame(loop)
  if (time - lastTime < FRAME_MS) return
  const delta = Math.min(time - lastTime, 100)
  lastTime = time

  angleY += delta * (0.00018 + spin)
  spin *= 0.96
  // Ease the tilt toward the pointer
  tiltX += (targetTiltX - tiltX) * 0.05
  tiltY += (targetTiltY - tiltY) * 0.05
  draw()
}

function start() {
  if (rafId || reducedMotion.value === 'reduce' || !visible || document.hidden) return
  lastTime = performance.now()
  rafId = requestAnimationFrame(loop)
}

function stop() {
  cancelAnimationFrame(rafId)
  rafId = 0
}

function onPointerMove(e: PointerEvent) {
  const nx = e.clientX / window.innerWidth - 0.5
  const ny = e.clientY / window.innerHeight - 0.5
  targetTiltY = nx * 1.0
  targetTiltX = -ny * 0.7

  // Horizontal pointer speed gently spins the globe in the same direction
  if (lastPointerX !== null) {
    const dx = (e.clientX - lastPointerX) / window.innerWidth
    spin = Math.max(-0.0009, Math.min(0.0009, spin + dx * 0.005))
  }
  lastPointerX = e.clientX
}

function onVisibility() {
  if (document.hidden) stop()
  else start()
}

onMounted(() => {
  const el = canvas.value
  if (!el) return
  ctx = el.getContext('2d')
  createPoints()
  readColors()
  resize()
  draw()

  resizeObserver = new ResizeObserver(() => {
    resize()
    draw()
  })
  resizeObserver.observe(el)

  observer = new IntersectionObserver(([entry]) => {
    visible = !!entry?.isIntersecting
    if (visible) start()
    else stop()
  })
  observer.observe(el)

  window.addEventListener('pointermove', onPointerMove, { passive: true })
  document.addEventListener('visibilitychange', onVisibility)
  start()
})

onBeforeUnmount(() => {
  stop()
  observer?.disconnect()
  resizeObserver?.disconnect()
  window.removeEventListener('pointermove', onPointerMove)
  document.removeEventListener('visibilitychange', onVisibility)
})

// Re-read colors after the theme switches (wait one frame for the new tokens).
watch(
  () => theme.resolved,
  () =>
    requestAnimationFrame(() => {
      readColors()
      draw()
    }),
)

watch(reducedMotion, (value) => {
  if (value === 'reduce') {
    stop()
    draw()
  } else start()
})
</script>

<template>
  <canvas ref="canvas" class="globe" aria-hidden="true" />
</template>

<style scoped lang="scss">
.globe {
  position: absolute;
  top: 50%;
  left: 50%;
  width: min(90vh, 110vw);
  height: min(90vh, 110vw);
  translate: -50% -50%;
  pointer-events: none;
  opacity: 0.55;
  animation: globe-in 1.4s var(--ease-out) both;
  animation-delay: 200ms;
  // Fade the edges so the text on top stays readable
  mask-image: radial-gradient(circle at center, #000 45%, transparent 72%);
}

@keyframes globe-in {
  from {
    opacity: 0;
    scale: 0.85;
  }
  to {
    opacity: 0.55;
    scale: 1;
  }
}
</style>
