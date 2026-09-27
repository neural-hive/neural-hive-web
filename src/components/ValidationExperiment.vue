<template>
  <section class="section">
    <div class="container">
      <div class="stack-lg">
        <p v-reveal class="eyebrow">Who builds what comes next?</p>
        <h2 v-reveal class="display-2">We are testing something else too.</h2>
        <p v-reveal class="lede measure">We want to know whether people actually want to participate in building the Internet of AI, an alternative to centralized AI.</p>
      </div>

      <div class="options">
        <div v-reveal class="option">
          <span class="option__tag">Option A</span>
          <h3>Let the few decide</h3>
          <div class="option__body">
            <p>Let the largest companies build the systems, set the rules, and decide access and what happens next.</p>
          </div>
        </div>
        <div v-reveal class="option option--highlight">
          <span class="option__tag">Option B</span>
          <h3>Build with us</h3>
          <div class="option__body">
            <p>Help fund an alternative, become an early user, participate in the network, and help prove another model is possible.</p>
          </div>
        </div>
      </div>

      <div v-reveal class="measure lede stack">
        <p class="statement">This presale is our first signal.</p>
        <p>We cannot force people to care about this idea. We can only build it and ask. Do you want to be part of an attempt to build a different future for AI, or are you comfortable letting a small number of companies decide what that future looks like?</p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.options {
  margin: 48px 0;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.option {
  padding: 32px;
  border: 1px solid var(--line);
  border-radius: 12px;
}

.option--highlight {
  border-color: var(--signal-line);
  background: var(--signal-soft);
}

.option__tag {
  font-size: 12px;
  color: var(--ink-faint);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.option h3 {
  margin: 12px 0;
  font-size: 1.2rem;
}

.option__body p {
  color: var(--ink-dim);
  font-size: 14px;
}

.statement {
  font-family: var(--font-display);
  font-size: 1.4rem;
  font-weight: 600;
  color: var(--ink);
}

@media (max-width: 700px) {
  .options {
    grid-template-columns: 1fr;
  }
}
</style>
