<script setup>
import {
  onMounted,
  onBeforeUnmount,
  ref,
  watch
} from 'vue'

const props = defineProps({
  nodeCount: {
    type: Number,
    default: 8
  }
})

const canvas = ref(null)

let ctx = null
let frame = null
let resizeObserver = null
let startTime = 0

const nodes = []

const TAU = Math.PI * 2

function random(min, max) {
  return Math.random() * (max - min) + min
}

function easeOutExpo(t) {
  return t === 1
    ? 1
    : 1 - Math.pow(2, -10 * t)
}

function createNodes(width, height) {
  nodes.length = 0

  const cx = width / 2
  const cy = height / 2

  const maxRadius =
    Math.min(width, height) * 0.62

  /*
   * Always create the complete network.
   * nodeCount only controls visibility.
   */
  const totalNodes = 8

  for (let i = 0; i < totalNodes; i++) {
    const angle =
      (i / totalNodes) * TAU -
      Math.PI / 2

    nodes.push({
      angle,

      distance: random(
        maxRadius * 0.82,
        maxRadius
      ),

      progress: random(0, 0.08),

      size: random(6, 9),

      wobble: random(0, TAU),

      wobbleSpeed: random(
        0.7,
        1.25
      ),

      phase: random(0, TAU),

      opacity:
        i < props.nodeCount
          ? 1
          : 0,

      targetOpacity:
        i < props.nodeCount
          ? 1
          : 0
    })
  }
}

function updateNodeTargets() {
  nodes.forEach((node, index) => {
    node.targetOpacity =
      index < props.nodeCount
        ? 1
        : 0
  })
}

function resizeCanvas() {
  if (!canvas.value) return

  const rect =
    canvas.value.getBoundingClientRect()

  const dpr =
    Math.min(
      window.devicePixelRatio || 1,
      2
    )

  canvas.value.width =
    rect.width * dpr

  canvas.value.height =
    rect.height * dpr

  ctx =
    canvas.value.getContext('2d')

  ctx.setTransform(
    dpr,
    0,
    0,
    dpr,
    0,
    0
  )

  createNodes(
    rect.width,
    rect.height
  )
}

function glow(
  x,
  y,
  radius,
  color,
  alpha
) {
  const gradient =
    ctx.createRadialGradient(
      x,
      y,
      0,
      x,
      y,
      radius
    )

  gradient.addColorStop(
    0,
    `${color}${alpha})`
  )

  gradient.addColorStop(
    0.35,
    `${color}${alpha * 0.35})`
  )

  gradient.addColorStop(
    1,
    `${color}0)`
  )

  ctx.fillStyle = gradient

  ctx.beginPath()

  ctx.arc(
    x,
    y,
    radius,
    0,
    TAU
  )

  ctx.fill()
}

