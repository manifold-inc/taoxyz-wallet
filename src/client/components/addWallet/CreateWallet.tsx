import { motion } from 'framer-motion';

import { useEffect, useState } from 'react';

import type { KeyringPair } from '@polkadot/keyring/types';

import { NotificationType } from '../../../types/client';
import { useNotification } from '../../contexts/NotificationContext';
import KeyringService from '../../services/KeyringService';

interface CreateWalletProps {
  onSuccess: (wallet: KeyringPair, mnemonic: string) => Promise<void>;
  onBack: () => void;
}

const CreateWallet = ({ onSuccess, onBack }: CreateWalletProps) => {
  const { showNotification } = useNotification();
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
    showNotification({
      type: NotificationType.Info,
      title: `Named ${getWalletName()} by Default`,
      message: 'Edit to Rename Wallet',
      autoHide: true,
    });
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
    if (!validateName(name) || !validatePassword(password)) {
      return;
    }

    const mnemonic = KeyringService.createMnemonic();
    const wallet = await KeyringService.addWallet(mnemonic, name, password);
    if (wallet instanceof Error) {
      showNotification({
        type: NotificationType.Error,
        message: wallet.message,
      });
      return;
    }
    await onSuccess(wallet, mnemonic);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col items-center justify-center w-full px-16 [&>*]:w-full"
    >
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
      <div className="h-8">
        {nameStatus && (
          <p
            className={`mt-2 text-xs text-left ${
              nameStatus === 'Valid Wallet Name' && !nameSelected
                ? 'hidden'
                : nameStatus === 'Valid Wallet Name'
                  ? 'text-mf-sybil-500'
                  : 'text-mf-safety-500'
            }`}
          >
            {nameStatus}
          </p>
        )}
      </div>

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
      <div className="h-8">
        {passwordStatus && (
          <p
            className={`mt-2 text-xs text-left ${
              passwordStatus === 'Valid Password' && !passwordSelected
                ? 'hidden'
                : passwordStatus === 'Valid Password'
                  ? 'text-mf-sybil-500'
                  : 'text-mf-safety-500'
            }`}
          >
            {passwordStatus}
          </p>
        )}
      </div>

      {/* Buttons */}
      <div className="flex flex-col items-center gap-3 pt-4">
        <motion.button
          type="button"
          onClick={onBack}
          className="cursor-pointer flex items-center gap-1.5 px-6 py-1 bg-mf-safety-opacity rounded-full text-sm text-mf-safety-500 border border-mf-safety-opacity hover:border-mf-safety-500 transition-colors hover:text-mf-edge-500"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span>Back</span>
        </motion.button>
        <motion.button
          type="submit"
          disabled={
            !name ||
            !password ||
            nameStatus !== 'Valid Wallet Name' ||
            passwordStatus !== 'Valid Password'
          }
          className="cursor-pointer flex items-center gap-1.5 px-6 py-1 bg-mf-sybil-opacity rounded-full text-sm text-mf-sybil-500 border border-mf-sybil-opacity hover:border-mf-sybil-500 transition-colors hover:text-mf-edge-500 disabled:opacity-50 disabled:cursor-not-allowed"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span>Create</span>
        </motion.button>
      </div>
    </form>
  );
};

export default CreateWallet;
