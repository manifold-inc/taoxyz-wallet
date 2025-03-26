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

export const slippageSwapCalculation = (
  alphaIn: bigint,
  taoIn: bigint,
  amountInRao: bigint,
  toAlpha: boolean
): Slippage => {
  let slippage: bigint;
  let slippagePercentage: number;
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
    // TODO: Verify this is correct
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
};

// TODO: Verify this is correct
export const slippageStakeCalculation = (
  alphaIn: bigint,
  taoIn: bigint,
  amountInRao: bigint
): Slippage => {
  const unstakeResult = slippageSwapCalculation(
    alphaIn,
    taoIn,
    amountInRao,
    false
  );
  console.log("input", alphaIn, taoIn, amountInRao);
  console.log("unstakeResult", unstakeResult);

  const newAlphaIn = alphaIn - taoToRao(unstakeResult.tokens);
  const newTaoIn = taoIn + amountInRao;

  console.log("new alpha and tao", newAlphaIn, newTaoIn);

  const restakeResult = slippageSwapCalculation(
    newAlphaIn,
    newTaoIn,
    taoToRao(unstakeResult.tokens),
    true
  );

  console.log("restakeResult", restakeResult);

  // Total tokens received after both operations
  const totalTokens = restakeResult.tokens;

  // Calculate total slippage percentage
  // This is the sum of both slippage percentages since they're sequential operations
  const totalSlippagePercentage =
    unstakeResult.slippagePercentage + restakeResult.slippagePercentage;

  return {
    tokens: totalTokens,
    slippagePercentage: totalSlippagePercentage,
  };
};
