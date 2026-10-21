<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import SectionTitle from '@/components/SectionTitle.vue'
import BaseIcon from '@/components/BaseIcon.vue'
import StatusBadge from '@/components/StatusBadge.vue'
import { skillGroups, type SkillItem } from '@/data/skills'

const { t } = useI18n()

const skillLabel = (item: SkillItem) => (typeof item === 'string' ? item : t(item.key))
const skillKey = (item: SkillItem) => (typeof item === 'string' ? item : item.key)
</script>

<template>
  <section id="skills" class="section skills" aria-labelledby="skills-title" tabindex="-1">
    <div class="container">
      <SectionTitle
        title-id="skills-title"
        :eyebrow="t('skills.eyebrow')"
        :title="t('skills.title')"
        :subtitle="t('skills.subtitle')"
      />

      <ul class="skills__grid" role="list">
        <li
          v-for="group in skillGroups"
          :key="group.id"
          class="skills__card surface-card"
          :class="{ 'skills__card--learning': group.learning }"
          data-reveal
        >
          <div class="skills__head">
            <span class="skills__icon" aria-hidden="true">
              <BaseIcon :name="group.icon" :size="20" />
            </span>
            <div class="skills__heading">
              <h3 class="skills__title">{{ t(`skills.categories.${group.id}`) }}</h3>
              <p class="skills__desc">{{ t(`skills.descriptions.${group.id}`) }}</p>
            </div>
            <StatusBadge
              v-if="group.learning"
              :label="t('skills.inProgress')"
              tone="accent"
              size="sm"
              class="skills__badge"
            />
          </div>

          <ul class="skills__list" role="list">
            <li
              v-for="item in group.items"
              :key="skillKey(item)"
              class="chip"
              :class="{ 'chip--dashed': group.learning }"
            >
              {{ skillLabel(item) }}
            </li>
          </ul>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped lang="scss">
.skills__grid {
  display: grid;
  gap: var(--space-2);

  @include up(md) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: var(--space-3);
  }
}

.skills__card {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding: var(--space-3);
  transition:
    border-color 0.3s ease,
    box-shadow 0.3s ease;

  @include up(md) {
    padding: var(--space-4);
  }

  @include hover {
    border-color: var(--border-strong);
    box-shadow: var(--card-hover-shadow);

    .skills__icon {
      transform: rotate(-6deg) scale(1.06);
    }
  }
}

.skills__card--learning {
  border-style: dashed;
  background:
    radial-gradient(120% 120% at 100% 0%, var(--accent-soft), transparent 60%), var(--surface);
}

.skills__head {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: var(--space-2);
}

.skills__icon {
  display: grid;
  flex-shrink: 0;
  place-items: center;
  width: 2.75rem;
  height: 2.75rem;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  background: var(--surface-2);
  color: var(--accent);
  transition: transform 0.4s var(--ease-out);
}

.skills__heading {
  flex: 1;
  min-width: 10rem;
}

.skills__title {
  font-size: 1.25rem;
}

.skills__desc {
  margin-top: 0.25rem;
  color: var(--muted);
  font-size: 0.875rem;
}

.skills__list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
</style>
