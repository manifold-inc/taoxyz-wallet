import type { Slippage } from "../types/client";

export const generateId = (): number => {
  return Math.floor(Math.random() * 1000000);
};

export const taoToRao = (amount: number): bigint => {
  if (isNaN(amount)) return BigInt(0);
  return BigInt(Math.floor(amount * 1e9));
};

export const raoToTao = (amount: bigint): number => {
  return Number(amount) / 1e9;
};

export const slippageStakeCalculation = (
  alphaIn: bigint,
  taoIn: bigint,
  amountInRao: bigint,
  toAlpha: boolean,
  isDynamic?: boolean
): Slippage => {
  let slippage: bigint;
  let slippagePercentage: number;
  // Slippage for Dynamic Tao
  if (isDynamic) {
    const k = alphaIn * taoIn;
    if (toAlpha) {
      const newTaoIn = taoIn + amountInRao;
      const newAlphaIn = k / newTaoIn;
      const alphaReturned = alphaIn - newAlphaIn;
      const alphaIdeal = (alphaIn / taoIn) * amountInRao;

      if (alphaIdeal > alphaReturned) {
        slippage = alphaIdeal - alphaReturned;
      } else {
        slippage = 0n;
      }

      if (slippage + alphaReturned != 0n) {
        slippagePercentage =
          (100 * Number(slippage)) / Number(slippage + alphaReturned);
      } else {
        slippagePercentage = 0;
      }

      return {
        tokens: raoToTao(alphaReturned),
        slippagePercentage,
      };
    } else {
      const newAlphaIn = alphaIn + amountInRao;
      const newTaoReserve = k / newAlphaIn;
      const taoReturned = taoIn - newTaoReserve;
      const taoIdeal = (taoIn / alphaIn) * amountInRao;

      if (taoIdeal > taoReturned) {
        slippage = taoIdeal - taoReturned;
      } else {
        slippage = 0n;
      }

      if (slippage + taoReturned != 0n) {
        slippagePercentage =
          (100 * Number(slippage)) / Number(slippage + taoReturned);
      } else {
        slippagePercentage = 0;
      }

      return {
        tokens: raoToTao(taoReturned),
        slippagePercentage,
      };
    }
  }

  // Slippage for Staking on Root
  const taoReturned = raoToTao(amountInRao);
  return {
    tokens: taoReturned,
    slippagePercentage: 0,
  };
};

export const slippageMoveStakeCalculation = (
  alphaIn: bigint,
  taoIn: bigint,
  amountInRao: bigint
): Slippage => {
  const unstakeResult = slippageStakeCalculation(
    alphaIn,
    taoIn,
    amountInRao,
    false,
    true
  );

  const newAlphaIn = alphaIn - taoToRao(unstakeResult.tokens);
  const newTaoIn = taoIn + amountInRao;

  const restakeResult = slippageStakeCalculation(
    newAlphaIn,
    newTaoIn,
    taoToRao(unstakeResult.tokens),
    true,
    true
  );

  const totalTokens = restakeResult.tokens;
  const totalSlippagePercentage =
    unstakeResult.slippagePercentage + restakeResult.slippagePercentage;

  return {
    tokens: totalTokens,
    slippagePercentage: totalSlippagePercentage,
  };
};
