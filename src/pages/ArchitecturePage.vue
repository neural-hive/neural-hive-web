<script setup>
import HiveArchitecture from '../components/HiveArchitecture.vue'
import HowItWorks from '../components/HowItWorks.vue'
import ControlSwitch from '../components/ControlSwitch.vue'
</script>

<template>
  <div class="page-head page-head--compact">
    <div class="container">
      <p class="eyebrow">The Internet of AI</p>
      <h1 class="display-1">Not one model. <span class="gradient-text">A living Hive.</span></h1>
      <p class="lede measure">Different specialized AI systems work together to solve different parts of a problem, combining their intelligence to produce a useful result.</p>
    </div>
  </div>
  <HiveArchitecture />
  <HowItWorks />
  <ControlSwitch />
</template>
