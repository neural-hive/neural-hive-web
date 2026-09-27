<script setup>

const phases = [
  {
    n: '01',
    title: 'The presale',
    when: '12 months',
    body: 'Raise the minimum $3M required to begin full development, and find out whether there is real demand for Neural Hive.'
  },
  {
    n: '02',
    title: 'Return the funds if the $3M target is not reached',
    when: 'After the presale Concludes',
    body: 'If the $3 million target is not reached within the first year, return the presale funds.'
  },
  {
    n: '03',
    title: 'Build the Hive',
    when: 'After the presale concludes',
    body: 'Develop the core architecture and coordination layer, build infrastructure, test, and harden security.'
  },
  {
    n: '04',
    title: 'Beta release',
    when: 'About 10 months after the presale ends',
    body: 'Presale participants get priority access. Real users, real feedback, real fixes.'
  },
  {
    n: '05',
    title: 'Invite creators',
    when: 'About 3 months after beta',
    body: 'Open the network to AI creators and begin onboarding specialist intelligence.'
  },
  {
    n: '06',
    title: 'List HIVE on exchanges',
    when: 'About 2 month after stage 05',
    body: 'Prepare HIVE for exchange listing once the network and ecosystem are ready.'
  }
]
</script>

<template>
  <section class="section">
    <div class="container">
      <div class="stack-lg">
        <p v-reveal class="eyebrow">Roadmap</p>
        <h2 v-reveal class="display-2">From idea to Hive</h2>
      </div>

      <div class="timeline">
        <div v-for="phase in phases" :key="phase.n" v-reveal class="phase">
          <div class="phase__marker">
            <span class="mono">{{ phase.n }}</span>
          </div>
          <div class="phase__body">
            <div class="phase__head">
              <h3>{{ phase.title }}</h3>
              <span class="phase__when">{{ phase.when }}</span>
            </div>
            <p>{{ phase.body }}</p>
          </div>
        </div>
      </div>

      <p v-reveal class="fine-print">
        Timelines are targets, measured from the milestone before them. They can move if development,
        security or regulatory work takes longer than planned. We will never claim a listing or
        partnership that does not exist yet.
      </p>
    </div>
  </section>
</template>

<style scoped>
.timeline {
  margin-top: 48px;
  border-left: 1px solid var(--line);
  padding-left: 32px;
  display: flex;
  flex-direction: column;
  gap: 44px;
}

.phase {
  position: relative;
}

.phase__marker {
  position: absolute;
  left: -49px;
  top: 0;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: var(--bg-panel);
  border: 1px solid var(--line-strong);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: var(--ink-dim);
}

.phase__head {
  display: flex;
  align-items: baseline;
  gap: 14px;
  flex-wrap: wrap;
  margin-bottom: 8px;
}

.phase__head h3 {
  font-size: 1.1rem;
}

.phase__when {
  font-size: 13px;
  color: var(--ink-faint);
}

.phase p {
  color: var(--ink-dim);
  max-width: 560px;
}

.fine-print {
  margin-top: 48px;
  color: var(--ink-faint);
  font-size: 13px;
  max-width: 640px;
}
</style>
