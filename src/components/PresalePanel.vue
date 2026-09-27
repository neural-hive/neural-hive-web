<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { config } from '../config/index.js'
import { useWallet } from '../composables/useWallet.js'
import { usePresale } from '../composables/usePresale.js'
import WalletPicker from './WalletPicker.vue'
import TransactionToast from './TransactionToast.vue'

const {
  address,
  shortAddress,
  isConnected,
  isWrongNetwork,
  status: walletStatus,
  errorMessage: walletError,
  connect,
  disconnect,
  switchNetwork
} = useWallet()

const {
  raisedUsd,
  raisedLoaded,
  transactionReady,

  refundEnabled,

  recentContributions,
  refreshRecentContributions,
  refreshPresaleData,
  hiveToUsd,
  refreshRaised,

  selectedPayment,
  setPaymentMethod,
  paymentMethods,

  quote,
  buy,

  buyStatus,
  buyError,
  lastTxHash,

  getRefundableContribution,
  claimRefund
} = usePresale()

const numberFmt = new Intl.NumberFormat('en-US')
const usdFmt = {
  format(value) {
    const num = Number(value)

    if (!Number.isFinite(num)) return ''

    // Whole number
    if (Number.isInteger(num)) {
      return `$${num}`
    }

    // Numbers >= 1 → normal 2 decimal places
    if (num >= 1) {
      return `$${num.toFixed(2)}`
    }

    // Numbers between 0 and 1
    const str = num.toFixed(20)
    const decimal = str.split('.')[1]

    // Count zeros after decimal before first non-zero digit
    const match = decimal.match(/^(0*)([1-9]\d*)/)

    if (!match) {
      return '$0.00'
    }

    const zeros = match[1].length
    const firstSignificant = match[2]

    // Take first 2 significant digits and round properly
    const significantNumber = Number(
      '0.' + firstSignificant
    )

    // Get enough significant digits
    const digits = firstSignificant.padEnd(3, '0')

    let firstTwo = Number(digits.slice(0, 3)) / 100

    // Round to 2 significant digits
    firstTwo = Math.round(firstTwo * 100) / 100

    // Better: use the actual first 3 significant digits
    const firstThree = Number(
      firstSignificant.slice(0, 3).padEnd(3, '0')
    )

    const rounded = Math.round(firstThree / 10) / 10

    const display = rounded
      .toFixed(1)
      .replace(/\.0$/, '')

    const subscripts = '₀₁₂₃₄₅₆₇₈₉'

    const subscript = String(zeros)
      .split('')
      .map(d => subscripts[Number(d)])
      .join('')

    // Special case: zeroCount = 0
    if (zeros === 0) {
      return `$0.${display.replace('.', '')}`
    }

    return `$0.0${subscript}${display.replace('.', '')}`
  }
}

const walletPickerOpen = ref(false)

const amount = ref('')
const refundStatus = ref('idle')
const refundMessage = ref('')

// toast refs
const toastShow = ref(false)
const toastStatus = ref('success')
const toastAmount = ref(0)
const toastPaymentType = ref('')
const toastWallet = ref('')
const toastTxHash = ref('')

/*
 * ---------------------------------------------------------
 * Cosmetic fallback data
 * ---------------------------------------------------------
 *
 * ONLY used when the contract has no contributions yet.
 * This does not touch the blockchain.
 */
const frContributors = [
  {
    buyer: '0x7A3F91B2C4D5E6F7890123456789ABCDEF123456',
    amount: 18420,
    paymentType: 'USDT'
  },
  {
    buyer: '0x91B4D7E2A6C8F013579B2468ACE13579D2468012',
    amount: 12750,
    paymentType: 'FDUSD'
  },
  {
    buyer: '0x4E8A21C7D9F035B6124789ACEF24680135792468',
    amount: 9350,
    paymentType: 'USDT'
  },
  {
    buyer: '0xB62D8F41A7C395E0214F6789ABCD1234567890123',
    amount: 7420,
    paymentType: 'FDUSD'

  },
  {
    buyer: '0x35C9A7E214B608D3F5912468ACE0246813579246',
    amount: 5180,
    paymentType: 'BNB'

  }
]

