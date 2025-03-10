import type { Slippage } from "../types/client";

// Generates a random ID to keep track of requests
export const generateId = (): number => {
  return Math.floor(Math.random() * 1000000);
};

export const calculateSlippage = (
  alphaIn: number,
  taoIn: number,
  amount: number,
  toAlpha: boolean
): Slippage => {
  console.log("Calulation: ", alphaIn, taoIn, amount, toAlpha);
  const conversionRate = alphaIn / taoIn;
  const amountRao = amount * 1e9;
  if (toAlpha) {
    // TAO to Alpha
    const grossAlpha = amountRao * conversionRate;
    const alphaInRao = alphaIn - (taoIn * alphaIn) / (taoIn + amountRao);
    const alpha = alphaInRao / 1e9;

    const slippage = grossAlpha - alpha;
    const slippagePercentage = (slippage / grossAlpha) * 100;

    return {
      tokens: alpha,
      slippagePercentage,
      slippage,
    };
  } else {
    // Alpha to TAO
    const grossTao = amount / conversionRate;
    const taoInRao = taoIn - (alphaIn * taoIn) / (alphaIn + amountRao);
    const tao = taoInRao / 1e9;

    const slippage = grossTao - tao;
    const slippagePercentage = (slippage / grossTao) * 100;

    return {
      tokens: tao,
      slippagePercentage,
      slippage,
    };
  }
};
