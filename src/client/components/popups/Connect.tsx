import { useEffect, useState } from "react";
import type { InjectedAccount } from "@polkadot/extension-inject/types";

import KeyringService from "../../services/KeyringService";
import { MESSAGE_TYPES } from "../../../types/messages";
import taoxyzLogo from "../../../../public/icons/taoxyz.svg";

interface AuthRequest {
  origin: string;
  requestId: string;
}

interface SelectableWallet extends InjectedAccount {
  selected: boolean;
}

const Connect = () => {
  const [request, setRequest] = useState<AuthRequest | null>(null);
  const [wallets, setWallets] = useState<SelectableWallet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const requestConnect = async () => {
      try {
        const result = await chrome.storage.local.get(["connectRequest"]);
        if (result.connectRequest) {
          setRequest(result.connectRequest);
        }

        const keyringWallets = await KeyringService.getWallets();
        const formattedWallets = keyringWallets.map((wallet) => ({
          address: wallet.address,
          genesisHash: null,
          name: (wallet.meta?.username as string) || "Unnamed Wallet",
          type: "sr25519" as const,
          meta: {
            source: "taoxyz-wallet",
          },
          selected: false,
        }));
        setWallets(formattedWallets);
      } catch (error) {
        console.error("Failed to connect:", error);
      } finally {
        setLoading(false);
      }
    };

    requestConnect();
  }, []);

  const toggleWallet = (address: string) => {
    setWallets((prev) =>
      prev.map((wallet) =>
        wallet.address === address
          ? { ...wallet, selected: !wallet.selected }
          : wallet
      )
    );
  };

  const handleResponse = async (approved: boolean) => {
    if (!request) return;

    try {
      const selectedWallets = wallets
        .filter((wallet) => wallet.selected)
        .map(({ selected: _, ...wallet }) => wallet);

      if (approved && selectedWallets.length > 0) {
        try {
          await KeyringService.updatePermissions(
            request.origin,
            selectedWallets[0].address,
            approved
          );
        } catch (error) {
          console.error("[Connect] Error updating permissions:", error);
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

      if (!response?.success) {
        console.error("[Connect] Response was not successful");
      }

      window.close();
    } catch (error) {
      console.error("[Connect] Error sending response:", error);
      window.close();
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center text-mf-silver-300">
        Loading...
      </div>
    );
  if (!request)
    return (
      <div className="flex items-center justify-center text-mf-silver-300">
        No pending request
      </div>
    );

  return (
    <div className="flex flex-col items-center overflow-hidden">
      <div className="h-12" />
      <div className="flex flex-col items-center w-72">
        <img src={taoxyzLogo} alt="Taoxyz Logo" className="w-16 h-16 mb-6" />

        <div className="w-full">
          <div className="text-center mb-4">
            <h1 className="text-xl font-semibold text-mf-silver-300">
              Connection Request
            </h1>
          </div>

          <div className="bg-mf-ash-500/30 border border-mf-ash-500 rounded-lg p-2.5 mb-4 text-xs">
            <p className="text-mf-sybil-500">{request.origin}</p>
            <p className="text-mf-silver-300">
              is requesting to connect to your wallet
            </p>
          </div>

          <div className="mb-4">
            <div className="space-y-2">
              {wallets.map((wallet) => (
                <label
                  key={wallet.address}
                  className={`flex items-center p-2 bg-mf-ash-500/30 border rounded-lg hover:bg-mf-ash-500/50 cursor-pointer transition-colors ${
                    wallet.selected
                      ? "border-mf-safety-500 ring-1 ring-mf-safety-500"
                      : "border-mf-ash-500"
                  }`}
                >
                  <div className="custom-checkbox">
                    <input
                      type="checkbox"
                      checked={wallet.selected}
                      onChange={() => toggleWallet(wallet.address)}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-xs text-mf-silver-300">
                      {wallet.name}
                    </div>
                    <div className="text-xs text-mf-silver-500">
                      {`${wallet.address.slice(0, 8)}...${wallet.address.slice(
                        -8
                      )}`}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={() => handleResponse(true)}
              disabled={!wallets.some((wallet) => wallet.selected)}
              className="flex-1 text-sm rounded-lg bg-mf-safety-500 hover:bg-mf-safety-300 disabled:bg-mf-ash-500 disabled:cursor-not-allowed px-4 py-3 text-mf-milk-300 transition-colors"
            >
              Approve
            </button>
            <button
              onClick={() => handleResponse(false)}
              className="flex-1 text-sm rounded-lg bg-mf-ash-500 hover:bg-mf-ash-400 px-4 py-3 text-mf-safety-300 transition-colors"
            >
              Reject
            </button>
          </div>
        </div>
      </div>
      <div className="h-12" />
    </div>
  );
};

export default Connect;
