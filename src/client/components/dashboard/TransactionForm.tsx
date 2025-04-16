import { motion } from 'framer-motion';

import SlippageDisplay from '@/client/components/common/SlippageDisplay';
import type { AmountState } from '@/client/components/dashboard/Transaction';
import { DashboardState, useDashboard } from '@/client/contexts/DashboardContext';
import { taoToRao } from '@/utils/utils';

interface TransactionFormProps {
  amountState: AmountState;
  toAddress: string;
  setAmountState: (amountState: AmountState) => void;
  setToAddress: (toAddress: string) => void;
  handleSetupTransaction: (e: React.FormEvent) => void;
  handleRenderSubnetSelection: () => React.ReactNode;
  handleRenderValidatorSelection: () => React.ReactNode;
}

const TransactionForm = ({
  amountState,
  toAddress,
  setAmountState,
  setToAddress,
  handleSetupTransaction,
  handleRenderSubnetSelection,
  handleRenderValidatorSelection,
}: TransactionFormProps) => {
  const {
    resetDashboardState,
    dashboardSubnet,
    dashboardStake,
    dashboardFreeBalance,
    dashboardState,
    dashboardValidator,
  } = useDashboard();

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('handleAmountChange called with value:', e.target.value);
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value)) {
      const numValue = parseFloat(value);
      setAmountState({
        amount: value,
        amountInRao: !isNaN(numValue) && numValue >= 0 ? taoToRao(numValue) : null,
      });
    }
  };

  const handleMaxAmount = () => {
    switch (dashboardState) {
      case DashboardState.CREATE_STAKE:
      case DashboardState.TRANSFER:
        if (dashboardFreeBalance === null) return;
        setAmountState({
          amount: dashboardFreeBalance.toString(),
          amountInRao: taoToRao(dashboardFreeBalance),
        });
        break;
      case DashboardState.ADD_STAKE:
      case DashboardState.REMOVE_STAKE:
      case DashboardState.MOVE_STAKE:
        if (dashboardStake === null) return;
        setAmountState({
          amount: dashboardStake.stake.toString(),
          amountInRao: taoToRao(dashboardStake.stake),
        });
        break;
      default:
        return;
    }
  };

  const amountValidation = (amount: number) => {
    if (amount <= 0) return false;
    if (dashboardFreeBalance === null || dashboardStake === null) return false;

    switch (dashboardState) {
      case DashboardState.CREATE_STAKE:
      case DashboardState.TRANSFER:
        if (amount > dashboardFreeBalance) return false;
        return true;
      case DashboardState.ADD_STAKE:
      case DashboardState.REMOVE_STAKE:
      case DashboardState.MOVE_STAKE:
        if (dashboardStake === null) return false;
        if (amount > dashboardStake.stake) return false;
        return true;
      default:
        return true;
    }
  };

  const renderInputFields = () => {
    switch (dashboardState) {
      case DashboardState.ADD_STAKE:
      case DashboardState.REMOVE_STAKE:
      case DashboardState.MOVE_STAKE:
      case DashboardState.CREATE_STAKE:
        return (
          <div className="w-full flex flex-col gap-4 items-center justify-center">
            {handleRenderSubnetSelection()}
            {handleRenderValidatorSelection()}
          </div>
        );

      case DashboardState.TRANSFER:
        return (
          <input
            type="text"
            value={toAddress}
            placeholder="Enter Address"
            onChange={e => setToAddress(e.target.value)}
            className="w-full p-2 text-sm text-mf-edge-500 placeholder-mf-edge-700 bg-mf-night-300 rounded-md"
          />
        );
      default:
        return null;
    }
  };

  const renderSlippageDisplay = () => {
    if (dashboardSubnet === null) return;
    if (dashboardValidator === null) return;
    if (dashboardStake === null || dashboardFreeBalance === null) return;
    if (amountState.amountInRao === null) return;

    const isRoot = dashboardSubnet.id === 0;
    switch (dashboardState) {
      case DashboardState.CREATE_STAKE:
        return (
          <SlippageDisplay
            amount={amountState.amount}
            balance={dashboardFreeBalance.toString()}
            isRoot={isRoot}
            handleAmountChange={handleAmountChange}
          />
        );
      case DashboardState.ADD_STAKE:
      case DashboardState.REMOVE_STAKE:
        return (
          <SlippageDisplay
            amount={amountState.amount}
            balance={dashboardStake.stake.toString()}
            isRoot={isRoot}
            handleAmountChange={handleAmountChange}
          />
        );
      case DashboardState.MOVE_STAKE:
        return (
          <SlippageDisplay
            amount={amountState.amount}
            balance={dashboardStake.stake.toString()}
            moveStake={true}
            isRoot={isRoot}
            handleAmountChange={handleAmountChange}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full h-full flex flex-col gap-3">
      <form
        className="flex flex-col gap-4 items-center justify-center"
        onSubmit={handleSetupTransaction}
      >
        <div className="w-full flex flex-col gap-4 items-center justify-center">
          <div className="w-full flex items-center gap-2">
            <input
              type="text"
              value={amountState.amount}
              placeholder="Enter Amount"
              onChange={handleAmountChange}
              className="w-4/5 p-2 text-sm text-mf-edge-500 placeholder-mf-edge-700 bg-mf-night-300 rounded-md"
            />
            <motion.button
              type="button"
              onClick={handleMaxAmount}
              className="w-1/5 text-mf-sybil-500 text-sm p-2 rounded-md bg-mf-sybil-opacity cursor-pointer"
              whileHover={{ opacity: 0.5 }}
            >
              Max
            </motion.button>
          </div>
          {renderInputFields()}
        </div>
        {renderSlippageDisplay()}
        <div className="w-full flex gap-2 items-center justify-center">
          <motion.button
            type="button"
            onClick={() => resetDashboardState()}
            className="w-full rounded-md text-center cursor-pointer w-1/2 py-1.5 bg-mf-red-opacity border border-mf-red-opacity transition-colors text-mf-red-500 gap-1"
            whileHover={{ opacity: 0.5, color: '#c5dbff', borderColor: '#ff5a5a' }}
          >
            Cancel
          </motion.button>
          <motion.button
            type="submit"
            disabled={
              !dashboardSubnet ||
              !dashboardValidator ||
              !amountValidation(Number(amountState.amount))
            }
            className="w-full rounded-md text-center cursor-pointer w-1/2 py-1.5 bg-mf-sybil-opacity border border-mf-sybil-opacity transition-colors text-mf-sybil-500 gap-1 disabled:disabled-button disabled:cursor-not-allowed"
            whileHover={{ opacity: 0.5, color: '#c5dbff', borderColor: '#57e8b4' }}
          >
            Submit
          </motion.button>
        </div>
      </form>
    </div>
  );
};

export default TransactionForm;
