<script setup>
import { ref, computed } from 'vue'
import { config } from '../config/index.js'

const amount = ref(config.presale.minContributionUsd)

const hiveReceived = computed(() => {
  const usd = Number(amount.value)
  if (!Number.isFinite(usd) || usd < config.presale.minContributionUsd) return 0
  return usd / config.presale.priceUsd
})

const numberFmt = new Intl.NumberFormat('en-US')

function formatSupply(n) {
  return numberFmt.format(n)
}
</script>

<template>
  <section class="section">
    <div class="container">
      <div class="stack-lg">
        <p v-reveal class="eyebrow">Token economics</p>

        <h2 v-reveal class="display-2">
          The token that powers Neural Hive.
        </h2>
      </div>

      <div v-reveal class="stats">
        <div class="stat">
          <span class="stat__value mono">
            {{ formatSupply(config.token.totalSupply) }}
          </span>
          <span class="stat__label">
            Total {{ config.token.symbol }} supply
          </span>
        </div>

        <div class="stat">
          <span class="stat__value mono">
            {{ formatSupply(config.presale.supply) }}
          </span>
          <span class="stat__label">
            Presale allocation
          </span>
        </div>

        <div class="stat">
          <span class="stat__value mono">
            ${{ config.presale.priceUsd }}
          </span>
          <span class="stat__label">
            Presale price per {{ config.token.symbol }}
          </span>
        </div>

        <div class="stat">
          <span class="stat__value mono">
            ${{ config.presale.minContributionUsd }}
          </span>
          <span class="stat__label">
            Minimum contribution
          </span>
        </div>
      </div>

      <div v-reveal class="calculator">
        <label class="calculator__field">
          <span class="calculator__label">
            {{ config.paymentToken.symbol }} contribution
          </span>

          <input
            v-model.number="amount"
            type="number"
            :min="config.presale.minContributionUsd"
            step="1"
            class="calculator__input"
          />
        </label>

        <span class="calculator__arrow">→</span>

        <div class="calculator__field">
          <span class="calculator__label">
            {{ config.token.symbol }} received
          </span>

          <span class="calculator__output mono">
            {{
              amount >= config.presale.minContributionUsd
                ? formatSupply(Math.floor(hiveReceived))
                : '0'
            }}
          </span>
        </div>
      </div>

      <div v-reveal class="measure lede stack">
        <p>
          {{ config.token.symbol }} is designed as the utility token for
          Neural Hive. Once the network is available, it is intended to
          provide access to AI services across the network and reward creators
          whose systems contribute value.
        </p>
      </div>

      <div v-reveal class="use-grid">
        <div class="use-card">
          <h3>Access</h3>
          <p>
            Use {{ config.token.symbol }} to access Neural Hive services once
            they launch.
          </p>
        </div>

        <div class="use-card">
          <h3>Creator rewards</h3>
          <p>
            Creators can earn {{ config.token.symbol }} when their AI systems
            contribute value to the network.
          </p>
        </div>

        <div class="use-card">
          <h3>Early access</h3>
          <p>
             Presale participants are intended to receive priority and preferential pricing for access to the beta release of the superintelligence network.
          </p>
        </div>
      </div>

      <div v-reveal class="not-selling">
        <h3 class="display-3">What we are building around it</h3>

        <div class="lede stack">
          <p>
            {{ config.token.symbol }} is designed primarily as a utility
            token. Its purpose is to support access to Neural Hive and reward
            the creators who contribute intelligence to the network.
          </p>

          <p>
            We are not promising a guaranteed return or claiming that the
            token price will rise. Its longer-term value will depend on the
            adoption and use of Neural Hive, as well as supply and demand
            among participants in the network.
          </p>
        </div>

        <p class="not-selling__statement">
          The product comes first. The token exists to power it.
        </p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.stats {
  margin-top: 48px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  border-top: 1px solid var(--line);
  border-bottom: 1px solid var(--line);
  padding: 32px 0;
}

.stat {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.stat__value {
  font-size: 1.4rem;
  font-weight: 600;
}

.stat__label {
  font-size: 13px;
  color: var(--ink-faint);
}

.calculator {
  margin-top: 48px;
  display: flex;
  align-items: flex-end;
  gap: 24px;
  padding: 28px;
  background: var(--bg-panel);
  border: 1px solid var(--line);
  border-radius: 12px;
  max-width: 560px;
  flex-wrap: wrap;
}

.calculator__field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.calculator__label {
  font-size: 12px;
  color: var(--ink-faint);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.calculator__input {
  background: var(--bg);
  border: 1px solid var(--line-strong);
  border-radius: 6px;
  color: var(--ink);
  font-size: 1.1rem;
  padding: 10px 12px;
  width: 160px;
  font-family: var(--font-body);
}

.calculator__input:focus-visible {
  outline: 2px solid var(--signal);
}

.calculator__output {
  font-size: 1.4rem;
  font-weight: 600;
}

.calculator__arrow {
  color: var(--ink-faint);
  padding-bottom: 12px;
}

.use-grid {
  margin-top: 56px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.use-card {
  padding: 24px;
  border: 1px solid var(--line);
  border-radius: 10px;
}

.use-card h3 {
  font-size: 1rem;
  margin-bottom: 8px;
}

.use-card p {
  color: var(--ink-dim);
  font-size: 14px;
}

.not-selling {
  margin-top: 72px;
  padding-top: 48px;
  border-top: 1px solid var(--line);
  max-width: 640px;
}

.not-selling__statement {
  margin-top: 24px;
  font-family: var(--font-display);
  font-size: 1.3rem;
  font-weight: 600;
}

@media (max-width: 860px) {
  .stats {
    grid-template-columns: repeat(2, 1fr);
  }

  .use-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 600px) {
  .calculator {
    align-items: flex-start;
    flex-direction: column;
  }

  .calculator__arrow {
    transform: rotate(90deg);
    padding-bottom: 0;
  }
}
</style>