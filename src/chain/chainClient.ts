import {
  createPublicClient,
  defineChain,
  fallback,
  http,
  type Address,
  type Chain,
  type Hex,
  type PublicClient,
} from "viem";
import { CircuitBreaker } from "./circuitBreaker.js";
import { CircuitOpenError, RpcError, TimeoutError } from "./errors.js";
import { DEFAULT_RPC_TIMEOUT_MS } from "./timeouts.js";

function buildChain(chainId: number, rpcUrls: string[]): Chain {
  const [first] = rpcUrls;
  return defineChain({
    id: chainId,
    name: `chain-${chainId}`,
    nativeCurrency: { name: "Native", symbol: "NATIVE", decimals: 18 },
    rpcUrls: {
      default: { http: rpcUrls.length ? rpcUrls : [first ?? "http://127.0.0.1:8545"] },
    },
  });
}

export class ChainClient {
  private readonly clients = new Map<number, PublicClient>();
  private readonly breakers = new Map<number, CircuitBreaker>();

  constructor(private readonly rpcUrlsByChainId: ReadonlyMap<number, readonly string[]>) {}

  getRpcUrls(chainId: number): string[] {
    return [...(this.rpcUrlsByChainId.get(chainId) ?? [])];
  }

  hasConfiguredRpc(chainId: number): boolean {
    return this.getRpcUrls(chainId).length > 0;
  }

  private clientFor(chainId: number): PublicClient | null {
    const urls = this.getRpcUrls(chainId);
    if (!urls.length) return null;

    const existing = this.clients.get(chainId);
    if (existing) return existing;

    const client = createPublicClient({
      chain: buildChain(chainId, urls),
      transport: fallback(urls.map((url) => http(url, { timeout: DEFAULT_RPC_TIMEOUT_MS }))),
    });
    this.clients.set(chainId, client);
    return client;
  }

  private breakerFor(chainId: number): CircuitBreaker {
    let breaker = this.breakers.get(chainId);
    if (!breaker) {
      breaker = new CircuitBreaker();
      this.breakers.set(chainId, breaker);
    }
    return breaker;
  }

  async getBytecode(chainId: number, address: Address): Promise<Hex> {
    const client = this.clientFor(chainId);
    if (!client) throw new RpcError(`No RPC configured for chainId ${chainId}`);
    const breaker = this.breakerFor(chainId);
    if (breaker.isOpen()) throw new CircuitOpenError();

    try {
      const code = await client.getCode({ address });
      breaker.onSuccess();
      return (code ?? "0x") as Hex;
    } catch (error) {
      breaker.onFailure();
      throw error instanceof Error ? new RpcError(error.message) : new RpcError("getCode failed");
    }
  }

  async getStorageAt(chainId: number, address: Address, slot: Hex): Promise<Hex> {
    const client = this.clientFor(chainId);
    if (!client) throw new RpcError(`No RPC configured for chainId ${chainId}`);
    const breaker = this.breakerFor(chainId);
    if (breaker.isOpen()) throw new CircuitOpenError();

    try {
      const value = await client.getStorageAt({ address, slot });
      breaker.onSuccess();
      return (value ?? "0x") as Hex;
    } catch (error) {
      breaker.onFailure();
      throw error instanceof Error ? new RpcError(error.message) : new RpcError("getStorageAt failed");
    }
  }

  async call(chainId: number, params: { to: Address; data: Hex }): Promise<Hex> {
    const client = this.clientFor(chainId);
    if (!client) throw new RpcError(`No RPC configured for chainId ${chainId}`);
    const breaker = this.breakerFor(chainId);
    if (breaker.isOpen()) throw new CircuitOpenError();

    try {
      const result = await client.call({ to: params.to, data: params.data });
      breaker.onSuccess();
      return (result.data ?? "0x") as Hex;
    } catch (error) {
      breaker.onFailure();
      if (error instanceof Error && error.name === "AbortError") throw new TimeoutError();
      throw error instanceof Error ? new RpcError(error.message) : new RpcError("eth_call failed");
    }
  }
}
