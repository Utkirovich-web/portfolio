import { isNavigationFailure, NavigationFailureType, useRouter } from 'vue-router'
import { renderAllSections } from './useProgressiveSections'
import { getLenis } from './useSmoothScroll'

const FALLBACK_NAV_HEIGHT = 72

/** Height of the fixed navbar, read from the `--nav-height` design token. */
export function getScrollOffset(): number {
  if (typeof window === 'undefined') return FALLBACK_NAV_HEIGHT
  const value = getComputedStyle(document.documentElement).getPropertyValue('--nav-height')
  const parsed = Number.parseFloat(value)
  return Number.isFinite(parsed) ? parsed : FALLBACK_NAV_HEIGHT
}

export function preferredScrollBehavior(): ScrollBehavior {
  if (typeof window === 'undefined') return 'auto'
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
}

export function scrollToElement(element: HTMLElement) {
  const lenis = getLenis()
  if (lenis) {
    lenis.scrollTo(element, { offset: -getScrollOffset() })
    return
  }
  const top = element.getBoundingClientRect().top + window.scrollY - getScrollOffset()
  window.scrollTo({ top, behavior: preferredScrollBehavior() })
}

/**
 * Smooth in-page navigation that keeps the URL hash in sync (/#projects) and
 * moves keyboard focus to the target section for screen-reader users.
 */
export function useSectionNav() {
  const router = useRouter()

  async function goTo(id: string) {
    // Sections mount progressively; make sure the target (and everything above it) exists.
    await renderAllSections()
    const result = await router.push({ name: 'home', hash: `#${id}` })
    const target = document.getElementById(id)
    if (!target) return

    // Clicking the link of the hash that's already in the URL doesn't trigger a navigation.
    if (isNavigationFailure(result, NavigationFailureType.duplicated)) scrollToElement(target)
    target.focus({ preventScroll: true })
  }

  async function goTop() {
    if (router.currentRoute.value.name !== 'home') {
      await router.push({ name: 'home' })
      return
    }
    if (router.currentRoute.value.hash) await router.replace({ name: 'home', hash: '' })
    const lenis = getLenis()
    if (lenis) lenis.scrollTo(0)
    else window.scrollTo({ top: 0, behavior: preferredScrollBehavior() })
    document.getElementById('top')?.focus({ preventScroll: true })
  }

  return { goTo, goTop }
}
