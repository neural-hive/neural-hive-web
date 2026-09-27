<script setup>
import SiteNav from './components/SiteNav.vue'
import AppFooter from './components/AppFooter.vue'
</script>

<template>
  <SiteNav />
  <main class="app-shell">
    <router-view />
  </main>
  <AppFooter />
</template>
