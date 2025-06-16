import { motion } from 'framer-motion';

import { useEffect } from 'react';

import SlippageDisplay from '@/client/components/common/SlippageDisplay';
import type { AmountState } from '@/client/components/dashboard/transaction/Transaction';
import { DashboardState, useDashboard } from '@/client/contexts/DashboardContext';
import { raoToTao, taoToRao } from '@/utils/utils';

interface TransactionFormProps {
  amountState: AmountState;
  toAddress: string;
  slippage: string;
  setAmountState: (amountState: AmountState) => void;
  setToAddress: (toAddress: string) => void;
  setSlippage: (slippage: string) => void;
  handleSetupTransaction: (e: React.FormEvent) => void;
  renderSubnetSelection: () => React.ReactNode;
  renderValidatorSelection: () => React.ReactNode;
}

const TransactionForm = ({
  amountState,
  toAddress,
  slippage,
  setAmountState,
  setToAddress,
  setSlippage,
  handleSetupTransaction,
  renderSubnetSelection,
  renderValidatorSelection,
}: TransactionFormProps) => {
  const {
    resetDashboardState,
    dashboardSubnet,
    dashboardStake,
    dashboardFreeBalance,
    dashboardState,
    dashboardValidator,
    setDashboardFreeBalance,
  } = useDashboard();

  const handleSlippageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow empty string or numbers with optional decimal
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setSlippage(value);
    }
  };

  const handleSlippageBlur = () => {
    if (slippage === '') {
      setSlippage('0');
    }
  };

  const renderSlippageInput = () => {
    return (
      <div className="w-full flex gap-2 items-center justify-center">
        <div className="w-3/5 relative">
          <input
            type="text"
            value={slippage}
            onChange={handleSlippageChange}
            onBlur={handleSlippageBlur}
            placeholder="Enter Slippage"
            className="w-full p-2 pr-6 text-sm text-mf-edge-500 placeholder-mf-edge-700 bg-mf-night-300 rounded-md"
          />
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-mf-edge-700 text-sm">
            %
          </span>
        </div>
        <div className="w-2/5 text-mf-safety-500 text-center text-sm rounded-md bg-mf-safety-opacity p-2">
          Set Slippage
        </div>
      </div>
    );
  };

  const setBalance = () => {
    switch (dashboardState) {
      case DashboardState.CREATE_STAKE:
      case DashboardState.ADD_STAKE:
      case DashboardState.TRANSFER:
        // Free balance for tao is set when dashboard does api call - only for explicitness
        setDashboardFreeBalance(dashboardFreeBalance);
        break;
      case DashboardState.MOVE_STAKE:
      case DashboardState.REMOVE_STAKE:
        // Is needed when stake is selected
        if (dashboardStake === null) return;
        setDashboardFreeBalance(dashboardStake.stake);
        break;
      default:
        break;
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    let amount: string;
    let amountInRao: bigint;

    // If its a staked position, the stake/tokens is in rao already
    switch (dashboardState) {
      case DashboardState.CREATE_STAKE:
      case DashboardState.ADD_STAKE:
      case DashboardState.TRANSFER:
        if (dashboardFreeBalance === null) return;
        amount = raoToTao(dashboardFreeBalance).toString();
        amountInRao = dashboardFreeBalance;
        break;
      case DashboardState.REMOVE_STAKE:
      case DashboardState.MOVE_STAKE:
        if (dashboardStake === null) return;
        amount = raoToTao(dashboardStake.stake).toString();
        amountInRao = dashboardStake.stake;
        break;
      default:
        return;
    }
    setAmountState({
      amount,
      amountInRao,
    });
  };

  const amountValidation = (amount: number) => {
    if (amount <= 0) return false;
    const amountInRao = taoToRao(amount);

    switch (dashboardState) {
      case DashboardState.CREATE_STAKE:
      case DashboardState.TRANSFER:
        if (dashboardFreeBalance === null) return false;
        if (amountInRao > dashboardFreeBalance) return false;
        return true;

      case DashboardState.ADD_STAKE:
        if (dashboardStake === null) return false;
        if (dashboardFreeBalance === null) return false;
        if (amountInRao > dashboardFreeBalance) return false;
        return true;

      case DashboardState.REMOVE_STAKE:
      case DashboardState.MOVE_STAKE:
        if (dashboardStake === null) return false;
        if (amountInRao > dashboardStake.stake) return false;
        return true;

      default:
        return true;
    }
  };

  const renderInputFields = () => {
    switch (dashboardState) {
      case DashboardState.ADD_STAKE:
      case DashboardState.REMOVE_STAKE:
      case DashboardState.CREATE_STAKE:
        return (
          <div className="w-full flex flex-col gap-4 items-center justify-center">
            {renderSlippageInput()}
            {renderSubnetSelection()}
            {renderValidatorSelection()}
          </div>
        );
      case DashboardState.MOVE_STAKE:
        return (
          <div className="w-full flex flex-col gap-4 items-center justify-center">
            {renderSubnetSelection()}
            {renderValidatorSelection()}
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
    if (amountState.amountInRao === null) return;

    if (
      (dashboardState === DashboardState.ADD_STAKE ||
        dashboardState === DashboardState.REMOVE_STAKE ||
        dashboardState === DashboardState.MOVE_STAKE) &&
      dashboardStake === null
    ) {
      return;
    }

    if (
      (dashboardState === DashboardState.CREATE_STAKE ||
        dashboardState === DashboardState.TRANSFER) &&
      dashboardFreeBalance === null
    ) {
      return;
    }

    switch (dashboardState) {
      case DashboardState.CREATE_STAKE:
        return <SlippageDisplay amount={amountState.amount} />;
      case DashboardState.ADD_STAKE:
      case DashboardState.REMOVE_STAKE:
        return <SlippageDisplay amount={amountState.amount} />;
      case DashboardState.MOVE_STAKE:
        return <SlippageDisplay amount={amountState.amount} />;
      default:
        return null;
    }
  };

  useEffect(() => {
    void setBalance();
  }, [dashboardState]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSetupTransaction(e);
  };

  const allowContinue = () => {
    let result: boolean | null = null;
    if (dashboardState === DashboardState.TRANSFER) {
      result = amountValidation(Number(amountState.amount)) && toAddress !== '';
      return result;
    }
    result = dashboardSubnet && dashboardValidator && amountValidation(Number(amountState.amount));
    return result;
  };

  return (
    <div className="w-full h-full flex flex-col gap-3">
      <form className="flex flex-col gap-4 items-center justify-center" onSubmit={handleFormSubmit}>
        <div className="w-full flex flex-col gap-4 items-center justify-center">
          <div className="w-full flex items-center gap-2">
            <motion.input
              type="text"
              value={amountState.amount}
              placeholder="Enter Amount"
              onChange={handleAmountChange}
              className="w-3/5 p-2 text-sm text-mf-edge-500 border border-mf-ash-500 placeholder-mf-edge-700 bg-mf-night-300 rounded-md"
              whileFocus={{
                borderColor: '#57E8B4',
              }}
            />
            <button
              type="button"
              onClick={handleMaxAmount}
              className="w-2/5 text-mf-sybil-500 text-sm p-2 items-center rounded-md bg-mf-sybil-opacity cursor-pointer border border-mf-ash-500 hover:opacity-50"
            >
              Max Amount
            </button>
          </div>
          {renderInputFields()}
        </div>
        {renderSlippageDisplay()}
        <div className="w-full flex gap-2 items-center justify-center">
          <button
            type="button"
            onClick={() => resetDashboardState()}
            className="rounded-md text-center cursor-pointer w-1/2 py-1.5 bg-mf-red-opacity border border-mf-red-opacity text-mf-red-500 gap-1 disabled:cursor-not-allowed hover:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!allowContinue()}
            className="w-1/2 rounded-md text-center cursor-pointer py-1.5 gap-1 disabled:cursor-not-allowed hover:opacity-50 disabled:hover:opacity-100 disabled:bg-mf-ash-500 disabled:border-mf-ash-500 disabled:text-mf-edge-700 enabled:bg-mf-sybil-opacity enabled:border-mf-sybil-opacity enabled:text-mf-sybil-500"
          >
            Continue
          </button>
        </div>
      </form>
    </div>
  );
};

export default TransactionForm;
