# Neural Hive

A Vue 3 + Vite one-page site (plain JavaScript, no TypeScript) for Neural Hive: the
narrative/manifesto sections, the interactive Hive architecture diagram, and a
presale panel with wallet connect, a live USD → HIVE calculator, and a `deposit`
flow wired against a presale smart contract.

## Running it

```bash
npm install
cp .env.example .env   # then fill in real values, see below
npm run dev
```

`npm run build` produces a static `dist/` folder you can host anywhere.

## Configuration

Every configurable value lives in `.env` and is read in exactly one place,
`src/config/index.js`. Nothing else in the codebase touches `import.meta.env`
directly. See `.env.example` for the full list with comments: token identity,
presale contract address, payment token, chain/network, price, target,
minimum contribution, dates, and the links used in the "Verify Everything"
section.

## `VITE_PRESALE_ACTIVE` and the deposit flow, read this before going live

`VITE_PRESALE_ACTIVE=true|false` is the master switch for the presale UI. But
it is **deliberately not the only gate** on whether the app can move real
funds. `src/config/index.js` exports `isPresaleTransactionReady()`, which only
returns `true` when **all three** of these hold:

1. `VITE_PRESALE_ACTIVE` is `true`
2. `VITE_PRESALE_CONTRACT_ADDRESS` is not the placeholder zero address
3. `VITE_PAYMENT_TOKEN_ADDRESS` is not the placeholder zero address

`src/composables/usePresale.js` checks this before every `deposit()` call. As
shipped, with the placeholder addresses in `.env.example`, the presale panel
renders the full flow (wallet connect, amount entry, review screen) but the
`deposit()` function will refuse to submit a transaction and shows an
explanatory message instead. This is intentional: it means the UI is
demoable and reviewable end to end without being able to accidentally take
money from anyone.

**To go live**, in order:

1. Have your presale/escrow contract written and independently audited. It
   needs to expose (at minimum) the four methods declared in
   `PRESALE_ABI` inside `src/composables/usePresale.js`:
   `deposit(uint256)`, `totalRaised()`, `contributions(address)`,
   `refund()`, `isRefundEligible(address)`. Update that ABI to match your
   real contract's ABI once it's finalized, and swap in the real
   `TOKEN_ABI`/`ERC20_ABI` if your payment token differs from a standard
   ERC-20.
2. Deploy the contract, then set `VITE_PRESALE_CONTRACT_ADDRESS`,
   `VITE_TOKEN_CONTRACT_ADDRESS`, and `VITE_PAYMENT_TOKEN_ADDRESS` in `.env`
   to the real, deployed addresses.
3. Have the legal side of the refund promise (Section "What if we don't
   reach the target") actually match what the contract enforces on-chain.
   The site's copy is written to say "our intention is" / "subject to the
   final smart-contract and legal structure" rather than an unconditional
   guarantee, on purpose, until that's true.
4. Only then set `VITE_PRESALE_ACTIVE=true` and deploy.

If you flip `VITE_PRESALE_ACTIVE=true` without doing 1–3, the UI will say so
plainly ("Preview, not yet transactional") rather than pretending to be live.

## Wallet support

`src/composables/useWallet.js` connects to any injected wallet
(MetaMask, Coinbase Wallet, Trust Wallet, etc., anything on
`window.ethereum`). WalletConnect is stubbed with a clear message rather than
silently failing: wire in `@walletconnect/ethereum-provider` and your
`VITE_WALLETCONNECT_PROJECT_ID` (from https://cloud.walletconnect.com) to
finish it.

The app never asks for a seed phrase, private key, or wallet password, and
never could: every transaction goes through the wallet's own `request` /
`signer` methods, so the user's wallet software handles signing.

## What's real vs. what's a placeholder right now

- **Real, working**: all narrative sections, the interactive architecture
  diagram, the control-switch illustration, the token calculator, wallet
  connect/disconnect, network detection and switching, the review-then-
  confirm deposit flow, and the guard logic described above.
- **Placeholder, needs your input**: contract addresses, the exact ABI (this
  ships with a minimal illustrative one), RPC URL, WalletConnect project ID,
  and the documentation/audit/GitHub links in the transparency section.
- **Not implemented on purpose**: no backend indexer for `totalRaised()` beyond
  a direct on-chain read, no email/waitlist capture, no CMS. Add these if you
  need them.

## Project structure

```
src/
  config/index.js        single source of truth for env-driven values
  composables/
    useWallet.js          wallet connect/disconnect/network switch
    usePresale.js          calculator, deposit(), refund(), raised total
  directives/reveal.js    the one scroll-reveal treatment used site-wide
  components/             one component per section, in page order in App.vue
```


## Routes
- `/` Vision
- `/architecture` Live Hive architecture
- `/presale` Dedicated presale + wallet connection

## Typography
Set `VITE_FONT_SIZE` to test type scale. Leave `VITE_FONT_FAMILY` unset for the default type. Set it to `Cambria, Georgia, serif` to switch to Cambria.
