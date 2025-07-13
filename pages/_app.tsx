import "@mantine/core/styles.css";
import "@rainbow-me/rainbowkit/styles.css";
import "../styles/globals.css";

import { WagmiProvider } from "wagmi";
import { wagmiConfig } from "../wagmi";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

export default function App({ Component, pageProps }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <MantineProvider theme={{ primaryColor: "blue", defaultRadius: "md" }}>
            <Notifications />
            <Component {...pageProps} />
          </MantineProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
