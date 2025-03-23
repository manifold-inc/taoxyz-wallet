import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { WalletCards, ChevronDown, ChevronUp, Plus, Trash } from "lucide-react";
import type { KeyringPair } from "@polkadot/keyring/types";

import KeyringService from "../services/KeyringService";
import { useLock } from "../contexts/LockContext";
import { useWallet } from "../contexts/WalletContext";

interface WalletSelectionProps {
  onSelect?: () => void;
}

// TODO: Error handling if there are no wallets - shouldn't even display the component
// TODO: When the user clicks off of it should collapse
// TODO: If there are no wallets, no chevron in lock screen
const WalletSelection = ({ onSelect }: WalletSelectionProps) => {
  const navigate = useNavigate();
  const { isLocked } = useLock();
  const { currentAddress, setCurrentAddress } = useWallet();
  const [wallet, setWallet] = useState<KeyringPair | null>(null);
  const [wallets, setWallets] = useState<KeyringPair[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    getWallet();
    getWallets();
  }, [currentAddress]);

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
    setIsExpanded(false);
    onSelect?.();
  };

  const handleDeleteWallet = async (
    wallet: KeyringPair,
    event: React.MouseEvent
  ): Promise<void> => {
    event.stopPropagation();
    await KeyringService.deleteWallet(wallet.address);
    await getWallets();
  };

  return (
    <div className="bg-mf-ash-500 mt-4 relative">
      <div className="flex items-center justify-between p-2">
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
            <button onClick={() => setIsExpanded(!isExpanded)} className="p-1">
              {isExpanded ? (
                <ChevronUp className="w-6 h-6 text-mf-silver-300 p-1" />
              ) : (
                <ChevronDown className="w-6 h-6 text-mf-silver-300 p-1" />
              )}
            </button>
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
                <button
                  onClick={(event) => handleDeleteWallet(w, event)}
                  className="p-2 text-mf-milk-300 hover:text-mf-safety-500 transition-colors rounded-sm hover:bg-mf-night-500"
                  aria-label={`Delete wallet ${
                    (w.meta as { username: string }).username
                  }`}
                >
                  <Trash className="w-4 h-4" />
                </button>
              </div>
            ))}

          {!isLocked && (
            <button
              onClick={() => navigate("/add-wallet")}
              className="w-full flex items-center gap-3 p-2 hover:bg-mf-night-500 transition-colors"
            >
              <div className="flex items-center justify-center bg-mf-safety-500 border border-mf-safety-500 rounded-sm p-1">
                <Plus className="w-5 h-5 text-mf-ash-500" />
              </div>
              <div className="text-left text-mf-safety-500 text-xs">
                <span>Add New Wallet</span>
                <div></div>
              </div>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default WalletSelection;
