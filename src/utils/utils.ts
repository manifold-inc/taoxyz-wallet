import type { Slippage } from '@/types/client';

export const generateId = (): number => {
  return Math.floor(Math.random() * 1000000);
};

export const formatNumber = (num: number): number => {
  return Math.floor(num * 10000) / 10000;
};

export const taoToRao = (amount: number): bigint => {
  if (isNaN(amount)) return BigInt(0);
  return BigInt(Math.floor(amount * 1e9));
};

export const raoToTao = (amount: bigint): number => {
  return Number(amount) / 1e9;
};

// Price-based conversion without slippage
export const taoToAlpha = (tao: number, price: number): number => {
  return tao / price;
};

export const alphaToTao = (alpha: number, price: number): number => {
  return alpha * price;
};

// All in RAO denomination
export const taoToAlphaWithSlippage = (
  tao: number,
  alphaIn: number,
  taoIn: number,
  isDynamic: boolean,
  price: number
): Slippage => {
  if (isDynamic) {
    const newTaoIn = taoIn + tao;
    const newAlphaIn = (alphaIn * taoIn) / newTaoIn;

    if (newTaoIn === 0) {
      return {
        tokens: tao,
        slippage: 0,
        slippagePercentage: 0,
      };
    }

    const alphaReturned = alphaIn - newAlphaIn;
    const alphaIdeal = taoToAlpha(tao, price);

    if (alphaIdeal > alphaReturned) {
      const slippage = alphaIdeal - alphaReturned;
      const slippagePercentage = (100 * slippage) / (slippage + alphaReturned);
      return {
        tokens: alphaReturned,
        slippage,
        slippagePercentage,
      };
    } else {
      return {
        tokens: alphaReturned,
        slippage: 0,
        slippagePercentage: 0,
      };
    }
  }

  // Root
  return {
    tokens: tao,
    slippage: 0,
    slippagePercentage: 0,
  };
};

// All in RAO denomination
export const alphaToTaoWithSlippage = (
  alpha: number,
  alphaIn: number,
  taoIn: number,
  isDynamic: boolean,
  price: number
): Slippage => {
  if (isDynamic) {
    const newAlphaIn = alphaIn + alpha;
    const newTaoReserve = (alphaIn * taoIn) / newAlphaIn;

    const taoReturned = taoIn - newTaoReserve;
    const taoIdeal = alphaToTao(alpha, price);

    if (taoIdeal > taoReturned) {
      const slippage = taoIdeal - taoReturned;
      const slippagePercentage = (100 * slippage) / (slippage + taoReturned);
      return {
        tokens: taoReturned,
        slippage,
        slippagePercentage,
      };
    } else {
      return {
        tokens: taoReturned,
        slippage: 0,
        slippagePercentage: 0,
      };
    }
  }

  // Root
  return {
    tokens: alpha,
    slippage: 0,
    slippagePercentage: 0,
  };
};

export const moveStakeWithSlippage = (
  alpha: number,
  alphaIn: number,
  taoIn: number,
  isDynamic: boolean,
  price: number,
  isMovingToRoot = false,
  isMovingFromRoot = false
): Slippage => {
  console.log(
    'Params: ',
    alpha,
    alphaIn,
    taoIn,
    isDynamic,
    price,
    isMovingToRoot,
    isMovingFromRoot
  );
  if (!isDynamic && !isMovingToRoot && !isMovingFromRoot) {
    // Root to Root case: 1:1 conversion
    return {
      tokens: alpha,
      slippage: 0,
      slippagePercentage: 0,
    };
  }

  if (isMovingFromRoot) {
    // Root to Alpha case: Convert TAO to Alpha (with slippage if dynamic)
    return taoToAlphaWithSlippage(alpha, alphaIn, taoIn, isDynamic, price);
  }

  // Convert Alpha to TAO (with slippage if dynamic)
  const unstakeResult = alphaToTaoWithSlippage(alpha, alphaIn, taoIn, isDynamic, price);

  if (isMovingToRoot) {
    // When moving to Root, we just return the TAO amount (1:1 conversion)
    return {
      tokens: alphaToTao(unstakeResult.tokens, price),
      slippage: unstakeResult.slippage,
      slippagePercentage: unstakeResult.slippagePercentage,
    };
  }

  // Dynamic case: Calculate with slippage
  // Calculate new pool state after unstaking
  const newAlphaIn = alphaIn - unstakeResult.tokens;
  const newTaoIn = taoIn + alpha;

  // Restake: Convert TAO back to Alpha
  const restakeResult = taoToAlphaWithSlippage(
    unstakeResult.tokens,
    newAlphaIn,
    newTaoIn,
    isDynamic,
    price
  );

  return {
    tokens: restakeResult.tokens,
    slippage: unstakeResult.slippage + restakeResult.slippage,
    slippagePercentage: unstakeResult.slippagePercentage + restakeResult.slippagePercentage,
  };
};
