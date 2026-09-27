<script setup>
import { ref, computed } from 'vue'
const specialists = [
  ['Research','Evidence + discovery'],['Mathematics','Formal reasoning'],['Programming','Systems + code'],
  ['Finance','Markets + risk'],['Science','Scientific reasoning'],['Legal','Rules + regulation'],
  ['Data','Patterns + signal'],['Creative','Language + ideas'],['Custom','Your own agent']
]
const active = ref(null)
const nodes = computed(() => specialists.map((s,i) => {
  const a=(i/specialists.length)*Math.PI*2-Math.PI/2
  return {name:s[0],desc:s[1],x:50+Math.cos(a)*37,y:50+Math.sin(a)*37,delay:`${i*.12}s`}
}))
</script>
<template>
<section class="section architecture">
<div class="container">
  <div class="stack-lg"><p v-reveal class="eyebrow">The Hive architecture</p><h2 v-reveal class="display-2">One coordinator. Many specialists. <span class="gradient-text">One moving system.</span></h2></div>
  <div v-reveal class="hive-stage">
    <div class="orbit orbit-a"></div><div class="orbit orbit-b"></div>
    <div v-for="n in nodes" :key="n.name" class="hive-node" :style="{left:n.x+'%',top:n.y+'%',animationDelay:n.delay}" @mouseenter="active=n" @mouseleave="active=null">
      <span class="node-dot"></span><span>{{n.name}}</span>
    </div>
    <svg class="hive-lines" viewBox="0 0 100 100" preserveAspectRatio="none">
      <line v-for="n in nodes" :key="n.name" x1="50" y1="50" :x2="n.x" :y2="n.y" />
    </svg>
    <div class="hive-core"><span class="core-ring"></span><strong>THE HUB</strong><small>COLLECTIVE INTELLIGENCE</small></div>
    <div class="hive-detail"><strong>{{active?.name || 'SPECIALIST NETWORK'}}</strong><span>{{active?.desc || 'Move across the system. Every node has a job.'}}</span></div>
    <div class="data-pulse pulse-1"></div><div class="data-pulse pulse-2"></div><div class="data-pulse pulse-3"></div>
  </div>
  <div class="specialist-list"><div v-for="s in specialists" :key="s[0]"><h4>{{s[0]}}</h4><p>{{s[1]}}</p></div></div>
</div>
</section>
</template>
<style scoped>
.hive-stage{position:relative;width:min(780px,100%);aspect-ratio:1/1;margin:65px auto 20px;border-radius:50%;background:radial-gradient(circle,rgba(141,104,255,.08),transparent 50%);overflow:visible}
.hive-lines{position:absolute;inset:0;width:100%;height:100%;overflow:visible}.hive-lines line{stroke:rgba(141,104,255,.22);stroke-width:.16;stroke-dasharray:1 1.4;animation:flow 5s linear infinite}
.orbit{position:absolute;inset:14%;border:1px solid rgba(141,104,255,.12);border-radius:50%;animation:spin 22s linear infinite}.orbit-b{inset:25%;border-color:rgba(32,228,193,.1);animation-duration:15s;animation-direction:reverse}
.hive-node{position:absolute;transform:translate(-50%,-50%);display:flex;align-items:center;gap:7px;padding:7px 11px;border:1px solid var(--line);border-radius:999px;background:rgba(7,7,13,.82);backdrop-filter:blur(10px);color:#aaa6b8;font-size:11px;font-weight:800;z-index:2;animation:breathe 3.8s ease-in-out infinite;cursor:crosshair;transition:.2s}.hive-node:hover{color:#fff;border-color:rgba(141,104,255,.65);box-shadow:0 0 28px rgba(141,104,255,.2);transform:translate(-50%,-50%) scale(1.08)}
.node-dot{width:5px;height:5px;border-radius:50%;background:#8d68ff;box-shadow:0 0 10px #8d68ff}
.hive-core{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:150px;height:150px;border-radius:50%;display:grid;place-content:center;text-align:center;background:radial-gradient(circle at 40% 35%,#241a42,#0a0911 70%);border:1px solid rgba(141,104,255,.55);box-shadow:0 0 70px rgba(141,104,255,.22),inset 0 0 35px rgba(32,228,193,.08);z-index:3}.hive-core strong{font-family:var(--font-display);font-size:18px;line-height:.95;letter-spacing:.08em}.hive-core small{font-size:7px;letter-spacing:.14em;color:#777285;margin-top:7px}.core-ring{position:absolute;inset:-10px;border:1px solid rgba(32,228,193,.2);border-radius:50%;animation:spin 7s linear infinite}
.hive-detail{position:absolute;left:50%;bottom:-35px;transform:translateX(-50%);text-align:center;display:flex;flex-direction:column;gap:2px;color:#888397;font-size:11px}.hive-detail strong{color:#ddd8e8;font-size:10px;letter-spacing:.12em}.data-pulse{position:absolute;width:6px;height:6px;border-radius:50%;background:#31e7c0;box-shadow:0 0 15px #31e7c0;offset-path:path("M 390 390 L 700 390");animation:travel 4s linear infinite;z-index:4}.pulse-2{animation-delay:1.3s}.pulse-3{animation-delay:2.6s}
.specialist-list{display:none}
@keyframes spin{to{transform:rotate(360deg)}}@keyframes flow{to{stroke-dashoffset:-20}}@keyframes breathe{50%{transform:translate(-50%,-50%) translateY(-4px)}}@keyframes travel{from{left:50%;top:50%}to{left:87%;top:50%}}
@media(max-width:780px){.hive-stage{aspect-ratio:1/1;margin-top:40px}.hive-node{font-size:9px;padding:6px 8px}.hive-node:nth-of-type(n+7){display:none}.hive-core{width:120px;height:120px}.specialist-list{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:70px}.specialist-list h4{font-size:13px}.specialist-list p{font-size:11px;color:var(--ink-faint)}}
</style>
