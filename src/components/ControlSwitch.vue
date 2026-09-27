<script setup>
import { ref, computed } from 'vue'
import LimitedNetworkCanvas from './LimitedNetworkCanvas.vue'

const setting = ref('full')

const options = [
  { id: 'full', label: 'Full' },
  { id: 'limited', label: 'Limited' },
  { id: 'off', label: 'Off' }
]

const nodeCount = computed(() => {
  if (setting.value === 'off') return 0
  if (setting.value === 'limited') return 5
  return 8
})

const description = computed(() => {
  if (setting.value === 'off') {
    return 'Every participating node is offline. The Hive has no intelligence left to run.'
  }

  if (setting.value === 'limited') {
    return 'Some creators have taken their nodes offline. The remaining network stays active.'
  }

  return 'All participating specialist systems are online and available to the Hive.'
})
</script>

<template>
  <section class="section">
    <div class="container">
      <p v-reveal class="eyebrow">
        Who has the switch?
      </p>

      <h2 v-reveal class="display-2">
        Our design philosophy
      </h2>

      <p v-reveal class="lede intro">
        No central authority should own the only switch.
        Every creator decides whether their own intelligence is available to the network.
      </p>

      <div v-reveal class="switch-panel">

        <div class="switch-panel__visual">
          <LimitedNetworkCanvas
            :node-count="nodeCount"
          />
        </div>

        <div class="switch-panel__controls">

          <div
            class="switch"
            role="radiogroup"
            aria-label="Network availability"
          >
            <button
              v-for="opt in options"
              :key="opt.id"
              class="switch__option"
              :class="{
                'switch__option--active':
                  setting === opt.id
              }"
              role="radio"
              :aria-checked="
                setting === opt.id
              "
              type="button"
              @click="setting = opt.id"
            >
              {{ opt.label }}
            </button>
          </div>

          <p class="switch__description">
            {{ description }}
          </p>

        </div>
      </div>

      <div v-reveal class="measure stack-lg followup">

        <h3 class="display-3">
          Your node. Your choice.
        </h3>

        <div class="lede stack">
          <p>
            If you contribute intelligence to the Hive,
            you should be able to take your own node offline
            whenever you choose.
          </p>

          <p>
            The network can keep running with fewer participants.
            But if everyone leaves, the Hive goes dark.
          </p>
        </div>

        <p class="fine-print">
          This is the principle guiding how we design Neural Hive.
          The exact mechanism for taking nodes online and offline
          will depend on the final architecture.
        </p>

      </div>
    </div>
  </section>
</template>

<style scoped>
.intro {
  max-width: 680px;
  margin-top: 18px;
}

.switch-panel {
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 40px;
  align-items: center;

  margin: 56px 0 72px;
  padding: 40px;

  border: 1px solid var(--line);
  border-radius: 12px;

  background: var(--bg-panel);
}

.switch-panel__visual {
  min-height: 420px;

  display: flex;
  align-items: center;
  justify-content: center;

  overflow: hidden;
}

.switch {
  display: inline-flex;

  border: 1px solid var(--line-strong);
  border-radius: 100px;

  padding: 4px;
  gap: 4px;
}

.switch__option {
  border: none;
  background: transparent;

  color: var(--ink-dim);

  padding: 10px 20px;

  border-radius: 100px;

  font-weight: 600;
  font-size: 14px;

  cursor: pointer;

  transition:
    background 160ms ease,
    color 160ms ease;
}

.switch__option--active {
  background: var(--ink);
  color: #0a0a0c;
}

.switch__description {
  margin-top: 18px;

  color: var(--ink-dim);

  max-width: 360px;

  line-height: 1.6;
}

.fine-print {
  color: var(--ink-faint);

  font-size: 14px;

  border-top: 1px solid var(--line);

  padding-top: 20px;
}

@media (max-width: 780px) {
  .switch-panel {
    grid-template-columns: 1fr;
    padding: 28px;
  }

  .switch-panel__visual {
    min-height: 360px;
  }
}
</style>