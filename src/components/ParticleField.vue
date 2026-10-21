<script setup lang="ts">
/**
 * Scroll-driven 3D particle field that lives behind the whole home page
 * (plain Canvas 2D, no libraries).
 *
 * - Every section has its own formation: sphere → ring → DNA helix → wave → galaxy → sphere.
 *   As a section boundary scrolls through the viewport the particles morph into the next
 *   formation, each with a small random delay so the morph feels organic.
 * - Fast scrolling scatters the particles and spins the field; they settle when it stops.
 * - The pointer tilts the field and gently spins it.
 * - Colors come from the active theme (--accent / --accent-2).
 * - Pauses when the tab is hidden; with reduced motion it only redraws on scroll.
 */
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { usePreferredReducedMotion } from '@vueuse/core'
import { useThemeStore } from '@/stores/theme'

const canvas = ref<HTMLCanvasElement | null>(null)
const theme = useThemeStore()
const reducedMotion = usePreferredReducedMotion()

const COUNT = 600
const FPS = 50
const FRAME_MS = 1000 / FPS
const TAU = Math.PI * 2
const GOLDEN = Math.PI * (3 - Math.sqrt(5))

/** Section ids in page order — one formation per section. */
const SECTION_IDS = ['top', 'about', 'skills', 'projects', 'experience', 'contact']

type Formation = {
  points: Float32Array
  /** horizontal offset as a fraction of the viewport width (desktop only) */
  offsetX: number
  scale: number
  opacity: number
  /** base tilt toward the viewer, so flat shapes read as 3D */
  tilt: number
  /** animate the y coordinate as a travelling wave */
  wave: boolean
}

// ---------- formations ----------

/** Deterministic pseudo-random number in [0, 1) for index i. */
function rand(i: number, seed = 1) {
  const x = Math.sin(i * 12.9898 + seed * 78.233) * 43758.5453
  return x - Math.floor(x)
}

function build(fn: (i: number) => [number, number, number]) {
  const out = new Float32Array(COUNT * 3)
  for (let i = 0; i < COUNT; i++) out.set(fn(i), i * 3)
  return out
}

function sphere(i: number): [number, number, number] {
  const y = 1 - (i / (COUNT - 1)) * 2
  const r = Math.sqrt(1 - y * y)
  return [Math.cos(GOLDEN * i) * r, y, Math.sin(GOLDEN * i) * r]
}

function torus(i: number): [number, number, number] {
  const a = (i / COUNT) * TAU
  const b = GOLDEN * i * 7
  const x = (0.78 + 0.26 * Math.cos(b)) * Math.cos(a)
  const y = 0.26 * Math.sin(b)
  const z = (0.78 + 0.26 * Math.cos(b)) * Math.sin(a)
  // Tip the ring toward the viewer
  const t = 1.05
  return [x, y * Math.cos(t) - z * Math.sin(t), y * Math.sin(t) + z * Math.cos(t)]
}

function helix(i: number): [number, number, number] {
  const pair = Math.floor(i / 2)
  const t = pair / (COUNT / 2 - 1)
  const angle = t * Math.PI * 5
  const y = (t * 2 - 1) * 1.15
  const a: [number, number, number] = [Math.cos(angle) * 0.42, y, Math.sin(angle) * 0.42]
  const b: [number, number, number] = [-a[0], y, -a[2]]
  // Every fifth point sits on a "rung" between the two strands
  if (i % 5 === 4) {
    const f = rand(i, 3)
    return [a[0] + (b[0] - a[0]) * f, y, a[2] + (b[2] - a[2]) * f]
  }
  return i % 2 ? b : a
}

const GRID = Math.ceil(Math.sqrt(COUNT))
function plane(i: number): [number, number, number] {
  const col = i % GRID
  const row = Math.floor(i / GRID)
  return [(col / (GRID - 1)) * 2.5 - 1.25, 0, (row / (GRID - 1)) * 2.5 - 1.25]
}

function galaxy(i: number): [number, number, number] {
  const arm = i % 3
  const r = Math.pow(i / COUNT, 0.55) * 1.25
  const angle = r * 3.4 + (arm / 3) * TAU + (rand(i, 5) - 0.5) * 0.5
  const spread = (1.35 - r) * 0.1
  return [
    Math.cos(angle) * r + (rand(i, 6) - 0.5) * spread,
    (rand(i, 7) - 0.5) * spread,
    Math.sin(angle) * r + (rand(i, 8) - 0.5) * spread,
  ]
}