function draw(time) {
  if (!canvas.value || !ctx) {
    frame =
      requestAnimationFrame(draw)

    return
  }

  const width =
    canvas.value.clientWidth

  const height =
    canvas.value.clientHeight

  const cx = width / 2
  const cy = height / 2

  const cycleLength = 5200

  const elapsed =
    time - startTime

  if (elapsed >= cycleLength) {
    startTime = time
  }

  const cycle =
    (time - startTime) /
    cycleLength

  ctx.clearRect(
    0,
    0,
    width,
    height
  )

  /*
   * -------------------------
   * ATMOSPHERE
   * -------------------------
   */

  const atmosphere =
    ctx.createRadialGradient(
      cx,
      cy,
      0,
      cx,
      cy,
      Math.min(width, height) * 0.72
    )

  atmosphere.addColorStop(
    0,
    'rgba(30, 90, 160, 0.16)'
  )

  atmosphere.addColorStop(
    0.42,
    'rgba(15, 50, 100, 0.055)'
  )

  atmosphere.addColorStop(
    1,
    'rgba(0, 0, 0, 0)'
  )

  ctx.fillStyle =
    atmosphere

  ctx.fillRect(
    0,
    0,
    width,
    height
  )

  /*
   * -------------------------
   * SHOCKWAVE
   * -------------------------
   */

  if (cycle < 0.48) {
    const shockProgress =
      Math.min(
        cycle / 0.48,
        1
      )

    const eased =
      easeOutExpo(
        shockProgress
      )

    const radius =
      30 +
      eased *
        Math.min(width, height) *
        0.62

    const alpha =
      (1 - eased) * 0.4

    ctx.beginPath()

    ctx.arc(
      cx,
      cy,
      radius,
      0,
      TAU
    )

    ctx.strokeStyle =
      `rgba(77, 163, 255, ${alpha})`

    ctx.lineWidth = 2

    ctx.stroke()
  }

  /*
   * -------------------------
   * SIDE NODES
   * -------------------------
   */

  nodes.forEach(
    (node, index) => {

      /*
       * Smooth node removal/addition.
       */
      node.opacity +=
        (
          node.targetOpacity -
          node.opacity
        ) * 0.075

      if (node.opacity < 0.01) {
        return
      }

      /*
       * Initial expansion.
       */
      const delay =
        index * 0.035

      let progress =
        cycle - delay

      progress =
        Math.max(
          0,
          Math.min(
            1,
            progress / 0.68
          )
        )

      const eased =
        easeOutExpo(progress)

      const distance =
        24 +
        node.distance *
          eased

      const floating =
        progress >= 1
          ? Math.sin(
              time *
                0.001 *
                node.wobbleSpeed +
                node.wobble
            ) * 7
          : 0

      const x =
        cx +
        Math.cos(node.angle) *
          distance

      const y =
        cy +
        Math.sin(node.angle) *
          distance +
        floating

      /*
       * -------------------------
       * CONNECTION
       * -------------------------
       */

      const lineGradient =
        ctx.createLinearGradient(
          cx,
          cy,
          x,
          y
        )

      lineGradient.addColorStop(
        0,
        `rgba(255, 210, 235, ${0.72 * node.opacity})`
      )

      lineGradient.addColorStop(
        0.16,
        `rgba(100, 170, 255, ${0.55 * node.opacity})`
      )

      lineGradient.addColorStop(
        1,
        `rgba(77, 163, 255, ${0.08 * node.opacity})`
      )

      ctx.beginPath()

      ctx.moveTo(
        cx,
        cy
      )

      ctx.lineTo(
        x,
        y
      )

      ctx.strokeStyle =
        lineGradient

      ctx.lineWidth =
        progress < 1
          ? 1.7
          : 1.1

      ctx.stroke()

      /*
       * -------------------------
       * TRAVELLING SIGNAL
       * -------------------------
       */

      if (
        progress > 0 &&
        progress < 1
      ) {
        const signalProgress =
          Math.min(
            1,
            progress * 1.25
          )

        const sx =
          cx +
          (x - cx) *
            signalProgress

        const sy =
          cy +
          (y - cy) *
            signalProgress

        const trailGradient =
          ctx.createLinearGradient(
            cx,
            cy,
            sx,
            sy
          )

        trailGradient.addColorStop(
          0,
          'rgba(77, 163, 255, 0)'
        )

        trailGradient.addColorStop(
          0.90,
          'rgba(77, 163, 255, 0)'
        )

        trailGradient.addColorStop(
          1,
          `rgba(255, 255, 255, ${0.95 * node.opacity})`
        )

        ctx.beginPath()

        ctx.moveTo(
          cx,
          cy
        )

        ctx.lineTo(
          sx,
          sy
        )

        ctx.strokeStyle =
          trailGradient

        ctx.lineWidth = 2.5

        ctx.stroke()

        glow(
          sx,
          sy,
          30,
          'rgba(77, 163, 255, ',
          0.34 * node.opacity
        )

        ctx.beginPath()

        ctx.arc(
          sx,
          sy,
          3.2,
          0,
          TAU
        )

        ctx.fillStyle =
          `rgba(255, 255, 255, ${node.opacity})`

        ctx.fill()
      }

      /*
       * -------------------------
       * NODE
       * -------------------------
       */

      const pulse =
        1 +
        Math.sin(
          time * 0.003 +
          node.phase
        ) *
          0.16

      glow(
        x,
        y,
        node.size * 7 * pulse,
        'rgba(77, 163, 255, ',
        (
          progress >= 1
            ? 0.5
            : 0.28
        ) * node.opacity
      )

      if (progress >= 0.96) {
        ctx.beginPath()

        ctx.arc(
          x,
          y,
          node.size *
            2.5 *
            pulse,
          0,
          TAU
        )

        ctx.strokeStyle =
          `rgba(77, 163, 255, ${0.22 * node.opacity})`

        ctx.lineWidth = 1

        ctx.stroke()
      }

      ctx.beginPath()

      ctx.arc(
        x,
        y,
        node.size *
          pulse,
        0,
        TAU
      )

      ctx.fillStyle =
        `rgba(72, 167, 255, ${node.opacity})`

      ctx.fill()

      ctx.beginPath()

      ctx.arc(
        x,
        y,
        node.size *
          0.34,
        0,
        TAU
      )

      ctx.fillStyle =
        `rgba(255, 255, 255, ${node.opacity})`

      ctx.fill()
    }
  )

  /*
   * -------------------------
   * CENTRAL HIVE
   * -------------------------
   */

  const corePulse =
    1 +
    Math.sin(
      time * 0.004
    ) *
      0.09

  glow(
    cx,
    cy,
    190 * corePulse,
    'rgba(255, 105, 180, ',
    0.16
  )

  glow(
    cx,
    cy,
    110 * corePulse,
    'rgba(255, 145, 205, ',
    0.24
  )

  glow(
    cx,
    cy,
    65 * corePulse,
    'rgba(255, 210, 235, ',
    0.42
  )

  /*
   * Outer core ring.
   */

  ctx.beginPath()

  ctx.arc(
    cx,
    cy,
    34 * corePulse,
    0,
    TAU
  )

  ctx.strokeStyle =
    'rgba(255, 170, 220, 0.48)'

  ctx.lineWidth = 1.2

  ctx.stroke()

  /*
   * Inner core ring.
   */

  ctx.beginPath()

  ctx.arc(
    cx,
    cy,
    23 * corePulse,
    0,
    TAU
  )

  ctx.strokeStyle =
    'rgba(255, 220, 240, 0.45)'

  ctx.lineWidth = 1

  ctx.stroke()

  /*
   * Core.
   */

  const core =
    ctx.createRadialGradient(
      cx - 5,
      cy - 5,
      1,
      cx,
      cy,
      21
    )

  core.addColorStop(
    0,
    '#ffffff'
  )

  core.addColorStop(
    0.22,
    '#fff5fb'
  )

  core.addColorStop(
    0.48,
    '#ffd4eb'
  )

  core.addColorStop(
    0.72,
    '#f58ac5'
  )

  core.addColorStop(
    1,
    '#b84f91'
  )

  ctx.beginPath()

  ctx.arc(
    cx,
    cy,
    17 * corePulse,
    0,
    TAU
  )

  ctx.fillStyle =
    core

  ctx.fill()

  /*
   * White center.
   */

  ctx.beginPath()

  ctx.arc(
    cx,
    cy,
    5.5,
    0,
    TAU
  )

  ctx.fillStyle =
    '#ffffff'

  ctx.shadowBlur = 18

  ctx.shadowColor =
    'rgba(255, 220, 240, 0.95)'

  ctx.fill()

  ctx.shadowBlur = 0

  frame =
    requestAnimationFrame(draw)
}

