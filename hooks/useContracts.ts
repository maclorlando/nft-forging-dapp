import { useAccount, useWriteContract, useReadContract } from "wagmi";
import { usePublicClient, useWalletClient } from 'wagmi';
import { base  } from "wagmi/chains";
import My1155ABIJson from "../contracts/My1155.json";
import ForgeABIJson from "../contracts/Forge.json";

export const My1155ABI = My1155ABIJson.abi;
export const ForgeABI = ForgeABIJson.abi;

export const MY1155_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`;
export const FORGE_ADDRESS = process.env.NEXT_PUBLIC_FORGE_ADDRESS as `0x${string}`;
export const CHAIN_ID = Number(process.env.NEXT_PUBLIC_CHAIN_ID);
export const OPENSEA_COLLECTION_URL = process.env.NEXT_PUBLIC_OPENSEA_COLLECTION!;


export const TOKENS = [
  { id: 0, name: "Red Herb" },
  { id: 1, name: "Mysterious Solution" },
  { id: 2, name: "Magic Dust" },
  { id: 3, name: "Health Potion" },
  { id: 4, name: "Mana Potion" },
  { id: 5, name: "Stamina Satchel" },
  { id: 6, name: "Elixir of Power" },
];

export function useContracts() {
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  async function isApprovedForAll(owner: `0x${string}`, operator: `0x${string}`) {
    return await publicClient.readContract({
      address: MY1155_ADDRESS,
      abi: My1155ABI,
      functionName: "isApprovedForAll",
      args: [owner, operator],
    });
  }

  async function setApprovalForAll(operator: `0x${string}`, approved: boolean) {
    if (!walletClient) throw new Error("Wallet not connected");
    return await walletClient.writeContract({
      address: MY1155_ADDRESS,
      abi: My1155ABI,
      functionName: "setApprovalForAll",
      args: [operator, approved],
      chain: base,
      account: address
    });
  }

  const mint = async (tokenId: number) => {
    if (!address) throw new Error("Connect wallet first");
    return writeContractAsync({
      address: MY1155_ADDRESS,
      abi: My1155ABI,
      functionName: "mintFree",
      args: [tokenId],
      account: address,
      chain: base,
    });
  };

  const forge = async (targetId: number) => {
    if (!address) throw new Error("Connect wallet first");
    return writeContractAsync({
      address: FORGE_ADDRESS,
      abi: ForgeABI,
      functionName: "forgeToken",
      args: [targetId],
      account: address,
      chain: base,
    });
  };

  const trade = async (fromId: number, toId: number) => {
    if (!address) throw new Error("Connect wallet first");
    return writeContractAsync({
      address: FORGE_ADDRESS,
      abi: ForgeABI,
      functionName: "tradeToken",
      args: [fromId, toId],
      account: address,
      chain: base,
    });
  };

  const getBalanceOf = (tokenId: number) => {
    return useReadContract({
      address: MY1155_ADDRESS,
      abi: My1155ABI,
      functionName: "balanceOf",
      args: [address!, tokenId],
      query: {
        enabled: !!address,
      },
    });
  };

  return {
    mint,
    forge,
    trade,
    getBalanceOf,
    isApprovedForAll,
    setApprovalForAll,
  };
}
