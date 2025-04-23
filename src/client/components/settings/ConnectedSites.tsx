import taoxyz from '@public/assets/taoxyz.svg';
import { ChevronsDown, ChevronsUp, Plus, X } from 'lucide-react';

import { useState } from 'react';

import type { KeyringPair } from '@polkadot/keyring/types';

import ConfirmAction from '@/client/components/common/ConfirmAction';
import { useNotification } from '@/client/contexts/NotificationContext';
import KeyringService from '@/client/services/KeyringService';
import { NotificationType } from '@/types/client';
import type { Permissions, PermissionsPerWebsite } from '@/types/client';

interface ConnectedSitesProps {
  onClose: () => void;
}

const ConnectedSites = ({ onClose }: ConnectedSitesProps) => {
  const { showNotification } = useNotification();
  const [websitePermissions, setWebsitePermissions] = useState<PermissionsPerWebsite>({});
  const [expandedWebsite, setExpandedWebsite] = useState<string | null>(null);
  const [wallets, setWallets] = useState<KeyringPair[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [websiteToRemove, setWebsiteToRemove] = useState<string | null>(null);

  const loadPermissions = async () => {
    try {
      const keyringWallets = await KeyringService.getWallets();
      setWallets(keyringWallets);
      const permissionsPerWebsite: PermissionsPerWebsite = {};

      for (const wallet of keyringWallets) {
        const permissions = (wallet.meta.websitePermissions as Permissions) || {};

        Object.entries(permissions).forEach(([website, hasAccess]) => {
          if (!permissionsPerWebsite[website]) {
            permissionsPerWebsite[website] = {
              walletCount: 0,
              wallets: [],
            };
          }

          permissionsPerWebsite[website].walletCount++;
          permissionsPerWebsite[website].wallets.push({
            address: wallet.address,
            name: (wallet.meta.name as string) || 'Unnamed Wallet',
            hasAccess: hasAccess as boolean,
          });
        });
      }

      setWebsitePermissions(permissionsPerWebsite);
    } catch {
      showNotification({
        type: NotificationType.Error,
        message: 'Failed to Load Permissions',
      });
    }
  };

  const handleWebsiteAccessToggle = async (
    website: string,
    address: string,
    allowed: boolean,
    event: React.MouseEvent
  ) => {
    event.stopPropagation();
    try {
      await KeyringService.updatePermissions(website, address, allowed);
      loadPermissions();
    } catch {
      showNotification({
        type: NotificationType.Error,
        message: 'Failed to Update Permissions',
      });
    }
  };

  const handleRemoveWebsite = async (website: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setWebsiteToRemove(website);
  };

  const confirmRemoveWebsite = async () => {
    if (!websiteToRemove) return;

    try {
      for (const wallet of wallets) {
        await KeyringService.updatePermissions(websiteToRemove, wallet.address, false, true);
      }
      loadPermissions();
    } catch {
      showNotification({
        type: NotificationType.Error,
        message: 'Failed to Remove Website',
      });
    }
    setWebsiteToRemove(null);
  };

  const init = async () => {
    if (isInitialized) return;
    setIsInitialized(true);
    await loadPermissions();
  };

  if (!isInitialized) {
    void init();
  }

  return (
    <div className="flex flex-col items-center">
      <ConfirmAction
        isOpen={!!websiteToRemove}
        title="Remove Website"
        message={`Are you sure you want to remove access for ${websiteToRemove || ''}?`}
        onConfirm={confirmRemoveWebsite}
        onCancel={() => setWebsiteToRemove(null)}
      />
      <div className="flex flex-col items-center w-full">
        {/* Header */}
        <div className="w-full flex items-center justify-start pt-4 px-5">
          <div className="flex items-center gap-2">
            <img src={taoxyz} alt="Taoxyz Logo" className="w-8 h-8" />
            <p className="text-mf-edge-500 text-3xl font-semibold blinker-font mb-1">SETTINGS</p>
          </div>
        </div>

        <div className="w-full flex flex-col items-center">
          {/* Back Button */}
          <div className="w-full flex border-b border-mf-ash-300">
            <div className="w-full flex items-center justify-between py-3 px-5">
              <div className="flex items-center gap-2">
                <div className="bg-mf-sybil-500 rounded-sm p-1">
                  <Plus className="w-5 h-5 text-mf-ash-500" strokeWidth={3} />
                </div>
                <p className="blinker-font text-mf-edge-500 text-2xl font-semibold">
                  Connected Sites
                </p>
              </div>
              <button
                className="bg-mf-red-opacity text-mf-red-500 text-sm rounded-full px-3 py-1 cursor-pointer hover:opacity-50"
                onClick={onClose}
              >
                Back
              </button>
            </div>
          </div>

          {/* Connected Sites */}
          <div className="w-full flex flex-col gap-3 px-5 py-3">
            {/* Website */}
            {Object.entries(websitePermissions).map(([website, { walletCount, wallets }]) => (
              <div
                key={website}
                className={`bg-mf-ash-500 relative border rounded-md ${
                  expandedWebsite === website ? 'border-mf-sybil-500' : 'border-mf-ash-500'
                }`}
              >
                <div
                  className="flex flex-col items-start justify-between cursor-pointer gap-2 p-2"
                  onClick={() => setExpandedWebsite(expandedWebsite === website ? null : website)}
                >
                  <div className="flex items-center justify-between w-full gap-2">
                    <div className="flex items-center text-xs text-mf-milk-500 bg-mf-ash-300 rounded-xs p-1 flex-1 min-w-0">
                      <span className="truncate">{website}</span>
                    </div>

                    <button
                      onClick={event => handleRemoveWebsite(website, event)}
                      className="text-mf-ash-500 bg-mf-safety-500 rounded-sm hover:bg-mf-night-500 hover:text-mf-safety-500 border border-mf-safety-500 w-6 h-6 flex items-center justify-center"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between w-full">
                    <div className="flex gap-2 bg-mf-sybil-opacity rounded-full py-1 px-3">
                      <p className="text-mf-sybil-500 text-xs">
                        {walletCount} {walletCount === 1 ? 'Connection' : 'Connections'}
                      </p>
                    </div>
                    <div className="bg-[#12171D]/67 rounded-full p-1 items-center justify-center">
                      {expandedWebsite === website ? (
                        <ChevronsUp className="w-4 h-4 text-mf-edge-500" />
                      ) : (
                        <ChevronsDown className="w-4 h-4 text-mf-edge-500" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded State */}
                {expandedWebsite === website && (
                  <div className="border-t border-mf-ash-300">
                    <div className="space-y-2 p-2">
                      {wallets.map(wallet => (
                        <div key={wallet.address} className="flex items-center justify-between">
                          <div className="flex items-center justify-between w-full space-x-2">
                            <div className="flex items-center text-xs text-mf-milk-300 bg-mf-ash-300 rounded-xs p-1 space-x-2 flex-1 min-w-0">
                              <span className="truncate">{wallet.name}</span>
                              <span>
                                ({wallet.address.slice(0, 6)}...
                                {wallet.address.slice(-6)})
                              </span>
                            </div>
                            <div
                              className="relative inline-flex items-center cursor-pointer shrink-0"
                              onClick={event => {
                                handleWebsiteAccessToggle(
                                  website,
                                  wallet.address,
                                  !wallet.hasAccess,
                                  event
                                );
                              }}
                            >
                              <input
                                type="checkbox"
                                checked={wallet.hasAccess}
                                readOnly
                                className="sr-only peer"
                              />
                              <div className="w-14 h-6 bg-mf-ash-300 text-mf-safety-500 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-mf-safety-500 after:rounded-full after:h-4 after:w-6 after:transition-all peer-checked:after:bg-mf-sybil-500"></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConnectedSites;