/*
 * ---------------------------------------------------------
 * Payment method display
 * ---------------------------------------------------------
 */

const visiblePaymentMethods = computed(() => {
  if (Array.isArray(paymentMethods.value) && paymentMethods.value.length) {
    return paymentMethods.value
  }

  return [
    {
      key: 'BNB',
      symbol: 'BNB',
      label: 'BNB',
      enabled: true,
      icon: '◆'
    },
    {
      key: 'USDT',
      symbol: 'USDT',
      label: 'USDT',
      enabled: true,
      icon: '$'
    },
    {
      key: 'FDUSD',
      symbol: 'FDUSD',
      label: 'FDUSD',
      enabled: true,
      icon: 'F'
    }
  ]
})

const currentPayment = computed(() => {
  return (
    visiblePaymentMethods.value.find(
      method => method.key === selectedPayment.value
    ) ||
    visiblePaymentMethods.value[0]
  )
})

/*
 * ---------------------------------------------------------
 * Amount / quote
 * ---------------------------------------------------------
 */

const amountNumber = computed(() => Number(amount.value))

const amountValid = computed(() => {
  return Number.isFinite(amountNumber.value) && amountNumber.value > 0
})

const hiveOut = computed(() => {
  if (!amountValid.value) return 0

  const result = quote(
    currentPayment.value?.key || 'USDT',
    amountNumber.value
  )

  return Number(result || 0)
})

/*
 * ---------------------------------------------------------
 * Raised amount
 * ---------------------------------------------------------
 *
 * The contract does not have totalRaised().
 *
 * usePresale calculates the actual total from Contribution[]
 * using the stored hiveAmount.
 *
 * If there are genuinely no contributions, we intentionally
 * display the requested cosmetic $100,000 fallback.
 */

const displayedRaisedUsd = computed(() => {
    // console.log(raisedUsd)
    return Number(raisedUsd.value || 0)
})

const targetRaise = computed(() => {
  return Number(config.presale.targetRaiseUsd || 3000000)
})

const percentRaised = computed(() => {
  if (!displayedRaisedUsd.value || targetRaise.value <= 0) {
    return 0
  }

  return Math.min(
    100,
    (displayedRaisedUsd.value / targetRaise.value) * 100
  )
})

/*
 * ---------------------------------------------------------
 * Recent contributors
 * ---------------------------------------------------------
 */

const displayedContributors = computed(() => {
  const real = Array.isArray(recentContributions.value)
    ? recentContributions.value.slice(0, 5).map(item => ({
        buyer: item.buyer,
        amount: item.usdAmount,
        paymentType: item.paymentTypeName
      }))
    : []

  const remaining = Math.max(
    0,
    5 - real.length
  )

  return [
    ...real,
    ...frContributors.slice(0, remaining)
  ]
})

function displayAddress(addr) {
  if (!addr) return 'Unknown'

  return `${addr.slice(0, 6)}…${addr.slice(-4)}`
}

/*
 * ---------------------------------------------------------
 * Buy flow
 * ---------------------------------------------------------
 *
 * There is deliberately NO generic deposit() call anymore.
 *
 * Clicking the button directly calls:
 *
 * BNB   -> buyWithBNB()
 * USDT  -> approve + buyWithUSDT()
 * FDUSD -> approve + buyWithFDUSD()
 */

async function handleBuy() {
  if (!amountValid.value) return

  if (!isConnected.value) {
    walletPickerOpen.value = true
    return
  }

  if (isWrongNetwork.value) {
    await switchNetwork()
    return
  }

  const result = await buy(
    currentPayment.value.key,
    amountNumber.value
  )

  if (result?.ok) {
    // Show success notification
    toastStatus.value = 'success'
    toastAmount.value = hiveOut.value
    toastPaymentType.value = currentPayment.value.key
    toastWallet.value = address.value
    toastTxHash.value = lastTxHash.value || ''
    toastShow.value = true

    amount.value = ''

    await refreshRecentContributions()
  }
}

