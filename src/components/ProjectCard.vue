<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import BaseButton from './BaseButton.vue'
import BaseIcon from './BaseIcon.vue'
import ProjectCover from './ProjectCover.vue'
import type { Project } from '@/data/projects'
import { useSafeId } from '@/composables/useSafeId'

const props = defineProps<{ project: Project }>()

const { t } = useI18n()
const titleId = useSafeId('project-title')

const title = computed(() => t(`projects.items.${props.project.id}.title`))

// Admin panels are confidential: always the same generic line, never a feature description.
const description = computed(() =>
  props.project.category === 'public'
    ? t(`projects.items.${props.project.id}.description`)
    : t('projects.confidential'),
)
</script>

<template>
  <article
    class="project-card surface-card"
    :class="`project-card--${project.category}`"
    :aria-labelledby="titleId"
  >
    <!-- Cover is a mouse convenience; the labelled button below is the accessible link. -->
    <a
      v-if="project.category === 'public'"
      :href="project.url"
      class="project-card__media"
      target="_blank"
      rel="noopener noreferrer"
      tabindex="-1"
      aria-hidden="true"
    >
      <ProjectCover
        variant="website"
        :palette="project.palette"
        :seed="project.id"
        :domain="project.domain"
      />
      <span class="project-card__visit">
        {{ t('projects.liveWebsite') }}
        <BaseIcon name="arrowUpRight" :size="16" />
      </span>
    </a>
    <div v-else class="project-card__media">
      <ProjectCover variant="admin" :palette="project.palette" :seed="project.id" />
    </div>

    <div class="project-card__body">
      <div class="project-card__meta">
        <span class="project-card__org" aria-hidden="true">{{ t('projects.org') }}</span>
        <span v-if="project.category === 'admin'" class="project-card__badge">
          <BaseIcon name="lock" :size="13" :stroke-width="2" />
          {{ t('projects.internalBadge') }}
        </span>
      </div>

      <h3 :id="titleId" class="project-card__title">
        <span class="sr-only">{{ t('projects.org') }} — </span>{{ title }}
      </h3>
      <p class="project-card__desc">{{ description }}</p>

      <ul class="project-card__tags" role="list" :aria-label="t('projects.techLabel')">
        <li v-for="tag in project.tags" :key="tag" class="chip chip--sm">{{ tag }}</li>
      </ul>

      <div v-if="project.category === 'public'" class="project-card__actions">
        <BaseButton :href="project.url" external variant="secondary" size="sm">
          {{ t('projects.liveWebsite') }}
          <template #icon-right>
            <BaseIcon name="arrowUpRight" :size="16" />
          </template>
        </BaseButton>
        <span class="project-card__domain">{{ project.domain }}</span>
      </div>
    </div>
  </article>
</template>

<style scoped lang="scss">
.project-card {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  transition:
    transform 0.45s var(--ease-out),
    border-color 0.3s ease,
    box-shadow 0.3s ease;

  @include hover {
    transform: translateY(-4px);
    border-color: var(--border-strong);
    box-shadow: var(--card-hover-shadow);

    :deep(.cover__scene) {
      transform: translateY(-6px);
    }

    :deep(.cover__orb) {
      transform: scale(1.08) rotate(8deg);
    }

    :deep(.cover__lock-halo) {
      transform: scale(1.25);
    }

    .project-card__visit {
      opacity: 1;
      transform: none;
    }
  }

  &:focus-within {
    border-color: var(--border-strong);
  }
}

.project-card__media {
  position: relative;
  display: block;
  border-bottom: 1px solid var(--border);
}

.project-card__visit {
  position: absolute;
  right: var(--space-2);
  bottom: var(--space-2);
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  height: 2rem;
  padding-inline: 0.75rem 0.625rem;
  border: 1px solid var(--border);
  border-radius: var(--radius-full);
  background: var(--surface-elevated);
  color: var(--text);
  font-size: 0.8125rem;
  font-weight: 600;
  box-shadow: var(--shadow-md);
  opacity: 0;
  transform: translateY(8px);
  transition:
    opacity 0.3s ease,
    transform 0.4s var(--ease-out);
}

.project-card__body {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 0.75rem;
  padding: var(--space-3);

  @include up(md) {
    padding: var(--space-4);
  }
}

.project-card__meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.project-card__org {
  color: var(--muted);
  font-family: var(--font-mono);
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.project-card__badge {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  height: 1.5rem;
  padding-inline: 0.5rem 0.625rem;
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-full);
  background: var(--surface-2);
  color: var(--text-2);
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
}

.project-card__title {
  font-size: clamp(1.25rem, 2vw, 1.5rem);
  letter-spacing: -0.025em;
}

.project-card__desc {
  color: var(--muted);
  font-size: 0.9375rem;
}

.project-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
  margin-top: auto;
  padding-top: 0.5rem;
}

.project-card__actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-top: 0.5rem;
  padding-top: var(--space-2);
  border-top: 1px solid var(--border);
}

.project-card__domain {
  color: var(--muted);
  font-family: var(--font-mono);
  font-size: 0.8125rem;
}
</style>
