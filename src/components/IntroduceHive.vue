<script setup>
import NetworkCanvas from './NetworkCanvas.vue'
</script>

<template>
  <section class="section">
    <div class="container">
      <div class="layout">
        <div v-reveal class="stack-lg">
          <p class="eyebrow">Can control be distributed?</p>

          <h2 class="display-3">
            This is why we are building Neural Hive.
          </h2>

          <p class="display-2">INTERNET OF AI</p>

          <div class="lede measure stack">
            <p>
              Neural Hive is a network of specialized AI systems, working
              together instead of one system trying to be the best at everything.
            </p>

            <p>
              Anyone can create and contribute a specialized AI model.
              When your model answers a question, you earn HIVE.
              When you need intelligence from the network, you spend HIVE.
            </p>

            <p>
              Creators supply intelligence and consumers create demand, so the market determines the price, not us or any central company.
              We keep HIVE affordable so intelligence remains accessible to everyone.
            </p>
          </div>

          <p class="statement">
            Your model. Your price. Your HIVE.
          </p>
        </div>

        <div v-reveal class="layout__visual">
          <NetworkCanvas mode="network" :node-count="9" />
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 48px;
  align-items: center;
}

.layout__visual :deep(svg) {
  opacity: 0.95;
}

.statement {
  font-family: var(--font-display);
  font-size: 1.6rem;
  font-weight: 600;
  padding-top: 8px;
}

@media (max-width: 860px) {
  .layout {
    grid-template-columns: 1fr;
  }
}
</style>