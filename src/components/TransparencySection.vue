<script setup>
import { config, isPlaceholderAddress } from '../config/index.js'

const items = [
  {
    label: 'Presale contract address',
    value: config.presale.contractAddress,
    href: isPlaceholderAddress(config.presale.contractAddress)
      ? null
      : `${config.chain.explorerUrl}/address/${config.presale.contractAddress}`
  },
  {
    label: 'HIVE Token contract address',
    value: config.token.contractAddress,
    href: isPlaceholderAddress(config.token.contractAddress)
      ? null
      : `${config.chain.explorerUrl}/address/${config.token.contractAddress}`
  },
]
</script>

<template>
  <section class="section section--tight">
    <div class="container">
      <div class="stack-lg">
        <p v-reveal class="eyebrow"> Everything you need to verify Neural Hive</p>
        <h2 v-reveal class="display-2">Don't trust us. Verify us.</h2>
        <p v-reveal class="lede measure">Every address and document that matters to this presale, in one place. Verify the addresses on-chain and
          review the documentation before participating.</p>
      </div>

      <div class="verify-list">
        <div v-for="item in items" :key="item.label" v-reveal class="verify-row">
          <span class="verify-row__label">{{ item.label }}</span>
          <a v-if="item.href" class="verify-row__value mono" :href="item.href" target="_blank" rel="noopener noreferrer">
            {{ item.value }}
          </a>
          <span v-else class="verify-row__value verify-row__value--muted mono">{{ item.value }}</span>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.verify-list {
  margin-top: 40px;
  border-top: 1px solid var(--line);
}

.verify-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 18px 0;
  border-bottom: 1px solid var(--line);
  flex-wrap: wrap;
}

.verify-row__label {
  color: var(--ink-dim);
  font-size: 14px;
}

.verify-row__value {
  font-size: 13px;
  max-width: 60%;
  overflow-wrap: anywhere;
  text-align: right;
  text-decoration: underline;
  text-underline-offset: 3px;
}

.verify-row__value--muted {
  color: var(--ink-faint);
  text-decoration: none;
}
</style>
