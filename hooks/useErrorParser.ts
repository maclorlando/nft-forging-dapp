import { getContractError } from "viem";

export function parseTxError(err: any): string {
  // Try to decode the contract revert reason
  if (err?.cause?.reason) {
    return err.cause.reason;
  }

  if (err?.cause?.message) {
    return err.cause.message;
  }

  if (err?.shortMessage) {
    return err.shortMessage;
  }

  if (err?.message) {
    return err.message;
  }

  return "Transaction failed";
}
