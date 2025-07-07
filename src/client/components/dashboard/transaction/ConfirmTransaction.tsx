import taoxyz from '@public/assets/taoxyz.svg';
import { useQuery } from '@tanstack/react-query';

import { useEffect, useState } from 'react';

import SlippageDisplay from '@/client/components/common/SlippageDisplay';
import type {
  TransactionParams,
  TransferTaoParams,
} from '@/client/components/dashboard/transaction/Transaction';
import type { TransactionStatus } from '@/client/components/dashboard/transaction/Transaction';
import { DashboardState, useDashboard } from '@/client/contexts/DashboardContext';
import { useLock } from '@/client/contexts/LockContext';
import { useNotification } from '@/client/contexts/NotificationContext';
import { usePolkadotApi } from '@/client/contexts/PolkadotApiContext';
import { useWallet } from '@/client/contexts/WalletContext';
import KeyringService from '@/client/services/KeyringService';
import MessageService from '@/client/services/MessageService';
import type { Stake, Subnet, Validator } from '@/types/client';
import { NotificationType } from '@/types/client';
import { formatNumber, raoToTao } from '@/utils/utils';

interface ConfirmTransactionProps {
  params: TransactionParams | TransferTaoParams;
  dashboardSubnet: Subnet | null;
  dashboardSubnets: Subnet[] | null;
  dashboardValidator: Validator | null;
  dashboardStake: Stake | null;
  dashboardStakes: Stake[] | null;
  submitTransaction: (
    params: TransactionParams | TransferTaoParams,
    onStatusChange: (status: string) => void
  ) => Promise<void>;
  onCancel: () => void;
}

