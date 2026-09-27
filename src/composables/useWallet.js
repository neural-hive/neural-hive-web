import { ref, computed } from 'vue'
import { BrowserProvider } from 'ethers'
import { config } from '../config/index.js'

// ============================================================
// STATE
// ============================================================

const address = ref(null)
const chainId = ref(null)
const status = ref('idle')
const errorMessage = ref('')
const providerName = ref('')
const detectedWallets = ref([])

let provider = null
let activeInjected = null

// Keep references to the currently attached listeners so that
// we can remove them when switching wallets.
let accountsChangedHandler = null
let chainChangedHandler = null

// Used to avoid duplicate refresh timers.
let fallbackDetectionTimer = null

// ============================================================
// WALLET NAME
// ============================================================

function walletName(p) {
  if (!p) {
    return 'Browser Wallet'
  }

  // Trust Wallet can expose compatibility flags.
  if (
    p.isTrust ||
    p.isTrustWallet
  ) {
    return 'Trust Wallet'
  }

  // Phantom can expose isMetaMask for compatibility.
  if (p.isPhantom) {
    return 'Phantom'
  }

  if (p.isOKXWallet) {
    return 'OKX Wallet'
  }

  if (p.isRabby) {
    return 'Rabby'
  }

  if (p.isCoinbaseWallet) {
    return 'Coinbase Wallet'
  }

  if (p.isBraveWallet) {
    return 'Brave Wallet'
  }

  if (p.isMetaMask) {
    return 'MetaMask'
  }

  return 'Browser Wallet'
}

// ============================================================
// WALLET ICON
// ============================================================

function iconFor(name) {
  return {
    'MetaMask': 'M',
    'Coinbase Wallet': 'C',
    'Rabby': 'R',
    'Trust Wallet': 'T',
    'OKX Wallet': 'O',
    'Phantom': 'P',
    'Brave Wallet': 'B'
  }[name] || '◈'
}

// ============================================================
// NORMALIZE NAME
// ============================================================

function normalizeName(name) {
  return String(name || '')
    .trim()
    .toLowerCase()
}

// ============================================================
// ADD WALLET
// ============================================================

function addDetectedWallet(
  walletProvider,
  name = null,
  rdns = null,
  uuid = null
) {
  if (!walletProvider) {
    return
  }

  const resolvedName =
    name ||
    walletName(walletProvider)

  /*
   * EIP-6963 identity is preferred.
   *
   * UUID is the strongest identifier when supplied.
   * RDNS is the next-best identifier.
   *
   * For old injected wallets, fall back to the wallet name.
   */
  const identity =
    uuid
      ? `uuid:${uuid}`
      : rdns
        ? `rdns:${rdns}`
        : `name:${normalizeName(resolvedName)}`

  /*
   * Don't add the same wallet twice.
   */
  const existing =
    detectedWallets.value.find(
      wallet =>
        wallet.identity === identity
    )

  if (existing) {
    /*
     * If EIP-6963 gave us a better provider,
     * update the existing entry.
     */
    existing.provider =
      walletProvider

    existing.name =
      resolvedName

    existing.icon =
      iconFor(resolvedName)

    return
  }

  detectedWallets.value.push({
    id:
      uuid
        ? `eip6963-${uuid}`
        : rdns
          ? `eip6963-${rdns}`
          : normalizeName(
              resolvedName
            ).replace(/\s+/g, '-'),

    identity,

    name:
      resolvedName,

    detail:
      rdns || uuid
        ? 'EIP-6963 wallet'
        : 'Browser extension',

    icon:
      iconFor(resolvedName),

    provider:
      walletProvider,

    rdns,
    uuid
  })
}

// ============================================================
// REQUEST EIP-6963 PROVIDERS
// ============================================================

function requestEip6963Providers() {
  if (
    typeof window === 'undefined'
  ) {
    return
  }

  window.dispatchEvent(
    new Event(
      'eip6963:requestProvider'
    )
  )
}

// ============================================================
// FALLBACK: WINDOW.ETHEREUM
// ============================================================

function detectInjectedFallback() {
  if (
    typeof window === 'undefined'
  ) {
    return
  }

  const ethereum =
    window.ethereum

  if (!ethereum) {
    return
  }

  /*
   * Some browsers/wallets expose multiple
   * injected providers here.
   */
  const providers =
    Array.isArray(
      ethereum.providers
    )
      ? ethereum.providers
      : [ethereum]

  for (
    const walletProvider
    of providers
  ) {
    if (!walletProvider) {
      continue
    }

    const name =
      walletName(
        walletProvider
      )

    /*
     * If EIP-6963 already detected a wallet with
     * the same recognizable name, don't add another
     * fallback copy.
     */
    const exists =
      detectedWallets.value.some(
        wallet =>
          normalizeName(
            wallet.name
          ) ===
          normalizeName(name)
      )

    if (!exists) {
      addDetectedWallet(
        walletProvider,
        name
      )
    }
  }
}

