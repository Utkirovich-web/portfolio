import { computed, reactive, ref } from 'vue'

export const CONTACT_FIELDS = ['name', 'email', 'message'] as const
export type ContactField = (typeof CONTACT_FIELDS)[number]

/** A validation error as an i18n key (+ params), so it re-translates on language change. */
export interface FieldError {
  key: string
  params?: Record<string, unknown>
}

export const NAME_MIN_LENGTH = 2
export const MESSAGE_MIN_LENGTH = 10
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

function validate(field: ContactField, raw: string): FieldError | null {
  const value = raw.trim()
  const base = 'contact.form.errors'

  switch (field) {
    case 'name':
      if (!value) return { key: `${base}.nameRequired` }
      if (value.length < NAME_MIN_LENGTH) return { key: `${base}.nameShort` }
      return null
    case 'email':
      if (!value) return { key: `${base}.emailRequired` }
      if (!EMAIL_PATTERN.test(value)) return { key: `${base}.emailInvalid` }
      return null
    case 'message':
      if (!value) return { key: `${base}.messageRequired` }
      if (value.length < MESSAGE_MIN_LENGTH) {
        return { key: `${base}.messageShort`, params: { min: MESSAGE_MIN_LENGTH } }
      }
      return null
  }
}

interface ContactFormOptions {
  recipient: string
  /** Builds the email subject line (translated by the caller). */
  subject: (name: string) => string
}

/**
 * Client-side validated contact form that hands the message to the visitor's
 * mail client through a `mailto:` link — no backend required.
 */
export function useContactForm(options: ContactFormOptions) {
  const values = reactive<Record<ContactField, string>>({ name: '', email: '', message: '' })
  const touched = reactive<Record<ContactField, boolean>>({
    name: false,
    email: false,
    message: false,
  })
  const status = ref<'idle' | 'invalid' | 'sent'>('idle')

  const errors = computed(
    () =>
      Object.fromEntries(
        CONTACT_FIELDS.map((field) => [field, validate(field, values[field])]),
      ) as Record<ContactField, FieldError | null>,
  )

  /** Errors are only shown after a field was left once (or after a submit attempt). */
  function visibleError(field: ContactField): FieldError | null {
    return touched[field] ? errors.value[field] : null
  }

  function touch(field: ContactField) {
    touched[field] = true
  }

  /** Returns the first invalid field (to move focus there), or null when the mail client was opened. */
  function submit(): ContactField | null {
    CONTACT_FIELDS.forEach(touch)

    const firstInvalid = CONTACT_FIELDS.find((field) => errors.value[field]) ?? null
    if (firstInvalid) {
      status.value = 'invalid'
      return firstInvalid
    }

    const name = values.name.trim()
    const email = values.email.trim()
    const body = `${values.message.trim()}\n\n— ${name}\n${email}`
    const href =
      `mailto:${options.recipient}` +
      `?subject=${encodeURIComponent(options.subject(name))}` +
      `&body=${encodeURIComponent(body)}`

    window.location.href = href
    status.value = 'sent'
    return null
  }

  return { values, errors, status, visibleError, touch, submit }
}
