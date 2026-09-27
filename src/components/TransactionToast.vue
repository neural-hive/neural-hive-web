<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },

  status: {
    type: String,
    default: 'success'
  },

  amount: {
    type: [Number, String],
    default: 0
  },

  paymentType: {
    type: String,
    default: 'USDT'
  },

  wallet: {
    type: String,
    default: ''
  },

  txHash: {
    type: String,
    default: ''
  },

  explorerUrl: {
    type: String,
    default: ''
  },

  duration: {
    type: Number,
    default: 6000
  }
})

const emit = defineEmits(['close'])

const progress = ref(100)
let timer = null
let progressTimer = null

const isSuccess = computed(() => {
  return props.status === 'success'
})

const title = computed(() => {
  if (props.status === 'error') {
    return 'TRANSACTION FAILED'
  }

  if (props.status === 'pending') {
    return 'TRANSACTION PENDING'
  }

  return 'HIVE ACQUIRED'
})

const shortWallet = computed(() => {
  if (!props.wallet) return ''

  if (props.wallet.length < 12) {
    return props.wallet
  }

  return (
    props.wallet.slice(0, 6) +
    '…' +
    props.wallet.slice(-4)
  )
})

function close() {
  clearTimers()
  emit('close')
}

function clearTimers() {
  if (timer) {
    clearTimeout(timer)
    timer = null
  }

  if (progressTimer) {
    clearInterval(progressTimer)
    progressTimer = null
  }
}

function startTimer() {
  clearTimers()

  if (!props.show || props.duration <= 0) {
    return
  }

  progress.value = 100

  const started = Date.now()

  progressTimer = setInterval(() => {
    const elapsed = Date.now() - started
    const remaining =
      1 - elapsed / props.duration

    progress.value =
      Math.max(0, remaining * 100)

    if (remaining <= 0) {
      clearTimers()
    }
  }, 50)

  timer = setTimeout(() => {
    emit('close')
    clearTimers()
  }, props.duration)
}

watch(
  () => props.show,
  value => {
    if (value) {
      startTimer()
    } else {
      clearTimers()
    }
  },
  { immediate: true }
)

onBeforeUnmount(() => {
  clearTimers()
})
</script>

<template>
  <Transition name="hive-toast">
    <div
      v-if="show"
      class="hive-toast"
      :class="{
        'hive-toast--success': status === 'success',
        'hive-toast--error': status === 'error',
        'hive-toast--pending': status === 'pending'
      }"
    >
      <div class="hive-toast__glow"></div>

      <div class="hive-toast__header">
        <div class="hive-toast__icon">
          <span v-if="isSuccess">✓</span>
          <span v-else-if="status === 'pending'">◌</span>
          <span v-else>!</span>
        </div>

        <div class="hive-toast__title">
          {{ title }}
        </div>

        <button
          class="hive-toast__close"
          type="button"
          @click="close"
        >
          ×
        </button>
      </div>

      <div class="hive-toast__content">
        <div class="hive-toast__amount">
          {{ Number(amount).toLocaleString() }}
          <span>HIVE</span>
        </div>

        <div class="hive-toast__payment">
          Purchased with
          <strong>{{ paymentType }}</strong>
        </div>
      </div>

      <div
        v-if="wallet"
        class="hive-toast__wallet"
      >
        <span class="hive-toast__wallet-dot"></span>

        <span>{{ shortWallet }}</span>

        <span
          v-if="isSuccess"
          class="hive-toast__confirmed"
        >
          CONFIRMED
        </span>
      </div>

      <a
        v-if="txHash && explorerUrl"
        class="hive-toast__tx"
        :href="`${explorerUrl}/tx/${txHash}`"
        target="_blank"
        rel="noopener noreferrer"
      >
        VIEW ON-CHAIN
        <span>↗</span>
      </a>

      <div class="hive-toast__progress">
        <div
          class="hive-toast__progress-bar"
          :style="{ width: `${progress}%` }"
        ></div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.hive-toast {
  position: fixed;
  top: 92px;
  right: 24px;
  z-index: 9999;

  width: min(390px, calc(100vw - 32px));

  padding: 18px;

  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 18px;

  background:
    linear-gradient(
      145deg,
      rgba(20, 24, 35, 0.96),
      rgba(8, 10, 16, 0.96)
    );

  backdrop-filter: blur(24px);

  box-shadow:
    0 24px 70px rgba(0, 0, 0, 0.55),
    0 0 45px rgba(49, 231, 192, 0.08);

  overflow: hidden;
}

