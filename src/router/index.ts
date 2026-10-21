import { createRouter, createWebHistory, START_LOCATION } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import { getScrollOffset, preferredScrollBehavior } from '@/composables/useSectionNav'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      // Code-split: only downloaded when someone actually hits a missing page.
      component: () => import('@/views/NotFoundView.vue'),
    },
  ],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition

    if (to.hash) {
      return {
        el: to.hash,
        top: getScrollOffset(),
        // Jump instantly on first load (deep link), animate for in-page navigation.
        behavior: from === START_LOCATION ? 'instant' : preferredScrollBehavior(),
      }
    }

    // Removing the hash on the same page (e.g. "back to top") — the caller handles scrolling.
    if (to.name === from.name) return false

    return { top: 0 }
  },
})

export default router
