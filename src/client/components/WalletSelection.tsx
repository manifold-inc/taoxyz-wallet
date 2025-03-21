import { useEffect, useState } from "react";
import { WalletCards, ChevronDown, ChevronUp } from "lucide-react";
import type { KeyringPair } from "@polkadot/keyring/types";

import KeyringService from "../services/KeyringService";

interface WalletSelectionProps {
  onSelect: () => void;
}

// TODO: Error handling if there are no wallets - shouldn't even display the component
const WalletSelection = ({ onSelect }: WalletSelectionProps) => {
  const [wallet, setWallet] = useState<KeyringPair | null>(null);
  const [wallets, setWallets] = useState<KeyringPair[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    getWallet();
    getWallets();
  }, []);

  const getWallet = async (): Promise<void> => {
    const result = await chrome.storage.local.get("currentAddress");
    const wallet = await KeyringService.getWallet(result.currentAddress);
    setWallet(wallet);
  };

  const getWallets = async (): Promise<void> => {
    const wallets = await KeyringService.getWallets();
    setWallets(wallets);
  };

  const handleSelectWallet = async (wallet: KeyringPair): Promise<void> => {
    setWallet(wallet);
    setIsExpanded(false);
    await chrome.storage.local.set({
      currentAddress: wallet.address,
    });
    onSelect();
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
              <button
                key={w.address}
                onClick={() => handleSelectWallet(w)}
                className="w-full flex items-center gap-3 p-2"
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
            ))}
        </div>
      )}
    </div>
  );
};

export default WalletSelection;
