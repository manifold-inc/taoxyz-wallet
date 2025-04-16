import { motion } from 'framer-motion';

import { useState } from 'react';
import { useEffect } from 'react';

import SlippageDisplay from '@/client/components/common/SlippageDisplay';
import type { AmountState } from '@/client/components/dashboard/Transaction';
import { DashboardState, useDashboard } from '@/client/contexts/DashboardContext';
import { useLock } from '@/client/contexts/LockContext';
import { useNotification } from '@/client/contexts/NotificationContext';
import { useWallet } from '@/client/contexts/WalletContext';
import KeyringService from '@/client/services/KeyringService';
import MessageService from '@/client/services/MessageService';
import { NotificationType } from '@/types/client';
import { taoToRao } from '@/utils/utils';

interface TransactionFormProps {
  amountState: AmountState;
  toAddress: string;
  setAmountState: (amountState: AmountState) => void;
  setToAddress: (toAddress: string) => void;
  handleSetupTransaction: (e: React.FormEvent) => void;
  renderSubnetSelection: () => React.ReactNode;
  renderValidatorSelection: () => React.ReactNode;
}

const TransactionForm = ({
  amountState,
  toAddress,
  setAmountState,
  setToAddress,
  handleSetupTransaction,
  renderSubnetSelection,
  renderValidatorSelection,
}: TransactionFormProps) => {
  const { currentAddress } = useWallet();
  const { setIsLocked } = useLock();
  const { showNotification } = useNotification();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    resetDashboardState,
    dashboardSubnet,
    dashboardStake,
    dashboardFreeBalance,
    dashboardState,
    dashboardValidator,
    setDashboardFreeBalance,
  } = useDashboard();

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

    switch (dashboardState) {
      case DashboardState.CREATE_STAKE:
      case DashboardState.ADD_STAKE:
      case DashboardState.TRANSFER:
        if (dashboardFreeBalance === null) return;
        amount = dashboardFreeBalance.toString();
        amountInRao = taoToRao(dashboardFreeBalance);
        break;
      case DashboardState.REMOVE_STAKE:
      case DashboardState.MOVE_STAKE:
        if (dashboardStake === null) return;
        amount = dashboardStake.stake.toString();
        amountInRao = taoToRao(dashboardStake.stake);
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

    switch (dashboardState) {
      case DashboardState.CREATE_STAKE:
      case DashboardState.TRANSFER:
        if (dashboardFreeBalance === null) return false;
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
          />
        );
      case DashboardState.ADD_STAKE:
      case DashboardState.REMOVE_STAKE:
        return (
          <SlippageDisplay
            amount={amountState.amount}
            balance={dashboardStake.stake.toString()}
            isRoot={isRoot}
          />
        );
      case DashboardState.MOVE_STAKE:
        return (
          <SlippageDisplay
            amount={amountState.amount}
            balance={dashboardStake.stake.toString()}
            moveStake={true}
            isRoot={isRoot}
          />
        );
      default:
        return null;
    }
  };

  const handleAuth = async () => {
    // Address should never be null
    if (currentAddress === null) return;

    if (await KeyringService.isLocked(currentAddress)) {
      setIsLocked(true);
      await MessageService.sendWalletsLocked();

      const storeTransaction = async (key: string, data: Record<string, unknown>) => {
        await chrome.storage.local.set({ [key]: data });
        return false;
      };

      switch (dashboardState) {
        case DashboardState.CREATE_STAKE:
        case DashboardState.ADD_STAKE:
        case DashboardState.REMOVE_STAKE:
          if (dashboardSubnet === null || dashboardValidator === null) return;
          return await storeTransaction(`store${dashboardState}Transaction`, {
            address: currentAddress,
            subnet: dashboardSubnet,
            validator: dashboardValidator,
            amount: amountState.amount,
          });

        case DashboardState.MOVE_STAKE:
          if (dashboardStake === null || dashboardSubnet === null || dashboardValidator === null)
            return;
          return await storeTransaction('storeMoveStakeTransaction', {
            address: currentAddress,
            fromSubnetId: dashboardStake.netuid,
            fromHotkey: dashboardStake.hotkey,
            toSubnetId: dashboardSubnet.id,
            toHotkey: dashboardValidator.hotkey,
            amount: amountState.amount,
          });

        case DashboardState.TRANSFER:
          return await storeTransaction('storeTransferTransaction', {
            fromAddress: currentAddress,
            toAddress: toAddress,
            amount: amountState.amount,
          });

        default:
          return false;
      }
    }
    return true;
  };

  const restoreTransaction = async () => {
    const getStoredTransaction = async (key: string) => {
      const result = await chrome.storage.local.get(key);
      if (result[key]) {
        await chrome.storage.local.remove(key);
        return result[key];
      }
      return null;
    };

    let storedTransaction;
    switch (dashboardState) {
      case DashboardState.CREATE_STAKE:
        storedTransaction = await getStoredTransaction('storeCreateStakeTransaction');
        break;
      case DashboardState.ADD_STAKE:
        storedTransaction = await getStoredTransaction('storeAddStakeTransaction');
        break;
      case DashboardState.REMOVE_STAKE:
        storedTransaction = await getStoredTransaction('storeRemoveStakeTransaction');
        break;
      case DashboardState.MOVE_STAKE:
        storedTransaction = await getStoredTransaction('storeMoveStakeTransaction');
        break;
      case DashboardState.TRANSFER:
        storedTransaction = await getStoredTransaction('storeTransferTransaction');
        break;
    }

    if (storedTransaction) {
      setAmountState({
        amount: storedTransaction.amount,
        amountInRao: taoToRao(parseFloat(storedTransaction.amount)),
      });
      if (storedTransaction.toAddress) {
        setToAddress(storedTransaction.toAddress);
      }
    }
  };

  const logFormState = () => {
    console.log('Form State:', {
      isSubmitting,
      amount: amountState.amount,
      toAddress,
      dashboardSubnet: dashboardSubnet?.id,
      dashboardValidator: dashboardValidator?.hotkey,
      amountValidation: amountValidation(Number(amountState.amount)),
      disabledConditions: {
        submitButton:
          !dashboardSubnet ||
          !dashboardValidator ||
          !amountValidation(Number(amountState.amount)) ||
          isSubmitting,
        maxButton: isSubmitting,
        cancelButton: isSubmitting,
        amountInput: isSubmitting,
      },
    });
  };

  useEffect(() => {
    void setBalance();
    void restoreTransaction();
    logFormState();
  }, [dashboardState]);

  useEffect(() => {
    logFormState();
  }, [isSubmitting, amountState.amount, toAddress, dashboardSubnet, dashboardValidator]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    logFormState();

    const isAuthorized = await handleAuth();
    if (!isAuthorized) {
      setIsSubmitting(false);
      logFormState();
      return;
    }

    try {
      showNotification({
        message: 'Submitting Transaction...',
        type: NotificationType.Pending,
      });

      await handleSetupTransaction(e);

      showNotification({
        message: 'Transaction Successful!',
        type: NotificationType.Success,
      });
    } catch (error) {
      showNotification({
        message: error instanceof Error ? error.message : 'Transaction Failed',
        type: NotificationType.Error,
      });
    } finally {
      setIsSubmitting(false);
      logFormState();
    }
  };

  return (
    <div className="w-full h-full flex flex-col gap-3">
      <form className="flex flex-col gap-4 items-center justify-center" onSubmit={handleFormSubmit}>
        <div className="w-full flex flex-col gap-4 items-center justify-center">
          <div className="w-full flex items-center gap-2">
            <input
              type="text"
              value={amountState.amount}
              placeholder="Enter Amount"
              onChange={handleAmountChange}
              className="w-4/5 p-2 text-sm text-mf-edge-500 placeholder-mf-edge-700 bg-mf-night-300 rounded-md"
              disabled={isSubmitting}
            />
            <motion.button
              type="button"
              onClick={handleMaxAmount}
              className="w-1/5 text-mf-sybil-500 text-sm p-2 rounded-md bg-mf-sybil-opacity cursor-pointer disabled:cursor-not-allowed"
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
            className="w-full rounded-md text-center cursor-pointer w-1/2 py-1.5 bg-mf-red-opacity border border-mf-red-opacity transition-colors text-mf-red-500 gap-1 disabled:cursor-not-allowed"
            whileHover={{ opacity: 0.5, color: '#c5dbff', borderColor: '#ff5a5a' }}
          >
            Cancel
          </motion.button>
          <motion.button
            type="submit"
            disabled={
              !dashboardSubnet ||
              !dashboardValidator ||
              !amountValidation(Number(amountState.amount)) ||
              isSubmitting
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
