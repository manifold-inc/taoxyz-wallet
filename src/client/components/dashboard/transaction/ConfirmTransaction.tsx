import taoxyz from '@public/assets/taoxyz.svg';

import { useState } from 'react';

import SlippageDisplay from '@/client/components/common/SlippageDisplay';
import type { TransactionParams } from '@/client/components/dashboard/transaction/Transaction';
import type { TransactionStatus } from '@/client/components/dashboard/transaction/Transaction';
import { DashboardState, useDashboard } from '@/client/contexts/DashboardContext';
import { useLock } from '@/client/contexts/LockContext';
import { useNotification } from '@/client/contexts/NotificationContext';
import { useWallet } from '@/client/contexts/WalletContext';
import KeyringService from '@/client/services/KeyringService';
import MessageService from '@/client/services/MessageService';
import { NotificationType } from '@/types/client';
import { raoToTao } from '@/utils/utils';

interface ConfirmTransactionProps {
  params: TransactionParams;
  submitTransaction: (
    params: TransactionParams,
    onStatusChange: (status: string) => void
  ) => Promise<void>;
  onCancel: () => void;
}

const ConfirmTransaction = ({ params, submitTransaction, onCancel }: ConfirmTransactionProps) => {
  const { setIsLocked } = useLock();
  const { showNotification } = useNotification();
  const { currentAddress } = useWallet();
  const [password, setPassword] = useState('');
  const [passwordSelected, setPasswordSelected] = useState(false);
  const [status, setStatus] = useState<TransactionStatus>('ready');
  const { dashboardSubnet, dashboardValidator, dashboardFreeBalance, dashboardState } =
    useDashboard();

  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setPassword(event.target.value);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    if (password.length < 8) return;
    if (!currentAddress) {
      showNotification({
        type: NotificationType.Error,
        message: 'Wallet Not Found',
      });
      return;
    }

    try {
      const isUnlocked = KeyringService.unlockWallet(currentAddress, password);
      if (isUnlocked) {
        await setIsLocked(false);
        await MessageService.sendStartLockTimer();
        handleTransactionSubmit();
      } else {
        showNotification({
          type: NotificationType.Error,
          message: 'Failed to Unlock Wallet',
        });
      }
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === 'Unable to decode using the supplied passphrase'
      ) {
        showNotification({
          type: NotificationType.Error,
          message: 'Invalid Password',
        });
      } else {
        showNotification({
          type: NotificationType.Error,
          message: 'Failed to Unlock Wallet',
        });
      }
    }
  };

  const handleTransactionSubmit = async () => {
    try {
      const onStatusChange = (newStatus: string) => {
        switch (newStatus) {
          case 'ready':
            setStatus('ready');
            break;
          case 'broadcast':
            setStatus('broadcast');
            break;
          case 'inBlock':
            setStatus('inBlock');
            break;
          case 'success':
            setStatus('success');
            break;
          case 'failed':
            setStatus('failed');
            break;
          default:
            break;
        }
      };

      await submitTransaction(params, onStatusChange);
    } catch {
      setStatus('failed');
      showNotification({
        type: NotificationType.Error,
        message: 'Failed to Submit Transaction',
      });
    }
  };

  const renderContent = () => {
    switch (status) {
      case 'broadcast':
        return (
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="w-8 h-8 border-4 border-mf-sybil-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-mf-edge-500 text-lg">Submitting Transaction...</p>
          </div>
        );
      case 'inBlock':
        return (
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="w-8 h-8 bg-mf-sybil-500 rounded-full flex items-center justify-center">
              <svg
                className="w-4 h-4 text-mf-night-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <p className="text-mf-sybil-500 text-lg">Transaction In Block</p>
            <button
              onClick={onCancel}
              type="button"
              className="rounded-full cursor-pointer border-sm text-sm text-mf-safety-500 bg-mf-safety-opacity border border-mf-safety-opacity transition-colors px-6 py-1 hover:opacity-50 hover:text-mf-edge-500 hover:border-mf-safety-500"
            >
              <span>Close</span>
            </button>
          </div>
        );
      case 'success':
        return (
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="w-8 h-8 bg-mf-sybil-500 rounded-full flex items-center justify-center">
              <svg
                className="w-4 h-4 text-mf-night-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <p className="text-mf-sybil-500 text-lg">Transaction Finalized</p>
            <button
              onClick={onCancel}
              type="button"
              className="rounded-full cursor-pointer border-sm text-sm text-mf-safety-500 bg-mf-safety-opacity border border-mf-safety-opacity transition-colors px-6 py-1 hover:opacity-50 hover:text-mf-edge-500 hover:border-mf-safety-500"
            >
              <span>Close</span>
            </button>
          </div>
        );
      case 'failed':
        return (
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="w-8 h-8 bg-mf-safety-500 rounded-full flex items-center justify-center">
              <svg
                className="w-4 h-4 text-mf-night-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <p className="text-mf-safety-500 text-lg">Transaction Failed</p>
            <button
              onClick={onCancel}
              type="button"
              className="rounded-full cursor-pointer border-sm text-sm text-mf-safety-500 bg-mf-safety-opacity border border-mf-safety-opacity transition-colors px-6 py-1 hover:opacity-50 hover:text-mf-edge-500 hover:border-mf-safety-500"
            >
              <span>Close</span>
            </button>
          </div>
        );
      default:
        return (
          <div className="w-full h-full flex flex-col items-center gap-3 px-5 pt-12">
            {/* Header */}
            <div className="w-full flex flex-col items-center justify-center gap-3">
              <img src={taoxyz} alt="Taoxyz Logo" className="w-8 h-8" />
              <p className="text-mf-edge-500 text-2xl font-bold blinker-font">
                CONFIRM TRANSACTION
              </p>
            </div>

            {/* Transaction Details */}
            <div className="w-full flex flex-col bg-mf-ash-500 rounded-md divide-y divide-mf-ash-300">
              {/* Subnet Details */}
              <div className="flex flex-col gap-2 p-3">
                <div className="flex justify-between">
                  <p className="text-mf-edge-700 text-sm font-medium">Selected Subnet</p>
                  <p className="text-mf-sybil-500 text-sm font-medium">{dashboardSubnet?.name}</p>
                </div>
                <div className="flex justify-between">
                  <p className="text-mf-edge-700 text-sm font-medium">Subnet Price</p>
                  <p className="text-mf-sybil-500 text-sm font-medium">
                    {dashboardSubnet?.price} {dashboardSubnet?.id === 0 ? 'τ' : 'α'}
                  </p>
                </div>
                <div className="flex justify-between">
                  <p className="text-mf-edge-700 text-sm font-medium">Selected Validator</p>
                  <p className="text-mf-sybil-500 text-sm font-medium">
                    {dashboardValidator?.hotkey.slice(0, 6)}...
                    {dashboardValidator?.hotkey.slice(-6)}
                  </p>
                </div>
              </div>

              {/* Amount Details */}
              <SlippageDisplay
                amount={raoToTao(params.amountInRao).toString()}
                balance={raoToTao(dashboardFreeBalance ?? 0n).toString()}
                moveStake={dashboardState === DashboardState.MOVE_STAKE}
                isRoot={dashboardSubnet?.id === 0}
              />
            </div>

            {/* Password Input */}
            <form
              onSubmit={handleSubmit}
              className="flex flex-col items-center w-full [&>*]:w-full gap-3 px-10"
              autoComplete="off"
            >
              <input
                type="password"
                value={password}
                onChange={handlePasswordChange}
                onFocus={() => setPasswordSelected(true)}
                onBlur={() => setPasswordSelected(false)}
                placeholder="Enter Password"
                className={`p-2 rounded-sm text-base text-mf-edge-300 bg-mf-night-300 placeholder:text-mf-edge-700 border-1 focus:outline-none ${
                  password.length >= 8
                    ? passwordSelected
                      ? 'border-mf-sybil-500'
                      : 'border-transparent'
                    : 'border-transparent focus:border-mf-safety-500'
                }`}
                minLength={8}
              />

              <div className="flex justify-center items-center gap-3 w-full">
                <button
                  onClick={onCancel}
                  type="button"
                  className="rounded-full cursor-pointer border-sm text-sm text-mf-safety-500 bg-mf-safety-opacity border border-mf-safety-opacity transition-colors px-6 py-1 hover:opacity-50 hover:text-mf-edge-500 hover:border-mf-safety-500"
                >
                  <span>Cancel</span>
                </button>
                <button
                  type="submit"
                  disabled={password.length < 8}
                  className="rounded-full cursor-pointer border-sm text-sm text-mf-sybil-500 bg-mf-sybil-opacity border border-mf-sybil-opacity transition-colors px-6 py-1 disabled:disabled-button disabled:cursor-not-allowed hover:opacity-50 hover:text-[#c5dbff] hover:border-[#57e8b4]"
                >
                  <span>Submit</span>
                </button>
              </div>
            </form>
          </div>
        );
    }
  };

  return <div className="w-full h-full fixed inset-0 z-50 bg-mf-night-500">{renderContent()}</div>;
};

export default ConfirmTransaction;
