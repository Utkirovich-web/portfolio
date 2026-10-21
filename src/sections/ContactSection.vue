<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import SectionTitle from '@/components/SectionTitle.vue'
import BaseButton from '@/components/BaseButton.vue'
import BaseIcon from '@/components/BaseIcon.vue'
import { contacts, EMAIL } from '@/data/contacts'
import { useContactForm, type ContactField } from '@/composables/useContactForm'

const { t } = useI18n()

const { values, status, visibleError, touch, submit } = useContactForm({
  recipient: EMAIL,
  subject: (name) => t('contact.form.subject', { name }),
})

interface FieldConfig {
  id: ContactField
  type?: 'text' | 'email'
  autocomplete: string
  multiline?: boolean
}

const fields: FieldConfig[] = [
  { id: 'name', type: 'text', autocomplete: 'name' },
  { id: 'email', type: 'email', autocomplete: 'email' },
  { id: 'message', autocomplete: 'off', multiline: true },
]

const inputs: Partial<Record<ContactField, HTMLInputElement | HTMLTextAreaElement>> = {}

function setInputRef(field: ContactField, element: unknown) {
  if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
    inputs[field] = element
  }
}

const inputId = (field: ContactField) => `contact-${field}`
const errorId = (field: ContactField) => `contact-${field}-error`

function errorText(field: ContactField) {
  const error = visibleError(field)
  return error ? t(error.key, error.params ?? {}) : ''
}

function onSubmit() {
  const invalidField = submit()
  if (invalidField) inputs[invalidField]?.focus()
}

const statusText = computed(() => {
  if (status.value === 'sent') return t('contact.form.success')
  if (status.value === 'invalid') return t('contact.form.errorSummary')
  return ''
})

function contactLabel(id: string, external: boolean) {
  const label = t(`contact.cards.${id}`)
  return external ? `${label} ${t('a11y.newTab')}` : label
}
</script>

<template>
  <section id="contact" class="section contact" aria-labelledby="contact-title" tabindex="-1">
    <div class="container">
      <SectionTitle
        title-id="contact-title"
        :eyebrow="t('contact.eyebrow')"
        :title="t('contact.title')"
        :subtitle="t('contact.subtitle')"
      />

      <div class="contact__grid">
        <form class="contact__form surface-card" novalidate data-reveal @submit.prevent="onSubmit">
          <div
            v-for="field in fields"
            :key="field.id"
            class="field"
            :class="{ 'has-error': visibleError(field.id) }"
          >
            <label :for="inputId(field.id)" class="field__label">
              {{ t(`contact.form.${field.id}`) }}
            </label>

            <textarea
              v-if="field.multiline"
              :id="inputId(field.id)"
              :ref="(element) => setInputRef(field.id, element)"
              v-model="values[field.id]"
              class="field__control field__control--textarea"
              :name="field.id"
              rows="5"
              required
              :placeholder="t(`contact.form.${field.id}Placeholder`)"
              :aria-invalid="visibleError(field.id) ? 'true' : 'false'"
              :aria-describedby="visibleError(field.id) ? errorId(field.id) : undefined"
              @blur="touch(field.id)"
            />
            <input
              v-else
              :id="inputId(field.id)"
              :ref="(element) => setInputRef(field.id, element)"
              v-model="values[field.id]"
              class="field__control"
              :type="field.type"
              :name="field.id"
              :autocomplete="field.autocomplete"
              :inputmode="field.type === 'email' ? 'email' : undefined"
              required
              :placeholder="t(`contact.form.${field.id}Placeholder`)"
              :aria-invalid="visibleError(field.id) ? 'true' : 'false'"
              :aria-describedby="visibleError(field.id) ? errorId(field.id) : undefined"
              @blur="touch(field.id)"
            />

            <p v-if="visibleError(field.id)" :id="errorId(field.id)" class="field__error">
              {{ errorText(field.id) }}
            </p>
          </div>

          <div class="contact__footer">
            <p class="contact__note">{{ t('contact.form.note') }}</p>
            <BaseButton type="submit" size="lg" magnetic>
              {{ t('contact.form.submit') }}
              <template #icon-right>
                <BaseIcon name="send" :size="18" />
              </template>
            </BaseButton>
          </div>

          <p
            class="contact__status"
            :class="`contact__status--${status}`"
            role="status"
            aria-live="polite"
          >
            {{ statusText }}
          </p>
        </form>

        <div class="contact__aside">
          <h3 class="contact__aside-title" data-reveal>{{ t('contact.cardsTitle') }}</h3>
          <ul class="contact__cards" role="list">
            <li v-for="contact in contacts" :key="contact.id" data-reveal>
              <a
                :href="contact.href"
                class="contact-card surface-card"
                :target="contact.external ? '_blank' : undefined"
                :rel="contact.external ? 'noopener noreferrer' : undefined"
              >
                <span class="contact-card__icon" aria-hidden="true">
                  <BaseIcon :name="contact.icon" :size="20" />
                </span>
                <span class="contact-card__text">
                  <span class="contact-card__label">
                    {{ contactLabel(contact.id, false) }}
                    <span v-if="contact.external" class="sr-only">{{ t('a11y.newTab') }}</span>
                  </span>
                  <span class="contact-card__handle">{{ contact.handle }}</span>
                </span>
                <BaseIcon name="arrowUpRight" :size="18" class="contact-card__arrow" />
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
.contact__grid {
  display: grid;
  gap: var(--space-4);

  @include up(lg) {
    grid-template-columns: minmax(0, 7fr) minmax(0, 5fr);
    align-items: start;
    gap: var(--space-5);
  }
}

