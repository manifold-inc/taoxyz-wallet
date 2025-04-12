import { motion } from 'framer-motion';
import { Copy } from 'lucide-react';

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import type { KeyringPair } from '@polkadot/keyring/types';

import { useNotification } from '@/client/contexts/NotificationContext';
import { useWalletCreation } from '@/client/contexts/WalletCreationContext';
import KeyringService from '@/client/services/KeyringService';
import { NotificationType } from '@/types/client';

interface DisplayMnemonicProps {
  onContinue: (wallet: KeyringPair) => void;
}

const DisplayMnemonic = ({ onContinue }: DisplayMnemonicProps) => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const { state, actions } = useWalletCreation();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      showNotification({
        type: NotificationType.Warning,
        title: 'Safely Secure Passphrase',
        message: 'Please store in a secure location',
        duration: 3000,
      });
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleCopyMnemonic = async (): Promise<void> => {
    if (!state.mnemonic) return;
    await navigator.clipboard.writeText(state.mnemonic);
    setCopied(true);
    showNotification({
      type: NotificationType.Success,
      title: 'Recovery Phrase Copied',
    });
    setTimeout(() => setCopied(false), 2500);
  };

  const handleBack = (): void => {
    if (state.wallet) {
      KeyringService.deleteWallet(state.wallet.address);
    }
    actions.reset();
    navigate('/welcome', { state: { step: 'GET_STARTED' } });
  };

  if (!state.mnemonic) {
    handleBack();
    return null;
  }

  return (
    <div className="flex flex-col items-center justify-center w-full px-12 [&>*]:w-full">
      {/* Mnemonic */}
      <div className="relative">
        <textarea
          value={state.mnemonic}
          readOnly
          className={`cursor-not-allowed p-3 h-36 text-base rounded-sm bg-mf-night-300 text-mf-edge-700 border-2 border-mf-night-300 focus:outline-none w-full resize-none ${
            copied ? 'border-mf-sybil-500' : 'border-mf-safety-500'
          }`}
        />
        <button
          onClick={handleCopyMnemonic}
          className={`absolute right-2 bottom-3 transition-colors cursor-pointer bg-mf-night-300 ${
            copied ? 'text-mf-sybil-500' : 'text-mf-safety-500'
          }`}
        >
          <Copy className="w-4 h-4" />
        </button>
      </div>

      {/* Mnemonic Status */}
      <div className="h-8">
        <p className={`pt-1 text-xs ${copied ? 'text-mf-sybil-500' : 'text-mf-safety-500'}`}>
          Save and Store in a Secure Location
        </p>
      </div>

      {/* Buttons */}
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
          onClick={() => state.wallet && onContinue(state.wallet)}
          className="cursor-pointer flex items-center gap-1.5 px-6 py-1 bg-mf-sybil-opacity rounded-full text-sm text-mf-sybil-500 border border-mf-sybil-opacity hover:border-mf-sybil-500 transition-colors hover:text-mf-edge-500"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span>Continue</span>
        </motion.button>
      </div>
    </div>
  );
};

export default DisplayMnemonic;