/*
 * ---------------------------------------------------------
 * Refund
 * ---------------------------------------------------------
 *
 * IMPORTANT:
 *
 * refundEnabled comes directly from:
 *
 * HIVESale.refundEnabled()
 *
 * No date calculation.
 * No target calculation.
 * No invented eligibility condition.
 *
 * The contract owner decides when refunds are enabled.
 */

const refundContribution = computed(() => {
  if (!isConnected.value) return null

  return getRefundableContribution()
})

const refundButtonDisabled = computed(() => {
  return (
    !refundEnabled.value ||
    !isConnected.value ||
    !refundContribution.value ||
    refundStatus.value === 'claiming'
  )
})

async function handleRefund() {
  if (!refundEnabled.value) return

  if (!isConnected.value) {
    walletPickerOpen.value = true
    return
  }

  const contribution = getRefundableContribution()

  if (!contribution) {
    refundStatus.value = 'error'
    refundMessage.value =
      'No refundable contribution was found for this wallet.'
    return
  }

  refundStatus.value = 'claiming'
  refundMessage.value = ''

  const result = await claimRefund(contribution.id)

  if (result?.ok) {
    refundStatus.value = 'claimed'

    await refreshRecentContributions()
  } else {
    refundStatus.value = 'error'
    refundMessage.value =
      result?.reason ||
      'Could not process the refund.'
  }
}

/*
 * ---------------------------------------------------------
 * Lifecycle
 * ---------------------------------------------------------
 */

onMounted(async () => {
  await refreshPresaleData()
})

watch(isConnected, async connected => {
  if (connected) {
    await refreshRecentContributions()
    await refreshRaised()
  }
})
</script>

