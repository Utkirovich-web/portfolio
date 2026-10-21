<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, type RouteLocationRaw } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { vMagnetic } from '@/composables/useMagnetic'

type Variant = 'primary' | 'secondary' | 'ghost'
type Size = 'sm' | 'md' | 'lg'

const props = withDefaults(
  defineProps<{
    variant?: Variant
    size?: Size
    /** Renders an <a>. */
    href?: string
    /** Renders a <RouterLink>. */
    to?: RouteLocationRaw
    /** Opens in a new tab with a screen-reader hint. */
    external?: boolean
    type?: 'button' | 'submit' | 'reset'
    /** Gently follows the cursor on desktop (see useMagnetic). */
    magnetic?: boolean
    block?: boolean
  }>(),
  {
    variant: 'primary',
    size: 'md',
    external: false,
    type: 'button',
    magnetic: false,
    block: false,
  },
)

const { t } = useI18n()

const tag = computed(() => (props.to ? RouterLink : props.href ? 'a' : 'button'))

const bindings = computed(() => {
  if (props.to) return { to: props.to }
  if (props.href) {
    return props.external
      ? { href: props.href, target: '_blank', rel: 'noopener noreferrer' }
      : { href: props.href }
  }
  return { type: props.type }
})
</script>

<template>
  <component
    :is="tag"
    v-bind="bindings"
    v-magnetic="magnetic ? 0.25 : false"
    class="btn"
    :class="[`btn--${variant}`, `btn--${size}`, { 'btn--block': block }]"
  >
    <span class="btn__inner">
      <slot name="icon-left" />
      <span v-if="$slots.default" class="btn__label"><slot /></span>
      <slot name="icon-right" />
      <span v-if="external" class="sr-only">{{ t('a11y.newTab') }}</span>
    </span>
  </component>
</template>

<style scoped lang="scss">
.btn {
  --mx: 0px;
  --my: 0px;

  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid transparent;
  border-radius: var(--radius-md);
  font-weight: 600;
  line-height: 1;
  white-space: nowrap;
  text-decoration: none;
  cursor: pointer;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  transform: translate3d(var(--mx), var(--my), 0);
  transition:
    transform 0.35s var(--ease-out),
    background-color 0.2s ease,
    border-color 0.2s ease,
    color 0.2s ease,
    box-shadow 0.25s ease;

  &:active {
    transform: translate3d(var(--mx), var(--my), 0) scale(0.98);
  }

  &:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 3px;
  }
}

.btn__inner {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;

  :deep(.icon) {
    transition: transform 0.3s var(--ease-out);
  }
}

.btn {
  @include hover {
    .btn__inner > :deep(.icon:last-child) {
      transform: translateX(2px);
    }
  }
}

// Sizes (heights on the 8px grid; md/lg meet the 44px touch target)
.btn--sm {
  height: 2.25rem;
  padding-inline: 0.875rem;
  border-radius: 10px;
  font-size: 0.875rem;
}

.btn--md {
  height: 2.75rem;
  padding-inline: 1.25rem;
  font-size: 0.9375rem;
}

.btn--lg {
  height: 3.25rem;
  padding-inline: 1.5rem;
  font-size: 1rem;
}

.btn--block {
  width: 100%;
}

// Variants
.btn--primary {
  background: var(--btn-primary-bg);
  color: var(--btn-primary-fg);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 0.18),
    var(--shadow-sm);

  @include hover {
    background: var(--btn-primary-bg-hover);
    box-shadow:
      inset 0 1px 0 rgb(255 255 255 / 0.18),
      var(--shadow-md),
      var(--button-glow);
  }
}

.btn--secondary {
  border-color: var(--border);
  background: var(--surface);
  color: var(--text);
  -webkit-backdrop-filter: var(--surface-blur);
  backdrop-filter: var(--surface-blur);

  @include hover {
    border-color: var(--border-strong);
    background: var(--surface-2);
    box-shadow: var(--button-glow);
  }
}

.btn--ghost {
  background: transparent;
  color: var(--text-2);

  @include hover {
    background: var(--surface-2);
    color: var(--text);
  }
}
</style>
