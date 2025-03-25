import { useState } from "react";
import type { InjectedAccount } from "@polkadot/extension-inject/types";

import { useNotification } from "../../contexts/NotificationContext";
import KeyringService from "../../services/KeyringService";
import { NotificationType } from "../../../types/client";
import { MESSAGE_TYPES } from "../../../types/messages";
import taoxyzLogo from "../../../../public/icons/taoxyz.svg";

interface AuthRequest {
  origin: string;
  requestId: string;
}

interface Wallet extends InjectedAccount {
  selected: boolean;
}

// TODO: Close window if theres new request while open and automatically reject old one
// TODO: Handle if user clicks on the x on the popup, automatically reject the request
const Connect = () => {
  const { showNotification } = useNotification();
  const [request, setRequest] = useState<AuthRequest | null>(null);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  const getRequest = async (): Promise<AuthRequest | null> => {
    try {
      const result = await chrome.storage.local.get(["connectRequest"]);
      if (!result.connectRequest) throw new Error();
      setRequest(result.connectRequest);
      return result.connectRequest;
    } catch {
      showNotification({
        type: NotificationType.Error,
        message: "Failed to Get Request",
      });
      setTimeout(() => {
        window.close();
      }, 2000);
      return null;
    }
  };

  const loadWallets = async (request: AuthRequest) => {
    try {
      const keyringWallets = await KeyringService.getWallets();
      const walletsWithPermissions = (
        await Promise.all(
          keyringWallets.map(async (wallet) => {
            const permissions = await KeyringService.getPermissions(
              wallet.address
            );
            if (request.origin && permissions[request.origin] === false) {
              return null;
            }
            const selectableWallet = {
              address: wallet.address,
              genesisHash: null,
              name: (wallet.meta?.username as string) || "Unnamed Wallet",
              type: "sr25519" as const,
              meta: {
                source: "taoxyz-wallet",
              },
              selected: false,
            };
            return selectableWallet;
          })
        )
      ).filter((wallet) => wallet !== null);

      setWallets(walletsWithPermissions);
    } catch {
      showNotification({
        type: NotificationType.Error,
        message: "Failed to Load Wallets",
      });
      setTimeout(() => {
        window.close();
      }, 2000);
      return;
    }
  };

  const toggleWallet = (address: string) => {
    setWallets((wallets) =>
      wallets.map((wallet) => ({
        ...wallet,
        selected: wallet.address === address,
      }))
    );
  };

  const handleResponse = async (approved: boolean) => {
    try {
      if (!request) {
        showNotification({
          type: NotificationType.Error,
          message: "Request Not Found",
        });
        setTimeout(() => {
          window.close();
        }, 2000);
        return;
      }

      const selectedWallet = wallets.find((wallet) => wallet.selected);
      const selectedWallets = selectedWallet
        ? [{ ...selectedWallet, selected: undefined }]
        : [];

      if (approved && selectedWallet) {
        try {
          await KeyringService.updatePermissions(
            request.origin,
            selectedWallet.address,
            approved
          );
        } catch {
          showNotification({
            type: NotificationType.Error,
            message: "Failed to Update Permissions",
          });
          setTimeout(() => {
            window.close();
          }, 2000);
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
          message: "Failed to Send Response",
        });
      }

      window.close();
    } catch {
      showNotification({
        type: NotificationType.Error,
        message: "Failed to Send Response",
      });
      setTimeout(() => {
        window.close();
      }, 2000);
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
    <div className="flex flex-col items-center w-full">
      <div className="flex flex-col justify-center items-center space-y-2">
        <img src={taoxyzLogo} alt="Taoxyz Logo" className="w-16 h-16 mt-12" />
        <h1 className="text-lg text-mf-milk-300">Connection Request</h1>
      </div>

      <div className="mt-6 bg-mf-ash-500 rounded-sm p-3 text-sm flex flex-col justify-start w-80">
        <p className="text-mf-sybil-500">{request?.origin}</p>
        <p className="text-mf-milk-300">Wants to connect to your wallet</p>
      </div>

      <div className="mt-4 w-80 [&>*]:w-full">
        <div className="h-60 space-y-3 rounded-sm overflow-y-scroll">
          {wallets.map((wallet) => (
            <button
              key={wallet.address}
              onClick={() => toggleWallet(wallet.address)}
              className={`w-full flex items-start text-left py-2 px-4 bg-mf-ash-500 cursor-pointer transition-colors`}
            >
              <div className="flex items-center space-x-3">
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
                  <p className="text-mf-milk-300">
                    {wallet.address.slice(0, 6)}...{wallet.address.slice(-6)}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="flex space-x-2 mt-4">
          <button
            onClick={() => handleResponse(false)}
            className="flex-1 text-sm border-2 border-sm border-mf-safety-500 bg-mf-ash-500 hover:bg-mf-safety-500 hover:text-mf-night-500 p-2 text-mf-safety-500 transition-colors"
          >
            Reject
          </button>
          <button
            onClick={() => handleResponse(true)}
            disabled={!wallets.some((wallet) => wallet.selected)}
            className="flex-1 text-sm border-2 border-sm border-mf-sybil-500 bg-mf-sybil-500 hover:bg-mf-night-500 hover:text-mf-sybil-500 p-2 text-mf-night-500 transition-colors"
          >
            Approve
          </button>
        </div>
      </div>
    </div>
  );
};

export default Connect;
