import taoxyz from '@public/assets/taoxyz.svg';

import { useState } from 'react';

import type { InjectedAccount } from '@polkadot/extension-inject/types';

import { useNotification } from '@/client/contexts/NotificationContext';
import KeyringService from '@/client/services/KeyringService';
import { NotificationType } from '@/types/client';
import { MESSAGE_TYPES } from '@/types/messages';

interface AuthRequest {
  origin: string;
  requestId: string;
}

interface Wallet extends InjectedAccount {
  selected: boolean;
}

const Connect = () => {
  const { showNotification } = useNotification();
  const [request, setRequest] = useState<AuthRequest | null>(null);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  const getRequest = async (): Promise<AuthRequest | null> => {
    try {
      const result = await chrome.storage.local.get(['connectRequest']);
      if (!result.connectRequest) throw new Error();
      setRequest(result.connectRequest);
      return result.connectRequest;
    } catch {
      showNotification({
        type: NotificationType.Error,
        message: 'Failed to Get Request',
      });
      setTimeout(() => {
        window.close();
      }, 3000);
      return null;
    }
  };

  const loadWallets = async (request: AuthRequest) => {
    try {
      const keyringWallets = await KeyringService.getWallets();
      const walletsWithPermissions = (
        await Promise.all(
          keyringWallets.map(async wallet => {
            const permissions = await KeyringService.getPermissions(wallet.address);
            if (permissions instanceof Error) return null;
            if (request.origin && permissions[request.origin] === false) {
              return null;
            }
            const selectableWallet = {
              address: wallet.address,
              genesisHash: null,
              name: (wallet.meta?.name as string) || 'Unnamed Wallet',
              type: 'sr25519' as const,
              meta: {
                source: 'taoxyz-wallet',
              },
              selected: false,
            };
            return selectableWallet;
          })
        )
      ).filter(wallet => wallet !== null);

      setWallets(walletsWithPermissions);
    } catch {
      showNotification({
        type: NotificationType.Error,
        message: 'Failed to Load Wallets',
      });
      setTimeout(() => {
        window.close();
      }, 3000);
      return;
    }
  };

  const toggleWallet = (address: string) => {
    setWallets(wallets =>
      wallets.map(wallet => ({
        ...wallet,
        selected:
          wallets.length === 1
            ? wallet.address === address
              ? !wallet.selected
              : false
            : wallet.address === address,
      }))
    );
  };

  const handleResponse = async (approved: boolean) => {
    try {
      if (!request) {
        showNotification({
          type: NotificationType.Error,
          message: 'Request Not Found',
        });
        setTimeout(() => {
          window.close();
        }, 3000);
        return;
      }

      const selectedWallet = wallets.find(wallet => wallet.selected);
      const selectedWallets = selectedWallet ? [{ ...selectedWallet, selected: undefined }] : [];

      if (approved && selectedWallet) {
        try {
          await KeyringService.updatePermissions(request.origin, selectedWallet.address, approved);
        } catch {
          showNotification({
            type: NotificationType.Error,
            message: 'Failed to Update Permissions',
          });
          setTimeout(() => {
            window.close();
          }, 3000);
          return;
        }
      }

      const response = await chrome.runtime.sendMessage({
        type: MESSAGE_TYPES.CONNECT_RESPONSE,
        payload: {
          approved,
          wallets: selectedWallets,
          requestId: request.requestId,
          origin: request.origin,
        },
      });

      if (!response.success) {
        showNotification({
          type: NotificationType.Error,
          message: 'Failed to Send Response',
        });
      }

      window.close();
    } catch {
      showNotification({
        type: NotificationType.Error,
        message: 'Failed to Send Response',
      });
      setTimeout(() => {
        window.close();
      }, 3000);
    }
  };

  const init = async () => {
    if (isInitialized) return;
    setIsInitialized(true);
    const request = await getRequest();
    if (!request) return;
    await loadWallets(request);
  };

  if (!isInitialized) {
    void init();
  }

  return (
    <div className="w-full h-full flex flex-col items-center">
      <div className="max-w-96 p-5 flex flex-col items-center gap-6">
        <div className="flex justify-center items-center gap-2 w-full">
          <img src={taoxyz} alt="Taoxyz Logo" className="w-6 h-6" />
          <p className="text-mf-edge-500 text-2xl font-semibold blinker-font mb-0.5">
            CONNECTION REQUEST
          </p>
        </div>

        <div className="w-full bg-mf-ash-500 rounded-md p-2 flex flex-col items-start justify-center">
          <p className="text-mf-sybil-500 text-base">{request?.origin}</p>
          <p className="text-mf-edge-500 text-sm">Wants to connect to your wallet</p>
        </div>

        <div className="w-full flex flex-col items-center justify-start gap-6">
          <div className="w-full gap-3 flex flex-col">
            {wallets.map(wallet => (
              <button
                key={wallet.address}
                onClick={() => toggleWallet(wallet.address)}
                className={`w-full flex items-start text-left py-2 px-4 rounded-md bg-mf-ash-500 cursor-pointer hover:bg-mf-ash-300`}
              >
                <div className="flex items-center gap-3">
                  <div className="custom-checkbox">
                    <input
                      type="checkbox"
                      checked={wallet.selected}
                      readOnly
                      className="pointer-events-none"
                    />
                  </div>
                  <div className="flex flex-col text-sm">
                    <p className="text-mf-sybil-500">{wallet.name}</p>
                    <p className="text-mf-edge-500">
                      {wallet.address.slice(0, 6)}...{wallet.address.slice(-6)}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="w-full flex gap-3">
            <button
              onClick={() => handleResponse(false)}
              className="w-1/2 cursor-pointer px-3 py-1.5 text-sm rounded-md bg-mf-safety-opacity text-mf-safety-500 hover:opacity-50"
            >
              Reject
            </button>
            <button
              onClick={() => handleResponse(true)}
              disabled={!wallets.some(wallet => wallet.selected)}
              className="w-1/2 cursor-pointer px-3 py-1.5 text-sm rounded-md bg-mf-sybil-opacity text-mf-sybil-500 hover:opacity-50 disabled:bg-mf-ash-500 disabled:text-mf-edge-700"
            >
              Approve
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Connect;
