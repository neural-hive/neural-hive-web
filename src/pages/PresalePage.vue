<script setup>
import PresaleIntro from '../components/PresaleIntro.vue'
import FundingTarget from '../components/FundingTarget.vue'
import TokenEconomics from '../components/TokenEconomics.vue'
import PresalePanel from '../components/PresalePanel.vue'
import UseOfFunds from '../components/UseOfFunds.vue'
</script>

<template>
            <PresalePanel />

  <!-- <div class="page-head"> -->
    <div class="container">
      <p class="eyebrow">Genesis access / 01</p>
      <h1 class="display-1">Fund the first <span class="gradient-text">superintelligence</span> network.</h1>
      <p class="lede measure">The presale is the entry point. The thesis is bigger than a token: a living network where specialist AI systems can reason together instead of intelligence staying inside one closed model.</p>
    </div>
  <!-- </div> -->


  <PresaleIntro />
  <FundingTarget />
  <TokenEconomics />

  <UseOfFunds />
</template>