.hive-toast__glow {
  position: absolute;
  top: -90px;
  right: -70px;

  width: 180px;
  height: 180px;

  border-radius: 50%;

  background: rgba(49, 231, 192, 0.12);

  filter: blur(35px);

  pointer-events: none;
}

.hive-toast--error .hive-toast__glow {
  background: rgba(255, 70, 100, 0.12);
}

.hive-toast--pending .hive-toast__glow {
  background: rgba(157, 124, 255, 0.14);
}

.hive-toast__header {
  position: relative;

  display: flex;
  align-items: center;

  gap: 10px;
}

.hive-toast__icon {
  width: 28px;
  height: 28px;

  display: grid;
  place-items: center;

  border-radius: 9px;

  background: rgba(49, 231, 192, 0.12);

  color: #31e7c0;

  font-weight: 900;
}

.hive-toast--error .hive-toast__icon {
  background: rgba(255, 70, 100, 0.12);
  color: #ff4664;
}

.hive-toast--pending .hive-toast__icon {
  background: rgba(157, 124, 255, 0.12);
  color: #9d7cff;
}

.hive-toast__title {
  font-size: 11px;
  font-weight: 900;

  letter-spacing: 0.14em;
}

.hive-toast__close {
  margin-left: auto;

  width: 26px;
  height: 26px;

  border: 0;
  background: transparent;

  color: rgba(255, 255, 255, 0.45);

  font-size: 22px;
  line-height: 1;

  cursor: pointer;
}

.hive-toast__close:hover {
  color: white;
}

.hive-toast__content {
  position: relative;

  margin-top: 16px;
}

.hive-toast__amount {
  font-size: 25px;
  font-weight: 900;
  letter-spacing: -0.04em;
}

.hive-toast__amount span {
  margin-left: 5px;

  font-size: 12px;
  font-weight: 800;

  color: #31e7c0;

  letter-spacing: 0.08em;
}

.hive-toast__payment {
  margin-top: 4px;

  color: rgba(255, 255, 255, 0.48);

  font-size: 12px;
}

.hive-toast__payment strong {
  color: rgba(255, 255, 255, 0.82);
}

.hive-toast__wallet {
  display: flex;
  align-items: center;

  gap: 8px;

  margin-top: 15px;
  padding-top: 13px;

  border-top: 1px solid rgba(255, 255, 255, 0.08);

  font-family: monospace;
  font-size: 11px;

  color: rgba(255, 255, 255, 0.58);
}

.hive-toast__wallet-dot {
  width: 6px;
  height: 6px;

  border-radius: 50%;

  background: #31e7c0;

  box-shadow: 0 0 10px #31e7c0;
}

.hive-toast__confirmed {
  margin-left: auto;

  color: #31e7c0;

  font-family: inherit;
  font-size: 9px;
  font-weight: 900;

  letter-spacing: 0.12em;
}

.hive-toast__tx {
  display: inline-flex;
  align-items: center;

  gap: 5px;

  margin-top: 13px;

  color: #9d7cff;

  font-size: 10px;
  font-weight: 900;

  letter-spacing: 0.1em;

  text-decoration: none;
}

.hive-toast__tx:hover {
  color: white;
}

.hive-toast__progress {
  position: absolute;
  bottom: 0;
  left: 0;

  width: 100%;
  height: 2px;

  background: rgba(255, 255, 255, 0.05);
}

.hive-toast__progress-bar {
  height: 100%;

  background: #31e7c0;

  transition: width 0.05s linear;
}

.hive-toast--error .hive-toast__progress-bar {
  background: #ff4664;
}

.hive-toast--pending .hive-toast__progress-bar {
  background: #9d7cff;
}

.hive-toast-enter-active,
.hive-toast-leave-active {
  transition:
    opacity 0.35s ease,
    transform 0.35s cubic-bezier(0.22, 1, 0.36, 1);
}

.hive-toast-enter-from,
.hive-toast-leave-to {
  opacity: 0;
  transform: translateX(35px) scale(0.96);
}

@media (max-width: 600px) {
  .hive-toast {
    top: auto;
    right: 16px;
    bottom: 16px;
  }
}
</style>