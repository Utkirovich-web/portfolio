import { onBeforeUnmount, onMounted } from 'vue'

const MAX_SKEW = 2.2 // degrees

/**
 * Exposes the (smoothed) scroll speed as `--scroll-skew` on <html>, so `[data-skew]`
 * elements lean with fast scrolling and spring back when it stops.
 * The frame loop only runs while the page is moving. Skipped for reduced motion.
 */
export function useScrollSkew() {
  const root = document.documentElement
  let rafId = 0
  let lastY = 0
  let skew = 0

  function frame() {
    const y = window.scrollY
    const velocity = y - lastY
    lastY = y

    const target = Math.max(-MAX_SKEW, Math.min(MAX_SKEW, velocity * -0.06))
    skew += (target - skew) * 0.12

    if (Math.abs(skew) < 0.01 && Math.abs(velocity) < 0.5) {
      skew = 0
      root.style.removeProperty('--scroll-skew')
      rafId = 0
      return
    }
    root.style.setProperty('--scroll-skew', `${skew.toFixed(3)}deg`)
    rafId = requestAnimationFrame(frame)
  }

  function onScroll() {
    if (!rafId) rafId = requestAnimationFrame(frame)
  }

  onMounted(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    lastY = window.scrollY
    window.addEventListener('scroll', onScroll, { passive: true })
  })

  onBeforeUnmount(() => {
    cancelAnimationFrame(rafId)
    window.removeEventListener('scroll', onScroll)
    root.style.removeProperty('--scroll-skew')
  })
}
