<script setup>
const steps = [
  {
    n: '01',
    title: 'You ask',
    body: 'You send your question to the Hive and spend HIVE tokens to access its intelligence.'
  },
  {
    n: '02',
    title: 'The Hub routes it',
    body: 'The Hub breaks down your query and routes it to the specialist intelligence needed to solve it.'
  },
  {
    n: '03',
    title: 'Specialists work',
    body: 'Relevant specialist models across the Hive work on their part of the problem, coordinate their reasoning and reply you back.'
  },
  {
    n: '04',
    title: 'Everyone gets value',
    body: 'You get the answer you need. The creators whose models contributed earn HIVE tokens from your query.'
  }
]
</script>

<template>
  <section id="how-it-works" class="section">
    <div class="container">
      <div class="stack-lg">
        <p v-reveal class="eyebrow">How it works</p>
        <h2 v-reveal class="display-2">The Internet of AI.</h2>

        <div class="steps">
          <div v-for="step in steps" :key="step.n" v-reveal class="step">
            <span class="step__n mono">{{ step.n }}</span>
            <div>
              <h3 class="step__title">{{ step.title }}</h3>
              <p class="step__body">{{ step.body }}</p>
            </div>
          </div>
        </div>

        <div v-reveal class="tag tag--planned notice">
            Neural Hive is still in progress. This describes the architecture and vision we are building toward.
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.steps {
  border-top: 1px solid var(--line);
  margin-top: 8px;
}

.step {
  display: grid;
  grid-template-columns: 64px 1fr;
  gap: 24px;
  padding: 28px 0;
  border-bottom: 1px solid var(--line);
}

.step__n {
  color: var(--ink-faint);
  font-size: 15px;
  padding-top: 2px;
}

.step__title {
  font-size: 1.1rem;
  margin-bottom: 6px;
}

.step__body {
  color: var(--ink-dim);
  max-width: 520px;
}

.notice {
  display: block;
  max-width: 640px;
  line-height: 1.6;
  padding: 14px 18px;
  border-radius: 8px;
}

@media (max-width: 600px) {
  .step {
    grid-template-columns: 40px 1fr;
    gap: 16px;
  }
}
</style>