.contact__form {
  display: grid;
  gap: var(--space-3);
  padding: var(--space-3);

  @include up(md) {
    padding: var(--space-5);
  }
}

.field {
  display: grid;
  gap: 0.5rem;
}

.field__label {
  color: var(--text);
  font-size: 0.875rem;
  font-weight: 600;
}

.field__control {
  width: 100%;
  height: 3rem;
  padding-inline: 1rem;
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-md);
  background: var(--bg);
  color: var(--text);
  font-size: 1rem;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;

  &::placeholder {
    color: var(--muted);
    opacity: 0.8;
  }

  &:hover {
    border-color: var(--muted);
  }

  &:focus {
    border-color: var(--accent);
    outline: none;
    box-shadow: 0 0 0 4px var(--accent-soft);
  }

  &:focus-visible {
    outline: none;
  }

  .has-error & {
    border-color: var(--danger);

    &:focus {
      box-shadow: 0 0 0 4px color-mix(in srgb, var(--danger) 18%, transparent);
    }
  }
}

.field__control--textarea {
  height: auto;
  min-height: 9rem;
  padding-block: 0.875rem;
  line-height: 1.6;
  resize: vertical;
}

.field__error {
  color: var(--danger);
  font-size: 0.8125rem;
  font-weight: 500;
}

.contact__footer {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
  margin-top: var(--space-1);
}

.contact__note {
  max-width: 22rem;
  color: var(--muted);
  font-size: 0.8125rem;
}

.contact__status {
  font-size: 0.875rem;
  font-weight: 500;

  &:empty {
    display: none;
  }

  &--sent {
    color: var(--success);
  }

  &--invalid {
    color: var(--danger);
  }
}

.contact__aside {
  display: grid;
  gap: var(--space-2);
}

.contact__aside-title {
  color: var(--muted);
  font-family: var(--font-sans);
  font-size: 0.875rem;
  font-weight: 600;
  letter-spacing: 0;
}

.contact__cards {
  display: grid;
  gap: 0.75rem;

  @media (min-width: 640px) and (max-width: 959px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.contact-card {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) 1.25rem;
  transition:
    border-color 0.3s ease,
    box-shadow 0.3s ease,
    transform 0.4s var(--ease-out);

  @include hover {
    transform: translateY(-2px);
    border-color: var(--border-strong);
    box-shadow: var(--card-hover-shadow);

    .contact-card__icon {
      background: var(--accent);
      color: var(--btn-primary-fg);
    }

    .contact-card__arrow {
      color: var(--accent);
      transform: translate(2px, -2px);
    }
  }
}

.contact-card__icon {
  display: grid;
  flex-shrink: 0;
  place-items: center;
  width: 2.75rem;
  height: 2.75rem;
  border-radius: var(--radius-md);
  background: var(--accent-soft);
  color: var(--accent);
  transition:
    background-color 0.25s ease,
    color 0.25s ease;
}

.contact-card__text {
  display: grid;
  min-width: 0;
}

.contact-card__label {
  font-weight: 600;
}

.contact-card__handle {
  overflow: hidden;
  color: var(--muted);
  font-size: 0.875rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.contact-card__arrow {
  margin-left: auto;
  color: var(--muted);
  transition:
    color 0.25s ease,
    transform 0.3s var(--ease-out);
}
</style>
