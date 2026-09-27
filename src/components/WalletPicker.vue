<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useWallet } from '../composables/useWallet.js'

const props = defineProps({ open: Boolean })
const emit = defineEmits(['close'])
const { connect, isConnected, shortAddress, providerName, disconnect, detectedWallets, refreshWallets, errorMessage, status } = useWallet()
const loading = ref('')

watch(() => props.open, (open) => { if (open) refreshWallets() })

const wallets = computed(() => detectedWallets.value)

async function choose(id) {
  console.log('CLICKED WALLET ID:', id)
  console.log('DETECTED WALLETS:', detectedWallets.value)

  const selected =
    detectedWallets.value.find(
      wallet => wallet.id === id
    )

  console.log('SELECTED WALLET:', selected)
  console.log('SELECTED PROVIDER:', selected?.provider)

  loading.value = id

  await connect(id)

  loading.value = ''

  if (isConnected.value) {
    emit('close')
  }
}
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="wallet-backdrop" @click.self="emit('close')">
      <div class="wallet-modal">
        <button class="wallet-close" @click="emit('close')">×</button>
        <p class="eyebrow">Wallet access</p>
        <h2 class="display-3">Enter the Hive.</h2>
        <p class="wallet-copy">Choose any detected browser wallet, or use WalletConnect to open the wallet ecosystem on mobile and desktop.</p>

        <div v-if="isConnected" class="connected-card">
          <span class="wallet-live"></span>
          <div><strong>{{ providerName || 'Wallet' }} connected</strong><small class="mono">{{ shortAddress }}</small></div>
          <button class="link-button" @click="disconnect">Disconnect</button>
        </div>

        <div v-else class="wallet-list">
          <button v-for="wallet in wallets" :key="wallet.id" class="wallet-option" @click="choose(wallet.id)" :disabled="!!loading">
            <span class="wallet-icon">{{ wallet.icon || '◈' }}</span>
            <span><strong>{{ wallet.name }}</strong><small>{{ wallet.detail }}</small></span>
            <span class="wallet-arrow">{{ loading === wallet.id ? '…' : '→' }}</span>
          </button>
          <button class="wallet-option wallet-option--wc" @click="choose('walletconnect')" :disabled="!!loading">
            <span class="wallet-icon">◉</span>
            <span><strong>WalletConnect</strong><small>Connect hundreds of compatible wallets</small></span>
            <span class="wallet-arrow">{{ loading === 'walletconnect' ? '…' : '→' }}</span>
          </button>
        </div>

        <p v-if="errorMessage" class="status status--error">{{ errorMessage }}</p>
        <p class="wallet-note">Your wallet stays in your control. Neural Hive never asks for a seed phrase or private key.</p>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.wallet-backdrop{position:fixed;inset:0;z-index:300;background:rgba(0,0,0,.72);backdrop-filter:blur(12px);display:grid;place-items:center;padding:20px}
.wallet-modal{position:relative;width:min(500px,100%);padding:34px;border:1px solid var(--line-strong);border-radius:24px;background:linear-gradient(145deg,rgba(18,19,29,.98),rgba(8,9,15,.98));box-shadow:0 30px 100px rgba(0,0,0,.55)}
.wallet-close{position:absolute;right:18px;top:14px;background:none;border:0;color:var(--ink-dim);font-size:28px;cursor:pointer}
.wallet-copy{color:var(--ink-dim);margin:10px 0 24px}
.wallet-list{display:grid;gap:9px}
.wallet-option{display:grid;grid-template-columns:40px 1fr auto;align-items:center;gap:13px;text-align:left;width:100%;padding:14px;border:1px solid var(--line);border-radius:14px;background:rgba(255,255,255,.025);color:var(--ink);cursor:pointer}
.wallet-option:hover{border-color:rgba(157,124,255,.6);background:rgba(157,124,255,.07);transform:translateY(-1px)}
.wallet-option:disabled{opacity:.65}
.wallet-option--wc{border-color:rgba(49,231,192,.22)}
.wallet-icon{width:36px;height:36px;border-radius:11px;display:grid;place-items:center;background:var(--signal-soft);font-weight:800}
.wallet-option small,.connected-card small{display:block;color:var(--ink-faint);margin-top:2px;font-size:11px}
.wallet-arrow{color:var(--ink-faint)}
.connected-card{display:flex;align-items:center;gap:12px;padding:15px;border:1px solid rgba(49,231,192,.3);border-radius:14px;background:rgba(49,231,192,.05)}
.wallet-live{width:9px;height:9px;border-radius:50%;background:#31e7c0;box-shadow:0 0 15px #31e7c0}
.connected-card>div{flex:1}
.wallet-note{font-size:11px;color:var(--ink-faint);margin-top:20px}
</style>