const ConfirmTransaction = ({
  params,
  dashboardSubnet,
  dashboardSubnets,
  dashboardValidator,
  dashboardStake,
  submitTransaction,
  onCancel,
}: ConfirmTransactionProps) => {
  const { setIsLocked } = useLock();
  const { showNotification } = useNotification();
  const { currentAddress } = useWallet();
  const { api } = usePolkadotApi();
  const { dashboardState } = useDashboard();
  const [password, setPassword] = useState('');
  const [passwordSelected, setPasswordSelected] = useState(false);
  const [status, setStatus] = useState<TransactionStatus | null>(null);
  const [actualTotal, setActualTotal] = useState<bigint | null>(null);
  const [initialBalance, setInitialBalance] = useState<bigint | null>(null);

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

  const { data: stakes } = useQuery({
    queryKey: ['stakes', currentAddress],
    queryFn: () => api?.getStake(currentAddress ?? ''),
    enabled: !!api && !!currentAddress,
    refetchInterval: 10000,
  });

  const fetchUpdatedStake = async () => {
    if (!api || !currentAddress || !dashboardValidator) return;

    // If moving to a pre-existing stake
    const existingStake = stakes?.find(
      s => s.hotkey === dashboardValidator.hotkey && s.netuid === dashboardSubnet?.id
    );

    try {
      const [balance] = await Promise.all([api.getBalance(currentAddress)]);
      if (stakes) {
        const stake = stakes.find(
          s => s.hotkey === dashboardValidator.hotkey && s.netuid === dashboardSubnet?.id
        );
        // Calculate actual total based on transaction type
        switch (dashboardState) {
          case DashboardState.CREATE_STAKE:
            if (!stake) return;
            setActualTotal(stake.stake);
            break;
          case DashboardState.ADD_STAKE:
            if (dashboardStake) {
              if (!stake) return;
              setActualTotal(stake.stake - dashboardStake.stake);
            }
            break;
          case DashboardState.REMOVE_STAKE:
            if (initialBalance && balance) {
              setActualTotal(balance - initialBalance);
            }
            break;
          case DashboardState.MOVE_STAKE:
            if (existingStake) {
              if (!stake) return;
              setActualTotal(stake.stake - existingStake.stake);
            } else {
              if (!stake) return;
              setActualTotal(stake.stake);
            }
            break;
          case DashboardState.TRANSFER:
            setActualTotal(BigInt(params.amountInRao));
            break;
        }
      }
    } catch (error) {
      console.error('Error fetching updated stake:', error);
    }
  };

  const getInitialBalance = async () => {
    if (!api || !currentAddress) return;
    const balance = await api.getBalance(currentAddress);
    if (balance) {
      setInitialBalance(balance);
    }
  };

  useEffect(() => {
    void getInitialBalance();
    if (status === 'success') {
      void fetchUpdatedStake();
    }
  }, [status]);

  // Duplicated logic
  const renderTransferDetails = () => {
    let receiveToken = 't';
    const isDynamic = dashboardSubnet?.id !== 0;

    switch (dashboardState) {
      case DashboardState.CREATE_STAKE:
      case DashboardState.ADD_STAKE:
        if (isDynamic) {
          receiveToken = 'α';
        } else {
          receiveToken = 'τ';
        }
        break;
      case DashboardState.REMOVE_STAKE:
        receiveToken = 'τ';
        break;
      case DashboardState.MOVE_STAKE:
        if (isDynamic) {
          receiveToken = 'α';
        } else {
          receiveToken = 'τ';
        }
        break;
    }

    if (dashboardState !== DashboardState.TRANSFER) {
      return (
        <div className="divide-y divide-mf-ash-300">
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
          <SlippageDisplay
            amount={params.amount}
            dashboardSubnet={dashboardSubnet}
            dashboardSubnets={dashboardSubnets}
          />
          {status === 'success' && (
            <div className="flex justify-between p-3">
              <p className="text-mf-edge-300 text-sm font-medium">Actual Total</p>
              <p className="text-mf-sybil-500 text-sm font-medium">
                {formatNumber(raoToTao(actualTotal ?? 0n))} {receiveToken}
              </p>
            </div>
          )}
        </div>
      );
    } else {
      const transferParams = params as TransferTaoParams;
      return (
        <div className="flex flex-col gap-2 p-3">
          <div className="flex justify-between">
            <p className="text-mf-edge-700 text-sm font-medium">From</p>
            <p className="text-mf-sybil-500 text-sm font-medium">
              {transferParams.fromAddress.slice(0, 6)}...
              {transferParams.fromAddress.slice(-6)}
            </p>
          </div>
          <div className="flex justify-between">
            <p className="text-mf-edge-700 text-sm font-medium">Recipient</p>
            <p className="text-mf-sybil-500 text-sm font-medium">
              {transferParams.toAddress.slice(0, 6)}...
              {transferParams.toAddress.slice(-6)}
            </p>
          </div>
          <div className="flex justify-between">
            <p className="text-mf-edge-500 text-sm font-medium">Amount</p>
            <p className="text-mf-sybil-500 text-sm font-medium">
              {formatNumber(raoToTao(transferParams.amountInRao))} τ
            </p>
          </div>
        </div>
      );
    }
  };

  const renderContent = () => {
    switch (status) {
      case 'ready':
      case 'broadcast':
        return (
          <div className="flex flex-col justify-center items-center gap-4 px-5">
            <div className="w-8 h-8 border-4 border-mf-sybil-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-mf-edge-500 text-lg">Submitting Transaction...</p>
          </div>
        );
      case 'inBlock':
        return (
          <div className="flex flex-col items-center justify-center gap-4 px-5 pt-12">
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
              className="rounded-full cursor-pointer text-sm text-mf-safety-500 bg-mf-safety-opacity px-6 py-1 hover:opacity-50"
            >
              <span>Close</span>
            </button>
          </div>
        );
      case 'success':
        return (
          <div className="flex flex-col items-center justify-center gap-2 px-5 pt-2">
            <div className="w-7 h-7 bg-mf-sybil-500 rounded-full flex items-center justify-center">
              <svg
                className="w-3 h-3 text-mf-night-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={5}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <p className="text-mf-edge-500 text-lg">Transaction Finalized</p>

            {/* Transaction Details */}
            <div className="w-full flex flex-col bg-mf-ash-500 rounded-md divide-y divide-mf-ash-300">
              {renderTransferDetails()}
            </div>

            <button
              onClick={onCancel}
              type="button"
              className="rounded-full cursor-pointer text-sm text-mf-safety-500 bg-mf-safety-opacity px-6 py-1 mt-1 hover:opacity-50"
            >
              <span>Close</span>
            </button>
          </div>
        );
      case 'failed':
        return (
          <div className="flex flex-col items-center justify-center gap-4 px-5 pt-16">
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
              className="rounded-full cursor-pointer text-sm text-mf-safety-500 bg-mf-safety-opacity px-6 py-4 hover:opacity-50"
            >
              <span>Close</span>
            </button>
          </div>
        );
      default:
        return (
          <div className="w-full h-full flex flex-col items-center gap-5 px-5 pt-12">
            {/* Header */}
            <div className="w-full flex flex-col items-center justify-center gap-3">
              <img src={taoxyz} alt="Taoxyz Logo" className="w-8 h-8" />
              <p className="text-mf-edge-500 text-2xl font-bold blinker-font">
                CONFIRM TRANSACTION
              </p>
            </div>

            {/* Transaction Details */}
            <div className="w-full flex flex-col bg-mf-ash-500 rounded-md divide-y divide-mf-ash-300">
              {renderTransferDetails()}
            </div>

            {/* Password Input */}
            <form
              onSubmit={handleSubmit}
              className="flex flex-col items-center w-full [&>*]:w-full gap-4 px-12"
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

              <div className="flex justify-center items-center w-full gap-3">
                <button
                  onClick={onCancel}
                  type="button"
                  className="w-1/2 rounded-full cursor-pointer text-sm text-mf-safety-500 bg-mf-safety-opacity px-6 py-1.5 hover:opacity-50"
                >
                  <span>Cancel</span>
                </button>
                <button
                  type="submit"
                  disabled={password.length < 8}
                  className="w-1/2 rounded-full cursor-pointer text-sm text-mf-sybil-500 bg-mf-sybil-opacity px-6 py-1.5 disabled:bg-mf-ash-500 disabled:text-mf-edge-700 disabled:cursor-not-allowed hover:opacity-50"
                >
                  <span>Submit</span>
                </button>
              </div>
            </form>
          </div>
        );
    }
  };

  return (
    <div className="w-full h-full fixed inset-0 z-50 bg-mf-night-500 flex justify-center items-center">
      {renderContent()}
    </div>
  );
};

export default ConfirmTransaction;