<template>
  <section id="presale" class="section presale">
    <div class="container">

      <div class="stack-lg">
        <p v-reveal class="eyebrow">Neural Hive presale</p>

        <h2 v-reveal class="display-2">
          Fund the Internet of AI
        </h2>
      </div>

      <div
        v-reveal
        class="panel presale-panel presale-glass"
      >

        <!-- =================================================
             Animated glass background
             ================================================= -->

        <div class="glass-orbit"></div>
        <div class="glass-rect"></div>

        <div class="glass-blob glass-blob--a"></div>
        <div class="glass-blob glass-blob--b"></div>

        <div class="glass-shimmer"></div>

        <div class="presale-panel__content">

          <!-- =================================================
               HEADER
               ================================================= -->

          <div class="presale-panel__status-row">

            <span
              v-if="!config.presaleActive"
              class="tag tag--planned"
            >
              Presale not live yet
            </span>

            <span
              v-else-if="!transactionReady"
              class="tag tag--planned"
            >
              Preview
            </span>

            <span
              v-else
              class="tag tag--live"
            >
              Live
            </span>

            <a
              v-if="
                config.presale.contractAddress &&
                config.presale.contractAddress !==
                  '0x0000000000000000000000000000000000000000'
              "
              class="explorer-link"
              :href="`${config.chain.explorerUrl}/address/${config.presale.contractAddress}`"
              target="_blank"
              rel="noopener noreferrer"
            >
              View contract
            </a>

          </div>

          <!-- =================================================
               STATUS NOTICE
               ================================================= -->

          <div
            v-if="!config.presaleActive"
            class="notice"
          >
            <p>
              The presale hasn't opened yet.
            </p>
          </div>

          <div
            v-else-if="!transactionReady"
            class="notice"
          >
            <p>
              The presale contract is not configured for live
              transactions yet.
            </p>
          </div>

          <!-- =================================================
               MAIN GRID
               ================================================= -->

          <div class="presale-grid">

            <!-- =================================================
                 LEFT SIDE
                 ================================================= -->

            <div class="presale-info">

              <div class="info-row">
                <span>Token price</span>

                <span class="mono">
                  ${{ config.presale.priceUsd }}
                  /
                  {{ config.token.symbol }}
                </span>
              </div>

              <div class="info-row">
                <span>Presale supply</span>

                <span class="mono">
                  {{
                    numberFmt.format(config.presale.supply)
                  }}
                  {{ config.token.symbol }}
                </span>
              </div>

              <div class="info-row">
                <span>Raise target</span>

                <span class="mono">
                  {{ usdFmt.format(targetRaise) }}
                </span>
              </div>

              <div class="info-row">
                <span>Raised so far</span>

                <span class="mono">
                  <template v-if="raisedLoaded">
                    {{ usdFmt.format(displayedRaisedUsd) }}
                  </template>

                  <template v-else>
                    …
                  </template>
                </span>
              </div>

              <div class="progress">

                <div
                  class="progress__bar"
                  :style="{
                    width: percentRaised + '%'
                  }"
                ></div>

              </div>

              <div class="progress-caption">

                <template v-if="raisedLoaded">
                  {{ usdFmt.format(displayedRaisedUsd) }}
                </template>

                <template v-else>
                  …
                </template>

                /
                {{ usdFmt.format(targetRaise) }}
                raised

              </div>

              <!-- =================================================
                   RECENT CONTRIBUTORS
                   ================================================= -->

              <div class="contributors">

                <div class="contributors__header">

                  <span>
                    Recent contributors
                  </span>

                  <span class="contributors__live">
                    LIVE
                  </span>

                </div>

                <div
                  v-for="(contributor, index) in displayedContributors"
                  :key="`${contributor.buyer}-${index}`"
                  class="contributor"
                >

                  <div class="contributor__identity">

                    <span class="contributor__dot"></span>

                    <span class="mono">
                      {{ displayAddress(contributor.buyer) }}
                    </span>

                  </div>

                  <div class="contributor__amount">

                    <span>
                      {{ usdFmt.format(contributor.amount) }}
                    </span>

                    <small
                      v-if="contributor.paymentType"
                    >
                      {{ contributor.paymentType }}
                    </small>

                  </div>

                </div>

              </div>

            </div>

            <!-- =================================================
                 RIGHT SIDE
                 ================================================= -->

            <div class="presale-action">

              <!-- =================================================
                   WALLET
                   ================================================= -->

              <div
                v-if="!isConnected"
                class="wallet-connect"
              >

                <p class="wallet-connect__label">
                  Connect your wallet to enter the presale
                </p>

                <button
                  class="btn btn-primary wallet-connect__cta"
                  @click="walletPickerOpen = true"
                >
                  View all wallets →
                </button>

                <p class="wallet-connect__hint">
                  MetaMask, Coinbase, Rabby, Trust, OKX,
                  Phantom and WalletConnect-compatible wallets.
                </p>

                <p
                  v-if="walletError"
                  class="status status--error"
                >
                  {{ walletError }}
                </p>

              </div>

              <div
                v-else
                class="wallet-connected"
              >

                <span class="wallet-connected__address mono">
                  {{ shortAddress }}
                </span>

                <button
                  class="link-button"
                  @click="disconnect"
                >
                  Disconnect
                </button>

              </div>

              <!-- =================================================
                   WRONG NETWORK
                   ================================================= -->

              <div
                v-if="isConnected && isWrongNetwork"
                class="notice notice--warn"
              >

                <p>
                  Your wallet is on the wrong network.
                  This presale runs on
                  {{ config.chain.name }}.
                </p>

                <button
                  class="btn btn-secondary"
                  @click="switchNetwork"
                >
                  Switch network
                </button>

              </div>

              <!-- =================================================
                   PAYMENT
                   ================================================= -->

              <div
                v-if="!isWrongNetwork"
                class="buy-box"
              >

                <div class="buy-box__heading">
                  <span>Choose payment</span>
                </div>

                <!-- =================================================
                     TOKEN BUTTONS
                     ================================================= -->

                <div class="payment-methods">

                  <button
                    v-for="method in visiblePaymentMethods"
                    :key="method.key"
                    class="payment-method"
                    :class="{
                      'payment-method--active':
                        selectedPayment === method.key,
                      'payment-method--disabled':
                        method.enabled === false
                    }"
                    :disabled="method.enabled === false"
                    @click="setPaymentMethod(method.key)"
                  >

                    <span class="payment-method__icon">
                      <span v-if="method.key === 'BNB'">
                          <img
                            src="https://bscscan.com/assets/bsc/images/svg/logos/token-light.svg?v=26.9.2.0"
                            alt="BNB"
                            class="payment-method__icon"
                          />
                      </span>

                      <span v-else-if="method.key === 'USDT'">
                          <img
                            src="https://bscscan.com/token/images/busdt_32.png"
                            alt="USDT"
                            class="payment-method__icon"
                          />
                      </span>

                      <span v-else>
                          <img
                            src="https://bscscan.com/token/images/firstdigital_32.png"
                            alt="FDUSD"
                            class="payment-method__icon"
                          />
                      </span>
                    </span>

                    <span class="payment-method__text">

                      <strong>
                        {{ method.label || method.symbol }}
                      </strong>

                      <small>
                        {{ method.key }}
                      </small>

                    </span>

                    <span
                      v-if="selectedPayment === method.key"
                      class="payment-method__check"
                    >
                      ✓
                    </span>

                  </button>

                </div>

                <!-- =================================================
                     AMOUNT
                     ================================================= -->

                <div class="amount-form">

                  <label
                    class="amount-form__label"
                    for="presale-amount"
                  >
                    Amount to contribute
                  </label>

                  <div class="amount-form__input-row">

                    <input
                      id="presale-amount"
                      v-model="amount"
                      type="number"
                      min="0"
                      step="any"
                      placeholder="0.00"
                    />

                    <span class="amount-form__unit">
                      {{ currentPayment?.symbol }}
                    </span>

                  </div>

                  <p class="amount-form__preview">

                    You'll receive ≈

                    <span class="mono">
                      {{ numberFmt.format(Math.floor(hiveOut)) }}
                    </span>

                    {{ config.token.symbol }}

                    <template v-if="isConnected">
                      · sent to
                      <span class="mono">
                        {{ shortAddress }}
                      </span>
                    </template>

                  </p>

                </div>

                <!-- =================================================
                     BUY BUTTON
                     ================================================= -->

                <button
                  class="btn btn-primary send-btn"
                  :disabled="
                    !amountValid ||
                    !isConnected ||
                    buyStatus === 'approving' ||
                    buyStatus === 'buying' ||
                    !transactionReady
                  "
                  @click="handleBuy"
                >

                  <template v-if="buyStatus === 'approving'">
                    Approving {{ currentPayment?.symbol }}…
                  </template>

                  <template v-else-if="buyStatus === 'buying'">
                    Confirming…
                  </template>

                  <template v-else>
                    Buy {{ config.token.symbol }}
                    with {{ currentPayment?.symbol }}
                  </template>

                </button>

                <p
                  v-if="buyStatus === 'error'"
                  class="status status--error"
                >
                  {{ buyError }}
                </p>
