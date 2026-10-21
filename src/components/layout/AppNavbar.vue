<script setup lang="ts">
import { computed, ref, useTemplateRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useEventListener, useMediaQuery, useScrollLock, useWindowScroll } from '@vueuse/core'
import LogoMark from '@/components/LogoMark.vue'
import ThemeSwitcher from '@/components/ThemeSwitcher.vue'
import LangSwitcher from '@/components/LangSwitcher.vue'
import MobileMenu from './MobileMenu.vue'
import { navSections } from '@/data/navigation'
import { useSectionNav } from '@/composables/useSectionNav'
import { useActiveSection } from '@/composables/useActiveSection'

const { t } = useI18n()
const { goTo, goTop } = useSectionNav()
const active = useActiveSection(['top', ...navSections])

const { y } = useWindowScroll()
const scrolled = computed(() => y.value > 8)

const menuOpen = ref(false)
// The mobile menu is only built the first time it is opened (keeps the initial render small).
const menuMounted = ref(false)
const burger = useTemplateRef<HTMLButtonElement>('burger')
const isDesktop = useMediaQuery('(min-width: 960px)')
const scrollLock = useScrollLock(typeof document === 'undefined' ? null : document.body)

watch(isDesktop, (desktop) => {
  if (desktop) menuOpen.value = false
})

// While the menu is open, lock page scroll and make the rest of the page inert
// so keyboard / screen-reader focus stays inside the header.
watch(
  menuOpen,
  (open) => {
    if (open) menuMounted.value = true
    scrollLock.value = open
    for (const id of ['main', 'site-footer']) {
      document.getElementById(id)?.toggleAttribute('inert', open)
    }
  },
  { flush: 'sync' },
)

useEventListener(document, 'keydown', (event: KeyboardEvent) => {
  if (event.key === 'Escape' && menuOpen.value) {
    menuOpen.value = false
    burger.value?.focus()
  }
})

function navigate(id: string) {
  menuOpen.value = false
  goTo(id)
}

function onBrandClick() {
  menuOpen.value = false
  goTop()
}
</script>

<template>
  <header class="navbar" :class="{ 'is-scrolled': scrolled || menuOpen, 'is-open': menuOpen }">
    <div class="navbar__inner container">
      <a
        href="/"
        class="navbar__brand"
        :aria-label="t('a11y.homeLink')"
        @click.prevent="onBrandClick"
      >
        <LogoMark :size="36" />
        <span class="navbar__name">{{ t('profile.name') }}</span>
      </a>

      <nav class="navbar__nav" :aria-label="t('a11y.primaryNav')">
        <ul class="navbar__links" role="list">
          <li v-for="id in navSections" :key="id">
            <a
              :href="`/#${id}`"
              class="navbar__link"
              :class="{ 'is-active': active === id }"
              :aria-current="active === id ? 'true' : undefined"
              @click.prevent="navigate(id)"
            >
              {{ t(`nav.${id}`) }}
            </a>
          </li>
        </ul>
      </nav>

      <div class="navbar__actions">
        <div class="navbar__switchers">
          <ThemeSwitcher />
          <LangSwitcher />
        </div>

        <button
          ref="burger"
          type="button"
          class="navbar__burger"
          :aria-expanded="menuOpen"
          aria-controls="mobile-menu"
          :aria-label="menuOpen ? t('a11y.closeMenu') : t('a11y.openMenu')"
          @click="menuOpen = !menuOpen"
        >
          <span class="burger" :class="{ 'is-open': menuOpen }" aria-hidden="true">
            <span />
            <span />
          </span>
        </button>
      </div>
    </div>

    <MobileMenu v-if="menuMounted" :open="menuOpen" :active="active" @navigate="navigate" />
  </header>
</template>

<style scoped lang="scss">
.navbar {
  position: fixed;
  inset: 0 0 auto;
  z-index: 50;
  height: var(--nav-height);

  // The glass layer lives on a pseudo-element: a backdrop-filter on the header itself
  // would become the containing block of the fixed mobile menu and collapse it.
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    z-index: -1;
    border-bottom: 1px solid var(--border);
    background: var(--nav-bg);
    -webkit-backdrop-filter: blur(16px) saturate(180%);
    backdrop-filter: blur(16px) saturate(180%);
    opacity: 0;
    transition:
      opacity 0.3s ease,
      background-color 0.3s ease;
  }

  &.is-scrolled::before {
    opacity: 1;
  }

  &.is-open::before {
    background: var(--bg);
  }
}

.navbar__inner {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  height: 100%;
}

.navbar__brand {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  gap: 0.75rem;
  border-radius: var(--radius-md);
  font-family: var(--font-display);
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.navbar__name {
  display: none;

  @media (min-width: 400px) and (max-width: 959px), (min-width: 1140px) {
    display: inline;
  }
}

.navbar__nav {
  display: none;
  flex: 1;
  justify-content: center;

  @include up(lg) {
    display: flex;
  }
}

.navbar__links {
  display: flex;
  gap: 0.25rem;
}

.navbar__link {
  position: relative;
  display: inline-flex;
  align-items: center;
  height: 2.5rem;
  padding-inline: 0.875rem;
  border-radius: 10px;
  color: var(--muted);
  font-size: 0.9375rem;
  font-weight: 500;
  transition:
    color 0.2s ease,
    background-color 0.2s ease;

  @include hover {
    background: var(--surface-2);
    color: var(--text);
  }

  &.is-active {
    color: var(--text);

    &::after {
      content: '';
      position: absolute;
      bottom: 0.3rem;
      left: 50%;
      width: 1rem;
      height: 2px;
      border-radius: 2px;
      background: var(--accent);
      translate: -50% 0;
    }
  }
}

.navbar__actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-left: auto;

  @include up(lg) {
    margin-left: 0;
  }
}

.navbar__switchers {
  display: none;
  gap: 0.5rem;

  @include up(lg) {
    display: flex;
  }
}

.navbar__burger {
  display: grid;
  place-items: center;
  width: 2.75rem;
  height: 2.75rem;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  background: var(--surface);
  -webkit-backdrop-filter: var(--surface-blur);
  backdrop-filter: var(--surface-blur);

  @include up(lg) {
    display: none;
  }
}

.burger {
  position: relative;
  display: block;
  width: 18px;
  height: 12px;

  span {
    position: absolute;
    left: 0;
    width: 100%;
    height: 1.75px;
    border-radius: 2px;
    background: var(--text);
    transition:
      transform 0.3s var(--ease-out),
      top 0.3s var(--ease-out);

    &:first-child {
      top: 2px;
    }

    &:last-child {
      top: 8px;
    }
  }

  &.is-open span {
    top: 5px;

    &:first-child {
      transform: rotate(45deg);
    }

    &:last-child {
      transform: rotate(-45deg);
    }
  }
}
</style>
