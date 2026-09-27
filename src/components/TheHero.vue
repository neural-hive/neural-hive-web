<script setup>
import { ref, onMounted } from 'vue'
import NetworkCanvas from './NetworkCanvas.vue'
const showNetwork = ref(false)
onMounted(() => window.setTimeout(() => { showNetwork.value = true }, 500))
</script>

<template>
  <header class="hero">
    <div class="hero__noise"></div>
    <div class="hero__visual"><NetworkCanvas :mode="showNetwork ? 'network' : 'single'" :node-count="10" /></div>
    <div class="hero__orb hero__orb--one"></div><div class="hero__orb hero__orb--two"></div>

    <div class="container hero__content">
      <div class="hero__kicker"><span class="live-pulse"></span>Decentralized superintelligence network</div>
      <h1 class="display-1">The race to <span class="gradient-text">superintelligence</span> has already begun.</h1>
      <p class="hero__statement">
        OpenAI built <strong>ChatGPT & Codex.</strong>
        Anthropic built <strong>Claude.</strong>
        We’re building <strong>a Hive of intelligence.</strong>
        We call it <strong>The Hive Superintelligence.</strong>  
      </p>
      <p class="lede measure">Not one giant model pretending to know everything. A network of smaller specialist systems that challenge each other, combine their reasoning and become more capable together.</p>
      <div class="btn-row">
        <RouterLink to="/presale" class="btn btn-primary">Join the presale <span>↗</span></RouterLink>
        <RouterLink to="/architecture" class="btn btn-secondary">Enter the architecture</RouterLink>
      </div>
      <div class="hero__signal-row"><span>DECENTRALIZED</span><i></i><span>SPECIALIST AGENTS</span><i></i><span>COLLECTIVE REASONING</span></div>
    </div>
  </header>
</template>

<style scoped>
.hero{min-height:100vh;position:relative;display:flex;align-items:center;padding:150px 0 90px;overflow:hidden;border-bottom:1px solid var(--line)}
.hero__content{position:relative;z-index:2}.hero__kicker{display:inline-flex;align-items:center;gap:9px;color:#c2bed0;font-size:14px;letter-spacing:.16em;font-weight:900;margin-bottom:25px}.live-pulse{width:7px;height:7px;border-radius:50%;background:#35e9c5;box-shadow:0 0 0 0 rgba(53,233,197,.6);animation:ping 1.8s infinite}
.hero h1{max-width:980px}.hero__statement{font-family:var(--font-display);font-size:clamp(1.25rem,2.1vw,1.65rem);line-height:1.4;max-width:780px;margin:30px 0 14px;color:#ded9eb}.hero__statement strong{color:white}.hero__visual{position:absolute;inset:5% -8%;display:flex;align-items:center;justify-content:center;opacity:.82;pointer-events:none;mask-image:radial-gradient(ellipse 60% 58% at 62% 45%,black 20%,transparent 78%);}.hero__visual :deep(svg){max-width:1100px;filter:drop-shadow(0 0 30px rgba(141,104,255,.18))}
.hero__orb{position:absolute;border-radius:50%;filter:blur(1px);pointer-events:none}.hero__orb--one{width:520px;height:520px;right:-180px;top:16%;background:radial-gradient(circle,rgba(141,104,255,.16),transparent 65%);animation:float 9s ease-in-out infinite}.hero__orb--two{width:360px;height:360px;left:-160px;bottom:-100px;background:radial-gradient(circle,rgba(32,228,193,.08),transparent 66%);animation:float 12s ease-in-out infinite reverse}.hero__signal-row{display:flex;gap:12px;align-items:center;margin-top:65px;color:#68657a;font-size:12px;font-weight:900;letter-spacing:.15em}.hero__signal-row i{width:3px;height:3px;border-radius:50%;background:#8d68ff}
@keyframes ping{70%{box-shadow:0 0 0 8px transparent}100%{box-shadow:0 0 0 0 transparent}}@keyframes float{50%{transform:translate3d(0,-22px,0) scale(1.04)}}
@media(max-width:720px){.hero{padding-top:130px}.hero__visual{inset:10% -80%}.hero__signal-row{flex-wrap:wrap;margin-top:40px}}
</style>
