import taoxyz from '@public/assets/taoxyz.svg';

import { useState } from 'react';

import WalletSelection from '@/client/components/common/WalletSelection';
import { useLock } from '@/client/contexts/LockContext';
import { useNotification } from '@/client/contexts/NotificationContext';
import { useWallet } from '@/client/contexts/WalletContext';
import KeyringService from '@/client/services/KeyringService';
import MessageService from '@/client/services/MessageService';
import { NotificationType } from '@/types/client';

interface LockScreenProps {
  isLocked: boolean;
}

const LockScreen = ({ isLocked }: LockScreenProps) => {
  const { setIsLocked } = useLock();
  const { showNotification } = useNotification();
  const { currentAddress } = useWallet();
  const [password, setPassword] = useState('');
  const [passwordSelected, setPasswordSelected] = useState(false);

  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setPassword(event.target.value);
  };

  const handleUnlock = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    if (password.length < 8) return;

    if (!currentAddress) {
      showNotification({
        type: NotificationType.Error,
        message: 'No Wallet Selected',
      });
      return;
    }

    try {
      const isUnlocked = KeyringService.unlockWallet(currentAddress, password);
      if (isUnlocked) {
        setPassword('');
        await setIsLocked(false);
        await MessageService.sendStartLockTimer();
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

  if (!isLocked) return null;

  return (
    <div className="fixed inset-0 z-50 bg-mf-night-500">
      <div className="flex flex-col items-center justify-start w-full h-full pt-6 gap-10">
        {/* Wallet Selection */}
        <WalletSelection />

        {/* Header */}
        <div className="flex flex-col items-center justify-center gap-3 pt-8">
          <img src={taoxyz} alt="Taoxyz Logo" className="w-8 h-8" />
          <p className="text-mf-edge-500 text-2xl font-bold blinker-font">UNLOCK WALLET</p>
        </div>

        {/* Unlock Form */}
        <form
          onSubmit={handleUnlock}
          className="flex flex-col items-center justify-center [&>*]:w-full gap-4"
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

          <div className="flex flex-col items-center pt-4">
            <button
              type="submit"
              disabled={password.length < 8}
              className="rounded-full cursor-pointer border-sm text-sm text-mf-sybil-500 bg-mf-sybil-opacity border border-mf-sybil-opacity px-6 py-1 hover:opacity-50 disabled:disabled-button disabled:cursor-not-allowed"
            >
              <span>Unlock</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LockScreen;
