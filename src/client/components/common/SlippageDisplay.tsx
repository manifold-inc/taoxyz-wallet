import type { Slippage } from '@/types/client';
import {
  formatNumber,
  slippageMoveStakeCalculation,
  slippageStakeCalculation,
  taoToRao,
} from '@/utils/utils';

interface SlippageDisplayProps {
  amount: string;
  balance: string;
  isRoot?: boolean;
  moveStake?: boolean;
}

const SlippageDisplay = ({
  amount,
  balance,
  moveStake = false,
  isRoot = false,
}: SlippageDisplayProps) => {
  const chainFee = moveStake ? 0.0001 : 0.00005;
  const amountInRao = taoToRao(Number(amount));
  const balanceInRao = taoToRao(Number(balance));

  // Calculate slippage based on the operation type
  let slippage: Slippage;
  if (moveStake) {
    slippage = slippageMoveStakeCalculation(balanceInRao, balanceInRao, amountInRao);
  } else if (isRoot) {
    slippage = slippageStakeCalculation(balanceInRao, balanceInRao, amountInRao, false, false);
  } else {
    slippage = slippageStakeCalculation(balanceInRao, balanceInRao, amountInRao, false, true);
  }

  const payToken = moveStake ? (isRoot ? 'τ' : 'α') : 'τ';

  return (
    <div className="w-full flex flex-col gap-2 p-3">
      <div className="flex items-center justify-between">
        <p className="text-mf-edge-700 text-sm font-medium">Pay</p>
        <p className="text-mf-sybil-500 text-sm font-medium">
          {formatNumber(parseFloat(amount))} {payToken}
        </p>
      </div>
      {!isRoot && (
        <div className="flex items-center justify-between">
          <p className="text-mf-edge-700 text-sm font-medium">Slippage</p>
          <p className="text-mf-safety-500 text-sm font-medium">
            {formatNumber(slippage.slippagePercentage).toFixed(2)}%
          </p>
        </div>
      )}
      <div className="flex items-center justify-between">
        <p className="text-mf-edge-700 text-sm font-medium">Chain Fee</p>
        <p className="text-mf-sybil-500 text-sm font-medium">{chainFee} τ</p>
      </div>
      <div className="flex items-center justify-between">
        <p className="text-mf-edge-500 text-sm font-medium">Estimated Total</p>
        <p className="text-mf-sybil-500 text-sm font-medium">
          {formatNumber(slippage.tokens - chainFee)} {payToken}
        </p>
      </div>
    </div>
  );
};

export default SlippageDisplay;
