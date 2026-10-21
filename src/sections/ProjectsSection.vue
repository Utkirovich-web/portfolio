<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import SectionTitle from '@/components/SectionTitle.vue'
import ProjectCard from '@/components/ProjectCard.vue'
import { projectFilters, projects, type ProjectFilter } from '@/data/projects'

const { t } = useI18n()

const activeFilter = ref<ProjectFilter>('all')

const visibleProjects = computed(() =>
  activeFilter.value === 'all'
    ? projects
    : projects.filter((project) => project.category === activeFilter.value),
)

const counts = computed(
  () =>
    Object.fromEntries(
      projectFilters.map((filter) => [
        filter,
        filter === 'all'
          ? projects.length
          : projects.filter((project) => project.category === filter).length,
      ]),
    ) as Record<ProjectFilter, number>,
)
</script>

<template>
  <section id="projects" class="section projects" aria-labelledby="projects-title" tabindex="-1">
    <div class="container">
      <SectionTitle
        title-id="projects-title"
        :eyebrow="t('projects.eyebrow')"
        :title="t('projects.title')"
        :subtitle="t('projects.subtitle')"
      />

      <div
        class="projects__filters"
        role="group"
        :aria-label="t('a11y.projectFilters')"
        data-reveal
      >
        <button
          v-for="filter in projectFilters"
          :key="filter"
          type="button"
          class="projects__filter"
          :class="{ 'is-active': activeFilter === filter }"
          :aria-pressed="activeFilter === filter"
          @click="activeFilter = filter"
        >
          {{ t(`projects.filters.${filter}`) }}
          <span class="projects__count" aria-hidden="true">{{ counts[filter] }}</span>
        </button>
      </div>

      <p class="sr-only" role="status">
        {{ t('projects.showing', { count: visibleProjects.length }) }}
      </p>

      <div data-reveal>
        <TransitionGroup tag="ul" name="project" class="projects__grid" role="list">
          <li
            v-for="project in visibleProjects"
            :key="project.id"
            class="projects__item"
            :class="`projects__item--${project.category}`"
          >
            <ProjectCard :project="project" />
          </li>
        </TransitionGroup>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
.projects__filters {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  margin-bottom: var(--space-4);
  padding: 0.25rem;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  background: var(--surface);
  -webkit-backdrop-filter: var(--surface-blur);
  backdrop-filter: var(--surface-blur);
}

.projects__filter {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  height: 2.5rem;
  padding-inline: 0.875rem 0.625rem;
  border-radius: 10px;
  color: var(--muted);
  font-size: 0.875rem;
  font-weight: 600;
  transition:
    color 0.2s ease,
    background-color 0.2s ease,
    box-shadow 0.2s ease;

  @include hover {
    color: var(--text);
  }

  &.is-active {
    background: var(--surface-2);
    color: var(--text);
    box-shadow:
      inset 0 0 0 1px var(--border),
      var(--shadow-sm);
  }

  &:focus-visible {
    outline-offset: 1px;
  }
}

.projects__count {
  display: inline-grid;
  place-items: center;
  min-width: 1.375rem;
  height: 1.375rem;
  padding-inline: 0.25rem;
  border-radius: 6px;
  background: var(--surface-2);
  color: var(--muted);
  font-family: var(--font-mono);
  font-size: 0.75rem;

  .is-active & {
    background: var(--accent-soft);
    color: var(--accent);
  }
}

.projects__grid {
  display: grid;
  gap: var(--space-2);

  @include up(md) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: var(--space-3);
  }
}

.projects__item {
  min-width: 0;
}

// Filter animation: new cards fade up, remaining cards glide into place.
.project-enter-active {
  transition:
    opacity 0.45s ease,
    transform 0.5s var(--ease-out);
}

.project-enter-from {
  opacity: 0;
  transform: translateY(16px) scale(0.98);
}

.project-leave-active {
  display: none;
}

.project-move {
  transition: transform 0.5s var(--ease-out);
}
</style>
