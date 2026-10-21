import { onBeforeUnmount, onMounted } from 'vue'
import type Lenis from 'lenis'

let lenis: Lenis | null = null

/** The active smooth-scroll instance (null on touch devices, reduced motion or before load). */
export function getLenis(): Lenis | null {
  return lenis
}

/**
 * Inertia ("buttery") wheel scrolling via Lenis.
 * - Lenis still drives the native scroll position, so `window.scrollY`, IntersectionObserver,
 *   anchors and keyboard scrolling keep working.
 * - Touch scrolling stays native; skipped entirely for reduced motion.
 * - Loaded lazily so it never delays the first paint.
 * - Programmatic scrolls go through `getLenis()` (see useSectionNav / router).
 */
export function useSmoothScroll() {
  let disposed = false

  onMounted(async () => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const { default: LenisCtor } = await import('lenis')
    if (disposed) return

    lenis = new LenisCtor({
      autoRaf: true,
      lerp: 0.09,
      wheelMultiplier: 0.9,
    })
  })

  onBeforeUnmount(() => {
    disposed = true
    lenis?.destroy()
    lenis = null
  })
}
