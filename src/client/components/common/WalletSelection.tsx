import { Plus, WalletCards, X } from 'lucide-react';

import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import type { KeyringPair } from '@polkadot/keyring/types';

import { useLock } from '../../contexts/LockContext';
import { useWallet } from '../../contexts/WalletContext';
import KeyringService from '../../services/KeyringService';
import ConfirmAction from './ConfirmAction';

const WalletSelection = () => {
  const navigate = useNavigate();
  const { currentAddress, setCurrentAddress } = useWallet();
  const { isLocked } = useLock();
  const [wallet, setWallet] = useState<KeyringPair | null>(null);
  const [wallets, setWallets] = useState<KeyringPair[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [walletToDelete, setWalletToDelete] = useState<KeyringPair | null>(null);
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

      if (listenerRef.current && !listenerRef.current.contains(event.target as Node)) {
        setIsExpanded(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const clearSavedTransactions = async (): Promise<void> => {
    await chrome.storage.local.remove('storeMoveStakeTransaction');
    await chrome.storage.local.remove('storeAddStakeTransaction');
    await chrome.storage.local.remove('storeTransferTransaction');
  };

  const getWallet = async (): Promise<void> => {
    if (!currentAddress) return;
    const wallet = KeyringService.getWallet(currentAddress);
    if (wallet instanceof Error) {
      setWallet(null);
    } else {
      setWallet(wallet);
    }
  };

  const getWallets = async (): Promise<void> => {
    const wallets = KeyringService.getWallets();
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
    KeyringService.deleteWallet(walletToDelete.address);
    await chrome.storage.local.remove(`permissions_${walletToDelete.address}`);
    await getWallets();
    await clearSavedTransactions();
    setWalletToDelete(null);
  };

  return (
    <>
      <div
        className={`w-full bg-mf-ash-500 relative ${isExpanded ? 'rounded-t-md' : 'rounded-md'}`}
        ref={listenerRef}
      >
        <div
          className="flex items-center justify-between p-2 hover:bg-mf-night-500 cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <>
            <div className="flex items-center justify-between w-full gap-3">
              <div className="text-left text-mf-milk-300 text-xs flex flex-col">
                <span>{wallet?.meta.name || 'Unknown'}</span>
                <span className="text-mf-sybil-500">
                  {wallet && (
                    <>
                      {wallet?.address.slice(0, 6)}...{wallet?.address.slice(-6)}
                    </>
                  )}
                </span>
              </div>
              <div className="flex items-center justify-center bg-mf-sybil-500 border border-mf-sybil-500 rounded-sm p-1">
                <WalletCards className="w-5 h-5 text-mf-night-500" />
              </div>
            </div>
          </>
        </div>

        {isExpanded && (
          <div className="absolute top-full left-0 right-0 z-50 bg-mf-ash-500 rounded-b-md">
            {wallets
              .filter(w => w.address !== wallet?.address)
              .map(w => (
                <div
                  key={w.address}
                  className="flex items-center justify-between p-2 hover:bg-mf-night-500"
                >
                  <button
                    onClick={() => handleSelectWallet(w)}
                    className="flex items-center gap-3 flex-1 text-left cursor-pointer"
                  >
                    <div className="flex items-center justify-center bg-mf-night-500 border border-mf-sybil-500 rounded-sm p-1">
                      <WalletCards className="w-5 h-5 text-mf-sybil-500" />
                    </div>
                    <div className="text-left text-mf-milk-300 text-xs">
                      <span>{w.meta.name || 'Unknown'}</span>
                      <div className="text-mf-sybil-500">
                        {w.address.slice(0, 6)}...{w.address.slice(-6)}
                      </div>
                    </div>
                  </button>
                  {!isLocked && (
                    <button
                      onClick={event => handleDeleteWallet(w, event)}
                      className="text-mf-night-500 bg-mf-safety-500 rounded-sm hover:bg-mf-night-500 hover:text-mf-safety-500 border border-mf-safety-500 mr-1 cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}

            <button
              onClick={() => navigate('/welcome', { state: { step: 'GET_STARTED' } })}
              className="w-full flex items-center justify-between  p-2 hover:bg-mf-night-500 cursor-pointer rounded-b-md"
            >
              <div className="text-left text-mf-safety-500 text-xs">
                <span>Add New Wallet</span>
              </div>
              <div className="flex items-center justify-center bg-mf-safety-500 border border-mf-safety-500 rounded-sm p-1">
                <Plus className="w-5 h-5 text-mf-ash-500" />
              </div>
            </button>
          </div>
        )}
      </div>
      <ConfirmAction
        isOpen={!!walletToDelete}
        title="Delete Wallet"
        message={`Are you sure you want to delete the wallet "${
          walletToDelete?.meta.name || 'Unknown'
        }"? This wallet cannot be recovered without its recovery phrase.`}
        onConfirm={confirmDelete}
        onCancel={() => setWalletToDelete(null)}
      />
    </>
  );
};

export default WalletSelection;