function startAnimation() {
  resizeCanvas()

  startTime =
    performance.now()

  frame =
    requestAnimationFrame(draw)
}

watch(
  () => props.nodeCount,
  () => {
    updateNodeTargets()
  }
)

onMounted(() => {
  startAnimation()

  resizeObserver =
    new ResizeObserver(() => {
      resizeCanvas()
    })

  if (canvas.value) {
    resizeObserver.observe(
      canvas.value
    )
  }
})

onBeforeUnmount(() => {
  if (frame) {
    cancelAnimationFrame(frame)
  }

  if (resizeObserver) {
    resizeObserver.disconnect()
  }
})
</script>

<template>
  <div class="limited-network-canvas">
    <canvas
      ref="canvas"
      class="limited-network-canvas__canvas"
      aria-hidden="true"
    />
  </div>
</template>

<style scoped>
.limited-network-canvas {
  position: relative;
  width: 100%;
  height: 900px;
  overflow: hidden;

  background:
    radial-gradient(
      circle at center,
      rgba(18, 48, 82, 0.14),
      transparent 72%
    );

  isolation: isolate;
}

.limited-network-canvas__canvas {
  position: absolute;
  inset: 0;

  display: block;

  width: 100%;
  height: 100%;
}

@media (min-width: 1400px) {
  .limited-network-canvas {
    height: 1000px;
  }
}

@media (max-width: 1200px) {
  .limited-network-canvas {
    height: 800px;
  }
}

@media (max-width: 900px) {
  .limited-network-canvas {
    height: 650px;
  }
}

@media (max-width: 600px) {
  .limited-network-canvas {
    height: 520px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .limited-network-canvas__canvas {
    opacity: 0.8;
  }
}
</style>