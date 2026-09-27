<script setup>
const usdFmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })

const items = [
  { label: 'Development', amount: 1_000_000, desc: 'Engineering, product development, infrastructure and the first major build phase.' },
  { label: 'Extended development', amount: 500_000, desc: 'Additional runway, infrastructure and engineering beyond the first phase.' },
  { label: 'Research and collaboration', amount: 800_000, desc: 'Specialist collaboration, research and ecosystem development.' },
  { label: 'Reserve', amount: 700_000, desc: 'Security, audits, infrastructure scaling, legal work, operations, hiring and contingency.' }
]

const total = items.reduce((sum, i) => sum + i.amount, 0)
</script>

<template>
  <section class="section">
    <div class="container">
      <div class="stack-lg">
        <p v-reveal class="eyebrow">Where the money goes</p>
        <h2 v-reveal class="display-2">Where the $3M goes next.</h2>
      </div>

      <div v-reveal class="bars">
        <div v-for="item in items" :key="item.label" class="bar-row">
          <div class="bar-row__head">
            <span class="bar-row__label">{{ item.label }}</span>
            <span class="bar-row__amount mono">{{ usdFmt.format(item.amount) }}</span>
          </div>
          <div class="bar-row__track">
            <div class="bar-row__fill" :style="{ width: (item.amount / total) * 100 + '%' }"></div>
          </div>
          <p class="bar-row__desc">{{ item.desc }}</p>
        </div>
      </div>

      <p v-reveal class="fine-print">
        These are planning estimates based on a fully funded {{ usdFmt.format(total) }} raise, not fixed
        guarantees. Actual spending will depend on development needs and the final structure of the project.
      </p>
    </div>
  </section>
</template>

<style scoped>
.bars {
  margin-top: 48px;
  display: flex;
  flex-direction: column;
  gap: 32px;
  max-width: 720px;
}

.bar-row__head {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 15px;
}

.bar-row__amount {
  color: var(--ink-dim);
}

.bar-row__track {
  height: 8px;
  background: var(--bg-panel);
  border: 1px solid var(--line);
  border-radius: 100px;
  overflow: hidden;
}

.bar-row__fill {
  height: 100%;
  background: var(--signal);
}

.bar-row__desc {
  margin-top: 10px;
  color: var(--ink-dim);
  font-size: 14px;
  max-width: 520px;
}

.fine-print {
  margin-top: 32px;
  color: var(--ink-faint);
  font-size: 13px;
  max-width: 640px;
}
</style>
