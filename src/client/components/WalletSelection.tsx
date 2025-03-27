import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { WalletCards, ChevronDown, ChevronUp, Plus, X } from "lucide-react";
import type { KeyringPair } from "@polkadot/keyring/types";

import { useLock } from "../contexts/LockContext";
import { useWallet } from "../contexts/WalletContext";
import KeyringService from "../services/KeyringService";
import ConfirmAction from "./ConfirmAction";

const WalletSelection = () => {
  const navigate = useNavigate();
  const { currentAddress, setCurrentAddress } = useWallet();
  const { isLocked } = useLock();
  const [wallet, setWallet] = useState<KeyringPair | null>(null);
  const [wallets, setWallets] = useState<KeyringPair[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [walletToDelete, setWalletToDelete] = useState<KeyringPair | null>(
    null
  );
  const listenerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getWallet();
    getWallets();
  }, [currentAddress]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if ((event.target as Element).closest('[role="dialog"]')) {
        return;
      }

      if (
        listenerRef.current &&
        !listenerRef.current.contains(event.target as Node)
      ) {
        setIsExpanded(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const clearSavedTransactions = async (): Promise<void> => {
    await chrome.storage.local.remove("storeMoveStakeTransaction");
    await chrome.storage.local.remove("storeAddStakeTransaction");
    await chrome.storage.local.remove("storeTransferTransaction");
  };

  const getWallet = async (): Promise<void> => {
    if (!currentAddress) return;
    const wallet = await KeyringService.getWallet(currentAddress);
    if (wallet instanceof Error) {
      setWallet(null);
    } else {
      setWallet(wallet);
    }
  };

  const getWallets = async (): Promise<void> => {
    const wallets = await KeyringService.getWallets();
    setWallets(wallets);
  };

  const handleSelectWallet = async (wallet: KeyringPair): Promise<void> => {
    setWallet(wallet);
    await setCurrentAddress(wallet.address);
    await clearSavedTransactions();
    setIsExpanded(false);
  };

  const handleDeleteWallet = async (
    wallet: KeyringPair,
    event: React.MouseEvent
  ): Promise<void> => {
    event.stopPropagation();
    setWalletToDelete(wallet);
  };

  const confirmDelete = async (): Promise<void> => {
    if (!walletToDelete) return;
    await KeyringService.deleteWallet(walletToDelete.address);
    await chrome.storage.local.remove(`permissions_${walletToDelete.address}`);
    await getWallets();
    await clearSavedTransactions();
    setWalletToDelete(null);
  };

  return (
    <>
      <div className="bg-mf-ash-500 mt-4 relative" ref={listenerRef}>
        <div
          className="flex items-center justify-between p-2 hover:bg-mf-night-500 transition-colors"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {wallet && (
            <>
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center bg-mf-sybil-500 border border-mf-sybil-500 rounded-sm p-1">
                  <WalletCards className="w-5 h-5 text-mf-night-500" />
                </div>
                <div className="text-left text-mf-milk-300 text-xs flex flex-col">
                  <span>{(wallet.meta as { username: string }).username}</span>
                  <span className="text-mf-sybil-500">
                    {wallet.address.slice(0, 6)}...{wallet.address.slice(-6)}
                  </span>
                </div>
              </div>
              <div className="p-1">
                {isExpanded ? (
                  <ChevronUp className="w-6 h-6 text-mf-silver-300 p-1" />
                ) : (
                  <ChevronDown className="w-6 h-6 text-mf-silver-300 p-1" />
                )}
              </div>
            </>
          )}
        </div>

        {isExpanded && (
          <div className="absolute top-full left-0 right-0 z-50 bg-mf-ash-500">
            {wallets
              .filter((w) => w.address !== wallet?.address)
              .map((w) => (
                <div
                  key={w.address}
                  className="flex items-center justify-between p-2 hover:bg-mf-night-500 transition-colors"
                >
                  <button
                    onClick={() => handleSelectWallet(w)}
                    className="flex items-center gap-3 flex-1 text-left"
                  >
                    <div className="flex items-center justify-center bg-mf-night-500 border border-mf-sybil-500 rounded-sm p-1">
                      <WalletCards className="w-5 h-5 text-mf-sybil-500" />
                    </div>
                    <div className="text-left text-mf-milk-300 text-xs">
                      <span>{(w.meta as { username: string }).username}</span>
                      <div className="text-mf-sybil-500">
                        {w.address.slice(0, 6)}...{w.address.slice(-6)}
                      </div>
                    </div>
                  </button>
                  {!isLocked && (
                    <button
                      onClick={(event) => handleDeleteWallet(w, event)}
                      className="text-mf-night-500 bg-mf-safety-500 rounded-sm hover:bg-mf-night-500 hover:text-mf-safety-500 border-2 border-mf-safety-500 transition-colors mr-1"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}

            <button
              onClick={() => navigate("/add-wallet")}
              className="w-full flex items-center gap-3 p-2 hover:bg-mf-night-500 transition-colors"
            >
              <div className="flex items-center justify-center bg-mf-safety-500 border border-mf-safety-500 rounded-sm p-1">
                <Plus className="w-5 h-5 text-mf-ash-500" />
              </div>
              <div className="text-left text-mf-safety-500 text-xs">
                <span>Add New Wallet</span>
              </div>
            </button>
          </div>
        )}
      </div>
      <ConfirmAction
        isOpen={!!walletToDelete}
        title="Delete Wallet"
        message={`Are you sure you want to delete the wallet "${
          walletToDelete?.meta?.username || "Unknown"
        }"? This wallet cannot be recovered without its recovery phrase.`}
        onConfirm={confirmDelete}
        onCancel={() => setWalletToDelete(null)}
      />
    </>
  );
};

export default WalletSelection;
