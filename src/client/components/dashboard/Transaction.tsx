import { ChevronRight, CircleCheckBig } from 'lucide-react';

import { useState } from 'react';

import SubnetSelection from '@/client/components/dashboard/SubnetSelection';
import TransactionForm from '@/client/components/dashboard/TransactionForm';
import ValidatorSelection from '@/client/components/dashboard/ValidatorSelection';
import { DashboardState, useDashboard } from '@/client/contexts/DashboardContext';
import { usePolkadotApi } from '@/client/contexts/PolkadotApiContext';
import type { Subnet, Validator } from '@/types/client';

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

export interface AmountState {
  amount: string;
  amountInRao: bigint | null;
}

const Transaction = ({ address, isLoading = true, dashboardState }: TransactionProps) => {
  const { api } = usePolkadotApi();
  const {
    dashboardSubnet,
    dashboardSubnets,
    dashboardValidator,
    dashboardValidators,
    dashboardStake,
    setDashboardSubnet,
    setDashboardValidators,
    setDashboardValidator,
  } = useDashboard();

  const [amountState, setAmountState] = useState<AmountState>({
    amount: '',
    amountInRao: null,
  });
  const [toAddress, setToAddress] = useState<string>('');
  const [showSubnetSelection, setShowSubnetSelection] = useState(false);
  const [showValidatorSelection, setShowValidatorSelection] = useState(false);

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
    console.log('params', params);
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
          className="w-full p-2 bg-mf-night-400 rounded-md cursor-pointer flex items-center justify-between"
          onClick={() => setShowSubnetSelection(true)}
        >
          <p className="text-mf-edge-700 text-sm font-medium">Select Subnet</p>
          <ChevronRight className="w-4 h-4 text-mf-edge-500" />
        </button>
      );
    }

    return (
      <button
        className="w-full p-2 text-sm bg-mf-night-400 rounded-md cursor-pointer flex items-center justify-between"
        onClick={() => setShowSubnetSelection(true)}
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
          className="w-full p-2 text-sm bg-mf-night-400 rounded-md cursor-pointer flex items-center justify-between disabled:disabled-button disabled:cursor-not-allowed"
          disabled={dashboardSubnet === null}
          onClick={() => setShowValidatorSelection(true)}
        >
          <p className="text-mf-edge-700 font-medium">Select Validator</p>
          <ChevronRight className="w-4 h-4 text-mf-edge-500" />
        </button>
      );
    }

    return (
      <button
        className="w-full p-2 text-sm bg-mf-night-400 rounded-md cursor-pointer flex items-center justify-between"
        onClick={() => setShowValidatorSelection(true)}
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
      ) : (
        <TransactionForm
          amountState={amountState}
          setAmountState={setAmountState}
          toAddress={toAddress}
          setToAddress={setToAddress}
          handleSetupTransaction={handleSetupTransaction}
          handleRenderSubnetSelection={renderSubnetSelection}
          handleRenderValidatorSelection={renderValidatorSelection}
        />
      )}
    </>
  );
};

export default Transaction;
