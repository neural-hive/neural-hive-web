import { ref, computed } from 'vue'
import {
  Contract,
  parseUnits,
  formatUnits
} from 'ethers'

import {
  config,
  isPresaleTransactionReady
} from '../config/index.js'

import { useWallet } from './useWallet.js'


// ============================================================
// HIVESale ABI
// ============================================================

const PRESALE_ABI = [
  // Payments
  'function buyWithBNB() external payable',
  'function buyWithUSDT(uint256 usdtAmount) external',
  'function buyWithFDUSD(uint256 fdusdAmount) external',

  // Refund
  'function refundEnabled() view returns (bool)',
  'function refund(uint256 contributionId) external',

  // Contributions
  'function contributionCount() view returns (uint256)',
  'function getContribution(uint256 contributionId) view returns ((address buyer, uint8 paymentType, uint256 paymentAmount, uint256 hiveAmount, uint256 timestamp, bool refunded))',
  'function getBuyerContributionIds(address buyer) view returns (uint256[])',
  'function recentContributions(uint256 count) view returns ((address buyer, uint8 paymentType, uint256 paymentAmount, uint256 hiveAmount, uint256 timestamp, bool refunded)[])',
  'function recentContributionIds(uint256 count) view returns (uint256[])',

  // Rates
  'function bnbRate() view returns (uint256)',
  'function usdtRate() view returns (uint256)',
  'function fdusdRate() view returns (uint256)',

  // Payment switches
  'function bnbEnabled() view returns (bool)',
  'function usdtEnabled() view returns (bool)',
  'function fdusdEnabled() view returns (bool)',

  // Quotes
  'function quoteBNB(uint256 bnbAmount) view returns (uint256)',
  'function quoteUSDT(uint256 usdtAmount) view returns (uint256)',
  'function quoteFDUSD(uint256 fdusdAmount) view returns (uint256)'
]

// ============================================================
// ERC20 ABI
// ============================================================

const ERC20_ABI = [
  'function approve(address spender, uint256 amount) external returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function balanceOf(address account) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function totalSupply() view returns (uint256)',

]

// ============================================================
// SHARED REACTIVE STATE
// ============================================================

const raisedUsd = ref(0)
const raisedLoaded = ref(false)

const recentContributions = ref([])

const refundEnabled = ref(false)
const refundLoaded = ref(false)

const contributionStatus = ref('idle')
const contributionError = ref('')

const refundStatus = ref('idle')
const refundError = ref('')

const lastTxHash = ref('')

// ============================================================
// PAYMENT STATE
// ============================================================

const bnbEnabled = ref(true)
const usdtEnabled = ref(true)
const fdusdEnabled = ref(true)

// IMPORTANT:
// This was missing before.
// PresalePanel.vue expects selectedPayment.value.
const selectedPayment = ref('BNB')

// Cached contract rates.
// These are used by the synchronous quote() function
// expected by PresalePanel.vue.
const bnbRate = ref(1540000)
const usdtRate = ref(2000)
const fdusdRate = ref(2000)

// ============================================================
// PAYMENT TYPE
// ============================================================

const PAYMENT_TYPE = {
  0: 'BNB',
  1: 'USDT',
  2: 'FDUSD'
}

function getPaymentTypeName(paymentType) {
  return PAYMENT_TYPE[Number(paymentType)] || 'UNKNOWN'
}

// ============================================================
// TOKEN CONFIG
// ============================================================

function getUSDTConfig() {
  const token = config.paymentToken || {}

  return {
    address: token.address,
    decimals: Number(token.decimals ?? 6),
    symbol: token.symbol || 'USDT'
  }
}

function getFDUSDConfig() {
  const token =
    config.paymentTokenFDUSD ||
    config.paymentToken1 ||
    {}

  return {
    address: token.address,
    decimals: Number(token.decimals ?? 6),
    symbol: token.symbol || 'FDUSD'
  }
}

function getPaymentDecimals(paymentType) {
  switch (Number(paymentType)) {
    case 0:
      return 18

    case 1:
      return getUSDTConfig().decimals

    case 2:
      return getFDUSDConfig().decimals

    default:
      return 18
  }
}

// ============================================================
// FORMAT CONTRIBUTION
// ============================================================

