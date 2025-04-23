import { motion } from 'framer-motion';

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import type { KeyringPair } from '@polkadot/keyring/types';

import { useNotification } from '@/client/contexts/NotificationContext';
import { useWalletCreation } from '@/client/contexts/WalletCreationContext';
import KeyringService from '@/client/services/KeyringService';
import { NotificationType } from '@/types/client';

interface ImportWalletProps {
  onSuccess: (wallet: KeyringPair) => Promise<void>;
}

const ImportWallet = ({ onSuccess }: ImportWalletProps) => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const { state, actions } = useWalletCreation();
  const [password, setPassword] = useState('');
  const [nameSelected, setNameSelected] = useState(false);
  const [passwordSelected, setPasswordSelected] = useState(false);
  const [nameStatus, setNameStatus] = useState<string | null>('Valid Wallet Name');
  const [passwordStatus, setPasswordStatus] = useState<string | null>(null);

  const getWalletName = (): string => {
    const wallets = KeyringService.getWallets();
    return `Wallet ${wallets.length + 1}`;
  };

  const [name, setName] = useState(() => {
    return getWalletName();
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      showNotification({
        type: NotificationType.Info,
        title: `Named ${getWalletName()} by Default`,
        message: 'Edit to Rename Wallet',
      });
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const getWalletNameColor = (): string => {
    let color;
    if (name === getWalletName()) {
      color = 'text-mf-safety-500';
    } else {
      color = 'text-mf-edge-500';
    }
    return color;
  };

  const validateName = (value: string): boolean => {
    if (value.trim().length < 3) {
      setNameStatus('Minimum 3 Characters Required');
      return false;
    }
    setNameStatus(null);
    return true;
  };

  const validatePassword = (value: string): boolean => {
    if (value.trim().length < 8) {
      setPasswordStatus('Minimum 8 Characters Required');
      return false;
    }
    setPasswordStatus(null);
    return true;
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.value;
    setName(value);
    if (value.length > 0) {
      if (validateName(value)) {
        setNameStatus('Valid Wallet Name');
      }
    } else {
      setNameStatus(null);
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.value;
    setPassword(value);
    if (value.length > 0) {
      if (validatePassword(value)) {
        setPasswordStatus('Valid Password');
      }
    } else {
      setPasswordStatus(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!state.mnemonic) {
      showNotification({
        type: NotificationType.Error,
        message: 'Mnemonic Not Found',
      });
      return;
    }

    const wallet = await KeyringService.addWallet(state.mnemonic, name, password);
    if (wallet instanceof Error) {
      showNotification({
        type: NotificationType.Error,
        message: wallet.message,
      });
      return;
    }
    await onSuccess(wallet);
  };

  const handleBack = (): void => {
    if (state.wallet) {
      KeyringService.deleteWallet(state.wallet.address);
    }
    actions.reset();
    navigate('/welcome', { state: { step: 'GET_STARTED' } });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col items-center justify-center w-full px-16 [&>*]:w-full"
    >
      {/* Name Input */}
      <input
        type="text"
        value={name}
        onChange={handleNameChange}
        onFocus={() => setNameSelected(true)}
        onBlur={() => setNameSelected(false)}
        className={`p-2 rounded-sm text-sm ${getWalletNameColor()} bg-mf-night-300 placeholder:text-mf-edge-700 border-1 focus:outline-none ${
          nameStatus === 'Valid Wallet Name' && !nameSelected
            ? 'border-transparent'
            : nameStatus === 'Valid Wallet Name'
              ? 'border-mf-sybil-500'
              : nameSelected
                ? 'border-mf-safety-500'
                : nameStatus
                  ? 'border-mf-safety-500'
                  : 'border-transparent focus:border-mf-safety-500'
        }`}
        placeholder="Wallet Name"
        required
      />
      {/* Name Status */}
      <div className="h-8">
        <p
          hidden={!nameSelected && nameStatus === 'Valid Wallet Name'}
          className={`pt-2 text-xs text-left ${
            nameStatus === 'Valid Wallet Name' ? 'text-mf-sybil-500' : 'text-mf-safety-500'
          }`}
        >
          {nameStatus}
        </p>
      </div>

      {/* Password Input */}
      <input
        type="password"
        value={password}
        onChange={handlePasswordChange}
        onFocus={() => setPasswordSelected(true)}
        onBlur={() => setPasswordSelected(false)}
        className={`p-2 rounded-sm text-sm text-mf-edge-300 bg-mf-night-300 placeholder:text-mf-edge-700 border-1 focus:outline-none ${
          passwordStatus === 'Valid Password' && !passwordSelected
            ? 'border-transparent'
            : passwordStatus === 'Valid Password'
              ? 'border-mf-sybil-500'
              : passwordSelected
                ? 'border-mf-safety-500'
                : passwordStatus
                  ? 'border-mf-safety-500'
                  : 'border-transparent focus:border-mf-safety-500'
        }`}
        placeholder="Password"
        required
      />
      {/* Password Status */}
      <div className="h-8">
        <p
          hidden={!passwordSelected && passwordStatus === 'Valid Password'}
          className={`pt-2 text-xs text-left ${
            passwordStatus === 'Valid Password' ? 'text-mf-sybil-500' : 'text-mf-safety-500'
          }`}
        >
          {passwordStatus}
        </p>
      </div>

      {/* Buttons */}
      <div className="flex flex-col items-center gap-3 pt-4">
        <motion.button
          type="button"
          onClick={handleBack}
          className="cursor-pointer flex items-center gap-1.5 px-6 py-1 bg-mf-safety-opacity rounded-full text-sm text-mf-safety-500 border border-mf-safety-opacity hover:border-mf-safety-500 hover:text-mf-edge-500"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span>Back</span>
        </motion.button>
        <motion.button
          type="submit"
          disabled={nameStatus !== 'Valid Wallet Name' || passwordStatus !== 'Valid Password'}
          className="cursor-pointer flex items-center gap-1.5 px-6 py-1 bg-mf-sybil-opacity rounded-full text-sm text-mf-sybil-500 border border-mf-sybil-opacity hover:border-mf-sybil-500 hover:text-mf-edge-500 disabled:bg-mf-ash-500 disabled:border-mf-ash-500 disabled:text-mf-edge-700 disabled:cursor-not-allowed"
          whileHover={
            nameStatus === 'Valid Wallet Name' && passwordStatus === 'Valid Password'
              ? { scale: 1.05 }
              : undefined
          }
          whileTap={
            nameStatus === 'Valid Wallet Name' && passwordStatus === 'Valid Password'
              ? { scale: 0.95 }
              : undefined
          }
        >
          <span>Import</span>
        </motion.button>
      </div>
    </form>
  );
};

export default ImportWallet;
