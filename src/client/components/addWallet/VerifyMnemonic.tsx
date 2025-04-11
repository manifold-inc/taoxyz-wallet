import { motion } from 'framer-motion';

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import type { KeyringPair } from '@polkadot/keyring/types';

import { useNotification } from '@/client/contexts/NotificationContext';
import KeyringService from '@/client/services/KeyringService';
import { NotificationType } from '@/types/client';

interface MnemonicVerifyProps {
  mnemonic: string;
  wallet: KeyringPair;
  onContinue: (wallet: KeyringPair) => void;
}

const MnemonicVerify = ({ mnemonic, wallet, onContinue }: MnemonicVerifyProps) => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [inputMnemonic, setInputMnemonic] = useState('');
  const [inputMnemonicSelected, setInputMnemonicSelected] = useState(false);
  const [inputMnemonicStatus, setInputMnemonicStatus] = useState<string | null>(null);

  useEffect(() => {
    showNotification({
      type: NotificationType.Info,
      title: 'Verify Recovery Phrase',
      message: 'Enter your recovery phrase',
      duration: 5000,
    });
  }, []);

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

  const handleMnemonicChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setInputMnemonic(value);

    if (!value.trim()) {
      setInputMnemonicStatus('Recovery Phrase is Required');
      return;
    }

    const wordCount = value.trim().split(/\s+/).length;
    if (wordCount !== 12) {
      setInputMnemonicStatus('Recovery Phrase Must Be 12 Words');
      return;
    }

    setInputMnemonicStatus(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    verifyMnemonic(inputMnemonic);
  };

  const handleBack = (): void => {
    KeyringService.deleteWallet(wallet.address);
    navigate('/welcome', { state: { step: 'GET_STARTED' } });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col items-center justify-center w-full px-12 [&>*]:w-full"
    >
      <div className="relative">
        <textarea
          value={inputMnemonic}
          onChange={handleMnemonicChange}
          onFocus={() => setInputMnemonicSelected(true)}
          onBlur={() => setInputMnemonicSelected(false)}
          className={`p-3 h-36 text-base rounded-sm bg-mf-night-300 border-mf-night-300 text-mf-edge-700 border-2 focus:outline-none w-full resize-none focus:border-mf-safety-500`}
          placeholder="Enter Your Recovery Phrase"
        />
        <div className="h-8">
          <p hidden={!inputMnemonicSelected} className={'pt-1.5 text-xs text-mf-safety-500'}>
            {inputMnemonicStatus}
          </p>
        </div>
      </div>

      <div className="flex flex-col items-center gap-3 pt-4">
        <motion.button
          onClick={handleBack}
          className="cursor-pointer flex items-center gap-1.5 px-6 py-1 bg-mf-safety-opacity rounded-full text-sm text-mf-safety-500 border border-mf-safety-opacity hover:border-mf-safety-500 transition-colors hover:text-mf-edge-500"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span>Back</span>
        </motion.button>
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
