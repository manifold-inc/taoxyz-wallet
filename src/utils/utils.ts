import type { Slippage } from "../types/client";

const RAO_MULTIPLIER = 1_000_000_000n;

export const generateId = (): number => {
  return Math.floor(Math.random() * 1000000);
};

export const taoToRao = (amount: number): bigint => {
  return BigInt(Math.floor(amount * 1e9));
};

export const calculateSlippage = (
  alphaIn: bigint,
  taoIn: bigint,
  amountInRao: bigint,
  toAlpha: boolean
): Slippage => {
  if (toAlpha) {
    const idealAmount = (alphaIn * amountInRao) / taoIn;
    const actualAmount = (alphaIn * amountInRao) / (taoIn + amountInRao);
    const slippagePercentageBigInt =
      ((idealAmount - actualAmount) * 100n * RAO_MULTIPLIER) / idealAmount;

    const tokens = Number(actualAmount) / 1e9;
    const slippagePercentage = Number(slippagePercentageBigInt) / 1e9;

    return {
      tokens,
      slippagePercentage,
    };
  } else {
    const idealAmount = (taoIn * amountInRao) / alphaIn;
    const actualAmount = (taoIn * amountInRao) / (alphaIn + amountInRao);
    const slippagePercentageBigInt =
      ((idealAmount - actualAmount) * 100n * RAO_MULTIPLIER) / idealAmount;

    const tokens = Number(actualAmount) / 1e9;
    const slippagePercentage = Number(slippagePercentageBigInt) / 1e9;

    return {
      tokens,
      slippagePercentage,
    };
  }
};
