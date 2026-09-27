<script setup>
import { ref, computed } from 'vue'
import WalletPicker from './WalletPicker.vue'
import { useWallet } from '../composables/useWallet.js'

const walletOpen = ref(false)

const {
  isConnected,
  address
} = useWallet()

const walletLabel = computed(() => {
  if (!isConnected.value) {
    return 'Connect'
  }

  if (!address.value) {
    return 'Connected'
  }

  return `${address.value.slice(0, 6)}...${address.value.slice(-4)}`
})
</script>

<template>
  <nav class="nav">
    <div class="nav__inner">

      <RouterLink
        to="/"
        class="nav__logo"
        aria-label="Neural Hive home"
      >
        <span class="logo-mark">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <polygon
              points="12,2 21,7 21,17 12,22 3,17 3,7"
              stroke="#3D8BFF"
              stroke-width="1.6"
            />
            <circle
              cx="12"
              cy="12"
              r="3"
              fill="#31e7c0"
            />
          </svg>
        </span>

        <span>Neural Hive - Internet of AI</span>
      </RouterLink>

      <div class="nav__links">
        <RouterLink
          to="/"
          class="nav__link"
          exact-active-class="nav__link--active"
        >
          Vision
        </RouterLink>

        <RouterLink
          to="/architecture"
          class="nav__link"
          active-class="nav__link--active"
        >
          Architecture
        </RouterLink>
      </div>

      <div class="nav__actions">
        <RouterLink
          to="/presale"
          class="btn btn-primary nav__cta"
        >
          Join presale
        </RouterLink>

        <button
          class="wallet-chip"
          :class="{ 'wallet-chip--connected': isConnected }"
          @click="walletOpen = true"
        >
          <span
            class="wallet-dot"
            :class="{ 'wallet-dot--connected': isConnected }"
          ></span>

          {{ walletLabel }}
        </button>
      </div>

    </div>
  </nav>

  <WalletPicker
    :open="walletOpen"
    @close="walletOpen = false"
  />
</template>

<style scoped>
.nav {
  position: fixed;
  inset: 0 0 auto;
  z-index: 100;
  backdrop-filter: blur(22px) saturate(150%);
  background: rgba(5, 6, 10, 0.68);
  border-bottom: 1px solid var(--line);
}

.nav__inner {
  width: 100%;
  min-height: 74px;
  display: flex;
  align-items: center;
  gap: 26px;
  padding: 0 24px;
}

.nav__logo {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  font-family: var(--font-display);
  font-weight: 700;
  letter-spacing: -0.03em;
}

.logo-mark {
  width: 31px;
  height: 31px;
  display: grid;
  place-items: center;
  border-radius: 9px;
  font-size: 10px;
  color: #07070b;
  box-shadow: 0 0 24px rgba(157, 124, 255, 0.3);
}

.logo-mark svg {
  width: 31px;
  height: 31px;
}

.nav__links {
  display: flex;
  gap: 22px;
  margin-left: auto;
}

.nav__link {
  color: var(--ink-dim);
  text-decoration: none;
  font-size: 13px;
  font-weight: 700;
  transition: color 0.2s;
}

.nav__link:hover,
.nav__link--active {
  color: var(--ink);
}

.nav__actions {
  display: flex;
  align-items: center;
  gap: 9px;
}

.nav__cta {
  padding: 10px 17px;
  font-size: 12px;
}

.wallet-chip {
  border: 1px solid var(--line-strong);
  background: rgba(255, 255, 255, 0.035);
  color: var(--ink);
  border-radius: 999px;
  padding: 9px 14px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s;
}

.wallet-chip:hover {
  background: rgba(255, 255, 255, 0.07);
}

.wallet-chip--connected {
  border-color: rgba(49, 231, 192, 0.35);
}

.wallet-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #777;
  margin-right: 6px;
}

.wallet-dot--connected {
  background: #31e7c0;
  box-shadow: 0 0 10px #31e7c0;
}

@media (max-width: 760px) {
  .nav__links {
    display: none;
  }

  .nav__inner {
    gap: 10px;
  }

  .nav__logo span:last-child {
    display: none;
  }

  .wallet-chip {
    display: none;
  }
}
</style>