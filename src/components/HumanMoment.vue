<template>
  <section class="section quiet">
    <div class="container center measure stack-xl">

      <p v-reveal class="eyebrow">
        The choice
      </p>

      <h2 v-reveal class="display-2">
        We don't want a world without AI.
      </h2>

      <h2 v-reveal class="display-2 quiet__accent">
        We want a world where AI doesn't own us.
      </h2>

      <div v-reveal class="lede stack">
        <p>
          AI could become one of humanity's greatest tools.
          It could expand what we can learn, build, discover, and create.
        </p>

        <p>
          But the more powerful the tool becomes,
          the more important it is that its power doesn't belong to a few.
        </p>
      </div>

      <p v-reveal class="statement quiet__final">
        <span>AI should serve humanity.</span><br />
        <span class="quiet__accent">Not the other way around.</span>
      </p>

    </div>
  </section>
</template>

<style scoped>
.quiet {
  padding: 180px 0;
  background: #000;
}

.quiet__accent {
  color: var(--ink-dim);
}

.quiet__final {
  padding-top: 24px;
  font-size: 1.5rem;
  line-height: 1.35;
}
</style>