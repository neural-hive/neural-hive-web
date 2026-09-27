<script setup>
</script>

<template>
  <section class="section revolution">
    <div class="container center measure stack-lg">

      <p v-reveal class="eyebrow">This is our bet</p>

      <h2 v-reveal class="display-2">
        Intelligence should not belong to a few.
      </h2>

      <div v-reveal class="lede stack">
        <p>
          We believe intelligence will become one of the most valuable
          resources in the world.
        </p>

        <p>
          And when it does, access to it should become broader,
          not narrower.
        </p>

        <p>
          The people building with AI should have a place in its future.
          The public should not have to wait for a handful of companies
          to decide what that future looks like.
        </p>
      </div>

      <div v-reveal class="cascade">
        <span>Don't wait for permission.</span>
        <span>Build.</span>
        <span>Participate.</span>
        <span>Control.</span>
      </div>

      <RouterLink
        v-reveal
        class="btn btn-primary"
        to="/presale"
      >
        Join the Hive
      </RouterLink>

    </div>
  </section>
</template>

<style scoped>
.revolution {
  padding: 180px 0;
  background: #000;
}

.cascade {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-family: var(--font-display);
  font-size: clamp(1.4rem, 3vw, 2rem);
  font-weight: 600;
}

.cascade span:last-child {
  color: #5CE1E6;
}
</style>