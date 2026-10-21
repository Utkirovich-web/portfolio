<script setup lang="ts">
import { nextTick, useTemplateRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import BaseIcon from '@/components/BaseIcon.vue'
import ThemeSwitcher from '@/components/ThemeSwitcher.vue'
import LangSwitcher from '@/components/LangSwitcher.vue'
import { navSections } from '@/data/navigation'
import { contacts } from '@/data/contacts'

const props = defineProps<{
  open: boolean
  active: string | null
}>()

const emit = defineEmits<{ navigate: [id: string] }>()

const { t } = useI18n()
const panel = useTemplateRef<HTMLElement>('panel')

// Move focus into the menu when it opens.
watch(
  () => props.open,
  async (open) => {
    if (!open) return
    await nextTick()
    panel.value?.querySelector<HTMLElement>('a[href]')?.focus()
  },
  { immediate: true },
)
</script>

<template>
  <Transition name="mobile-menu" appear>
    <div v-show="open" id="mobile-menu" ref="panel" class="mobile-menu">
      <div class="mobile-menu__inner container">
        <nav :aria-label="t('a11y.primaryNav')">
          <ul class="mobile-menu__links" role="list">
            <li v-for="(id, index) in navSections" :key="id" :style="{ '--i': index }">
              <a
                :href="`/#${id}`"
                class="mobile-menu__link"
                :class="{ 'is-active': active === id }"
                :aria-current="active === id ? 'true' : undefined"
                @click.prevent="emit('navigate', id)"
              >
                <span class="mobile-menu__index" aria-hidden="true">0{{ index + 1 }}</span>
                {{ t(`nav.${id}`) }}
                <BaseIcon name="arrowRight" :size="20" class="mobile-menu__arrow" />
              </a>
            </li>
          </ul>
        </nav>

        <div class="mobile-menu__settings">
          <div class="mobile-menu__setting">
            <span class="mobile-menu__label" aria-hidden="true">{{ t('theme.label') }}</span>
            <ThemeSwitcher show-label />
          </div>
          <div class="mobile-menu__setting">
            <span class="mobile-menu__label" aria-hidden="true">{{ t('lang.label') }}</span>
            <LangSwitcher show-label />
          </div>
        </div>

        <ul class="mobile-menu__social" role="list" :aria-label="t('a11y.socialLinks')">
          <li v-for="contact in contacts" :key="contact.id">
            <a
              :href="contact.href"
              class="mobile-menu__social-link"
              :target="contact.external ? '_blank' : undefined"
              :rel="contact.external ? 'noopener noreferrer' : undefined"
              :aria-label="
                contact.external
                  ? `${t(`contact.cards.${contact.id}`)} ${t('a11y.newTab')}`
                  : t(`contact.cards.${contact.id}`)
              "
            >
              <BaseIcon :name="contact.icon" :size="20" />
            </a>
          </li>
        </ul>
      </div>
    </div>
  </Transition>
</template>

<style scoped lang="scss">
.mobile-menu {
  position: fixed;
  inset: var(--nav-height) 0 0;
  z-index: 40;
  overflow-y: auto;
  overscroll-behavior: contain;
  border-top: 1px solid var(--border);
  background: var(--bg);

  @include up(lg) {
    display: none !important;
  }
}

.mobile-menu__inner {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  min-height: 100%;
  padding-block: var(--space-3) var(--space-5);
}

.mobile-menu__links li {
  border-bottom: 1px solid var(--border);
}

.mobile-menu__link {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding-block: 1.125rem;
  font-family: var(--font-display);
  font-size: clamp(1.5rem, 7vw, 2rem);
  font-weight: 700;
  letter-spacing: -0.03em;
  line-height: 1.1;

  &.is-active {
    color: var(--accent);
  }
}

.mobile-menu__index {
  min-width: 1.75rem;
  color: var(--muted);
  font-family: var(--font-mono);
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0;
}

.mobile-menu__arrow {
  margin-left: auto;
  color: var(--muted);
}

.mobile-menu__settings {
  display: grid;
  gap: var(--space-2);
}

.mobile-menu__setting {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
}

.mobile-menu__label {
  color: var(--muted);
  font-size: 0.875rem;
  font-weight: 500;
}

.mobile-menu__social {
  display: flex;
  gap: 0.5rem;
  margin-top: auto;
}

.mobile-menu__social-link {
  display: grid;
  place-items: center;
  width: 2.75rem;
  height: 2.75rem;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  background: var(--surface);
  color: var(--text-2);
}

// Panel + staggered links
.mobile-menu-enter-active,
.mobile-menu-leave-active {
  transition:
    opacity 0.25s ease,
    transform 0.35s var(--ease-out);
}

.mobile-menu-enter-from,
.mobile-menu-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

.mobile-menu-enter-active .mobile-menu__links li {
  animation: link-in 0.5s var(--ease-out) both;
  animation-delay: calc(var(--i) * 45ms + 60ms);
}

@keyframes link-in {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
}
</style>
