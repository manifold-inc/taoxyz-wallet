import { DashboardState, useDashboard } from '@/client/contexts/DashboardContext';
import type { Slippage } from '@/types/client';
import {
  formatNumber,
  slippageMoveStakeCalculation,
  slippageStakeCalculation,
  taoToRao,
} from '@/utils/utils';

interface SlippageDisplayProps {
  amount: string;
}

const SlippageDisplay = ({ amount }: SlippageDisplayProps) => {
  const { dashboardSubnet, dashboardState } = useDashboard();
  const isRoot = dashboardSubnet?.id === 0;
  const moveStake = dashboardState === DashboardState.MOVE_STAKE;

  const chainFee = moveStake ? 0.0001 : 0.00005;
  const amountInRao = taoToRao(Number(amount));

  // Calculate slippage based on the operation type
  let slippage: Slippage;
  if (moveStake) {
    slippage = slippageMoveStakeCalculation(
      BigInt(dashboardSubnet?.alphaIn ?? 0),
      BigInt(dashboardSubnet?.taoIn ?? 0),
      BigInt(amountInRao)
    );
  } else if (isRoot) {
    slippage = slippageStakeCalculation(
      BigInt(dashboardSubnet?.alphaIn ?? 0),
      BigInt(dashboardSubnet?.taoIn ?? 0),
      BigInt(amountInRao),
      false,
      false
    );
  } else {
    slippage = slippageStakeCalculation(
      BigInt(dashboardSubnet?.alphaIn ?? 0),
      BigInt(dashboardSubnet?.taoIn ?? 0),
      BigInt(amountInRao),
      false,
      true
    );
  }

  let receiveToken = 'τ';
  let payToken = 'τ';

  switch (dashboardState) {
    case DashboardState.CREATE_STAKE:
    case DashboardState.ADD_STAKE:
      payToken = 'τ';
      if (isRoot) {
        receiveToken = 'τ';
      } else {
        receiveToken = 'α';
      }
      break;
    case DashboardState.REMOVE_STAKE:
      receiveToken = 'τ';
      if (isRoot) {
        payToken = 'τ';
      } else {
        payToken = 'α';
      }
      break;
    case DashboardState.MOVE_STAKE:
      payToken = 'α';
      if (isRoot) {
        receiveToken = 'τ';
      } else {
        receiveToken = 'α';
      }
      break;
  }

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
          {formatNumber(slippage.tokens - chainFee)} {receiveToken}
        </p>
      </div>
    </div>
  );
};

export default SlippageDisplay;
