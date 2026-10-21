<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import SectionTitle from '@/components/SectionTitle.vue'
import AvatarImage from '@/components/AvatarImage.vue'
import BaseIcon from '@/components/BaseIcon.vue'
import { profile } from '@/data/profile'

const { t } = useI18n()
</script>

<template>
  <section id="about" class="section about" aria-labelledby="about-title" tabindex="-1">
    <div class="container">
      <SectionTitle
        title-id="about-title"
        :eyebrow="t('about.eyebrow')"
        :title="t('about.title')"
      />

      <div class="about__grid" data-skew>
        <figure class="about__profile surface-card" data-reveal>
          <AvatarImage class="about__avatar" :alt="t('about.avatarAlt')" />
          <figcaption>
            <dl class="about__identity">
              <div class="about__row">
                <dt>{{ t('about.fullNameLabel') }}</dt>
                <dd>{{ t('profile.fullName') }}</dd>
              </div>
              <div class="about__row">
                <dt>{{ t('about.roleLabel') }}</dt>
                <dd>{{ t('profile.role') }}</dd>
              </div>
              <div class="about__row">
                <dt>{{ t('about.locationLabel') }}</dt>
                <dd>{{ t('profile.location') }}</dd>
              </div>
            </dl>
          </figcaption>
        </figure>

        <div class="about__content">
          <div class="about__bio" data-reveal>
            <p class="about__lead">{{ t('about.bio1') }}</p>
            <p>{{ t('about.bio2') }}</p>
            <p>{{ t('about.bio3') }}</p>
          </div>

          <ul class="about__facts" role="list" :aria-label="t('a11y.keyFacts')">
            <li
              v-for="fact in profile.facts"
              :key="fact.id"
              class="about__fact surface-card"
              data-reveal
            >
              <span class="about__fact-icon" aria-hidden="true">
                <BaseIcon :name="fact.icon" :size="20" />
              </span>
              <strong class="about__fact-title">{{ t(`about.facts.${fact.id}.title`) }}</strong>
              <span class="about__fact-detail">{{ t(`about.facts.${fact.id}.detail`) }}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
.about__grid {
  display: grid;
  gap: var(--space-4);

  @include up(lg) {
    grid-template-columns: minmax(0, 5fr) minmax(0, 7fr);
    gap: var(--space-6);
  }
}

.about__profile {
  max-width: 28rem;
  padding: 0.75rem;

  @include up(lg) {
    display: flex;
    flex-direction: column;
    max-width: none;
  }
}

// On desktop the photo takes whatever height the text column needs,
// so both columns end on the same line instead of leaving a gap under the facts.
.about__profile .about__avatar {
  @include up(lg) {
    flex: 1 1 auto;
    min-height: 15rem;
    aspect-ratio: auto;
    contain: size;
  }
}

.about__identity {
  display: grid;
  gap: 0;
  padding: var(--space-2) 0.5rem 0.25rem;
}

.about__row {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 0.25rem 1rem;
  padding-block: 0.75rem;
  border-bottom: 1px solid var(--border);
  font-size: 0.875rem;

  &:last-child {
    border-bottom: 0;
  }

  dt {
    color: var(--muted);
  }

  dd {
    margin: 0;
    font-weight: 600;
    text-align: right;
  }
}

.about__content {
  display: grid;
  gap: var(--space-4);
}

.about__bio {
  display: grid;
  gap: var(--space-2);
  color: var(--text-2);
  font-size: clamp(1rem, 1.3vw, 1.0625rem);
  line-height: 1.75;
}

.about__lead {
  color: var(--text);
  font-family: var(--font-display);
  font-size: clamp(1.25rem, 2.2vw, 1.625rem);
  font-weight: 600;
  letter-spacing: -0.02em;
  line-height: 1.4;
}

.about__facts {
  display: grid;
  gap: var(--space-2);

  @include up(sm) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

.about__fact {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  padding: var(--space-3);
  transition:
    border-color 0.3s ease,
    box-shadow 0.3s ease,
    transform 0.4s var(--ease-out);

  @include hover {
    transform: translateY(-3px);
    border-color: var(--border-strong);
    box-shadow: var(--card-hover-shadow);
  }
}

.about__fact-icon {
  display: grid;
  place-items: center;
  width: 2.5rem;
  height: 2.5rem;
  margin-bottom: 0.5rem;
  border-radius: var(--radius-md);
  background: var(--accent-soft);
  color: var(--accent);
}

.about__fact-title {
  font-family: var(--font-display);
  font-size: 1.0625rem;
  font-weight: 700;
  letter-spacing: -0.01em;
  line-height: 1.3;
}

.about__fact-detail {
  color: var(--muted);
  font-size: 0.875rem;
  line-height: 1.5;
}
</style>
