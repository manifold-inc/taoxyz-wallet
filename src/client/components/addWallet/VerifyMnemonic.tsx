import { motion } from 'framer-motion';

import { useEffect, useState } from 'react';

import type { KeyringPair } from '@polkadot/keyring/types';

import { useNotification } from '@/client/contexts/NotificationContext';
import { NotificationType } from '@/types/client';

interface MnemonicVerifyProps {
  mnemonic: string;
  wallet: KeyringPair;
  onContinue: (wallet: KeyringPair) => void;
}

const MnemonicVerify = ({ mnemonic, wallet, onContinue }: MnemonicVerifyProps) => {
  const { showNotification } = useNotification();
  const [inputMnemonic, setInputMnemonic] = useState('');

  const verifyMnemonic = (input: string) => {
    const normalizedInput = input.trim().toLowerCase();
    const normalizedMnemonic = mnemonic.trim().toLowerCase();

    if (normalizedInput === normalizedMnemonic) {
      onContinue(wallet);
    } else {
      showNotification({
        type: NotificationType.Error,
        message: 'Recovery phrase is incorrect',
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setInputMnemonic(value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    verifyMnemonic(inputMnemonic);
  };

  useEffect(() => {
    showNotification({
      type: NotificationType.Info,
      title: 'Verify Recovery Phrase',
      message: 'Enter your recovery phrase for verification',
      duration: 5000,
    });
  }, []);

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col items-center justify-center w-full px-12 [&>*]:w-full"
    >
      <div className="relative">
        <textarea
          value={inputMnemonic}
          onChange={handleInputChange}
          className={`p-3 h-36 text-base rounded-sm bg-mf-night-300 border-mf-night-300 text-mf-edge-700 border-2 focus:outline-none w-full resize-none`}
          placeholder="Enter Your Recovery Phrase"
        />
      </div>

      <div className="flex flex-col items-center pt-4">
        <motion.button
          type="submit"
          className="cursor-pointer flex items-center gap-1.5 px-6 py-1 bg-mf-sybil-opacity rounded-full text-sm text-mf-sybil-500 border border-mf-sybil-opacity hover:border-mf-sybil-500 transition-colors hover:text-mf-edge-500"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span>Verify</span>
        </motion.button>
      </div>
    </form>
  );
};

export default MnemonicVerify;
