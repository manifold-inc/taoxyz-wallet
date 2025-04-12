import { AnimatePresence, motion } from 'framer-motion';

import { useNavigate } from 'react-router-dom';

import type { KeyringPair } from '@polkadot/keyring/types';

import taoxyz from '../../../public/icons/taoxyz.svg';
import { NotificationType } from '../../types/client';
import CreateWallet from '../components/addWallet/CreateWallet';
import DisplayMnemonic from '../components/addWallet/DisplayMnemonic';
import ImportMnemonic from '../components/addWallet/ImportMnemonic';
import ImportWallet from '../components/addWallet/ImportWallet';
import MnemonicVerify from '../components/addWallet/VerifyMnemonic';
import { useLock } from '../contexts/LockContext';
import { useNotification } from '../contexts/NotificationContext';
import { useWallet } from '../contexts/WalletContext';
import { Mode, useWalletCreation } from '../contexts/WalletCreationContext';
import MessageService from '../services/MessageService';

const getStepTitle = (mode: Mode) => {
  switch (mode) {
    case Mode.CREATE_WALLET:
      return 'CREATE WALLET';
    case Mode.IMPORT_WALLET:
      return 'IMPORT WALLET';
    case Mode.DISPLAY_MNEMONIC:
      return 'BACKUP PHRASE';
    case Mode.IMPORT_MNEMONIC:
      return 'IMPORT MNEMONIC';
    case Mode.VERIFY_MNEMONIC:
      return 'VERIFY PHRASE';
    default:
      return '';
  }
};

const AddWallet = () => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const { setIsLocked } = useLock();
  const { setCurrentAddress } = useWallet();
  const { state, actions } = useWalletCreation();

  const handleImportMnemonic = (mnemonic: string) => {
    actions.setMnemonic(mnemonic);
    actions.setMode(Mode.IMPORT_WALLET);
  };

  const handleCreateWallet = async (wallet: KeyringPair, mnemonic: string): Promise<void> => {
    actions.setMnemonic(mnemonic);
    actions.setWallet(wallet);
    actions.setMode(Mode.DISPLAY_MNEMONIC);
  };

  const handleDisplayMnemonic = async (wallet: KeyringPair): Promise<void> => {
    actions.setWallet(wallet);
    actions.setMode(Mode.VERIFY_MNEMONIC);
  };

  const handleContinue = async (wallet: KeyringPair): Promise<void> => {
    if (!wallet) {
      showNotification({
        type: NotificationType.Error,
        message: 'Could Not Find Wallet',
      });
      return;
    }

    await setCurrentAddress(wallet.address);
    await setIsLocked(false);
    await MessageService.sendClearLockTimer();
    navigate('/dashboard');
  };

  const renderContent = () => {
    switch (state.mode) {
      case Mode.CREATE_WALLET:
        return <CreateWallet onSuccess={handleCreateWallet} />;

      case Mode.IMPORT_WALLET:
        return <ImportWallet onSuccess={handleContinue} />;

      case Mode.DISPLAY_MNEMONIC:
        return <DisplayMnemonic onContinue={handleDisplayMnemonic} />;

      case Mode.VERIFY_MNEMONIC:
        return <MnemonicVerify onContinue={handleContinue} />;

      case Mode.IMPORT_MNEMONIC:
        return <ImportMnemonic onContinue={handleImportMnemonic} />;

      default:
        handleBack();
        return null;
    }
  };

  const handleBack = () => {
    actions.reset();
    navigate('/welcome', { state: { step: 'GET_STARTED' } });
  };

  return (
    <div className="w-full h-full bg-mf-night-500 flex flex-col justify-end items-center overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={state.mode}
          className="flex flex-col items-center justify-center w-full gap-10 absolute top-32"
          initial={{ y: '100vh', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '-100vh', opacity: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          {/* Header */}
          <div className="flex flex-col items-center justify-center gap-3">
            <img src={taoxyz} alt="Taoxyz Logo" className="w-8 h-8" />
            <p className="text-mf-edge-500 text-2xl font-bold blinker-font">
              {getStepTitle(state.mode)}
            </p>
          </div>

          {/* Content */}
          <div className="flex flex-col flex-1 w-full">{renderContent()}</div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default AddWallet;
