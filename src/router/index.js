import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '@/views/HomePage.vue'
import ExerciseSandbox from '@/views/ExerciseSandbox.vue'
import ExercisesOverview from '@/views/ExercisesOverview.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomePage
  },
  {
    path: '/exercise/:id',
    name: 'ExerciseSandbox',
    component: ExerciseSandbox
  },
  {
    path: '/exercises',
    name: 'ExerciseList',
    component: ExercisesOverview
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
