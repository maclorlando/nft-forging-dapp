import { useEffect, useState, useCallback } from "react";
import { useAccount, usePublicClient } from "wagmi";
import { MY1155_ADDRESS, My1155ABI, TOKENS } from "./useContracts";

export function useAllBalances() {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const [balances, setBalances] = useState<Record<number, number>>({});

  const fetchBalances = useCallback(async () => {
    if (!address) return;
    const results = await Promise.all(
      TOKENS.map((token) =>
        publicClient.readContract({
          address: MY1155_ADDRESS,
          abi: My1155ABI,
          functionName: "balanceOf",
          args: [address, token.id],
        })
      )
    );
    const mapped = TOKENS.reduce((acc, t, i) => {
      acc[t.id] = Number(results[i]);
      return acc;
    }, {} as Record<number, number>);
    setBalances(mapped);
  }, [address]);

  useEffect(() => {
    fetchBalances();
  }, [fetchBalances]);

  return { balances, refetchBalances: fetchBalances };
}