const formations: Formation[] = [
  { points: build(sphere), offsetX: 0, scale: 1, opacity: 0.6, tilt: 0, wave: false },
  { points: build(torus), offsetX: 0.24, scale: 0.9, opacity: 0.45, tilt: 0, wave: false },
  { points: build(helix), offsetX: -0.26, scale: 0.95, opacity: 0.45, tilt: 0, wave: false },
  { points: build(plane), offsetX: 0, scale: 1.3, opacity: 0.32, tilt: 0.55, wave: true },
  { points: build(galaxy), offsetX: 0.24, scale: 1, opacity: 0.45, tilt: 0.95, wave: false },
  { points: build(sphere), offsetX: 0, scale: 0.85, opacity: 0.55, tilt: 0, wave: false },
]

// Per-particle constants: color mix, morph delay and scatter direction
const mixes = new Float32Array(COUNT)
const delays = new Float32Array(COUNT)
const scatter = new Float32Array(COUNT * 3)
for (let i = 0; i < COUNT; i++) {
  mixes[i] = (sphere(i)[1] + 1) / 2
  delays[i] = rand(i, 2) * 0.35
  const dir = sphere(Math.floor(rand(i, 4) * COUNT))
  const strength = 0.5 + rand(i, 9)
  scatter.set([dir[0] * strength, dir[1] * strength, dir[2] * strength], i * 3)
}

// ---------- state ----------

let ctx: CanvasRenderingContext2D | null = null
let width = 0
let height = 0
let dpr = 1
type RGB = [number, number, number]
let colorA: RGB = [37, 99, 235]
let colorB: RGB = [124, 58, 237]

/** Document-space top of each section; recomputed when the page height changes. */
let anchors: number[] = [0]

let rafId = 0
let lastTime = 0
let time = 0
let angleY = 0
let tiltX = 0
let tiltY = 0
let targetTiltX = 0
let targetTiltY = 0
let spin = 0
let lastPointerX: number | null = null
let lastScrollY = 0
let velocity = 0
/** Continuous section position: 2.4 = 40% of the way from formation 2 to 3. */
let stage = 0
let resizeObserver: ResizeObserver | null = null

const smoothstep = (t: number) => t * t * (3 - 2 * t)
const clamp01 = (t: number) => Math.min(Math.max(t, 0), 1)

function measureAnchors() {
  const found = SECTION_IDS.map((id) => document.getElementById(id)).filter(
    (el): el is HTMLElement => el !== null,
  )
  anchors = found.map((el) => el.getBoundingClientRect().top + window.scrollY)
  if (!anchors.length) anchors = [0]
}

/** Maps the scroll position to the stage: a formation holds, then morphs as the next section arrives. */
function targetStage() {
  const center = window.scrollY + height * 0.5
  const last = Math.min(anchors.length, formations.length) - 1
  for (let i = 0; i < last; i++) {
    const start = anchors[i]!
    const end = anchors[i + 1]!
    if (center >= end) continue
    const length = Math.max(end - start, 1)
    const progress = (center - start) / length
    const morphStart = Math.max(0, 1 - (height * 0.65) / length)
    return i + smoothstep(clamp01((progress - morphStart) / (1 - morphStart)))
  }
  return last
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
  measureAnchors()
}

// ---------- rendering ----------

