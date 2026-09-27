import { createRouter, createWebHistory } from 'vue-router'
import HomePage from './pages/HomePage.vue'
import PresalePage from './pages/PresalePage.vue'
import ArchitecturePage from './pages/ArchitecturePage.vue'

const routes = [
  { path: '/', name: 'home', component: HomePage },
  { path: '/presale', name: 'presale', component: PresalePage },
  { path: '/architecture', name: 'architecture', component: ArchitecturePage },
  { path: '/:pathMatch(.*)*', redirect: '/' }
]

export default createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    return { top: 0, behavior: 'smooth' }
  }
})
