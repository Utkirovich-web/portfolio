<script setup lang="ts">
import { useRoute } from 'vue-router'
import HeroSection from '@/sections/HeroSection.vue'
import AboutSection from '@/sections/AboutSection.vue'
import SkillsSection from '@/sections/SkillsSection.vue'
import ProjectsSection from '@/sections/ProjectsSection.vue'
import ExperienceSection from '@/sections/ExperienceSection.vue'
import ContactSection from '@/sections/ContactSection.vue'
import { useProgressiveSections } from '@/composables/useProgressiveSections'
import { useScrollReveal } from '@/composables/useScrollReveal'

// Below-the-fold sections, in page order.
const sections = [AboutSection, SkillsSection, ProjectsSection, ExperienceSection, ContactSection]

const route = useRoute()

// Deep links (/#contact) need every section in place before the router scrolls.
const { isRendered, allRendered } = useProgressiveSections(sections.length, {
  immediate: Boolean(route.hash),
})

useScrollReveal('[data-reveal]', allRendered)
</script>

<template>
  <HeroSection />
  <template v-for="(section, index) in sections" :key="index">
    <component :is="section" v-if="isRendered(index)" />
  </template>
</template>
