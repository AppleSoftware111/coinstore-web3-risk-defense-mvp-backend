import { type Address, type Hex, getAddress, isAddress, pad } from "viem";
import type { ChainClient } from "./chainClient.js";
import { EIP1967_IMPLEMENTATION_SLOT } from "./constants.js";

const ZERO = "0x0000000000000000000000000000000000000000" as Address;

export async function resolveEip1967Implementation(
  client: ChainClient,
  chainId: number,
  proxyAddress: Address,
): Promise<Address | null> {
  const slot = pad(EIP1967_IMPLEMENTATION_SLOT as Hex, { size: 32 });
  const raw = await client.getStorageAt(chainId, proxyAddress, slot);
  if (!raw || raw === `0x${"0".repeat(64)}`) return null;
  const last20 = `0x${raw.slice(-40)}`;
  if (!isAddress(last20)) return null;
  const normalized = getAddress(last20);
  return normalized.toLowerCase() === ZERO.toLowerCase() ? null : normalized;
}

export function bytecodeSuggestsProxy(bytecode: Hex): boolean {
  const value = bytecode.toLowerCase();
  return value.includes("363d3d373d3d3d363d73") || value.includes("eip1967");
}