function hiveToUsdv1(hiveAmount) {
  const hive = Number(hiveAmount)

  if (
    !Number.isFinite(hive) ||
    hive <= 0
  ) {
    return 0
  }

  return (
    hive *
    Number(config.presale.priceUsd)
  )
}


function formatContribution(raw) {
  if (!raw) return null

  const paymentType = Number(raw.paymentType)

  const paymentDecimals =
    getPaymentDecimals(paymentType)

  const hiveAmount =
    Number(
      formatUnits(
        raw.hiveAmount,
        18
      )
    )

  const usdAmount = hiveToUsdv1(hiveAmount)

  return {
    buyer: raw.buyer,

    paymentType,

    paymentSymbol:
      getPaymentTypeName(paymentType),

    // PresalePanel.vue uses paymentType as the displayed label.
    paymentTypeName:
      getPaymentTypeName(paymentType),

    paymentAmountRaw:
      raw.paymentAmount,

    paymentAmount:
        formatUnits(
          raw.paymentAmount,
          paymentDecimals
        ),

    hiveAmountRaw:
      raw.hiveAmount,

    hiveAmount,

    // IMPORTANT:
    // PresalePanel.vue expects item.usdAmount.
    usdAmount,

    timestamp:
      Number(raw.timestamp),

    refunded:
      Boolean(raw.refunded)
  }
}

// ============================================================
// MAIN COMPOSABLE
// ============================================================

