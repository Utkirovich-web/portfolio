import { nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { allSectionsRendered } from './useProgressiveSections'

/**
 * Tracks which page section is currently in the middle of the viewport
 * (used to highlight the matching navbar link).
 */
export function useActiveSection(ids: readonly string[]) {
  const active = ref<string | null>(null)
  const route = useRoute()
  let observer: IntersectionObserver | null = null

  function observe() {
    observer?.disconnect()
    active.value = null
    if (typeof IntersectionObserver === 'undefined') return

    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) active.value = entry.target.id
        }
      },
      // A thin band ~40% down the viewport: whichever section crosses it is "active".
      { rootMargin: '-38% 0px -58% 0px' },
    )

    for (const id of ids) {
      const element = document.getElementById(id)
      if (element) observer.observe(element)
    }
  }

  // Sections only exist on the home route and mount progressively,
  // so re-observe when the route changes and once they're all rendered.
  watch([() => route.name, allSectionsRendered], () => nextTick(observe), {
    immediate: true,
    flush: 'post',
  })

  onBeforeUnmount(() => observer?.disconnect())

  return active
}
