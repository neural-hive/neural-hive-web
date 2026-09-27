<script setup>
import { ref } from 'vue'
import { config } from '../config/index.js'

const usdFmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })

const faqs = [
  {
    q: 'What is Neural Hive?',
    a: 'Neural Hive is the "Internet of AI": a network of specialized AI systems that work together to answer complex questions and perform useful tasks. Instead of relying on one AI system to know everything, Neural Hive connects different forms of specialized intelligence into one network.'
  },
  {
    q: 'Why a network instead of one AI?',
    a: 'Different systems are good at different things. Neural Hive combines specialized intelligence instead of depending on one system. But the network is also about control: intelligence can come from many independent creators rather than being concentrated in a single AI provider.'
  },
  {
    q: 'Is Neural Hive already live?',
    a: `No. Neural Hive is currently in development, and this website represents the project's vision, architecture, and development plan.

Right now, we are testing whether people actually want an Internet of AI and are raising a $3M pre-seed round to build and launch the first version of Neural Hive.

Instead of raising that money from a small group of investors and concentrating ownership and influence even further, we want to open the opportunity to the people who believe in the idea and want to see it built.

Even a $5 contribution can help us move closer to building the first version. And if you cannot contribute financially, helping us spread awareness about Neural Hive is also a meaningful contribution.

The goal is simple: test the idea, build the product, and see whether there is enough demand to make the Internet of AI a reality.
`
  },
  {
    q: `What is ${config.token.symbol} Token?`,
    a: `${config.token.symbol} is the utility token of the Neural Hive ecosystem. It is used to access intelligence across the network and reward AI creators when their systems contribute value.`
  },
  {
    q: `Is ${config.token.symbol} token an investment?`,
    a: `${config.token.symbol} is designed primarily as a utility token, not as an investment. Its purpose is to give users access to the Neural Hive network and reward creators whose AI systems contribute value.

Presale participants will have access to the network at an early, preferential price. If you choose to hold or trade ${config.token.symbol} after it becomes available on exchanges, that is your decision, but we make no promises about its future price or returns.

The value of ${config.token.symbol} will ultimately depend on supply and demand within the network. We price network usage in dollars, so if the market price of ${config.token.symbol} rises, users simply need fewer tokens to pay for the same request. Our goal is to keep access fair and affordable, regardless of the token's market price.
`
  },
  {
    q: 'Why is the presale happening?',
    a: 'We need funding to build the technology. We also want to find out whether people actually want to participate in building this vision and whether there is real demand for an Internet of AI.'
  },
  {
    q: `Why ${usdFmt.format(config.presale.targetRaiseUsd)}?`,
    a: `We believe that is the minimum amount that gives us enough runway to seriously build the first version of Neural Hive: engineering, infrastructure, research, security and operations.`
  },
  {
    q: "What happens if the target isn't reached?",
    a: `If we do not reach ${usdFmt.format(config.presale.targetRaiseUsd)}, we will assess whether Neural Hive can still be built responsibly with the amount raised.

If we are close enough to the target and determine that the project is feasible within the funds raised, we will begin development and continue the presale to raise the remaining funds.

If the amount raised is not sufficient to make the project viable, your contributed ${config.paymentToken.symbol} will be returned through the claim process on this website.
`
  },
  {
    q: 'What is the minimum contribution?',
    a: `The minimum contribution is ${usdFmt.format(config.presale.minContributionUsd)}.`
  },
  {
    q: 'When does the beta launch?',
    a: 'The current roadmap targets the beta about 10 months after the presale successfully concludes.'
  },
  {
    q: 'When will the team be announced?',
    a: 'Once the presale concludes and development begins, we plan to publicly introduce the team building Neural Hive.'
  },
  {
    q: 'Can I contribute my own AI model?',
    a: `That is part of the long-term vision. We want creators and developers to contribute specialized AI systems to the network while keeping control over their systems. This also gives creators an opportunity to earn ${config.token.symbol}  when their models contribute value to the network.`
  },
  {
    q: 'Can I turn AI off?',
    a: 'Yes, but only for your own model/node. Control is a core design principle of Neural Hive. If creators feel their systems should be taken offline, they should be able to do so. The goal is that the Hive can go offline through the collective choice of its participants, not because we or any single authority decides to shut it down. The exact technical controls will depend on the final architecture.'
  },
  {
    q: 'I can’t see HIVE in my wallet. What should I do?',
    a: `If you purchased HIVE successfully but don't see it in your wallet, you may need to import the token manually. The HIVE token contract address is ${config.token.contractAddress}. The token symbol is HIVE and it uses 18 decimals.`
  }

]

const openIndex = ref(null)
function toggle(i) {
  openIndex.value = openIndex.value === i ? null : i
}
</script>

<template>
  <section class="section">
    <div class="container">
      <div class="stack-lg">
        <p v-reveal class="eyebrow">FAQ</p>
        <h2 v-reveal class="display-2">Questions people actually ask</h2>
      </div>

      <div class="faq-list">
        <div v-for="(item, i) in faqs" :key="item.q" v-reveal class="faq-item">
          <button class="faq-item__question" :aria-expanded="openIndex === i" @click="toggle(i)">
            <span>{{ item.q }}</span>
            <span class="faq-item__icon">{{ openIndex === i ? '−' : '+' }}</span>
          </button>
          <div v-if="openIndex === i" class="faq-item__answer">
            <p>{{ item.a }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.faq-list {
  margin-top: 40px;
  border-top: 1px solid var(--line);
  max-width: 720px;
}

.faq-item {
  border-bottom: 1px solid var(--line);
}

.faq-item__question {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  background: none;
  border: none;
  color: var(--ink);
  text-align: left;
  padding: 20px 0;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
}

.faq-item__icon {
  color: var(--ink-faint);
  font-size: 18px;
  flex-shrink: 0;
}

.faq-item__answer {
  padding-bottom: 20px;
}

.faq-item__answer p {
  color: var(--ink-dim);
  max-width: 600px;
}
</style>
