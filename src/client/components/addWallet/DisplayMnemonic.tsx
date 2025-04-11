import { motion } from 'framer-motion';
import { Copy } from 'lucide-react';

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import type { KeyringPair } from '@polkadot/keyring/types';

import { useNotification } from '@/client/contexts/NotificationContext';
import KeyringService from '@/client/services/KeyringService';
import { NotificationType } from '@/types/client';

interface DisplayMnemonicProps {
  mnemonic: string;
  wallet: KeyringPair;
  onContinue: (wallet: KeyringPair) => void;
}

const DisplayMnemonic = ({ mnemonic, wallet, onContinue }: DisplayMnemonicProps) => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    showNotification({
      type: NotificationType.Warning,
      title: 'Safely Secure Passphrase',
      message: 'Cannot recover wallet without it',
      duration: 5000,
    });
  }, []);

  const handleCopyMnemonic = async (): Promise<void> => {
    await navigator.clipboard.writeText(mnemonic);
    setCopied(true);
    showNotification({
      type: NotificationType.Success,
      title: 'Recovery Phrase Copied',
    });
    setTimeout(() => setCopied(false), 2500);
  };

  const handleBack = (): void => {
    KeyringService.deleteWallet(wallet.address);
    navigate('/welcome', { state: { step: 'GET_STARTED' } });
  };

  return (
    <div className="flex flex-col items-center justify-center w-full px-12 [&>*]:w-full">
      <div className="relative">
        <textarea
          value={mnemonic}
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
      <div className="h-8">
        <p className={`pt-1.5 text-xs ${copied ? 'text-mf-sybil-500' : 'text-mf-safety-500'}`}>
          Save and Store in a Secure Location
        </p>
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
          onClick={() => onContinue(wallet)}
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
