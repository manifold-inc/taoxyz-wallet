import { motion } from 'framer-motion';

import type { KeyringPair } from '@polkadot/keyring/types';

import { useWalletCreation } from '../../contexts/WalletCreationContext';

interface DisplayMnemonicProps {
  onContinue: (wallet: KeyringPair) => Promise<void>;
  wallet: KeyringPair;
}

const DisplayMnemonic = ({ onContinue, wallet }: DisplayMnemonicProps) => {
  const { state } = useWalletCreation();

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <div className="bg-mf-night-300 p-4 rounded-sm w-full">
        <p className="text-mf-edge-500 text-sm text-center">{state.mnemonic}</p>
      </div>
      <motion.button
        className="mt-8 cursor-pointer flex items-center gap-1.5 px-6 py-1 bg-mf-sybil-opacity rounded-full text-sm text-mf-sybil-500 border border-mf-sybil-opacity hover:border-mf-sybil-500 transition-colors hover:text-mf-edge-500"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onContinue(wallet)}
      >
        <span>Continue</span>
      </motion.button>
    </div>
  );
};

export default DisplayMnemonic;