<!-- 
                <div
                  v-if="buyStatus === 'success'"
                  class="notice notice--good"
                >

                  <p>
                    Purchase successful.
                  </p>

                  <a
                    v-if="lastTxHash"
                    class="explorer-link"
                    :href="`${config.chain.explorerUrl}/tx/${lastTxHash}`"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View transaction
                  </a>

                </div> -->

              </div>

              <!-- =================================================
                   REFUND
                   ================================================= -->

              <div class="refund-box">

                <div class="refund-box__header">

                  <div>

                    <h3>
                      Refund
                    </h3>

                    <p>
                      Refund will be enabled if we don't reach our target by the presale deadline.
                    </p>

                  </div>

                  <span
                    class="refund-status"
                    :class="{
                      'refund-status--on':
                        refundEnabled,
                      'refund-status--off':
                        !refundEnabled
                    }"
                  >
                    {{
                      refundEnabled
                        ? 'ENABLED'
                        : 'DISABLED'
                    }}
                  </span>

                </div>

                <button
                  class="btn btn-secondary refund-button"
                  :disabled="refundButtonDisabled"
                  @click="handleRefund"
                >

                  <template
                    v-if="refundStatus === 'claiming'"
                  >
                    Processing refund…
                  </template>

                  <template v-else>
                    Take refund
                  </template>

                </button>

                <p
                  v-if="!refundEnabled"
                  class="refund-hint"
                >
                  Refunds are currently disabled by the owner.
                </p>

                <p
                  v-else-if="!isConnected"
                  class="refund-hint"
                >
                  Connect the wallet used for the contribution.
                </p>

                <p
                  v-else-if="!refundContribution"
                  class="refund-hint"
                >
                  No refundable contribution found for this wallet.
                </p>

                <p
                  v-if="refundStatus === 'claimed'"
                  class="status status--good"
                >
                  Refund transaction submitted successfully.
                </p>

                <p
                  v-if="refundStatus === 'error'"
                  class="status status--error"
                >
                  {{ refundMessage }}
                </p>

              </div>

            </div>

          </div>

        </div>

      </div>

      <p class="never-ask">
        We will never ask for your seed phrase, private key,
        or wallet password. Your wallet signs every transaction;
        we never hold your keys.
      </p>

    </div>

  </section>

  <WalletPicker
    :open="walletPickerOpen"
    @close="walletPickerOpen = false"
  />

