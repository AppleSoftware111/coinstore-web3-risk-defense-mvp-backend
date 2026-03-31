import { z } from "zod";
import { isAddress } from "viem";
import { getChainEntry } from "../chains/registry.js";

export const analyzeRequestSchema = z
  .object({
    tokenAddress: z.string().refine((value) => isAddress(value), "Invalid token address"),
    walletAddress: z.string().refine((value) => isAddress(value), "Invalid wallet address"),
    chainId: z.number().int().positive(),
    action: z.enum(["BUY", "SELL", "TRANSFER"]),
    amount: z.string().optional(),
  })
  .superRefine((value, ctx) => {
    const chain = getChainEntry(value.chainId);
    if (!chain) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["chainId"],
        message: `Unsupported network: chainId ${value.chainId} is not enabled`,
      });
    }
  });

export const killSwitchSchema = z.object({
  enabled: z.boolean().default(true),
  tokens: z.array(z.string()).default([]),
  wallets: z.array(z.string()).default([]),
});
