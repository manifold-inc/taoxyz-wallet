import { ChevronRight, CircleCheckBig } from 'lucide-react';

import { useState } from 'react';

import ConfirmTransaction from '@/client/components/dashboard/transaction/ConfirmTransaction';
import SubnetSelection from '@/client/components/dashboard/transaction/SubnetSelection';
import TransactionForm from '@/client/components/dashboard/transaction/TransactionForm';
import ValidatorSelection from '@/client/components/dashboard/transaction/ValidatorSelection';
import { DashboardState, useDashboard } from '@/client/contexts/DashboardContext';
import { useNotification } from '@/client/contexts/NotificationContext';
import { usePolkadotApi } from '@/client/contexts/PolkadotApiContext';
import { NotificationType } from '@/types/client';
import type { Subnet, Validator } from '@/types/client';

export interface TransactionParams {
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

export interface TransactionProps {
  address: string;
  dashboardState: DashboardState;
  isLoading: boolean;
  onRefresh: () => void;
}

export interface AmountState {
  amount: string;
  amountInRao: bigint | null;
}

export type TransactionStatus = 'ready' | 'broadcast' | 'inBlock' | 'success' | 'failed';

const Transaction = ({
  address,
  isLoading = true,
  dashboardState,
  onRefresh,
}: TransactionProps) => {
  const { api } = usePolkadotApi();
  const {
    dashboardSubnet,
    dashboardSubnets,
    dashboardValidator,
    dashboardValidators,
    dashboardStake,
    setDashboardSubnet,
    setDashboardValidator,
    setDashboardValidators,
    resetDashboardState,
  } = useDashboard();
  const { showNotification } = useNotification();

  const [amountState, setAmountState] = useState<AmountState>({
    amount: '',
    amountInRao: null,
  });
  const [toAddress, setToAddress] = useState<string>('');
  const [showSubnetSelection, setShowSubnetSelection] = useState(false);
  const [showValidatorSelection, setShowValidatorSelection] = useState(false);
  const [showTransactionConfirmation, setShowTransactionConfirmation] = useState(false);
  const [transactionParams, setTransactionParams] = useState<TransactionParams | null>(null);
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
  const handleSetupTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!api) return;
    if (amountState.amountInRao === null) return;