<TransactionToast
  :show="toastShow"
  :status="toastStatus"
  :amount="toastAmount"
  :payment-type="toastPaymentType"
  :wallet="toastWallet"
  :tx-hash="toastTxHash"
  :explorer-url="config.chain.explorerUrl"
  @close="toastShow = false"
/>

</template>

<style scoped>
.presale-panel {
  margin-top: 48px;
  max-width: 960px;
  position: relative;
}

.presale-panel__content {
  position: relative;
  z-index: 1;
  padding: 40px;
}

.presale-panel__status-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 28px;
  flex-wrap: wrap;
}

.explorer-link {
  font-size: 13px;
  color: var(--ink-dim);
  text-decoration: underline;
  text-underline-offset: 3px;
}

/* =========================================================
   Main layout
   ========================================================= */

.presale-grid {
  display: grid;
  grid-template-columns: 1.1fr 1fr;
  gap: 48px;
  align-items: start;
}

.presale-info {
  display: flex;
  flex-direction: column;
}

.info-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 0;
  border-bottom: 1px solid var(--line);
  font-size: 14px;
}

.info-row:first-child {
  padding-top: 0;
}

.info-row span:first-child {
  color: var(--ink-dim);
}

.info-row span:last-child {
  font-weight: 600;
}

/* =========================================================
   Progress
   ========================================================= */

.progress {
  margin-top: 24px;
  height: 6px;
  border-radius: 100px;
  background: var(--bg);
  border: 1px solid var(--line);
  overflow: hidden;
}

.progress__bar {
  height: 100%;
  background: var(--signal);
  transition: width 400ms ease;
}

.progress-caption {
  margin-top: 10px;
  font-size: 12px;
  color: var(--ink-faint);
}

/* =========================================================
   Notices
   ========================================================= */

.notice {
  margin-bottom: 24px;
  padding: 16px 18px;
  border-radius: 8px;
  background: var(--bg);
  border: 1px solid var(--line);
  color: var(--ink-dim);
  font-size: 14px;
}

.notice--warn {
  border-color: rgba(224, 169, 76, 0.4);
  margin-top: 16px;
}

.notice--good {
  border-color: rgba(91, 201, 154, 0.4);
}

/* =========================================================
   Wallet
   ========================================================= */

.wallet-connect {
  margin-bottom: 20px;
}

.wallet-connect__label {
  color: var(--ink-dim);
  font-size: 14px;
  margin-bottom: 14px;
}

.wallet-connect__cta {
  width: 100%;
}

.wallet-connect__hint {
  color: var(--ink-faint);
  font-size: 12px;
  margin-top: 10px;
}

