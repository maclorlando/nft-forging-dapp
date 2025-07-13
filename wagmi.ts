import { http, createConfig, useChains } from "wagmi";
import { base } from "wagmi/chains";
import { getDefaultWallets } from '@rainbow-me/rainbowkit';


const { connectors } = getDefaultWallets({
  appName: "magic-alchemy-forge",
  projectId: process.env.NEXT_PUBLIC_PROJECT_ID!, // add project ID
});

export const wagmiConfig = createConfig({
  chains: [base],
  transports: {
    [base.id]: http(process.env.NEXT_PUBLIC_RPC_URL!), // Alchemy or custom RPC
  },
  ssr: true,
  connectors
});