    let params: TransactionParams;
    switch (dashboardState) {
      case DashboardState.CREATE_STAKE:
        if (!dashboardValidator || !dashboardSubnet) return;
        params = {
          address,
          subnetId: dashboardSubnet.id,
          validatorHotkey: dashboardValidator.hotkey,
          amountInRao: amountState.amountInRao,
        } as StakeParams;
        break;
      case DashboardState.ADD_STAKE:
      case DashboardState.REMOVE_STAKE:
        if (!dashboardStake || !dashboardSubnet) return;
        params = {
          address,
          subnetId: dashboardSubnet.id,
          validatorHotkey: dashboardStake.hotkey,
          amountInRao: amountState.amountInRao,
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
          amountInRao: amountState.amountInRao,
        } as MoveStakeParams;
        break;
      case DashboardState.TRANSFER:
        if (toAddress === '') return;
        params = {
          fromAddress: address,
          toAddress,
          amountInRao: amountState.amountInRao,
        } as TransferTaoParams;
        break;
      default:
        return;
    }
    setTransactionParams(params);
    setShowTransactionConfirmation(true);
  };

  const submitTransaction = async (
    params: TransactionParams,
    onStatusChange: (status: string) => void
  ) => {
    if (!api) return;
    try {
      switch (dashboardState) {
        case DashboardState.CREATE_STAKE:
        case DashboardState.ADD_STAKE:
          await api.createStake(params as StakeParams, onStatusChange);
          break;
        case DashboardState.REMOVE_STAKE:
          await api.removeStake(params as StakeParams, onStatusChange);
          break;
        case DashboardState.MOVE_STAKE:
          await api.moveStake(params as MoveStakeParams, onStatusChange);
          break;
        case DashboardState.TRANSFER:
          await api.transfer(params as TransferTaoParams, onStatusChange);
          break;
      }
    } catch {
      onStatusChange('failed');
      showNotification({
        message: 'Transaction Failed',
        type: NotificationType.Error,
      });
    }
  };

  const renderSubnetSelection = () => {
    if (showSubnetSelection && dashboardSubnets) {
      return (
        <div className="w-full">
          <SubnetSelection
            subnets={dashboardSubnets}
            isLoadingSubnets={isLoading}
            onCancel={handleSubnetCancel}
            onConfirm={handleSubnetConfirm}
          />
        </div>
      );
    }

    if (dashboardSubnet === null) {
      return (
        <button
          type="button"
          className="w-full p-2 bg-mf-night-400 rounded-md cursor-pointer flex items-center justify-between"
          onClick={handleSubnetSelection}
        >
          <p className="text-mf-edge-700 text-sm font-medium">Select Subnet</p>
          <ChevronRight className="w-4 h-4 text-mf-edge-500" />
        </button>
      );
    }

    // Users should not be able to change subnet for adding to or removing from a stake
    return (
      <button
        className="w-full p-2 text-sm bg-mf-night-400 rounded-md cursor-pointer flex items-center justify-between disabled:disabled-button disabled:cursor-not-allowed"
        onClick={handleSubnetSelection}
        disabled={
          dashboardState === DashboardState.ADD_STAKE ||
          dashboardState === DashboardState.REMOVE_STAKE
        }
      >
        <div className="flex gap-1">
          <p className="text-mf-edge-500 font-medium">{dashboardSubnet.name}</p>
          <span className="text-mf-edge-700 font-medium">SN{dashboardSubnet.id}</span>
        </div>
        <CircleCheckBig className="w-4 h-4 text-mf-sybil-500" />
      </button>
    );
  };

  const renderValidatorSelection = () => {
    if (showValidatorSelection && dashboardValidators) {
      return (
        <div className="w-full">
          <ValidatorSelection
            validators={dashboardValidators}
            onCancel={handleValidatorCancel}
            onConfirm={handleValidatorConfirm}
          />
        </div>
      );
    }

    if (dashboardValidator === null) {
      return (
        <button
          type="button"
          className="w-full p-2 text-sm bg-mf-night-400 rounded-md cursor-pointer flex items-center justify-between"
          onClick={handleValidatorSelection}
        >
          <p className="text-mf-edge-700 font-medium">Select Validator</p>
          <ChevronRight className="w-4 h-4 text-mf-edge-500" />
        </button>
      );
    }

    // Users should not be able to change validator for adding to or removing from a stake
    return (
      <button
        className="w-full p-2 text-sm bg-mf-night-400 rounded-md cursor-pointer flex items-center justify-between disabled:disabled-button disabled:cursor-not-allowed"
        onClick={handleValidatorSelection}
        disabled={
          dashboardState === DashboardState.ADD_STAKE ||
          dashboardState === DashboardState.REMOVE_STAKE
        }
      >
        <div className="flex gap-1">
          <p className="text-mf-edge-500 font-medium truncate max-w-[16ch]">
            {dashboardValidator.name || 'Validator'}
          </p>
          <span className="text-mf-edge-700 font-medium">
            {dashboardValidator.hotkey.slice(0, 6)}...{dashboardValidator.hotkey.slice(-6)}
          </span>
        </div>
        <CircleCheckBig className="w-4 h-4 text-mf-sybil-500" />
      </button>
    );
  };

  const handleSubnetSelection = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSubnetSelection(true);
  };

  const handleValidatorSelection = (e: React.FormEvent) => {
    e.preventDefault();
    setShowValidatorSelection(true);
  };

  const handleSubnetCancel = () => {
    setDashboardSubnet(null);
    setDashboardValidator(null);
    setDashboardValidators(null);
    setShowSubnetSelection(false);
  };

  const handleSubnetConfirm = (subnet: Subnet, validators: Validator[]) => {
    setDashboardSubnet(subnet);
    setDashboardValidator(null);
    setDashboardValidators(validators);
    setShowSubnetSelection(false);
  };

  const handleValidatorCancel = () => {
    setDashboardValidator(null);
    setDashboardValidators(null);
    setShowValidatorSelection(false);
  };

  const handleValidatorConfirm = (validator: Validator) => {
    setDashboardValidator(validator);
    setShowValidatorSelection(false);
  };

  const handleTransactionConfirmationCancel = () => {
    resetDashboardState();
    onRefresh();
    setTransactionParams(null);
    setShowTransactionConfirmation(false);
  };

  return (
    <>
      {showSubnetSelection && dashboardSubnets ? (
        <SubnetSelection
          subnets={dashboardSubnets}
          isLoadingSubnets={isLoading}
          onCancel={handleSubnetCancel}
          onConfirm={handleSubnetConfirm}
        />
      ) : showValidatorSelection && dashboardValidators ? (
        <ValidatorSelection
          validators={dashboardValidators}
          onCancel={handleValidatorCancel}
          onConfirm={handleValidatorConfirm}
        />
      ) : showTransactionConfirmation && transactionParams ? (
        <ConfirmTransaction
          params={transactionParams}
          submitTransaction={submitTransaction}
          onCancel={handleTransactionConfirmationCancel}
        />
      ) : (
        <TransactionForm
          amountState={amountState}
          toAddress={toAddress}
          setAmountState={setAmountState}
          setToAddress={setToAddress}
          handleSetupTransaction={handleSetupTransaction}
          renderSubnetSelection={renderSubnetSelection}
          renderValidatorSelection={renderValidatorSelection}
        />
      )}
    </>
  );
};

export default Transaction;
