<script setup lang="ts">
import { profile } from '@/data/profile'

/**
 * Profile photo with AVIF → WebP → fallback sources and native lazy loading.
 * Until a photo is configured in src/data/profile.ts, a monogram placeholder is shown.
 */
defineProps<{ alt: string }>()

const avatar = profile.avatar
</script>

<template>
  <div class="avatar">
    <picture v-if="avatar">
      <source v-if="avatar.avif" :srcset="avatar.avif" type="image/avif" />
      <source v-if="avatar.webp" :srcset="avatar.webp" type="image/webp" />
      <img
        :src="avatar.fallback"
        :alt="alt"
        :width="avatar.width"
        :height="avatar.height"
        loading="lazy"
        decoding="async"
        class="avatar__img"
      />
    </picture>

    <div v-else class="avatar__placeholder" role="img" :aria-label="alt">
      <span class="avatar__grid" aria-hidden="true" />
      <span class="avatar__orbit" aria-hidden="true" />
      <span class="avatar__initials" aria-hidden="true">{{ profile.initials }}</span>
    </div>
  </div>
</template>

<style scoped lang="scss">
.avatar {
  position: relative;
  overflow: hidden;
  aspect-ratio: 4 / 5;
  border-radius: var(--radius-md);
  background: var(--surface-2);
}

.avatar__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar__placeholder {
  position: relative;
  display: grid;
  place-items: center;
  height: 100%;
  background:
    radial-gradient(80% 60% at 20% 10%, var(--glow-1), transparent 70%),
    radial-gradient(70% 60% at 90% 90%, var(--glow-3), transparent 70%), var(--surface-2);
}

.avatar__grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(var(--grid-line) 1px, transparent 1px),
    linear-gradient(90deg, var(--grid-line) 1px, transparent 1px);
  background-size: 32px 32px;
  mask-image: radial-gradient(circle at 50% 50%, #000 20%, transparent 75%);
}

.avatar__orbit {
  position: absolute;
  width: 62%;
  aspect-ratio: 1;
  border: 1px dashed var(--border-strong);
  border-radius: 50%;
  animation: spin 40s linear infinite;
}

.avatar__initials {
  position: relative;
  background: var(--gradient-text);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  font-family: var(--font-display);
  font-size: clamp(4rem, 12vw, 7rem);
  font-weight: 800;
  letter-spacing: -0.06em;
  line-height: 1;
}

@keyframes spin {
  to {
    rotate: 360deg;
  }
}
</style>
