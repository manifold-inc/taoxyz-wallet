import { ChevronRight, CircleCheckBig } from 'lucide-react';

import { useEffect, useMemo, useState } from 'react';

import { newApi } from '@/api/api';
import ConfirmTransaction from '@/client/components/dashboard/transaction/ConfirmTransaction';
import SubnetSelection from '@/client/components/dashboard/transaction/SubnetSelection';
import TransactionForm from '@/client/components/dashboard/transaction/TransactionForm';
import ValidatorSelection from '@/client/components/dashboard/transaction/ValidatorSelection';
import { DashboardState, useDashboard } from '@/client/contexts/DashboardContext';
import { useNotification } from '@/client/contexts/NotificationContext';
import { usePolkadotApi } from '@/client/contexts/PolkadotApiContext';
import { NotificationType } from '@/types/client';
import type { Subnet, Validator } from '@/types/client';
import { taoToRao } from '@/utils/utils';

export interface TransactionParams {
  address?: string;
  amountInRao: bigint;
  amount: string;
}

interface StakeParams extends TransactionParams {
  address: string;
  subnetId: number;
  validatorHotkey: string;
  limitPrice: bigint;
  allowPartial?: boolean;
}

interface MoveStakeParams extends TransactionParams {
  address: string;
  fromSubnetId: number;
  fromHotkey: string;
  toSubnetId: number;
  toHotkey: string;
}

export interface TransferTaoParams extends TransactionParams {
  fromAddress: string;
  toAddress: string;
}

export interface TransactionProps {
  address: string;
  dashboardState: DashboardState;
  onRefresh: () => void;
}

export interface AmountState {
  amount: string;
  amountInRao: bigint | null;
}

export type TransactionStatus = 'ready' | 'broadcast' | 'inBlock' | 'success' | 'failed';

