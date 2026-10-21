<script setup lang="ts">
import { computed, nextTick, ref, useTemplateRef } from 'vue'
import { onClickOutside } from '@vueuse/core'
import BaseIcon from './BaseIcon.vue'
import type { DropdownOption } from '@/types/ui'
import { useSafeId } from '@/composables/useSafeId'

/**
 * Accessible single-choice menu (WAI-ARIA menu button with menuitemradio items).
 * Keyboard: Enter/Space/↓ open, ↑/↓/Home/End move, Enter/Space select, Esc/Tab close.
 */
const props = withDefaults(
  defineProps<{
    options: DropdownOption[]
    modelValue: string
    /**
     * Accessible name of the trigger. Needed for icon-only triggers; omit it when the
     * trigger content already reads well (the name is then taken from the content).
     */
    label?: string
    align?: 'start' | 'end'
  }>(),
  { align: 'end' },
)

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const open = ref(false)
const root = useTemplateRef<HTMLElement>('root')
const trigger = useTemplateRef<HTMLButtonElement>('trigger')
const items: HTMLButtonElement[] = []

const baseId = useSafeId('dropdown')
const buttonId = `${baseId}-button`
const menuId = `${baseId}-menu`

const selectedIndex = computed(() =>
  Math.max(
    0,
    props.options.findIndex((option) => option.value === props.modelValue),
  ),
)

function setItemRef(element: unknown, index: number) {
  if (element instanceof HTMLButtonElement) items[index] = element
}

function focusItem(index: number) {
  const count = props.options.length
  items[(index + count) % count]?.focus()
}

async function openMenu(focusIndex = selectedIndex.value) {
  open.value = true
  await nextTick()
  focusItem(focusIndex)
}

function closeMenu(returnFocus = true) {
  if (!open.value) return
  open.value = false
  if (returnFocus) trigger.value?.focus()
}

function toggle() {
  if (open.value) closeMenu()
  else openMenu()
}

function select(value: string) {
  emit('update:modelValue', value)
  closeMenu()
}

function onTriggerKeydown(event: KeyboardEvent) {
  if (event.key === 'ArrowDown') {
    event.preventDefault()
    openMenu()
  } else if (event.key === 'ArrowUp') {
    event.preventDefault()
    openMenu(props.options.length - 1)
  }
}

function onMenuKeydown(event: KeyboardEvent) {
  const current = items.findIndex((item) => item === document.activeElement)

  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      focusItem(current + 1)
      break
    case 'ArrowUp':
      event.preventDefault()
      focusItem(current - 1)
      break
    case 'Home':
      event.preventDefault()
      focusItem(0)
      break
    case 'End':
      event.preventDefault()
      focusItem(props.options.length - 1)
      break
    case 'Escape':
      event.preventDefault()
      // Don't let Escape also close a parent (e.g. the mobile menu).
      event.stopPropagation()
      closeMenu()
      break
    case 'Tab':
      closeMenu(false)
      break
  }
}

onClickOutside(root, () => closeMenu(false))
</script>

<template>
  <div ref="root" class="dropdown" :class="`dropdown--${align}`">
    <button
      :id="buttonId"
      ref="trigger"
      type="button"
      class="dropdown__trigger"
      aria-haspopup="menu"
      :aria-expanded="open"
      :aria-controls="open ? menuId : undefined"
      :aria-label="label"
      @click="toggle"
      @keydown="onTriggerKeydown"
    >
      <slot name="trigger" :open="open" />
      <BaseIcon name="chevronDown" :size="14" :stroke-width="2" class="dropdown__chevron" />
    </button>

    <Transition name="dropdown">
      <ul
        v-if="open"
        :id="menuId"
        class="dropdown__menu"
        role="menu"
        :aria-labelledby="buttonId"
        @keydown="onMenuKeydown"
      >
        <li v-for="(option, index) in options" :key="option.value" role="none">
          <button
            :ref="(element) => setItemRef(element, index)"
            type="button"
            role="menuitemradio"
            class="dropdown__item"
            :class="{ 'is-active': option.value === modelValue }"
            :aria-checked="option.value === modelValue"
            tabindex="-1"
            @click="select(option.value)"
          >
            <BaseIcon v-if="option.icon" :name="option.icon" :size="16" class="dropdown__icon" />
            <span v-if="option.hint" class="dropdown__hint" aria-hidden="true">{{
              option.hint
            }}</span>
            <span class="dropdown__label" :lang="option.lang">{{ option.label }}</span>
            <BaseIcon
              v-if="option.value === modelValue"
              name="check"
              :size="16"
              :stroke-width="2.25"
              class="dropdown__check"
            />
          </button>
        </li>
      </ul>
    </Transition>
  </div>
</template>

<style scoped lang="scss">
.dropdown {
  position: relative;
}

.dropdown__trigger {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  height: 2.5rem;
  padding-inline: 0.75rem 0.625rem;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  background: var(--surface);
  color: var(--text-2);
  font-size: 0.875rem;
  font-weight: 600;
  line-height: 1;
  -webkit-backdrop-filter: var(--surface-blur);
  backdrop-filter: var(--surface-blur);
  transition:
    color 0.2s ease,
    border-color 0.2s ease,
    background-color 0.2s ease,
    box-shadow 0.25s ease;

  @include hover {
    border-color: var(--border-strong);
    background: var(--surface-2);
    color: var(--text);
    box-shadow: var(--button-glow);
  }

  &[aria-expanded='true'] {
    border-color: var(--border-strong);
    background: var(--surface-2);
    color: var(--text);
  }
}

.dropdown__chevron {
  color: var(--muted);
  transition: rotate 0.2s var(--ease-out);

  [aria-expanded='true'] > & {
    rotate: 180deg;
  }
}

.dropdown__menu {
  position: absolute;
  top: calc(100% + 0.5rem);
  z-index: 60;
  min-width: 13rem;
  margin: 0;
  padding: 0.375rem;
  list-style: none;
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  background: var(--surface-elevated);
  box-shadow: var(--shadow-lg);
}

.dropdown--end .dropdown__menu {
  right: 0;
  transform-origin: top right;
}

.dropdown--start .dropdown__menu {
  left: 0;
  transform-origin: top left;
}

.dropdown__item {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  width: 100%;
  min-height: 2.5rem;
  padding: 0.5rem 0.625rem;
  border-radius: 10px;
  color: var(--text-2);
  font-size: 0.875rem;
  font-weight: 500;
  text-align: left;
  transition:
    background-color 0.15s ease,
    color 0.15s ease;

  @include hover {
    background: var(--surface-2);
    color: var(--text);
  }

  &:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: -2px;
    background: var(--surface-2);
    color: var(--text);
  }

  &.is-active {
    background: var(--accent-soft);
    color: var(--text);
    font-weight: 600;
  }
}

.dropdown__icon {
  color: var(--muted);

  .is-active & {
    color: var(--accent);
  }
}

.dropdown__hint {
  min-width: 1.75rem;
  color: var(--muted);
  font-family: var(--font-mono);
  font-size: 0.75rem;
  font-weight: 700;

  .is-active & {
    color: var(--accent);
  }
}

.dropdown__check {
  margin-left: auto;
  color: var(--accent);
}

// Enter / leave
.dropdown-enter-active,
.dropdown-leave-active {
  transition:
    opacity 0.16s ease,
    transform 0.16s var(--ease-out);
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px) scale(0.98);
}
</style>