// ============================================================
// REFRESH WALLETS
// ============================================================

function refreshWallets() {
  if (
    typeof window === 'undefined'
  ) {
    return
  }

  /*
   * Cancel any previous fallback timer.
   */
  if (
    fallbackDetectionTimer
  ) {
    clearTimeout(
      fallbackDetectionTimer
    )

    fallbackDetectionTimer =
      null
  }

  /*
   * Start clean.
   */
  detectedWallets.value = []

  /*
   * Ask EIP-6963 wallets to announce themselves.
   */
  requestEip6963Providers()

  /*
   * Give EIP-6963 wallets a short moment to announce.
   *
   * Then inspect window.ethereum for wallets that
   * don't support EIP-6963.
   */
  fallbackDetectionTimer =
    setTimeout(() => {

      detectInjectedFallback()

      fallbackDetectionTimer =
        null

    }, 150)
}

// ============================================================
// EIP-6963 LISTENER
// ============================================================

if (
  typeof window !== 'undefined'
) {

  window.addEventListener(
    'eip6963:announceProvider',
    event => {

      const walletProvider =
        event.detail?.provider

      const info =
        event.detail?.info

      if (!walletProvider) {
        return
      }

      const name =
        info?.name ||
        walletName(
          walletProvider
        )

      const rdns =
        info?.rdns ||
        null

      const uuid =
        info?.uuid ||
        null

      console.log(
        '[Wallet] EIP-6963 detected:',
        {
          name,
          rdns,
          uuid
        }
      )

      addDetectedWallet(
        walletProvider,
        name,
        rdns,
        uuid
      )
    }
  )

  /*
   * Initial detection.
   */
  refreshWallets()
}

// ============================================================
// COMPOSABLE
// ============================================================