export function usePresale() {
  const {
    getProvider,
    address,
    isConnected,
    isWrongNetwork
  } = useWallet()

  // ==========================================================
  // CONFIGURATION
  // ==========================================================

  const transactionReady = computed(
    () => isPresaleTransactionReady()
  )

  const startsAt = computed(() => {
    return config.presale.startsAt
      ? new Date(config.presale.startsAt)
      : null
  })

  const endsAt = computed(() => {
    return config.presale.endsAt
      ? new Date(config.presale.endsAt)
      : null
  })

  const hasEnded = computed(() => {
    if (!endsAt.value) return false

    return new Date() > endsAt.value
  })

  const hasStarted = computed(() => {
    if (!startsAt.value) return true

    return new Date() >= startsAt.value
  })

  const targetReached = computed(() => {
    return (
      raisedUsd.value >=
      Number(config.presale.targetRaiseUsd || 0)
    )
  })

  const percentRaised = computed(() => {
    const target =
      Number(config.presale.targetRaiseUsd || 0)

    if (!target || target <= 0) {
      return 0
    }

    return Math.min(
      100,
      (raisedUsd.value / target) * 100
    )
  })

  const refundAvailable = computed(() => {
    return (
      transactionReady.value &&
      refundEnabled.value
    )
  })

  // ==========================================================
  // PAYMENT METHODS
  // ==========================================================

  const paymentMethods = computed(() => [
    {
      key: 'BNB',
      id: 'BNB',
      symbol: 'BNB',
      label: 'BNB',
      enabled: bnbEnabled.value,
      type: 'native'
    },
    {
      key: 'USDT',
      id: 'USDT',
      symbol: 'USDT',
      label: 'USDT',
      enabled: usdtEnabled.value,
      type: 'erc20'
    },
    {
      key: 'FDUSD',
      id: 'FDUSD',
      symbol: 'FDUSD',
      label: 'FDUSD',
      enabled: fdusdEnabled.value,
      type: 'erc20'
    }
  ])

  // ==========================================================
  // PAYMENT SELECTION
  // ==========================================================

  function setPaymentMethod(method) {
    const key =
      String(method || '').toUpperCase()

    if (
      key === 'BNB' &&
      bnbEnabled.value
    ) {
      selectedPayment.value = 'BNB'
      return
    }

    if (
      key === 'USDT' &&
      usdtEnabled.value
    ) {
      selectedPayment.value = 'USDT'
      return
    }

    if (
      key === 'FDUSD' &&
      fdusdEnabled.value
    ) {
      selectedPayment.value = 'FDUSD'
    }
  }

  // ==========================================================
  // HIVE CALCULATIONS
  // ==========================================================

  function usdToHive(usdAmount) {
    const usd = Number(usdAmount)

    if (
      !Number.isFinite(usd) ||
      usd <= 0
    ) {
      return 0
    }

    const price =
      Number(config.presale.priceUsd)

    if (!price || price <= 0) {
      return 0
    }

    return usd / price
  }

  function hiveToUsd(hiveAmount) {
    const hive = Number(hiveAmount)

    if (
      !Number.isFinite(hive) ||
      hive <= 0
    ) {
      return 0
    }

    return (
      hive *
      Number(config.presale.priceUsd)
    )
  }

  // ==========================================================
  // CONTRACT HELPERS
  // ==========================================================

  function getReadContract(provider) {
    return new Contract(
      config.presale.contractAddress,
      PRESALE_ABI,
      provider
    )
  }

  function getWriteContract(signer) {
    return new Contract(
      config.presale.contractAddress,
      PRESALE_ABI,
      signer
    )
  }

  // ==========================================================
  // REFRESH PAYMENT SWITCHES + RATES
  // ==========================================================

  async function refreshPaymentMethods() {
    if (!transactionReady.value) {
      bnbEnabled.value = true
      usdtEnabled.value = true
      fdusdEnabled.value = true

      return
    }

    try {
      const provider = getProvider()

      if (!provider) {
        return
      }

      const contract =
        getReadContract(provider)

      const [
        bnb,
        usdt,
        fdusd,
        bnbRateRaw,
        usdtRateRaw,
        fdusdRateRaw
      ] = await Promise.all([
        contract.bnbEnabled(),
        contract.usdtEnabled(),
        contract.fdusdEnabled(),

        contract.bnbRate(),
        contract.usdtRate(),
        contract.fdusdRate()
      ])

      bnbEnabled.value =
        Boolean(bnb)

      usdtEnabled.value =
        Boolean(usdt)

      fdusdEnabled.value =
        Boolean(fdusd)

      // Rates are assumed to use 18 decimals
      // and represent HIVE received per 1 payment token.
      bnbRate.value =
        Number(
          formatUnits(
            bnbRateRaw,
            18
          )
        )

      usdtRate.value =
        Number(
          formatUnits(
            usdtRateRaw,
            18
          )
        )

      fdusdRate.value =
        Number(
          formatUnits(
            fdusdRateRaw,
            18
          )
        )

      // If the currently selected payment became disabled,
      // move to another enabled method.
      if (
        selectedPayment.value === 'BNB' &&
        !bnbEnabled.value
      ) {
        if (usdtEnabled.value) {
          selectedPayment.value = 'USDT'
        } else if (fdusdEnabled.value) {
          selectedPayment.value = 'FDUSD'
        }
      }

      if (
        selectedPayment.value === 'USDT' &&
        !usdtEnabled.value
      ) {
        if (bnbEnabled.value) {
          selectedPayment.value = 'BNB'
        } else if (fdusdEnabled.value) {
          selectedPayment.value = 'FDUSD'
        }
      }

      if (
        selectedPayment.value === 'FDUSD' &&
        !fdusdEnabled.value
      ) {
        if (bnbEnabled.value) {
          selectedPayment.value = 'BNB'
        } else if (usdtEnabled.value) {
          selectedPayment.value = 'USDT'
        }
      }

    } catch (err) {
      console.error(
        'Could not load payment methods:',
        err
      )

      bnbEnabled.value = false
      usdtEnabled.value = false
      fdusdEnabled.value = false
    }
  }

  // ==========================================================
  // QUOTE
  //
  // PresalePanel.vue calls this synchronously:
  //
  // quote(payment, amount)
  //
  // Therefore we use the most recently cached contract rate.
  // ==========================================================

  function quote(paymentType, amount) {
    const payment =
      String(paymentType || '').toUpperCase()

    const numericAmount =
      Number(amount)

    if (
      !Number.isFinite(numericAmount) ||
      numericAmount <= 0
    ) {
      return 0
    }

    let rate = 0

    if (payment === 'BNB') {
      rate = bnbRate.value
    } else if (payment === 'USDT') {
      rate = usdtRate.value
    } else if (payment === 'FDUSD') {
      rate = fdusdRate.value
    }

    if (
      !Number.isFinite(rate) ||
      rate <= 0
    ) {
      return 0
    }

    return numericAmount * rate
  }

  // ==========================================================
  // REFRESH REFUND STATUS
  // ==========================================================

  async function refreshRefundStatus() {
    refundLoaded.value = false

    if (!transactionReady.value) {
      refundEnabled.value = false
      refundLoaded.value = true
      return
    }

    try {
      const provider = getProvider()

      if (!provider) {
        refundLoaded.value = true
        return
      }

      const contract =
        getReadContract(provider)

      refundEnabled.value =
        Boolean(
          await contract.refundEnabled()
        )

    } catch (err) {
      console.error(
        'Could not read refundEnabled:',
        err
      )

      refundEnabled.value = false

    } finally {
      refundLoaded.value = true
    }
  }

  // ==========================================================
  // REFRESH RECENT CONTRIBUTIONS
  // ==========================================================

  async function refreshRecentContributions() {
    if (!transactionReady.value) {
      recentContributions.value = []
      return
    }

    try {
      const provider = getProvider()

      if (!provider) {
        recentContributions.value = []
        return
      }

      const contract =
        getReadContract(provider)

      const result =
        await contract.recentContributions(5)

      recentContributions.value =
        result
          .map(formatContribution)
          .filter(Boolean)

    } catch (err) {
      console.error(
        'Could not load recent contributions:',
        err
      )

      recentContributions.value = []
    }
  }

  // ==========================================================
  async function refreshRaised() {
    raisedLoaded.value = false
  
    try {
      const provider = getProvider()
  
      // No wallet/provider → show base $100,000
      if (!provider) {
        raisedUsd.value = 100000
        return
      }
  
      const hive = new Contract(
        config.token.contractAddress,
        ERC20_ABI,
        provider
      )
  
      const totalSupplyRaw =
        await hive.totalSupply()
  
      const totalHive =
        Number(
          formatUnits(
            totalSupplyRaw,
            18
          )
        )
  
      const hiveUsdValue =
        Number(
          config.token.exchangeValue || 0
        )
  
      raisedUsd.value =
        100000 +
        (totalHive * hiveUsdValue)
  
    } catch (err) {
      console.error(
        'Could not calculate raised amount:',
        err
      )
  
      // If the read fails, also fall back to $100,000
      raisedUsd.value = 100000
  
    } finally {
      raisedLoaded.value = true
    }
  }
  // ==========================================================
  // REFRESH EVERYTHING
  // ==========================================================

  async function refreshPresaleData() {
    await Promise.all([
      refreshRaised(),
      refreshRecentContributions(),
      refreshRefundStatus(),
      refreshPaymentMethods()
    ])
  }

  // ==========================================================
  // USER CONTRIBUTIONS
  // ==========================================================

  async function getMyContributions() {
    if (
      !transactionReady.value ||
      !isConnected.value ||
      !address.value
    ) {
      return []
    }

    try {
      const provider = getProvider()

      if (!provider) {
        return []
      }

      const contract =
        getReadContract(provider)

      const ids =
        await contract.getBuyerContributionIds(
          address.value
        )

      const result = []

      for (const id of ids) {
        const contribution =
          await contract.getContribution(id)

        result.push({
          id: Number(id),
          ...formatContribution(
            contribution
          )
        })
      }

      return result

    } catch (err) {
      console.error(
        'Could not load user contributions:',
        err
      )

      return []
    }
  }

  // ==========================================================
  // GET REFUNDABLE CONTRIBUTION
  //
  // PresalePanel.vue expects this function.
  //
  // We return the first unrefunded contribution belonging
  // to the connected wallet.
  // ==========================================================

  async function getRefundableContribution() {
    if (
      !transactionReady.value ||
      !isConnected.value ||
      !address.value ||
      !refundEnabled.value
    ) {
      return null
    }

    try {
      const contributions =
        await getMyContributions()

      const refundable =
        contributions.find(
          contribution =>
            !contribution.refunded
        )

      return refundable || null

    } catch (err) {
      console.error(
        'Could not find refundable contribution:',
        err
      )

      return null
    }
  }

  // ==========================================================
  // COMMON VALIDATION
  // ==========================================================

  function validateTransaction() {
    if (!transactionReady.value) {
      contributionStatus.value = 'error'

      contributionError.value =
        'The presale contract is not configured.'

      return false
    }

    if (!isConnected.value) {
      contributionStatus.value = 'error'

      contributionError.value =
        'Connect a wallet first.'

      return false
    }

    if (isWrongNetwork.value) {
      contributionStatus.value = 'error'

      contributionError.value =
        `Please switch to ${config.chain.name}.`

      return false
    }

    return true
  }

  // ==========================================================
  // BNB
  // ==========================================================

  async function buyWithBNB(bnbAmount) {
    contributionStatus.value = 'idle'
    contributionError.value = ''
    lastTxHash.value = ''

    if (!validateTransaction()) {
      return {
        ok: false,
        reason: 'validation_failed'
      }
    }

    if (!bnbEnabled.value) {
      contributionStatus.value = 'error'

      contributionError.value =
        'BNB contributions are currently disabled.'

      return {
        ok: false,
        reason: 'payment_disabled'
      }
    }

    const amount =
      Number(bnbAmount)

    if (
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      contributionStatus.value = 'error'

      contributionError.value =
        'Enter a valid BNB amount.'

      return {
        ok: false,
        reason: 'invalid_amount'
      }
    }

    try {
      const provider = getProvider()

      if (!provider) {
        throw new Error(
          'Wallet provider is unavailable.'
        )
      }

      const signer =
        await provider.getSigner()

      const presale =
        getWriteContract(signer)

      const value =
        parseUnits(
          amount.toString(),
          18
        )

      contributionStatus.value =
        'buying'

      const tx =
        await presale.buyWithBNB({
          value
        })

      lastTxHash.value =
        tx.hash

      await tx.wait()

      contributionStatus.value =
        'success'

      await refreshPresaleData()

      return {
        ok: true,
        hash: tx.hash
      }

    } catch (err) {
      console.error(
        'BNB transaction failed:',
        err
      )

      contributionStatus.value =
        'error'

      contributionError.value =
        err?.shortMessage ||
        err?.reason ||
        err?.message ||
        'The BNB transaction failed.'

      return {
        ok: false,
        reason: 'tx_failed'
      }
    }
  }

  // ==========================================================
  // ERC20 APPROVAL
  // ==========================================================

  async function ensureApproval(
    signer,
    tokenAddress,
    amount
  ) {
    const token =
      new Contract(
        tokenAddress,
        ERC20_ABI,
        signer
      )

    const owner =
      await signer.getAddress()

    const allowance =
      await token.allowance(
        owner,
        config.presale.contractAddress
      )

    if (allowance >= amount) {
      return null
    }

    contributionStatus.value =
      'approving'

    const approveTx =
      await token.approve(
        config.presale.contractAddress,
        amount
      )

    await approveTx.wait()

    return approveTx.hash
  }

  // ==========================================================
  // USDT
  // ==========================================================

  async function buyWithUSDT(usdtAmount) {
    contributionStatus.value = 'idle'
    contributionError.value = ''
    lastTxHash.value = ''

    if (!validateTransaction()) {
      return {
        ok: false,
        reason: 'validation_failed'
      }
    }

    if (!usdtEnabled.value) {
      contributionStatus.value = 'error'

      contributionError.value =
        'USDT contributions are currently disabled.'

      return {
        ok: false,
        reason: 'payment_disabled'
      }
    }

    const amountNumber =
      Number(usdtAmount)

    if (
      !Number.isFinite(amountNumber) ||
      amountNumber <= 0
    ) {
      contributionStatus.value = 'error'

      contributionError.value =
        'Enter a valid USDT amount.'

      return {
        ok: false,
        reason: 'invalid_amount'
      }
    }

    try {
      const provider = getProvider()

      if (!provider) {
        throw new Error(
          'Wallet provider is unavailable.'
        )
      }

      const signer =
        await provider.getSigner()

      const token =
        getUSDTConfig()

      if (!token.address) {
        throw new Error(
          'USDT contract address is not configured.'
        )
      }

      const amount =
        parseUnits(
          amountNumber.toString(),
          token.decimals
        )

      await ensureApproval(
        signer,
        token.address,
        amount
      )

      const presale =
        getWriteContract(signer)

      contributionStatus.value =
        'buying'

      const tx =
        await presale.buyWithUSDT(
          amount
        )

      lastTxHash.value =
        tx.hash

      await tx.wait()

      contributionStatus.value =
        'success'

      await refreshPresaleData()

      return {
        ok: true,
        hash: tx.hash
      }

    } catch (err) {
      console.error(
        'USDT transaction failed:',
        err
      )

      contributionStatus.value =
        'error'

      contributionError.value =
        err?.shortMessage ||
        err?.reason ||
        err?.message ||
        'The USDT transaction failed.'

      return {
        ok: false,
        reason: 'tx_failed'
      }
    }
  }

  // ==========================================================
  // FDUSD
  // ==========================================================

  async function buyWithFDUSD(fdusdAmount) {
    contributionStatus.value = 'idle'
    contributionError.value = ''
    lastTxHash.value = ''

    if (!validateTransaction()) {
      return {
        ok: false,
        reason: 'validation_failed'
      }
    }

    if (!fdusdEnabled.value) {
      contributionStatus.value = 'error'

      contributionError.value =
        'FDUSD contributions are currently disabled.'

      return {
        ok: false,
        reason: 'payment_disabled'
      }
    }

    const amountNumber =
      Number(fdusdAmount)

    if (
      !Number.isFinite(amountNumber) ||
      amountNumber <= 0
    ) {
      contributionStatus.value = 'error'

      contributionError.value =
        'Enter a valid FDUSD amount.'

      return {
        ok: false,
        reason: 'invalid_amount'
      }
    }

    try {
      const provider = getProvider()

      if (!provider) {
        throw new Error(
          'Wallet provider is unavailable.'
        )
      }

      const signer =
        await provider.getSigner()

      const token =
        getFDUSDConfig()

      if (!token.address) {
        throw new Error(
          'FDUSD contract address is not configured.'
        )
      }

      const amount =
        parseUnits(
          amountNumber.toString(),
          token.decimals
        )

      await ensureApproval(
        signer,
        token.address,
        amount
      )

      const presale =
        getWriteContract(signer)

      contributionStatus.value =
        'buying'

      const tx =
        await presale.buyWithFDUSD(
          amount
        )

      lastTxHash.value =
        tx.hash

      await tx.wait()

      contributionStatus.value =
        'success'

      await refreshPresaleData()

      return {
        ok: true,
        hash: tx.hash
      }

    } catch (err) {
      console.error(
        'FDUSD transaction failed:',
        err
      )

      contributionStatus.value =
        'error'

      contributionError.value =
        err?.shortMessage ||
        err?.reason ||
        err?.message ||
        'The FDUSD transaction failed.'

      return {
        ok: false,
        reason: 'tx_failed'
      }
    }
  }

  // ==========================================================
  // UNIFIED BUY API
  //
  // PresalePanel.vue calls:
  //
  // buy(paymentType, amount)
  // ==========================================================

  async function buy(paymentType, amount) {
    const payment =
      String(paymentType || '').toUpperCase()

    switch (payment) {
      case 'BNB':
        return buyWithBNB(amount)

      case 'USDT':
        return buyWithUSDT(amount)

      case 'FDUSD':
        return buyWithFDUSD(amount)

      default:
        contributionStatus.value = 'error'

        contributionError.value =
          `Unsupported payment method: ${payment}`

        return {
          ok: false,
          reason: 'unsupported_payment'
        }
    }
  }

  // ==========================================================
  // BACKWARDS COMPATIBILITY
  // ==========================================================

  const depositStatus = computed(
    () => contributionStatus.value
  )

  const depositError = computed(
    () => contributionError.value
  )

  async function deposit(amount) {
    return buy(
      selectedPayment.value,
      amount
    )
  }

  // ==========================================================
  // REFUND
  // ==========================================================

  async function claimRefund(contributionId) {
    refundStatus.value = 'idle'
    refundError.value = ''
    lastTxHash.value = ''

    if (!transactionReady.value) {
      refundStatus.value = 'error'

      refundError.value =
        'The presale contract is not configured.'

      return {
        ok: false,
        reason: 'not_configured'
      }
    }

    if (!isConnected.value) {
      refundStatus.value = 'error'

      refundError.value =
        'Connect a wallet first.'

      return {
        ok: false,
        reason: 'not_connected'
      }
    }

    if (isWrongNetwork.value) {
      refundStatus.value = 'error'

      refundError.value =
        `Please switch to ${config.chain.name}.`

      return {
        ok: false,
        reason: 'wrong_network'
      }
    }

    if (!refundEnabled.value) {
      refundStatus.value = 'error'

      refundError.value =
        'Refunds are currently disabled.'

      return {
        ok: false,
        reason: 'refund_disabled'
      }
    }

    if (
      contributionId === undefined ||
      contributionId === null
    ) {
      refundStatus.value = 'error'

      refundError.value =
        'Select a contribution to refund.'

      return {
        ok: false,
        reason: 'invalid_contribution'
      }
    }

    try {
      const provider = getProvider()

      if (!provider) {
        throw new Error(
          'Wallet provider is unavailable.'
        )
      }

      const signer =
        await provider.getSigner()

      const presale =
        getWriteContract(signer)

      const contribution =
        await presale.getContribution(
          contributionId
        )

      const caller =
        (
          await signer.getAddress()
        ).toLowerCase()

      if (
        contribution.buyer.toLowerCase() !==
        caller
      ) {
        refundStatus.value = 'error'

        refundError.value =
          'This contribution does not belong to the connected wallet.'

        return {
          ok: false,
          reason: 'not_contribution_owner'
        }
      }

      if (contribution.refunded) {
        refundStatus.value = 'error'

        refundError.value =
          'This contribution has already been refunded.'

        return {
          ok: false,
          reason: 'already_refunded'
        }
      }

      // ======================================================
      // HIVE APPROVAL
      // ======================================================

      const hive =
        new Contract(
          config.token.contractAddress,
          ERC20_ABI,
          signer
        )

      const owner =
        await signer.getAddress()

      const allowance =
        await hive.allowance(
          owner,
          config.presale.contractAddress
        )

      if (
        allowance <
        contribution.hiveAmount
      ) {
        refundStatus.value =
          'approving'

        const approveTx =
          await hive.approve(
            config.presale.contractAddress,
            contribution.hiveAmount
          )

        await approveTx.wait()
      }

      // ======================================================
      // REFUND TRANSACTION
      // ======================================================

      refundStatus.value =
        'refunding'

      const tx =
        await presale.refund(
          contributionId
        )

      lastTxHash.value =
        tx.hash

      await tx.wait()

      refundStatus.value =
        'success'

      await refreshPresaleData()

      return {
        ok: true,
        hash: tx.hash
      }

    } catch (err) {
      console.error(
        'Refund failed:',
        err
      )

      refundStatus.value =
        'error'

      refundError.value =
        err?.shortMessage ||
        err?.reason ||
        err?.message ||
        'The refund transaction failed.'

      return {
        ok: false,
        reason: 'refund_failed'
      }
    }
  }

  // ==========================================================
  // PANEL COMPATIBILITY ALIASES
  // ==========================================================

  const buyStatus = computed(
    () => contributionStatus.value
  )

  const buyError = computed(
    () => contributionError.value
  )

  // ==========================================================
  // RETURN EVERYTHING
  // ==========================================================

  return {
    // --------------------------------------------------------
    // Presale state
    // --------------------------------------------------------

    raisedUsd,
    raisedLoaded,

    recentContributions,

    refundEnabled,
    refundLoaded,

    transactionReady,

    hasStarted,
    hasEnded,

    targetReached,
    percentRaised,

    refundAvailable,

    // --------------------------------------------------------
    // Payment selection
    // --------------------------------------------------------

    selectedPayment,
    setPaymentMethod,
    paymentMethods,

    bnbEnabled,
    usdtEnabled,
    fdusdEnabled,

    // --------------------------------------------------------
    // Payment rates
    // --------------------------------------------------------

    bnbRate,
    usdtRate,
    fdusdRate,

    // --------------------------------------------------------
    // Contribution state
    // --------------------------------------------------------

    contributionStatus,
    contributionError,

    buyStatus,
    buyError,

    depositStatus,
    depositError,

    lastTxHash,

    // --------------------------------------------------------
    // Refund state
    // --------------------------------------------------------

    refundStatus,
    refundError,

    // --------------------------------------------------------
    // Helpers
    // --------------------------------------------------------

    usdToHive,
    hiveToUsd,
    getPaymentTypeName,

    quote,

    // --------------------------------------------------------
    // Reads
    // --------------------------------------------------------

    refreshRaised,
    refreshRefundStatus,
    refreshRecentContributions,
    refreshPaymentMethods,
    refreshPresaleData,

    getMyContributions,
    getRefundableContribution,

    // --------------------------------------------------------
    // Purchases
    // --------------------------------------------------------

    buy,
    buyWithBNB,
    buyWithUSDT,
    buyWithFDUSD,

    // --------------------------------------------------------
    // Old API
    // --------------------------------------------------------

    deposit,

    // --------------------------------------------------------
    // Refund
    // --------------------------------------------------------

    claimRefund
  }
}