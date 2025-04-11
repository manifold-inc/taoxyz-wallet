import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import type { KeyringPair } from '@polkadot/keyring/types';

import taoxyz from '../../../public/icons/taoxyz.svg';
import { NotificationType } from '../../types/client';
import CreateWallet from '../components/addWallet/CreateWallet';
import ImportWallet from '../components/addWallet/ImportWallet';
import MnemonicDisplay from '../components/addWallet/MnemonicDisplay';
import MnemonicImport from '../components/addWallet/MnemonicImport';
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

  const handleCreateWalletSuccess = async (
    wallet: KeyringPair,
    mnemonic: string
  ): Promise<void> => {
    setMnemonic(mnemonic);
    setWallet(wallet);
    setMode(Mode.DISPLAY_MNEMONIC);
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
        return (
          <CreateWallet onSuccess={handleCreateWalletSuccess} onBack={() => navigate('/welcome')} />
        );

      case Mode.IMPORT_WALLET:
        return <ImportWallet onSuccess={handleContinue} mnemonic={mnemonic} />;

      case Mode.DISPLAY_MNEMONIC:
        if (!wallet) {
          showNotification({
            type: NotificationType.Error,
            message: 'Wallet not found',
          });
          return null;
        }
        return <MnemonicDisplay mnemonic={mnemonic} onContinue={handleContinue} wallet={wallet} />;

      case Mode.IMPORT_MNEMONIC:
        return (
          <MnemonicImport onContinue={handleImportMnemonic} onBack={() => navigate('/welcome')} />
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-full h-full bg-mf-night-500 flex flex-col justify-center items-center">
      {/* Header */}
      <div className="flex flex-col items-center justify-center">
        <img src={taoxyz} alt="Taoxyz Logo" className="w-8 h-8" />
        <p className="text-mf-edge-500 text-2xl font-bold blinker-font">{getStepTitle(mode)}</p>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1">{renderContent()}</div>
    </div>
  );
};

export default AddWallet;
