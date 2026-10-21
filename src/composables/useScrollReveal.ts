import { onBeforeUnmount, onMounted, watch, type Ref } from 'vue'

type IdleHandle = { cancel: () => void }

/** Runs `callback` when the browser is idle (falls back to a short timeout). */
function whenIdle(callback: () => void): IdleHandle {
  if (typeof window.requestIdleCallback === 'function') {
    const id = window.requestIdleCallback(callback, { timeout: 2500 })
    return { cancel: () => window.cancelIdleCallback(id) }
  }
  const id = window.setTimeout(callback, 300)
  return { cancel: () => window.clearTimeout(id) }
}

/**
 * Fades + lifts every `[data-reveal]` element into view as it scrolls in.
 *
 * - GSAP is loaded lazily (separate chunk) once the browser is idle, so it never
 *   competes with the first paint or blocks the main thread during load.
 * - An IntersectionObserver decides *when* to animate (no scroll listeners, no forced
 *   layout on scroll); GSAP does the tweening and staggering.
 * - Only elements below the fold are hidden, so nothing already visible ever flickers.
 * - Only opacity/transform are animated, so hidden elements stay focusable.
 * - Skipped entirely for `prefers-reduced-motion: reduce`.
 *
 * `ready` delays the setup until all target elements are in the DOM
 * (see useProgressiveSections).
 */
export function useScrollReveal(selector = '[data-reveal]', ready?: Readonly<Ref<boolean>>) {
  let observer: IntersectionObserver | undefined
  let idle: IdleHandle | undefined
  let disposed = false

  async function start() {
    const { gsap } = await import('gsap')
    if (disposed) return

    const elements = Array.from(document.querySelectorAll<HTMLElement>(selector))
    const fold = window.innerHeight
    // Read all positions first, then write, to avoid layout thrashing.
    const belowFold = elements.filter((element) => element.getBoundingClientRect().top > fold)
    if (!belowFold.length) return

    gsap.set(belowFold, { opacity: 0, y: 24 })

    observer = new IntersectionObserver(
      (entries) => {
        const entering = entries
          .filter((entry) => entry.isIntersecting)
          .map((entry) => entry.target)
        if (!entering.length) return

        entering.forEach((element) => observer?.unobserve(element))
        gsap.to(entering, {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power3.out',
          stagger: 0.08,
          overwrite: true,
          clearProps: 'opacity,transform',
        })
      },
      { rootMargin: '0px 0px -8% 0px' },
    )

    belowFold.forEach((element) => observer?.observe(element))
  }

  onMounted(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const schedule = () => {
      idle = whenIdle(() => {
        start().catch(() => {
          // If the animation chunk fails to load, content simply stays visible.
        })
      })
    }

    if (!ready || ready.value) {
      schedule()
      return
    }
    const stop = watch(ready, (isReady) => {
      if (!isReady) return
      stop()
      schedule()
    })
  })

  onBeforeUnmount(() => {
    disposed = true
    idle?.cancel()
    observer?.disconnect()
  })
}