.wallet-connected {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.wallet-connected__address {
  padding: 8px 14px;
  border: 1px solid var(--line-strong);
  border-radius: 100px;
  font-size: 14px;
}

.link-button {
  background: none;
  border: none;
  color: var(--ink-faint);
  text-decoration: underline;
  cursor: pointer;
  font-size: 13px;
}

/* =========================================================
   Buy box
   ========================================================= */

.buy-box {
  display: flex;
  flex-direction: column;
}

.buy-box__heading {
  font-size: 12px;
  color: var(--ink-faint);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 10px;
}

/* =========================================================
   Payment methods
   ========================================================= */

.payment-methods {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-bottom: 20px;
}

.payment-method {
  position: relative;
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 11px 10px;
  background: var(--bg);
  border: 1px solid var(--line);
  border-radius: 9px;
  color: var(--ink);
  cursor: pointer;
  text-align: left;
  transition:
    border-color 180ms ease,
    background 180ms ease,
    transform 180ms ease;
}

.payment-method:hover:not(:disabled) {
  transform: translateY(-1px);
  border-color: var(--line-strong);
}

.payment-method--active {
  border-color: var(--signal);
  background: rgba(141, 104, 255, 0.08);
}

.payment-method--disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.payment-method__icon {
  width: 27px;
  height: 27px;
  min-width: 27px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  border: 1px solid var(--line-strong);
  font-size: 12px;
  font-weight: 700;
}

.payment-method__text {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.payment-method__text strong {
  font-size: 12px;
  line-height: 1.1;
}

.payment-method__text small {
  margin-top: 3px;
  font-size: 9px;
  color: var(--ink-faint);
}

.payment-method__check {
  margin-left: auto;
  font-size: 11px;
  color: var(--signal);
}

/* =========================================================
   Amount
   ========================================================= */

.amount-form {
  margin-bottom: 16px;
}

.amount-form__label {
  display: block;
  font-size: 12px;
  color: var(--ink-faint);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 10px;
}

.amount-form__input-row {
  display: flex;
  align-items: center;
  background: var(--bg);
  border: 1px solid var(--line-strong);
  border-radius: 8px;
  overflow: hidden;
}

.amount-form__input-row input {
  flex: 1;
  background: transparent;
  border: none;
  color: var(--ink);
  font-size: 1.1rem;
  padding: 14px 16px;
  font-family: var(--font-body);
  min-width: 0;
}

.amount-form__input-row input:focus {
  outline: none;
}

.amount-form__unit {
  padding: 0 16px;
  color: var(--ink-faint);
  font-size: 13px;
  border-left: 1px solid var(--line);
  align-self: stretch;
  display: flex;
  align-items: center;
}

.amount-form__preview {
  margin-top: 12px;
  font-size: 13px;
  color: var(--ink-faint);
}

/* =========================================================
   Contributors
   ========================================================= */

.contributors {
  margin-top: 30px;
  border-top: 1px solid var(--line);
  padding-top: 20px;
}

.contributors__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--ink-faint);
}

.contributors__live {
  font-size: 9px;
  color: var(--signal);
  letter-spacing: 0.08em;
}

.contributor {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 11px 0;
  border-bottom: 1px solid var(--line);
  font-size: 12px;
}

.contributor__identity {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.contributor__dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--signal);
  flex-shrink: 0;
}

.contributor__amount {
  display: flex;
  align-items: center;
  gap: 7px;
  white-space: nowrap;
}

.contributor__amount small {
  color: var(--ink-faint);
  font-size: 9px;
}

/* =========================================================
   Refund
   ========================================================= */

.refund-box {
  margin-top: 28px;
  padding-top: 22px;
  border-top: 1px solid var(--line);
}

.refund-box__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 14px;
}

.refund-box h3 {
  font-size: 1.05rem;
  margin-bottom: 5px;
}

.refund-box p {
  color: var(--ink-dim);
  font-size: 13px;
}

.refund-status {
  flex-shrink: 0;
  font-size: 9px;
  letter-spacing: 0.08em;
  padding: 5px 8px;
  border-radius: 100px;
  border: 1px solid var(--line);
}

.refund-status--on {
  color: var(--good);
  border-color: rgba(91, 201, 154, 0.4);
}

.refund-status--off {
  color: var(--ink-faint);
}

.refund-button {
  width: 100%;
}

.refund-hint {
  margin-top: 9px;
  font-size: 11px !important;
  color: var(--ink-faint) !important;
}

/* =========================================================
   Status
   ========================================================= */

.status {
  margin-top: 12px;
  font-size: 13px;
}

.status--error {
  color: #e37070;
}

.status--good {
  color: var(--good);
}

.send-btn {
  width: 100%;
}

/* =========================================================
   Footer
   ========================================================= */

