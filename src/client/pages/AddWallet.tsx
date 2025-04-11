import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

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
import MessageService from '../services/MessageService';

enum Mode {
  SELECT = 'select',
  CREATE_WALLET = 'create-wallet',
  IMPORT_WALLET = 'import-wallet',
  DISPLAY_MNEMONIC = 'display-mnemonic',
  IMPORT_MNEMONIC = 'import-mnemonic',
  VERIFY_MNEMONIC = 'verify-mnemonic',
}

interface AddWalletState {
  mode: Mode;
}

const getStepTitle = (mode: Mode) => {
  switch (mode) {
    case Mode.SELECT:
      return 'ADD WALLET';
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
  const location = useLocation();
  const { showNotification } = useNotification();
  const { setIsLocked } = useLock();
  const { setCurrentAddress } = useWallet();
  const [mode, setMode] = useState<Mode>((location.state as AddWalletState)?.mode || Mode.SELECT);
  const [mnemonic, setMnemonic] = useState<string>('');
  const [wallet, setWallet] = useState<KeyringPair | null>(null);

  const handleImportMnemonic = (mnemonic: string) => {
    setMnemonic(mnemonic);
    setMode(Mode.IMPORT_WALLET);
  };

  const handleCreateWallet = async (wallet: KeyringPair, mnemonic: string): Promise<void> => {
    setMnemonic(mnemonic);
    setWallet(wallet);
    setMode(Mode.DISPLAY_MNEMONIC);
  };

  const handleDisplayMnemonic = async (wallet: KeyringPair): Promise<void> => {
    setWallet(wallet);
    setMode(Mode.VERIFY_MNEMONIC);
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
    switch (mode) {
      case Mode.CREATE_WALLET:
        return <CreateWallet onSuccess={handleCreateWallet} />;

      case Mode.IMPORT_WALLET:
        return <ImportWallet onSuccess={handleContinue} mnemonic={mnemonic} />;

      case Mode.DISPLAY_MNEMONIC:
        if (!wallet) {
          showNotification({
            type: NotificationType.Error,
            message: 'Could Not Find Wallet',
          });
          return null;
        }
        return (
          <DisplayMnemonic mnemonic={mnemonic} onContinue={handleDisplayMnemonic} wallet={wallet} />
        );

      case Mode.VERIFY_MNEMONIC:
        if (!wallet) {
          showNotification({
            type: NotificationType.Error,
            message: 'Could Not Find Wallet',
          });
          return null;
        }
        return <MnemonicVerify mnemonic={mnemonic} onContinue={handleContinue} wallet={wallet} />;

      case Mode.IMPORT_MNEMONIC:
        return <ImportMnemonic onContinue={handleImportMnemonic} />;

      default:
        return null;
    }
  };

  return (
    <div className="w-full h-full bg-mf-night-500 flex flex-col justify-center items-center py-30 gap-10">
      {/* Header */}
      <div className="flex flex-col items-center justify-center gap-3">
        <img src={taoxyz} alt="Taoxyz Logo" className="w-8 h-8" />
        <p className="text-mf-edge-500 text-2xl font-bold blinker-font">{getStepTitle(mode)}</p>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 w-full">{renderContent()}</div>
    </div>
  );
};

export default AddWallet;
