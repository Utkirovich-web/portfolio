<script setup lang="ts">
/**
 * Decorative gradient glow.
 * - Light / Dark: soft, static accent glow (hero only).
 * - Aurora: slowly drifting teal → green → violet blobs (hero + section headers).
 * Only `transform` is animated so it stays on the compositor.
 */
withDefaults(defineProps<{ variant?: 'hero' | 'section' }>(), { variant: 'hero' })
</script>

<template>
  <div class="glow" :class="`glow--${variant}`" aria-hidden="true">
    <span class="glow__blob glow__blob--1" />
    <span class="glow__blob glow__blob--2" />
    <span class="glow__blob glow__blob--3" />
  </div>
</template>

<style scoped lang="scss">
.glow {
  position: absolute;
  z-index: -1;
  pointer-events: none;
}

.glow__blob {
  position: absolute;
  aspect-ratio: 1;
  border-radius: 50%;
  background: radial-gradient(closest-side, var(--blob), transparent);
}

// Hero
.glow--hero {
  inset: 0;
  overflow: hidden;

  .glow__blob--1 {
    --blob: var(--glow-1);
    top: -35%;
    left: 50%;
    width: min(64rem, 140vw);
    translate: -50% 0;
  }

  .glow__blob--2 {
    --blob: var(--glow-2);
    top: 15%;
    left: -12%;
    width: min(38rem, 90vw);
  }

  .glow__blob--3 {
    --blob: var(--glow-3);
    top: 25%;
    right: -12%;
    width: min(34rem, 80vw);
  }
}

// Section headers — Aurora theme only
.glow--section {
  display: none;
  top: -8rem;
  left: -12rem;
  width: min(48rem, 140vw);
  height: 22rem;

  .glow__blob--1 {
    --blob: var(--glow-1);
    top: 0;
    left: 0;
    width: 22rem;
  }

  .glow__blob--2 {
    --blob: var(--glow-2);
    top: 2rem;
    left: 12rem;
    width: 18rem;
  }

  .glow__blob--3 {
    --blob: var(--glow-3);
    top: -2rem;
    left: 22rem;
    width: 20rem;
  }
}

[data-theme='aurora'] .glow--section {
  display: block;
}

[data-theme='aurora'] .glow__blob {
  will-change: transform;
  animation: drift-a 24s var(--ease-in-out) infinite alternate;
}

[data-theme='aurora'] .glow__blob--2 {
  animation-name: drift-b;
  animation-duration: 30s;
}

[data-theme='aurora'] .glow__blob--3 {
  animation-name: drift-c;
  animation-duration: 36s;
}

@keyframes drift-a {
  0% {
    transform: translate3d(0, 0, 0) scale(1);
  }
  50% {
    transform: translate3d(8%, 6%, 0) scale(1.1);
  }
  100% {
    transform: translate3d(-6%, 10%, 0) scale(0.95);
  }
}

@keyframes drift-b {
  0% {
    transform: translate3d(0, 0, 0) scale(1);
  }
  50% {
    transform: translate3d(14%, -8%, 0) scale(1.15);
  }
  100% {
    transform: translate3d(4%, 12%, 0) scale(1);
  }
}

@keyframes drift-c {
  0% {
    transform: translate3d(0, 0, 0) scale(1.05);
  }
  50% {
    transform: translate3d(-12%, 8%, 0) scale(0.9);
  }
  100% {
    transform: translate3d(-4%, -10%, 0) scale(1.1);
  }
}
</style>
