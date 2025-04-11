import { motion } from 'framer-motion';

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { NotificationType } from '../../../types/client';
import { useNotification } from '../../contexts/NotificationContext';
import KeyringService from '../../services/KeyringService';

interface ImportMnemonicProps {
  onContinue: (mnemonic: string) => void;
}

const ImportMnemonic = ({ onContinue }: ImportMnemonicProps) => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [mnemonic, setMnemonic] = useState('');
  const [mnemonicSelected, setMnemonicSelected] = useState(false);
  const [mnemonicStatus, setMnemonicStatus] = useState<string | null>(null);

  const handleMnemonicChange = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
    setMnemonic(e.target.value);
    const wordCount = e.target.value.trim().split(/\s+/).length;
    if (wordCount !== 12) {
      setMnemonicStatus('Recovery Phrase Must Be 12 Words');
    }
  };

  const validateMnemonic = async (): Promise<boolean> => {
    if (!mnemonic.trim()) {
      showNotification({
        type: NotificationType.Error,
        message: 'Recovery Phrase is Required',
      });
      setMnemonicStatus(null);
      return false;
    }

    const wordCount = mnemonic.trim().split(/\s+/).length;
    if (wordCount !== 12) {
      showNotification({
        type: NotificationType.Error,
        message: 'Recovery Phrase Must Be 12 Words',
      });
      setMnemonicStatus(null);
      return false;
    }

    if (!KeyringService.validateMnemonic(mnemonic.trim())) {
      showNotification({
        type: NotificationType.Error,
        message: 'Recovery Phrase is Invalid',
      });
      setMnemonicStatus(null);
      return false;
    }

    const isDuplicate = await KeyringService.checkDuplicate(mnemonic.trim());
    if (isDuplicate) {
      showNotification({
        type: NotificationType.Error,
        message: 'Wallet Already Exists',
      });
      setMnemonicStatus(null);
      return false;
    }

    return true;
  };

  const handleSubmit = async (event: React.FormEvent): Promise<void> => {
    event.preventDefault();
    const isValid = await validateMnemonic();
    if (isValid) {
      onContinue(mnemonic.trim());
    }
  };

  const handleBack = (): void => {
    navigate('/welcome');
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col items-center justify-center w-full px-12 [&>*]:w-full"
    >
      {/* Mnemonic Input */}
      <textarea
        name="mnemonic"
        value={mnemonic}
        onFocus={() => setMnemonicSelected(true)}
        onBlur={() => setMnemonicSelected(false)}
        required
        onChange={handleMnemonicChange}
        className={`p-2 h-36 text-base rounded-sm border-mf-night-300 focus:border-mf-safety-500 bg-mf-night-300 text-mf-edge-700 placeholder:text-mf-edge-700 border-1 border-mf-night-300 focus:outline-none resize-none ${
          mnemonicStatus === 'Valid Mnemonic' ? 'border-mf-safety-500' : 'border-mf-sybil-500'
        }`}
        placeholder="Enter 12 Word Recovery Phrase"
      />
      <div className="h-8">
        <p
          hidden={!mnemonicSelected}
          className={`pt-1 text-xs text-mf-safety-500 ${
            mnemonicStatus === 'Valid Mnemonic' ? 'text-mf-safety-500' : 'text-mf-sybil-500'
          }`}
        >
          {mnemonicStatus}
        </p>
      </div>

      {/* Buttons */}
      <div className="flex flex-col items-center gap-3 pt-4">
        <motion.button
          type="button"
          onClick={handleBack}
          className="cursor-pointer flex items-center gap-1.5 px-6 py-1 bg-mf-safety-opacity rounded-full text-sm text-mf-safety-500 border border-mf-safety-opacity hover:border-mf-safety-500 transition-colors hover:text-mf-edge-500"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span>Back</span>
        </motion.button>
        <motion.button
          type="submit"
          disabled={mnemonic.trim().length !== 12}
          className="cursor-pointer flex items-center gap-1.5 px-6 py-1 bg-mf-sybil-opacity rounded-full text-sm text-mf-sybil-500 border border-mf-sybil-opacity hover:border-mf-sybil-500 transition-colors hover:text-mf-edge-500 disabled:bg-mf-ash-500 disabled:border-mf-ash-500 disabled:text-mf-edge-700 disabled:cursor-not-allowed"
          whileHover={mnemonic.trim().length === 12 ? { scale: 1.05 } : undefined}
          whileTap={mnemonic.trim().length === 12 ? { scale: 0.95 } : undefined}
        >
          <span>Continue</span>
        </motion.button>
      </div>
    </form>
  );
};

export default ImportMnemonic;
