<script setup>
import { config } from '../config/index.js'

const targetFormatted = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0
}).format(config.presale.targetRaiseUsd)
</script>

<template>
  <section class="section">
    <div class="container center measure stack-lg">
      <p v-reveal class="mono target-number">{{ targetFormatted }}</p>

      <h2 v-reveal class="display-3">
        At least {{ targetFormatted }} to give superintelligence a different architecture.
      </h2>

      <div v-reveal class="lede stack">
        <p>
          We are raising {{ targetFormatted }} as a pre-seed round to build the
          first version of Neural Hive: a network of specialized AI systems
          designed to work together.
        </p>

        <p>
          This presale is also a test. We want to find out whether people
          actually want to participate in building an Internet of AI.
        </p>
      </div>
    </div>

    <div v-reveal class="container">
      <div class="refund-panel">
        <h3 class="display-3">
          What if we don't reach {{ targetFormatted }}?
        </h3>

        <p class="lede">
          If we do not reach the minimum target by the end of the one-year
          presale period, we will assess whether Neural Hive is feasible with
          the funds raised. If we determine that it is feasible, we will begin
          development and continue the presale to raise the remaining funds.
          If it is not feasible, the contributed
          {{ config.paymentToken.symbol }} will be returned through the claim
          process on this website.
        </p>

        <p class="refund-headline">
          Build if feasible. Refund if not.
        </p>

        <p class="fine-print">
          The final refund mechanism will depend on the smart-contract and
          legal structure of the presale. The applicable mechanism and
          documentation will be published before contributions can be claimed.
        </p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.target-number {
  font-size: clamp(2.4rem, 6vw, 4rem);
  font-weight: 600;
  color: var(--ink);
}

.refund-panel {
  max-width: 760px;
  margin: 72px auto 0;
  padding: 44px;
  border: 1px solid var(--line-strong);
  border-radius: 14px;
  background: var(--bg-panel);
  text-align: center;
}

.refund-panel .lede {
  margin-top: 18px;
}

.refund-headline {
  margin-top: 28px;
  font-family: var(--font-display);
  font-size: 1.4rem;
  font-weight: 600;
}

.fine-print {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid var(--line);
  color: var(--ink-faint);
  font-size: 13px;
  text-align: left;
}

@media (max-width: 600px) {
  .refund-panel {
    padding: 28px;
  }
}
</style>