function draw() {
  if (!ctx) return
  ctx.clearRect(0, 0, width, height)

  const index = Math.min(Math.floor(stage), formations.length - 1)
  const from = formations[index]!
  const to = formations[Math.min(index + 1, formations.length - 1)]!
  const blend = stage - index
  const mix = (a: number, b: number) => a + (b - a) * blend

  const desktop = width >= 960
  const cx =
    width / 2 + (desktop ? mix(from.offsetX, to.offsetX) * width : 0) + tiltY * width * 0.04
  const cy = height / 2 - tiltX * height * 0.04
  const radius = Math.min(width, height) * 0.34 * mix(from.scale, to.scale)
  const opacity = mix(from.opacity, to.opacity) * (desktop ? 1 : 0.7)
  const camera = 2.6

  // Scroll speed scatters the particles outward
  const burst = Math.min(Math.abs(velocity) / 45, 1) * 0.45

  const cosY = Math.cos(angleY + tiltY)
  const sinY = Math.sin(angleY + tiltY)
  const tilt = mix(from.tilt, to.tilt) + tiltX
  const cosX = Math.cos(tilt)
  const sinX = Math.sin(tilt)

  for (let i = 0; i < COUNT; i++) {
    const k = i * 3
    // Staggered per-particle morph
    const local = smoothstep(clamp01((blend - delays[i]!) / 0.65))

    let px = from.points[k]! + (to.points[k]! - from.points[k]!) * local
    let py = from.points[k + 1]! + (to.points[k + 1]! - from.points[k + 1]!) * local
    let pz = from.points[k + 2]! + (to.points[k + 2]! - from.points[k + 2]!) * local

    const waveWeight = (from.wave ? 1 - local : 0) + (to.wave ? local : 0)
    if (waveWeight > 0) {
      py += (Math.sin(px * 2.6 + time * 1.3) * 0.12 + Math.cos(pz * 3.1 + time) * 0.08) * waveWeight
    }

    if (burst > 0.001) {
      px += scatter[k]! * burst
      py += scatter[k + 1]! * burst
      pz += scatter[k + 2]! * burst
    }

    // Rotate around Y, then X
    const x1 = px * cosY - pz * sinY
    const z1 = px * sinY + pz * cosY
    const y2 = py * cosX - z1 * sinX
    const z2 = py * sinX + z1 * cosX

    const scale = camera / (camera - z2)
    const sx = cx + x1 * radius * scale
    const sy = cy + y2 * radius * scale

    // Front points are bigger and brighter → depth
    const depth = clamp01((z2 + 1.3) / 2.6)
    const size = 0.6 + depth * 1.8
    const alpha = (0.15 + depth * 0.85) * opacity

    const m = mixes[i]!
    const r = Math.round(colorA[0] + (colorB[0] - colorA[0]) * m)
    const g = Math.round(colorA[1] + (colorB[1] - colorA[1]) * m)
    const b = Math.round(colorA[2] + (colorB[2] - colorA[2]) * m)

    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`
    ctx.beginPath()
    ctx.arc(sx, sy, size, 0, TAU)
    ctx.fill()
  }
}

function loop(now: number) {
  rafId = requestAnimationFrame(loop)
  if (now - lastTime < FRAME_MS) return
  const delta = Math.min(now - lastTime, 100)
  lastTime = now
  time += delta / 1000

  const scrollY = window.scrollY
  velocity += (scrollY - lastScrollY - velocity) * 0.2
  lastScrollY = scrollY

  stage += (targetStage() - stage) * 0.1
  // Idle spin + pointer spin + scroll spin
  angleY += delta * (0.00016 + spin) + velocity * 0.0012
  spin *= 0.96
  tiltX += (targetTiltX - tiltX) * 0.05
  tiltY += (targetTiltY - tiltY) * 0.05
  draw()
}

function start() {
  if (rafId || reducedMotion.value === 'reduce' || document.hidden) return
  lastTime = performance.now()
  lastScrollY = window.scrollY
  rafId = requestAnimationFrame(loop)
}

function stop() {
  cancelAnimationFrame(rafId)
  rafId = 0
}

/** Reduced motion: no animation loop, just jump to the right formation on scroll. */
let staticFrame = 0
function onScroll() {
  if (reducedMotion.value !== 'reduce' || staticFrame) return
  staticFrame = requestAnimationFrame(() => {
    staticFrame = 0
    stage = targetStage()
    draw()
  })
}

function onPointerMove(e: PointerEvent) {
  const nx = e.clientX / window.innerWidth - 0.5
  const ny = e.clientY / window.innerHeight - 0.5
  targetTiltY = nx * 1.0
  targetTiltX = -ny * 0.7

  // Horizontal pointer speed gently spins the field in the same direction
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
  readColors()
  resize()
  stage = targetStage()
  draw()

  // Sections mount progressively and images load late → re-measure when the page grows.
  resizeObserver = new ResizeObserver(() => {
    resize()
    if (!rafId) draw()
  })
  resizeObserver.observe(el)
  resizeObserver.observe(document.body)

  window.addEventListener('pointermove', onPointerMove, { passive: true })
  window.addEventListener('scroll', onScroll, { passive: true })
  document.addEventListener('visibilitychange', onVisibility)
  start()
})

onBeforeUnmount(() => {
  stop()
  cancelAnimationFrame(staticFrame)
  resizeObserver?.disconnect()
  window.removeEventListener('pointermove', onPointerMove)
  window.removeEventListener('scroll', onScroll)
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
    stage = targetStage()
    draw()
  } else start()
})
</script>

<template>
  <canvas ref="canvas" class="particles" aria-hidden="true" />
</template>

<style scoped lang="scss">
.particles {
  position: fixed;
  inset: 0;
  z-index: -1;
  width: 100%;
  height: 100%;
  pointer-events: none;
  animation: particles-in 1.6s var(--ease-out) both;
  animation-delay: 200ms;
}

@keyframes particles-in {
  from {
    opacity: 0;
    scale: 0.9;
  }
  to {
    opacity: 1;
    scale: 1;
  }
}
</style>
