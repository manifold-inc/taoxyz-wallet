import { DashboardState, useDashboard } from '@/client/contexts/DashboardContext';
import type { Slippage } from '@/types/client';
import {
  alphaToTaoWithSlippage,
  formatNumber,
  moveStakeWithSlippage,
  taoToAlphaWithSlippage,
} from '@/utils/utils';

interface SlippageDisplayProps {
  amount: string;
}

const SlippageDisplay = ({ amount }: SlippageDisplayProps) => {
  const { dashboardSubnet, dashboardState } = useDashboard();
  const isDynamic = dashboardSubnet?.id !== 0;
  const moveStake = dashboardState === DashboardState.MOVE_STAKE;

  const chainFee = moveStake ? 0.0001 : 0.00005;
  const amountInRao = Number(amount) * 1e9;

  let slippage: Slippage;
  switch (dashboardState) {
    case DashboardState.CREATE_STAKE:
    case DashboardState.ADD_STAKE:
      slippage = taoToAlphaWithSlippage(
        amountInRao,
        dashboardSubnet?.alphaIn || 0,
        dashboardSubnet?.taoIn || 0,
        isDynamic,
        dashboardSubnet?.price || 0
      );
      break;
    case DashboardState.REMOVE_STAKE:
      slippage = alphaToTaoWithSlippage(
        amountInRao,
        dashboardSubnet?.alphaIn || 0,
        dashboardSubnet?.taoIn || 0,
        isDynamic,
        dashboardSubnet?.price || 0
      );
      break;
    case DashboardState.MOVE_STAKE:
      slippage = moveStakeWithSlippage(
        amountInRao,
        dashboardSubnet?.alphaIn || 0,
        dashboardSubnet?.taoIn || 0,
        isDynamic,
        dashboardSubnet?.price || 0
      );
      break;
    default:
      slippage = {
        tokens: 0,
        slippage: 0,
        slippagePercentage: 0,
      };
      break;
  }

  let receiveToken = 'τ';
  let payToken = 'τ';
  const receiveAmount = formatNumber(slippage.tokens / 1e9 - chainFee);

  switch (dashboardState) {
    case DashboardState.CREATE_STAKE:
    case DashboardState.ADD_STAKE:
      payToken = 'τ';
      if (isDynamic) {
        receiveToken = 'α';
      } else {
        receiveToken = 'τ';
      }
      break;
    case DashboardState.REMOVE_STAKE:
      receiveToken = 'τ';
      if (isDynamic) {
        payToken = 'α';
      } else {
        payToken = 'τ';
      }
      break;
    case DashboardState.MOVE_STAKE:
      payToken = 'α';
      if (isDynamic) {
        receiveToken = 'α';
      } else {
        receiveToken = 'τ';
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
      {isDynamic && (
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
          {receiveAmount} {receiveToken}
        </p>
      </div>
    </div>
  );
};

export default SlippageDisplay;
