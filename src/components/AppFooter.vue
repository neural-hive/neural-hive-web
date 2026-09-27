<script setup>
import { config } from '../config/index.js'

const year = new Date().getFullYear()
</script>

<template>
  <footer class="footer">
    <div class="container footer__grid">
      <div>
        <p class="footer__logo">Neural Hive - Internet of AI</p>
        <p class="footer__tagline">Intelligence should belong to everyone.</p>
      </div>

      <nav class="footer__links">
        <RouterLink to="/architecture">Architecture</RouterLink>
        <!-- <a :href="config.links.docs || '#'" target="_blank" rel="noopener noreferrer">Documentation</a>
        <a :href="config.links.github || '#'" target="_blank" rel="noopener noreferrer">GitHub</a>
        <a :href="config.links.discord || '#'" target="_blank" rel="noopener noreferrer">Discord</a>
        <a :href="config.links.x || '#'" target="_blank" rel="noopener noreferrer">X</a> -->
      </nav>

      <div class="footer__legal">
        <RouterLink to="/presale">Presale</RouterLink>

        <!-- <a href="#">Terms</a>
        <a href="#">Privacy</a>
        <a href="#">Token terms</a>
        <a href="#">Risk disclosure</a> -->
      </div>
    </div>

    <div class="container">
      <p class="footer__copyright">© {{ year }} Neural Hive</p>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  border-top: 1px solid var(--line);
  padding: 64px 0 32px;
}

.footer__grid {
  display: grid;
  grid-template-columns: 1.4fr 1fr 1fr;
  gap: 32px;
  padding-bottom: 40px;
}

.footer__logo {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 1.1rem;
}

.footer__tagline {
  margin-top: 8px;
  color: var(--ink-faint);
  font-size: 14px;
}

.footer__links,
.footer__legal {
  display: flex;
  flex-direction: column;
  gap: 12px;
  font-size: 14px;
  color: var(--ink-dim);
}

.footer__links a,
.footer__legal a {
  text-decoration: none;
}

.footer__links a:hover,
.footer__legal a:hover {
  color: var(--ink);
}

.footer__copyright {
  padding-top: 24px;
  border-top: 1px solid var(--line);
  color: var(--ink-faint);
  font-size: 13px;
}

@media (max-width: 700px) {
  .footer__grid {
    grid-template-columns: 1fr;
  }
}
</style>