const Transaction = ({ address, dashboardState, onRefresh }: TransactionProps) => {
  const { api } = usePolkadotApi();
  const { setDashboardValidators, resetDashboardState } = useDashboard();
  const { showNotification } = useNotification();

  const { data: dashboardSubnets, isLoading: isLoadingSubnets } = newApi.subnets.getAll();
  const { data: dashboardStakes } = newApi.stakes.getAllStakes(address);

  const [selectedSubnetId, setSelectedSubnetId] = useState<number | null>(null);
  const [selectedValidatorHotkey, setSelectedValidatorHotkey] = useState<string | null>(null);

  const dashboardSubnet = useMemo(() => {
    if (!dashboardSubnets || selectedSubnetId === null) return null;
    return dashboardSubnets.find(subnet => subnet.id === selectedSubnetId) || null;
  }, [dashboardSubnets, selectedSubnetId]);

  const { data: dashboardValidators } = newApi.validators.getAllValidators(
    dashboardSubnet?.id || 0
  );

  // Query-based dashboardValidator - derived from validators list and selected hotkey
  const dashboardValidator = useMemo(() => {
    if (!dashboardValidators || !selectedValidatorHotkey) return null;
    return (
      dashboardValidators.find(validator => validator.hotkey === selectedValidatorHotkey) || null
    );
  }, [dashboardValidators, selectedValidatorHotkey]);

  // Helper function to replace context setter
  const setDashboardValidator = (validator: Validator | null) => {
    setSelectedValidatorHotkey(validator?.hotkey || null);
  };

  // Clear validator selection when subnet changes
  useEffect(() => {
    setSelectedValidatorHotkey(null);
  }, [selectedSubnetId]);

  const { data: dashboardStake } = newApi.stakes.getStakesByValidatorAndSubnet(
    address,
    dashboardValidator?.hotkey || '',
    dashboardSubnet?.id || 0
  );

  const [amountState, setAmountState] = useState<AmountState>({
    amount: '',
    amountInRao: null,
  });
  // Slippage defaults to 0.5%
  const [slippage, setSlippage] = useState<string>('0.5');
  const [toAddress, setToAddress] = useState<string>('');
  const [toSubnet, setToSubnet] = useState<Subnet | null>(null);
  const [toValidator, setToValidator] = useState<Validator | null>(null);
  const [showSubnetSelection, setShowSubnetSelection] = useState(false);
  const [showValidatorSelection, setShowValidatorSelection] = useState(false);
  const [showTransactionConfirmation, setShowTransactionConfirmation] = useState(false);
  const [transactionParams, setTransactionParams] = useState<TransactionParams | null>(null);

  const calculateLimitPrice = (subnet: Subnet, slippage: string): bigint => {
    const priceInRao = taoToRao(subnet.price);
    const slippageValue = Number(slippage) / 100;

    if (
      dashboardState === DashboardState.CREATE_STAKE ||
      dashboardState === DashboardState.ADD_STAKE
    ) {
      const priceLimit = taoToRao(subnet.price * (1 + slippageValue));
      return priceLimit;
    } else if (dashboardState === DashboardState.REMOVE_STAKE) {
      const priceLimit = taoToRao(subnet.price * (1 - slippageValue));
      return priceLimit;
    }
    return priceInRao;
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
  const handleSetupTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!api) return;
    if (amountState.amountInRao === null) return;

    let params: TransactionParams;
    let limitPrice: bigint;
    switch (dashboardState) {
      case DashboardState.CREATE_STAKE:
        if (!dashboardValidator || !dashboardSubnet) return;
        limitPrice = calculateLimitPrice(dashboardSubnet, slippage);
        params = {
          address,
          subnetId: dashboardSubnet.id,
          validatorHotkey: dashboardValidator.hotkey,
          amount: amountState.amount,
          // amountState.amountInRao is a number for some reason
          amountInRao: BigInt(amountState.amountInRao),
          limitPrice,
        } as StakeParams;
        break;
      case DashboardState.ADD_STAKE:
      case DashboardState.REMOVE_STAKE:
        if (!dashboardStake || !dashboardSubnet) return;
        limitPrice = calculateLimitPrice(dashboardSubnet, slippage);
        params = {
          address,
          subnetId: dashboardSubnet.id,
          validatorHotkey: dashboardStake.hotkey,
          amount: amountState.amount,
          amountInRao: BigInt(amountState.amountInRao),
          limitPrice,
        } as StakeParams;
        break;
      case DashboardState.MOVE_STAKE:
        if (!dashboardStake || !toValidator || !toSubnet) return;
        params = {
          address,
          fromSubnetId: dashboardStake.netuid,
          fromHotkey: dashboardStake.hotkey,
          toSubnetId: toSubnet.id,
          toHotkey: toValidator.hotkey,
          amount: amountState.amount,
          amountInRao: BigInt(amountState.amountInRao),
        } as MoveStakeParams;
        break;
      case DashboardState.TRANSFER:
        if (toAddress === '') return;
        params = {
          fromAddress: address,
          toAddress,
          amount: amountState.amount,
          amountInRao: BigInt(amountState.amountInRao),
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
          await api.createStakeLimit(params as StakeParams, onStatusChange);
          break;
        case DashboardState.REMOVE_STAKE:
          await api.removeStakeLimit(params as StakeParams, onStatusChange);
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
    if (showSubnetSelection && dashboardSubnets && !isLoadingSubnets) {
      return (
        <div className="w-full">
          <SubnetSelection
            subnets={dashboardSubnets}
            toSubnet={toSubnet}
            dashboardSubnet={dashboardSubnet}
            dashboardValidators={dashboardValidators || null}
            setToSubnet={setToSubnet}
            setDashboardValidators={setDashboardValidators}
            onCancel={handleSubnetCancel}
            onConfirm={handleSubnetConfirm}
          />
        </div>
      );
    }

    // Users should not be able to change subnet for adding to or removing from a stake
    if (
      dashboardSubnet &&
      (dashboardState === DashboardState.ADD_STAKE ||
        dashboardState === DashboardState.REMOVE_STAKE)
    ) {
      return (
        <div className="w-full p-2 bg-mf-night-400 rounded-md flex items-center justify-between">
          <p className="text-mf-edge-700 text-sm font-medium">{dashboardSubnet.name}</p>
          <CircleCheckBig className="w-4 h-4 text-mf-sybil-500" />
        </div>
      );
    }

    // Show "Select Subnet" and allow changes
    if (dashboardState === DashboardState.MOVE_STAKE) {
      if (toSubnet) {
        return (
          <button
            type="button"
            className="w-full p-2 bg-mf-night-400 rounded-md cursor-pointer flex items-center justify-between"
            onClick={handleSubnetSelection}
          >
            <p className="text-mf-edge-700 text-sm font-medium">{toSubnet.name}</p>
            <ChevronRight className="w-4 h-4 text-mf-edge-500" />
          </button>
        );
      }
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

    // Show "Select Subnet" and allow changes
    if (dashboardState === DashboardState.CREATE_STAKE) {
      if (dashboardSubnet) {
        return (
          <button
            type="button"
            className="w-full p-2 bg-mf-night-400 rounded-md cursor-pointer flex items-center justify-between"
            onClick={handleSubnetSelection}
          >
            <p className="text-mf-edge-700 text-sm font-medium">{dashboardSubnet.name}</p>
            <ChevronRight className="w-4 h-4 text-mf-edge-500" />
          </button>
        );
      }
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

    // Default case
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
  };

  const renderValidatorSelection = () => {
    if (showValidatorSelection && dashboardValidators) {
      return (
        <div className="w-full">
          <ValidatorSelection
            validators={dashboardValidators}
            toValidator={toValidator}
            setToValidator={setToValidator}
            onCancel={handleValidatorCancel}
            onConfirm={handleValidatorConfirm}
          />
        </div>
      );
    }

    // Users should not be able to change validator for adding to or removing from a stake
    if (
      dashboardValidator &&
      (dashboardState === DashboardState.ADD_STAKE ||
        dashboardState === DashboardState.REMOVE_STAKE)
    ) {
      return (
        <div className="w-full p-2 bg-mf-night-400 rounded-md flex items-center justify-between">
          <div className="flex gap-1">
            <p className="text-mf-edge-500 font-medium truncate max-w-[16ch]">
              {dashboardValidator.name || 'Validator'}
            </p>
            <span className="text-mf-edge-700 font-medium">
              {dashboardValidator.hotkey.slice(0, 6)}...{dashboardValidator.hotkey.slice(-6)}
            </span>
          </div>
          <CircleCheckBig className="w-4 h-4 text-mf-sybil-500" />
        </div>
      );
    }

    // Show "Select Validator" and allow changes
    if (dashboardState === DashboardState.MOVE_STAKE) {
      if (toValidator) {
        return (
          <button
            type="button"
            className="w-full p-2 bg-mf-night-400 rounded-md cursor-pointer flex items-center justify-between"
            onClick={handleValidatorSelection}
          >
            <div className="flex gap-1">
              <p className="text-mf-edge-500 font-medium truncate max-w-[16ch]">
                {toValidator.name || 'Validator'}
              </p>
              <span className="text-mf-edge-700 font-medium">
                {toValidator.hotkey.slice(0, 6)}...{toValidator.hotkey.slice(-6)}
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-mf-edge-500" />
          </button>
        );
      }
      return (
        <button
          type="button"
          className="w-full p-2 bg-mf-night-400 rounded-md cursor-pointer flex items-center justify-between"
          onClick={handleValidatorSelection}
        >
          <p className="text-mf-edge-700 text-sm font-medium">Select Validator</p>
          <ChevronRight className="w-4 h-4 text-mf-edge-500" />
        </button>
      );
    }

    // Show "Select Validator" and allow changes
    if (dashboardState === DashboardState.CREATE_STAKE) {
      if (dashboardValidator) {
        return (
          <button
            type="button"
            className="w-full p-2 bg-mf-night-400 rounded-md cursor-pointer flex items-center justify-between"
            onClick={handleValidatorSelection}
          >
            <div className="flex gap-1">
              <p className="text-mf-edge-500 font-medium truncate max-w-[16ch]">
                {dashboardValidator.name || 'Validator'}
              </p>
              <span className="text-mf-edge-700 font-medium">
                {dashboardValidator.hotkey.slice(0, 6)}...{dashboardValidator.hotkey.slice(-6)}
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-mf-edge-500" />
          </button>
        );
      }
      return (
        <button
          type="button"
          className="w-full p-2 bg-mf-night-400 rounded-md cursor-pointer flex items-center justify-between"
          onClick={handleValidatorSelection}
        >
          <p className="text-mf-edge-700 text-sm font-medium">Select Validator</p>
          <ChevronRight className="w-4 h-4 text-mf-edge-500" />
        </button>
      );
    }

    // Default case
    return (
      <button
        type="button"
        className="w-full p-2 bg-mf-night-400 rounded-md cursor-pointer flex items-center justify-between"
        onClick={handleValidatorSelection}
      >
        <p className="text-mf-edge-700 text-sm font-medium">Select Validator</p>
        <ChevronRight className="w-4 h-4 text-mf-edge-500" />
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
    setSelectedSubnetId(null);
    setSelectedValidatorHotkey(null);
    setDashboardValidator(null);
    setDashboardValidators(null);
    setShowSubnetSelection(false);
  };

  const handleSubnetConfirm = (subnet: Subnet, validators: Validator[]) => {
    setSelectedSubnetId(subnet.id);
    setSelectedValidatorHotkey(null);
    setDashboardValidator(null);
    setDashboardValidators(validators);
    setShowSubnetSelection(false);
  };

  const handleValidatorCancel = () => {
    setSelectedValidatorHotkey(null);
    setShowValidatorSelection(false);
  };

  const handleValidatorConfirm = (validator: Validator) => {
    setSelectedValidatorHotkey(validator.hotkey);
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
      {showSubnetSelection && dashboardSubnets && !isLoadingSubnets ? (
        <SubnetSelection
          subnets={dashboardSubnets}
          toSubnet={toSubnet}
          dashboardSubnet={dashboardSubnet}
          dashboardValidators={dashboardValidators || null}
          setToSubnet={setToSubnet}
          setDashboardValidators={setDashboardValidators}
          onCancel={handleSubnetCancel}
          onConfirm={handleSubnetConfirm}
        />
      ) : showValidatorSelection && dashboardValidators ? (
        <ValidatorSelection
          validators={dashboardValidators}
          toValidator={toValidator}
          setToValidator={setToValidator}
          onCancel={handleValidatorCancel}
          onConfirm={handleValidatorConfirm}
        />
      ) : showTransactionConfirmation && transactionParams ? (
        <ConfirmTransaction
          params={transactionParams}
          dashboardSubnet={dashboardSubnet}
          dashboardSubnets={dashboardSubnets || null}
          dashboardValidator={dashboardValidator}
          dashboardStake={dashboardStake || null}
          dashboardStakes={dashboardStakes || null}
          submitTransaction={submitTransaction}
          onCancel={handleTransactionConfirmationCancel}
        />
      ) : (
        <TransactionForm
          amountState={amountState}
          toAddress={toAddress}
          slippage={slippage}
          dashboardSubnet={dashboardSubnet}
          dashboardSubnets={dashboardSubnets || null}
          setAmountState={setAmountState}
          setToAddress={setToAddress}
          setSlippage={setSlippage}
          handleSetupTransaction={handleSetupTransaction}
          renderSubnetSelection={renderSubnetSelection}
          renderValidatorSelection={renderValidatorSelection}
        />
      )}
    </>
  );
};

export default Transaction;
