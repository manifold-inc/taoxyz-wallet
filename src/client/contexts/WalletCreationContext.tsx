import { createContext, useContext, useState } from 'react';

import type { KeyringPair } from '@polkadot/keyring/types';

export enum Mode {
  CREATE_WALLET = 'CREATE_WALLET',
  IMPORT_WALLET = 'IMPORT_WALLET',
  DISPLAY_MNEMONIC = 'DISPLAY_MNEMONIC',
  IMPORT_MNEMONIC = 'IMPORT_MNEMONIC',
  VERIFY_MNEMONIC = 'VERIFY_MNEMONIC',
}

interface WalletCreationState {
  mode: Mode;
  mnemonic: string;
  wallet: KeyringPair | null;
}

interface WalletCreationActions {
  setMode: (mode: Mode) => void;
  setMnemonic: (mnemonic: string) => void;
  setWallet: (wallet: KeyringPair) => void;
  reset: () => void;
}

interface WalletCreationContextType {
  state: WalletCreationState;
  actions: WalletCreationActions;
}

const WalletCreationContext = createContext<WalletCreationContextType | null>(null);

export const useWalletCreation = () => {
  const context = useContext(WalletCreationContext);
  if (!context) {
    throw new Error('useWalletCreation must be used within a WalletCreationProvider');
  }
  return context;
};

interface WalletCreationProviderProps {
  children: React.ReactNode;
  initialMode?: Mode;
}

const initialState: WalletCreationState = {
  mode: Mode.CREATE_WALLET,
  mnemonic: '',
  wallet: null,
};

export const WalletCreationProvider = ({
  children,
  initialMode = Mode.CREATE_WALLET,
}: WalletCreationProviderProps) => {
  const [state, setState] = useState<WalletCreationState>({
    ...initialState,
    mode: initialMode,
  });

  const actions: WalletCreationActions = {
    setMode: mode => setState(prev => ({ ...prev, mode })),
    setMnemonic: mnemonic => setState(prev => ({ ...prev, mnemonic })),
    setWallet: wallet => setState(prev => ({ ...prev, wallet })),
    reset: () => setState(initialState),
  };

  return (
    <WalletCreationContext.Provider value={{ state, actions }}>
      {children}
    </WalletCreationContext.Provider>
  );
};
