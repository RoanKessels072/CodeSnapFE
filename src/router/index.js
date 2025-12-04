import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '@/views/HomePage.vue'
import ExerciseSandbox from '@/views/ExerciseSandbox.vue'
import ExercisesOverview from '@/views/ExercisesOverview.vue'
import { state, login } from '@/keycloak.js'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomePage
  },
  {
    path: '/exercise/:id',
    name: 'ExerciseSandbox',
    component: ExerciseSandbox,
    meta: { requiresAuth: true }
  },
  {
    path: '/exercises',
    name: 'ExerciseList',
    component: ExercisesOverview,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth) {
    if (state.authenticated) {
      next()
    } else {
      const redirectUri = window.location.origin + to.fullPath
      login(redirectUri)
    }
  } else {
    next()
  }
})

export default router
