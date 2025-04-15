import { motion } from 'framer-motion';

import { useState } from 'react';

import ValidatorSelection from '@/client/components/dashboard/ValidatorSelection';
import { DashboardState, useDashboard } from '@/client/contexts/DashboardContext';
import { usePolkadotApi } from '@/client/contexts/PolkadotApiContext';
import type { Validator } from '@/types/client';
import { taoToRao } from '@/utils/utils';

import SubnetSelection from './SubnetSelection';

interface TransactionParams {
  address?: string;
  amountInRao: bigint;
}

interface StakeParams extends TransactionParams {
  address: string;
  subnetId: number;
  validatorHotkey: string;
}

interface MoveStakeParams extends TransactionParams {
  address: string;
  fromSubnetId: number;
  fromHotkey: string;
  toSubnetId: number;
  toHotkey: string;
}

interface TransferTaoParams extends TransactionParams {
  fromAddress: string;
  toAddress: string;
  amountInRao: bigint;
}

interface TransactionProps {
  address: string;
  dashboardState: DashboardState;
  isLoading: boolean;
}

const Transaction = ({ address, isLoading = true, dashboardState }: TransactionProps) => {
  const { api } = usePolkadotApi();
  const {
    dashboardSubnet,
    dashboardSubnets,
    dashboardValidator,
    dashboardValidators,
    dashboardFreeBalance,
    dashboardStake,
    setDashboardValidator,
    resetDashboardState,
  } = useDashboard();
  const [amount, setAmount] = useState<string>('');
  const [amountInRao, setAmountInRao] = useState<bigint | null>(null);
  const [toAddress, setToAddress] = useState<string>('');

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow empty string or valid decimal numbers
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setAmount(value);
      // Only convert to RAO if we have a valid number
      if (value !== '') {
        const numValue = parseFloat(value);
        if (!isNaN(numValue) && numValue >= 0) {
          setAmountInRao(taoToRao(numValue));
        }
      } else {
        setAmountInRao(null);
      }
    }
  };

  const amountValidation = (amountInRao: bigint) => {
    if (dashboardFreeBalance === null) return false;
    if (amountInRao <= 0) return false;
    if (amountInRao > BigInt(dashboardFreeBalance)) return false;
    return true;
  };

  const handleValidatorSelection = (validator: Validator) => {
    setDashboardValidator(validator);
  };

  /**
   * Create {address, subnetId, validatorHotkey, amountInRao}
   * Add {address, subnetId, validatorHotkey, amountInRao}
   *  Requires existing stake
   * Remove {address, subnetId, validatorHotkey, amountInRao}
   *  Requires existing stake
   * Move {address, fromHotkey, toHotkey, fromSubnetId, toSubnetId, amountInRao}
   *  Requires existing stake
   * Transfer {address, amountInRao}
   */
  const handleSetupTransaction = () => {
    if (!api) return;
    if (amountInRao === null) return;
    if (!amountValidation(amountInRao)) return;

    let params: TransactionParams;
    switch (dashboardState) {
      case DashboardState.CREATE_STAKE:
        if (!dashboardValidator || !dashboardSubnet) return;
        params = {
          address,
          subnetId: dashboardSubnet.id,
          validatorHotkey: dashboardValidator.hotkey,
          amountInRao,
        } as StakeParams;
        break;
      case DashboardState.ADD_STAKE:
      case DashboardState.REMOVE_STAKE:
        if (!dashboardStake || !dashboardSubnet) return;
        params = {
          address,
          subnetId: dashboardSubnet.id,
          validatorHotkey: dashboardStake.hotkey,
          amountInRao,
        } as StakeParams;
        break;
      case DashboardState.MOVE_STAKE:
        if (!dashboardStake || !dashboardValidator || !dashboardSubnet) return;
        params = {
          address,
          fromSubnetId: dashboardStake.netuid,
          fromHotkey: dashboardStake.hotkey,
          toSubnetId: dashboardSubnet.id,
          toHotkey: dashboardValidator.hotkey,
          amountInRao,
        } as MoveStakeParams;
        break;
      case DashboardState.TRANSFER:
        if (toAddress === '') return;
        params = {
          fromAddress: address,
          toAddress,
          amountInRao,
        } as TransferTaoParams;
        break;
      default:
        return;
    }
    submitTransaction(params);
  };

  const submitTransaction = async (params: TransactionParams) => {
    if (!api) return;
    switch (dashboardState) {
      case DashboardState.CREATE_STAKE:
      case DashboardState.ADD_STAKE:
        api.createStake(params as StakeParams);
        break;
      case DashboardState.REMOVE_STAKE:
        api.removeStake(params as StakeParams);
        break;
      case DashboardState.MOVE_STAKE:
        api.moveStake(params as MoveStakeParams);
        break;
      case DashboardState.TRANSFER:
        api.transfer(params as TransferTaoParams);
        break;
    }
  };

  const renderSubnetSelection = () => {
    if (dashboardSubnet === null) return null;
    return (
      <div className="w-full px-3 py-2 text-sm bg-mf-night-300 rounded-md">
        <p className="text-mf-edge-500">{dashboardSubnet.name}</p>
        <span className="text-mf-edge-700">SN{dashboardSubnet.id}</span>
      </div>
    );
  };

  const renderInputFields = () => {
    switch (dashboardState) {
      case DashboardState.CREATE_STAKE:
      case DashboardState.ADD_STAKE:
      case DashboardState.REMOVE_STAKE:
      case DashboardState.MOVE_STAKE:
        if (dashboardValidators === null) return null;
        return (
          <div className="flex flex-col gap-4 items-center justify-center w-full">
            {renderSubnetSelection()}
            <ValidatorSelection
              validators={dashboardValidators}
              onSelect={handleValidatorSelection}
            />
          </div>
        );

      case DashboardState.TRANSFER:
        return (
          <input
            type="text"
            value={toAddress}
            placeholder="Enter Address"
            onChange={e => setToAddress(e.target.value)}
            className="w-full px-3 py-2 text-sm text-mf-edge-500 placeholder-mf-edge-700 bg-mf-night-300 rounded-md"
          />
        );
    }
  };

  const TransactionForm = () => {
    return (
      <div className="w-full h-full flex flex-col gap-3 px-5 py-3">
        {/* Transaction Modal */}
        <form
          className="flex flex-col gap-4 items-center justify-center"
          onSubmit={handleSetupTransaction}
        >
          {/* Amount and Validator */}
          <input
            type="text"
            value={amount}
            placeholder="Enter Amount"
            onChange={handleAmountChange}
            className="w-full px-3 py-2 text-sm text-mf-edge-500 placeholder-mf-edge-700 bg-mf-night-300 rounded-md"
          />
          {renderInputFields()}

          {/* Action Buttons */}
          <div className="w-full flex gap-2 items-center justify-center">
            <motion.button
              type="button"
              onClick={() => resetDashboardState()}
              className="w-full rounded-md text-center cursor-pointer w-1/2 py-1.5 bg-mf-red-opacity border border-mf-red-opacity hover:border-mf-red-500 hover:text-mf-edge-500 transition-colors text-mf-red-500 gap-1"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Cancel
            </motion.button>
            <motion.button
              type="submit"
              disabled={
                !amountInRao ||
                !dashboardSubnet ||
                !dashboardValidator ||
                !amountValidation(amountInRao)
              }
              className="w-full rounded-md text-center cursor-pointer w-1/2 py-1.5 bg-mf-sybil-opacity border border-mf-sybil-opacity hover:border-mf-sybil-500 hover:text-mf-edge-500 transition-colors text-mf-sybil-500 gap-1"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Submit
            </motion.button>
          </div>
        </form>
      </div>
    );
  };

  const renderModal = () => {
    switch (dashboardState) {
      case DashboardState.ADD_STAKE:
      case DashboardState.MOVE_STAKE:
        // Skips render if subnet is selected
        if (dashboardSubnet !== null) break;
        if (dashboardSubnets === null) break;
        return <SubnetSelection subnets={dashboardSubnets} isLoadingSubnets={isLoading} />;
      default:
        return <TransactionForm />;
    }
  };

  return <>{renderModal()}</>;
};

export default Transaction;
