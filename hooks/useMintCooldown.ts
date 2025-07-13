import { useAccount, usePublicClient } from "wagmi";
import { useEffect, useState } from "react";
import { My1155ABI, MY1155_ADDRESS } from "./useContracts";

export function useMintCooldown() {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    if (!address) return;
    async function fetch() {
      try {
        const lastMint = await publicClient.readContract({
          address: MY1155_ADDRESS,
          abi: My1155ABI,
          functionName: "lastMintTime",
          args: [address],
        }) as bigint;
        const now = Math.floor(Date.now() / 1000);
        const diff = Number(lastMint) + 60 - now;
        setRemaining(diff > 0 ? diff : 0);
      } catch (err) {
        console.error("Cooldown fetch failed", err);
      }
    }
    fetch();
    const interval = setInterval(fetch, 1000);
    return () => clearInterval(interval);
  }, [address]);

  return remaining;
}
