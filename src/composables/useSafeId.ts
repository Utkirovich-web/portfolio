import { useId } from 'vue'

/**
 * Stable, unique id that is safe inside CSS selectors and SVG `url(#id)` references.
 * Must be called from a component's setup.
 */
export function useSafeId(prefix: string) {
  const raw = useId() ?? Math.random().toString(36).slice(2)
  return `${prefix}-${raw.replace(/[^a-zA-Z0-9_-]/g, '')}`
}
