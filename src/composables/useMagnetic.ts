import type { Directive } from 'vue'

const cleanups = new WeakMap<HTMLElement, () => void>()

/** Magnetic hover only makes sense with a precise pointer and when motion is welcome. */
function canUseMagnetic() {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(hover: hover) and (pointer: fine)').matches &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

/**
 * `v-magnetic` — the element is gently pulled toward the cursor.
 *
 *   <button v-magnetic>            default strength (0.25)
 *   <button v-magnetic="0.4">      custom strength
 *   <button v-magnetic="false">    disabled
 *
 * Writes `--mx` / `--my` custom properties; the element's CSS decides how to use them
 * (BaseButton applies them via `transform`). Disabled on touch devices and for reduced motion.
 */
export const vMagnetic: Directive<HTMLElement, number | boolean | undefined> = {
  mounted(el, binding) {
    const value = binding.value
    const strength = typeof value === 'number' ? value : value === false ? 0 : 0.25
    if (!strength || !canUseMagnetic()) return

    let frame = 0

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect()
        const x = (event.clientX - rect.left - rect.width / 2) * strength
        const y = (event.clientY - rect.top - rect.height / 2) * strength
        el.style.setProperty('--mx', `${x.toFixed(2)}px`)
        el.style.setProperty('--my', `${y.toFixed(2)}px`)
      })
    }

    const onLeave = () => {
      cancelAnimationFrame(frame)
      el.style.setProperty('--mx', '0px')
      el.style.setProperty('--my', '0px')
    }

    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerleave', onLeave)

    cleanups.set(el, () => {
      cancelAnimationFrame(frame)
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerleave', onLeave)
    })
  },
  unmounted(el) {
    cleanups.get(el)?.()
    cleanups.delete(el)
  },
}