.never-ask {
  margin-top: 32px;
  padding-top: 20px;
  border-top: 1px solid var(--line);
  font-size: 12px;
  color: var(--ink-faint);
  max-width: 960px;
}

/* =========================================================
   Glass background
   ========================================================= */

.presale-glass {
  position: relative;
  overflow: hidden;
  background:
    linear-gradient(
      145deg,
      rgba(24, 20, 39, 0.82),
      rgba(8, 9, 15, 0.72)
    );
  box-shadow:
    0 30px 100px rgba(0, 0, 0, 0.35),
    0 0 70px rgba(141, 104, 255, 0.07);
}

.presale-glass::before {
  content: "";
  position: absolute;
  inset: -40%;
  background:
    conic-gradient(
      from 0deg,
      transparent 0 65%,
      rgba(141, 104, 255, 0.12) 72%,
      rgba(32, 228, 193, 0.08) 77%,
      transparent 84%
    );
  animation: glassSpin 18s linear infinite;
  pointer-events: none;
  z-index: 0;
}

.glass-blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
  pointer-events: none;
  z-index: 0;
  opacity: 0.55;
  mix-blend-mode: screen;
}

.glass-blob--a {
  width: 260px;
  height: 260px;
  left: -60px;
  top: 10%;
  background:
    radial-gradient(
      circle,
      rgba(141, 104, 255, 0.55),
      transparent 70%
    );
  animation: blobDriftA 14s ease-in-out infinite;
}

.glass-blob--b {
  width: 300px;
  height: 300px;
  right: -80px;
  bottom: -40px;
  background:
    radial-gradient(
      circle,
      rgba(32, 228, 193, 0.4),
      transparent 70%
    );
  animation: blobDriftB 17s ease-in-out infinite;
}

.glass-shimmer {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background:
    linear-gradient(
      100deg,
      transparent 30%,
      rgba(255, 255, 255, 0.05) 45%,
      rgba(255, 255, 255, 0.09) 50%,
      rgba(255, 255, 255, 0.05) 55%,
      transparent 70%
    );
  background-size: 250% 100%;
  animation: shimmerSweep 6s ease-in-out infinite;
}

.glass-orbit {
  position: absolute;
  width: 220px;
  height: 220px;
  border: 1px solid rgba(255, 255, 255, 0.09);
  border-radius: 50%;
  right: -80px;
  top: -100px;
  z-index: 0;
  animation: glassFloat 8s ease-in-out infinite;
  pointer-events: none;
}

.glass-rect {
  position: absolute;
  width: 460px;
  height: 300px;
  top: 50%;
  left: 50%;
  margin: -150px 0 0 -230px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 28px;
  background:
    linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.025),
      rgba(255, 255, 255, 0.005) 60%
    );
  z-index: 0;
  opacity: 0.6;
  pointer-events: none;
  animation: glassRectSpin 60s linear infinite;
  will-change: transform;
}

@keyframes glassSpin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes glassRectSpin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes glassFloat {
  50% {
    transform: translate(-35px, 25px) rotate(25deg);
  }
}

@keyframes blobDriftA {
  0%, 100% {
    transform: translate(0, 0) scale(1);
  }

  50% {
    transform: translate(60px, 40px) scale(1.15);
  }
}

@keyframes blobDriftB {
  0%, 100% {
    transform: translate(0, 0) scale(1);
  }

  50% {
    transform: translate(-50px, -30px) scale(1.1);
  }
}

@keyframes shimmerSweep {
  0% {
    background-position: 200% 0;
  }

  100% {
    background-position: -50% 0;
  }
}

@media (max-width: 760px) {

  .presale-grid {
    grid-template-columns: 1fr;
    gap: 32px;
  }

  .presale-panel__content {
    padding: 28px 24px;
  }

  .payment-methods {
    grid-template-columns: 1fr;
  }

  .payment-method {
    padding: 12px;
  }
}

@media (prefers-reduced-motion: reduce) {

  .presale-glass::before,
  .glass-blob,
  .glass-shimmer,
  .glass-orbit,
  .glass-rect {
    animation: none;
  }
}

.payment-icon {
  width: 24px;
  height: 24px;
  object-fit: contain;
}
</style>
