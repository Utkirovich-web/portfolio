import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'

// Shared state: section navigation and active-section tracking need to know
// whether every section already exists in the DOM.
const renderAll = ref(false)
const renderedCount = ref(0)
const totalCount = ref(0)

export const allSectionsRendered = computed(
  () => renderAll.value || (totalCount.value > 0 && renderedCount.value >= totalCount.value),
)

/** Mounts every remaining section right away (e.g. right before jumping to one of them). */
export async function renderAllSections() {
  if (allSectionsRendered.value) return
  renderAll.value = true
  await nextTick()
}

/** Runs `callback` in a new task right after the next frame is painted. */
function afterPaint(callback: () => void) {
  let timeout: ReturnType<typeof setTimeout> | undefined
  const frame = requestAnimationFrame(() => {
    timeout = setTimeout(callback, 0)
  })
  return () => {
    cancelAnimationFrame(frame)
    clearTimeout(timeout)
  }
}

/**
 * Progressive rendering for the one-page layout: the hero renders immediately and the
 * below-the-fold sections are mounted one per task after the first paint. This keeps the
 * initial main-thread task short (better TBT / INP on slow phones) without lazy-loading
 * code or content — everything is in the DOM a few frames later.
 *
 * Pass `immediate: true` (e.g. when the URL has a #hash) to render everything at once.
 */
export function useProgressiveSections(total: number, options: { immediate?: boolean } = {}) {
  totalCount.value = total
  renderedCount.value = 0
  renderAll.value = Boolean(options.immediate)

  let cancel: (() => void) | undefined

  function step() {
    if (allSectionsRendered.value) return
    renderedCount.value += 1
    cancel = afterPaint(step)
  }

  onMounted(() => {
    cancel = afterPaint(step)
  })

  onBeforeUnmount(() => cancel?.())

  const isRendered = (index: number) => renderAll.value || index < renderedCount.value

  return { isRendered, allRendered: allSectionsRendered }
}
