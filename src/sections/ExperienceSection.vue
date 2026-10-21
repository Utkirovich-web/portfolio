<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import SectionTitle from '@/components/SectionTitle.vue'
import TimelineItem from '@/components/TimelineItem.vue'
import { experience } from '@/data/experience'

const { t } = useI18n()

const base = (id: string) => `experience.items.${id}`
</script>

<template>
  <section
    id="experience"
    class="section experience"
    aria-labelledby="experience-title"
    tabindex="-1"
  >
    <div class="container">
      <SectionTitle
        title-id="experience-title"
        :eyebrow="t('experience.eyebrow')"
        :title="t('experience.title')"
        :subtitle="t('experience.subtitle')"
      />

      <ol class="timeline" role="list">
        <TimelineItem
          v-for="entry in experience"
          :key="entry.id"
          :period="t(`${base(entry.id)}.period`)"
          :role="t(`${base(entry.id)}.role`)"
          :organization="t(`${base(entry.id)}.org`)"
          :type-label="t(`experience.types.${entry.type}`)"
          :icon="entry.icon"
          :points="entry.points.map((point) => t(`${base(entry.id)}.points.${point}`))"
          :current="entry.current"
          :current-label="t('experience.current')"
        />
      </ol>
    </div>
  </section>
</template>

<style scoped lang="scss">
.timeline {
  position: relative;
  display: grid;
  gap: var(--space-3);
  max-width: 52rem;

  // Vertical rail through the markers
  &::before {
    content: '';
    position: absolute;
    top: 1.5rem;
    bottom: 1.5rem;
    left: calc(1.25rem - 0.5px);
    width: 1px;
    background: linear-gradient(
      to bottom,
      var(--accent),
      var(--border-strong) 35%,
      var(--border) 85%,
      transparent
    );
  }
}
</style>
