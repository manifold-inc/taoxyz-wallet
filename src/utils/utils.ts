import type { Slippage } from "../types/client";

export const generateId = (): number => {
  return Math.floor(Math.random() * 1000000);
};

export const taoToRao = (amount: number): bigint => {
  return BigInt(Math.floor(amount * 1e9));
};

export const calculateSlippage = (
  alphaIn: number,
  taoIn: number,
  amount: number,
  toAlpha: boolean
): Slippage => {
  // Regular token swap calculations
  const amountRao = amount * 1e9;
  if (toAlpha) {
    const spotPrice = alphaIn / taoIn;
    const idealAmount = amount * spotPrice;

    const actualAmount = (alphaIn * amountRao) / (taoIn + amountRao);
    const actualAmountNormalized = actualAmount / 1e9;

    const slippagePercentage =
      ((idealAmount - actualAmountNormalized) / idealAmount) * 100;

    return {
      tokens: actualAmountNormalized,
      slippagePercentage,
    };
  } else {
    const spotPrice = taoIn / alphaIn;
    const idealAmount = amount * spotPrice;

    const actualAmount = (taoIn * amountRao) / (alphaIn + amountRao);
    const actualAmountNormalized = actualAmount / 1e9;

    const slippagePercentage =
      ((idealAmount - actualAmountNormalized) / idealAmount) * 100;

    return {
      tokens: actualAmountNormalized,
      slippagePercentage,
    };
  }
};
