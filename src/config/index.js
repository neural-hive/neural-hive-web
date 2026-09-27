// Single source of truth for every configurable value in the app.
// Nothing outside this file should call import.meta.env directly —
// that keeps every placeholder and every safety check in one place.

const env = import.meta.env

function toBool(value, fallback = false) {
  if (value === undefined || value === null || value === '') return fallback
  return String(value).toLowerCase() === 'true'
}

function toNumber(value, fallback = 0) {
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

const fontSize = toNumber(env.VITE_FONT_SIZE, 17)
const fontFamily =
  env.VITE_FONT_FAMILY || "'Space Grotesk', system-ui, sans-serif"

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

export const config = {
  typography: {
    fontSize,
    fontFamily
  },

  presaleActive: toBool(env.VITE_PRESALE_ACTIVE, false),

  // ---------------------------------------------------------
  // HIVE TOKEN
  // ---------------------------------------------------------

  token: {
    symbol: env.VITE_TOKEN_SYMBOL || 'HIVE',
    name: env.VITE_TOKEN_NAME || 'Neural Hive',
    contractAddress:
      env.VITE_TOKEN_CONTRACT_ADDRESS || ZERO_ADDRESS,
    
      exchangeValue: toNumber(
        env.VITE_TOKEN_PRICE_USD,
        0.0005
      ),

    totalSupply: toNumber(
      env.VITE_TOTAL_SUPPLY,
      100_000_000_000
    )
  },

  // ---------------------------------------------------------
  // PRESALE
  // ---------------------------------------------------------

  presale: {
    contractAddress:
      env.VITE_PRESALE_CONTRACT_ADDRESS || ZERO_ADDRESS,

    paymentAddress:
      env.VITE_PAYMENT_ADDRESS || ZERO_ADDRESS,

    priceUsd: toNumber(
      env.VITE_TOKEN_PRICE_USD,
      0.0005
    ),

    supply: toNumber(
      env.VITE_PRESALE_SUPPLY,
      6_000_000_000
    ),

    targetRaiseUsd: toNumber(
      env.VITE_TARGET_RAISE_USD,
      3_000_000
    ),

    minContributionUsd: toNumber(
      env.VITE_MIN_CONTRIBUTION_USD,
      5
    ),

    startsAt:
      env.VITE_PRESALE_START || '',

    endsAt:
      env.VITE_PRESALE_END || ''
  },

  // ---------------------------------------------------------
  // NETWORK
  // ---------------------------------------------------------

  chain: {
    id: toNumber(
      env.VITE_CHAIN_ID,
      1
    ),

    name:
      env.VITE_CHAIN_NAME ||
      'Ethereum Mainnet',

    rpcUrl:
      env.VITE_RPC_URL || '',

    explorerUrl:
      env.VITE_BLOCK_EXPLORER_URL ||
      'https://etherscan.io'
  },

  // ---------------------------------------------------------
  // PAYMENT TOKEN
  //
  // KEEPING THIS EXACTLY AS paymentToken SO EXISTING CODE
  // DOES NOT BREAK.
  //
  // This is USDT.
  // ---------------------------------------------------------

  paymentToken: {
    symbol:
      env.VITE_PAYMENT_TOKEN_SYMBOL ||
      'USDT',

    address:
      env.VITE_PAYMENT_TOKEN_ADDRESS ||
      ZERO_ADDRESS,

    decimals: toNumber(
      env.VITE_PAYMENT_TOKEN_DECIMALS,
      6
    )
  },

  // ---------------------------------------------------------
  // ADDITIONAL PAYMENT TOKENS
  //
  // FDUSD is added without removing paymentToken above.
  // ---------------------------------------------------------

  paymentToken1: {
    symbol:
      env.VITE_PAYMENT_TOKEN_SYMBOL_1 ||
      'FDUSD',

    address:
      env.VITE_PAYMENT_TOKEN_ADDRESS_1 ||
      ZERO_ADDRESS,

    decimals: toNumber(
      env.VITE_PAYMENT_TOKEN_DECIMALS_1,
      6
    )
  },

  // ---------------------------------------------------------
  // NATIVE PAYMENT
  //
  // BNB is native currency, therefore it has no ERC-20
  // contract address and does not use decimals from an
  // ERC-20 contract.
  // ---------------------------------------------------------

  nativePaymentToken: {
    symbol: 'BNB'
  },

  // ---------------------------------------------------------
  // WALLETCONNECT
  // ---------------------------------------------------------

  walletConnectProjectId:
    env.VITE_WALLETCONNECT_PROJECT_ID || '',

  // ---------------------------------------------------------
  // LINKS
  // ---------------------------------------------------------

  links: {
    docs:
      env.VITE_DOCS_URL || '',

    auditReport:
      env.VITE_AUDIT_REPORT_URL || '',

    github:
      env.VITE_GITHUB_URL || '',

    discord:
      env.VITE_DISCORD_URL || '',

    x:
      env.VITE_X_URL || ''
  }
}

// ---------------------------------------------------------
// ADDRESS HELPERS
// ---------------------------------------------------------

export function isPlaceholderAddress(address) {
  if (!address) return true

  return (
    address.toLowerCase() ===
    ZERO_ADDRESS.toLowerCase()
  )
}

// ---------------------------------------------------------
// PRESALE TRANSACTION READINESS
//
// Existing paymentToken = USDT
// paymentToken1          = FDUSD
// nativePaymentToken     = BNB
//
// BNB doesn't need an address because it is native currency.
// ---------------------------------------------------------

export function isPresaleTransactionReady() {
  return (
    config.presaleActive &&

    !isPlaceholderAddress(
      config.presale.contractAddress
    ) &&

    !isPlaceholderAddress(
      config.paymentToken.address
    ) &&

    !isPlaceholderAddress(
      config.paymentToken1.address
    )
  )
}

export { ZERO_ADDRESS }