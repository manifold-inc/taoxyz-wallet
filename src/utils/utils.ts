import type { Slippage } from "../types/client";

export const generateId = (): number => {
  return Math.floor(Math.random() * 1000000);
};

export const calculateSlippage = (
  alphaIn: number,
  taoIn: number,
  amount: number,
  toAlpha: boolean
): Slippage => {
  // Moving stake between validators in the same subnet
  if (toAlpha && taoIn === 0) {
    const actualAmount = (alphaIn * amount) / (alphaIn + amount);
    const slippagePercentage = ((amount - actualAmount) / amount) * 100;

    return {
      tokens: actualAmount,
      slippagePercentage,
    };
  }

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
