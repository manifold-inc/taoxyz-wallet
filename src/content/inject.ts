import { injectExtension } from '@polkadot/extension-inject';

import { TaoxyzWalletProvider } from './provider';

injectExtension(
  async (origin: string) => {
    if (!TaoxyzWalletProvider.enable) throw new Error('Provider not initialized');
    return TaoxyzWalletProvider.enable(origin);
  },
  {
    name: 'taoxyz-wallet',
    version: '1.2.4',
  }
);

export {};