export function useWallet() {

  // ==========================================================
  // COMPUTED
  // ==========================================================

  const isConnected =
    computed(() => {
      return (
        status.value ===
          'connected' &&
        !!address.value
      )
    })

  const isWrongNetwork =
    computed(() => {
      return (
        isConnected.value &&
        chainId.value !== null &&
        chainId.value !==
          config.chain.id
      )
    })

  const shortAddress =
    computed(() => {

      if (!address.value) {
        return ''
      }

      return (
        address.value.slice(0, 6) +
        '…' +
        address.value.slice(-4)
      )
    })

  // ==========================================================
  // REMOVE PROVIDER LISTENERS
  // ==========================================================

  function removeProviderListeners() {

    if (
      !activeInjected
    ) {
      return
    }

    if (
      accountsChangedHandler
    ) {
      activeInjected.removeListener?.(
        'accountsChanged',
        accountsChangedHandler
      )
    }

    if (
      chainChangedHandler
    ) {
      activeInjected.removeListener?.(
        'chainChanged',
        chainChangedHandler
      )
    }

    accountsChangedHandler =
      null

    chainChangedHandler =
      null
  }

  // ==========================================================
  // CONNECT
  // ==========================================================

  async function connect(
    walletType = null
  ) {

    errorMessage.value = ''

    try {

      status.value =
        'connecting'

      let injected = null

      // ======================================================
      // WALLETCONNECT
      // ======================================================

      if (
        walletType ===
        'walletconnect'
      ) {

        if (
          !config.walletConnectProjectId ||
          config.walletConnectProjectId.startsWith(
            'REPLACE'
          )
        ) {
          throw new Error(
            'Add VITE_WALLETCONNECT_PROJECT_ID to .env to enable WalletConnect.'
          )
        }

        const {
          EthereumProvider
        } = await import(
          '@walletconnect/ethereum-provider'
        )

        injected =
          await EthereumProvider.init({
            projectId:
              config.walletConnectProjectId,

            chains: [
              config.chain.id
            ],

            showQrModal:
              true,

            optionalChains: [
              config.chain.id
            ]
          })

        await injected.connect()

      }

      // ======================================================
      // DETECTED BROWSER WALLET
      // ======================================================

      else {

        if (!walletType) {
          throw new Error(
            'Please select a wallet.'
          )
        }

        const selected =
          detectedWallets.value.find(
            wallet =>
              wallet.id ===
              walletType
          )

        if (!selected) {

          console.error(
            '[Wallet] Available wallets:',
            detectedWallets.value
          )

          throw new Error(
            'The selected wallet was not detected. Please refresh the page and try again.'
          )
        }

        /*
         * VERY IMPORTANT:
         *
         * Use the provider belonging to the
         * selected wallet.
         *
         * Do NOT replace it with window.ethereum.
         */
        injected =
          selected.provider

        console.log(
          '[Wallet] Selected:',
          selected.name
        )

        console.log(
          '[Wallet] Provider:',
          injected
        )

        if (
          !injected?.request
        ) {
          throw new Error(
            'The selected wallet provider is invalid.'
          )
        }

        await injected.request({
          method:
            'eth_requestAccounts'
        })
      }

      // ======================================================
      // CREATE ETHERS PROVIDER
      // ======================================================

      provider =
        new BrowserProvider(
          injected
        )

      // ======================================================
      // GET ACCOUNT
      // ======================================================

      const accounts =
        await provider.send(
          'eth_accounts',
          []
        )

      if (
        !accounts ||
        accounts.length === 0
      ) {
        throw new Error(
          'No account was returned by the wallet.'
        )
      }

      // ======================================================
      // GET NETWORK
      // ======================================================

      const network =
        await provider.getNetwork()

      // ======================================================
      // CLEAN OLD LISTENERS
      // ======================================================

      removeProviderListeners()

      // ======================================================
      // SAVE ACTIVE PROVIDER
      // ======================================================

      activeInjected =
        injected

      // ======================================================
      // SAVE STATE
      // ======================================================

      address.value =
        accounts[0]

      chainId.value =
        Number(
          network.chainId
        )

      if (
        walletType ===
        'walletconnect'
      ) {
        providerName.value =
          'WalletConnect'
      } else {

        const selected =
          detectedWallets.value.find(
            wallet =>
              wallet.id ===
              walletType
          )

        providerName.value =
          selected?.name ||
          walletName(
            injected
          )
      }

      status.value =
        'connected'

      console.log(
        '[Wallet] Connected:',
        providerName.value
      )

      console.log(
        '[Wallet] Address:',
        address.value
      )

      console.log(
        '[Wallet] Chain:',
        chainId.value
      )

      // ======================================================
      // ACCOUNT CHANGED
      // ======================================================

      accountsChangedHandler =
        accounts => {

          if (
            !accounts ||
            accounts.length === 0
          ) {
            disconnect()
            return
          }

          address.value =
            accounts[0]
        }

      injected.on?.(
        'accountsChanged',
        accountsChangedHandler
      )

      // ======================================================
      // NETWORK CHANGED
      // ======================================================

      chainChangedHandler =
        async hexChainId => {

          chainId.value =
            parseInt(
              hexChainId,
              16
            )

          /*
           * Re-create the ethers provider
           * around the same wallet provider.
           */
          if (
            activeInjected
          ) {
            provider =
              new BrowserProvider(
                activeInjected
              )
          }
        }

      injected.on?.(
        'chainChanged',
        chainChangedHandler
      )

    } catch (err) {

      console.error(
        '[Wallet] Connection failed:',
        err
      )

      status.value =
        'error'

      errorMessage.value =
        err?.shortMessage ||
        err?.message ||
        'Could not connect to wallet.'
    }
  }

  // ==========================================================
  // SWITCH NETWORK
  // ==========================================================

  async function switchNetwork() {

    const injected =
      activeInjected

    if (
      !injected
    ) {
      errorMessage.value =
        'No wallet is connected.'

      return
    }

    try {

      await injected.request({
        method:
          'wallet_switchEthereumChain',

        params: [
          {
            chainId:
              '0x' +
              Number(
                config.chain.id
              ).toString(16)
          }
        ]
      })

      /*
       * Refresh the network after switching.
       */
      if (provider) {

        const network =
          await provider.getNetwork()

        chainId.value =
          Number(
            network.chainId
          )
      }

    } catch (err) {

      console.error(
        '[Wallet] Network switch failed:',
        err
      )

      errorMessage.value =
        err?.shortMessage ||
        err?.message ||
        'Could not switch network.'
    }
  }

  // ==========================================================
  // DISCONNECT
  // ==========================================================

  function disconnect() {

    removeProviderListeners()

    address.value =
      null

    chainId.value =
      null

    providerName.value =
      ''

    status.value =
      'idle'

    errorMessage.value =
      ''

    provider =
      null

    activeInjected =
      null
  }

  // ==========================================================
  // RETURN API
  // ==========================================================

  return {

    address,
    chainId,

    status,
    errorMessage,
    providerName,

    isConnected,
    isWrongNetwork,

    shortAddress,

    connect,
    disconnect,
    switchNetwork,

    getProvider: () =>
      provider,

    detectedWallets,
    refreshWallets
  }
}
