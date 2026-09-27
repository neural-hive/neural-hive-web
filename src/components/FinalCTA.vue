<script setup>
import NetworkCanvas from './NetworkCanvas.vue'
import { config } from '../config/index.js'

</script>

<template>
  <section class="section final">
    <div class="final__visual">
      <NetworkCanvas mode="network" :node-count="12" />
    </div>

    <div class="container center measure stack-lg">
      <h2 v-reveal class="display-2">Welcome to the Hive.</h2>
      <h3 v-reveal class="display-3">The Internet of AI.</h3>

      <p v-reveal class="lede">Help us find out whether people want a different future for AI.</p>

      <div v-reveal class="btn-row center-row">
        <RouterLink class="btn btn-primary" to="/presale">Join the presale</RouterLink>
        <!-- <a class="btn btn-secondary" :href="config.links.docs || '#'" target="_blank" rel="noopener noreferrer">Read the manifesto</a> -->
      </div>

      <p v-reveal class="fine-print">Minimum contribution: ${{ config.presale.minContributionUsd }}</p>

      <div v-reveal class="closing stack">
        <p class="display-3">Intelligence should be accessible to everyone.</p>
        <p class="display-3 closing__accent">And control should never belong to a few.</p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.final {
  position: relative;
  padding: 160px 0;
  overflow: hidden;
}

.final__visual {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.5;
  pointer-events: none;
  mask-image: radial-gradient(ellipse 70% 70% at 50% 50%, black 30%, transparent 80%);
}

.final__visual :deep(svg) {
  max-width: 1000px;
}

.center-row {
  justify-content: center;
}

.fine-print {
  color: var(--ink-faint);
  font-size: 13px;
}

.closing {
  margin-top: 40px;
  padding-top: 40px;
  border-top: 1px solid var(--line);
}

.closing__accent {
  color: var(--ink-dim);
}
</style>
