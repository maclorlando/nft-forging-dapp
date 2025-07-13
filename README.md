# 🧪 Magic Alchemy — NFT Forging dApp

A Web3 dApp built with Next.js, Wagmi v2, RainbowKit, and Mantine UI for minting and forging ERC-1155 NFTs on **Base Mainnet**.

---

## 🌐 Live Demo

🚀 Try the live dApp here:  
👉 [magic-alchemy-forge.vercel.app](https://magic-alchemy-forge.vercel.app)

### 📄 Deployed Contracts (Base Mainnet)

| Contract            | Address |
|----------------------|-----------------------------------------------|
| ERC-1155 NFT         | 0x36680cDF9b7E0acE05672D4d25C9f1297e79A901    |
| Forge Contract       | 0x90BBf46888fE1a4a63fb9b36A670E5E94d8A4bD2    |
| Network              | Base Mainnet (chainId: 8453)                  |

---

## 🚀 Features

- 🌿 Free Mint tokens with cooldown
- 🧪 Forge new items by combining ingredients
- 🔁 Trade any token for base ingredients
- ✅ Approval flow + error handling
- 🔢 Realtime balance updates after transactions
- 🎨 Dark fantasy theme with OpenSea integration

---

## 🔧 Technologies

- [Next.js 14](https://nextjs.org/)
- [Wagmi v2](https://wagmi.sh/)
- [RainbowKit](https://www.rainbowkit.com/)
- [Mantine](https://mantine.dev/)
- [Base Mainnet](https://base.org/)

---
## 🛠️ Local Setup Instructions

1. Clone repo

2. Install dependencies, from root run:
    npm install

3. Create .env.local
Create a .env.local file in the root directory replace with your/valid info:

NEXT_PUBLIC_CONTRACT_ADDRESS=0xYour1155OnBase

NEXT_PUBLIC_FORGE_ADDRESS=0xYourForgeOnBase

NEXT_PUBLIC_CHAIN_ID=8453

NEXT_PUBLIC_CHAIN_NAME=Base

NEXT_PUBLIC_RPC_URL=https://base-mainnet.g.alchemy.com/v2/your-alchemy-key

Replace the contract addresses and RPC URL with your actual deployed values.

4. Run the frontend locally
npm run dev
Then open your browser at:
http://localhost:3000