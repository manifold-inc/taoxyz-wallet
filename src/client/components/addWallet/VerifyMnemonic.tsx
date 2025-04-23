import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import type { KeyringPair } from '@polkadot/keyring/types';

import { useNotification } from '@/client/contexts/NotificationContext';
import { useWalletCreation } from '@/client/contexts/WalletCreationContext';
import KeyringService from '@/client/services/KeyringService';
import { NotificationType } from '@/types/client';

interface MnemonicVerifyProps {
  onContinue: (wallet: KeyringPair) => void;
}

const MnemonicVerify = ({ onContinue }: MnemonicVerifyProps) => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [inputMnemonic, setInputMnemonic] = useState('');
  const [inputMnemonicSelected, setInputMnemonicSelected] = useState(false);
  const [inputMnemonicStatus, setInputMnemonicStatus] = useState<string | null>(null);
  const { state, actions } = useWalletCreation();

  useEffect(() => {
    const timer = setTimeout(() => {
      showNotification({
        type: NotificationType.Info,
        title: 'Verify Recovery Phrase',
        message: 'Enter your recovery phrase',
        duration: 3000,
      });
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const verifyMnemonic = (input: string) => {
    if (!state.mnemonic || !state.wallet) return;

    const normalizedInput = input.trim().toLowerCase();
    const normalizedMnemonic = state.mnemonic.trim().toLowerCase();

    if (normalizedInput === normalizedMnemonic) {
      onContinue(state.wallet);
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
    if (state.wallet) {
      KeyringService.deleteWallet(state.wallet.address);
    }
    actions.reset();
    navigate('/welcome', { state: { step: 'GET_STARTED' } });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col items-center justify-center w-full px-12 [&>*]:w-full"
    >
      <div className="relative">
        {/* Mnemonic Input */}
        <textarea
          value={inputMnemonic}
          onChange={handleMnemonicChange}
          onFocus={() => setInputMnemonicSelected(true)}
          onBlur={() => setInputMnemonicSelected(false)}
          className={`p-3 h-36 text-base rounded-sm bg-mf-night-300 border-mf-night-300 text-mf-edge-700 border-2 focus:outline-none w-full resize-none focus:border-mf-safety-500`}
          placeholder="Enter Your Recovery Phrase"
        />
        {/* Mnemonic Status */}
        <div className="h-8">
          <p hidden={!inputMnemonicSelected} className={'pt-1.5 text-xs text-mf-safety-500'}>
            {inputMnemonicStatus}
          </p>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex flex-col items-center gap-3 pt-4 px-16">
        <button
          onClick={handleBack}
          className="w-full cursor-pointer text-center gap-1.5 px-6 py-1.5 bg-mf-safety-opacity rounded-full text-sm text-mf-safety-500 hover:opacity-50"
        >
          Back
        </button>
        <button
          type="submit"
          className="w-full cursor-pointer text-center gap-1.5 px-6 py-1.5 bg-mf-sybil-opacity rounded-full text-sm text-mf-sybil-500 hover:opacity-50"
        >
          Verify
        </button>
      </div>
    </form>
  );
};

export default MnemonicVerify;
