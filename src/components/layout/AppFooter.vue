<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import BaseButton from '@/components/BaseButton.vue'
import BaseIcon from '@/components/BaseIcon.vue'
import LogoMark from '@/components/LogoMark.vue'
import { contacts, footerSocials, type Contact } from '@/data/contacts'
import { profile } from '@/data/profile'
import { useSectionNav } from '@/composables/useSectionNav'

const { t } = useI18n()
const { goTop } = useSectionNav()

const socials = computed(() =>
  footerSocials
    .map((id) => contacts.find((contact) => contact.id === id))
    .filter((contact): contact is Contact => Boolean(contact)),
)

function linkLabel(contact: Contact) {
  const label = t(`contact.cards.${contact.id}`)
  return contact.external ? `${label} ${t('a11y.newTab')}` : label
}
</script>

<template>
  <footer id="site-footer" class="footer">
    <div class="footer__inner container">
      <div class="footer__brand">
        <LogoMark :size="32" />
        <div>
          <p class="footer__copy">© {{ profile.copyrightYear }} {{ t('profile.name') }}</p>
          <p class="footer__note">{{ t('footer.rights') }} {{ t('footer.builtWith') }}</p>
        </div>
      </div>

      <ul class="footer__social" role="list" :aria-label="t('a11y.socialLinks')">
        <li v-for="contact in socials" :key="contact.id">
          <a
            :href="contact.href"
            class="footer__social-link"
            :target="contact.external ? '_blank' : undefined"
            :rel="contact.external ? 'noopener noreferrer' : undefined"
            :aria-label="linkLabel(contact)"
            :title="t(`contact.cards.${contact.id}`)"
          >
            <BaseIcon :name="contact.icon" :size="18" />
          </a>
        </li>
      </ul>

      <BaseButton variant="ghost" size="sm" class="footer__top" @click="goTop">
        {{ t('footer.backToTop') }}
        <template #icon-right>
          <BaseIcon name="arrowUp" :size="16" />
        </template>
      </BaseButton>
    </div>
  </footer>
</template>

<style scoped lang="scss">
.footer {
  position: relative;
  border-top: 1px solid var(--border);
}

.footer__inner {
  display: grid;
  gap: var(--space-3);
  justify-items: start;
  padding-block: var(--space-5);

  @include up(md) {
    grid-template-columns: 1fr auto auto;
    align-items: center;
    gap: var(--space-4);
  }
}

.footer__brand {
  display: flex;
  align-items: center;
  gap: 0.875rem;
}

.footer__copy {
  font-size: 0.9375rem;
  font-weight: 600;
}

.footer__note {
  color: var(--muted);
  font-size: 0.8125rem;
}

.footer__social {
  display: flex;
  gap: 0.5rem;
}

.footer__social-link {
  display: grid;
  place-items: center;
  width: 2.5rem;
  height: 2.5rem;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  background: var(--surface);
  color: var(--text-2);
  transition:
    color 0.2s ease,
    border-color 0.2s ease,
    transform 0.3s var(--ease-out),
    box-shadow 0.25s ease;

  @include hover {
    border-color: var(--border-strong);
    color: var(--accent);
    transform: translateY(-2px);
    box-shadow: var(--button-glow);
  }
}
</style>
