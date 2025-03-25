import { useState } from "react";
import { X, ArrowLeftToLine } from "lucide-react";
import type { KeyringPair } from "@polkadot/keyring/types";

import { useNotification } from "../../contexts/NotificationContext";
import KeyringService from "../../services/KeyringService";
import { NotificationType } from "../../../types/client";
import type { Permissions, PermissionsPerWebsite } from "../../../types/client";
import taoxyz from "../../../../public/icons/taoxyz.svg";

interface ConnectedSitesProps {
  onClose: () => void;
}

// TODO: Add cursor-pointer style to every element that can be clicked
const ConnectedSites = ({ onClose }: ConnectedSitesProps) => {
  const { showNotification } = useNotification();
  const [websitePermissions, setWebsitePermissions] =
    useState<PermissionsPerWebsite>({});
  const [expandedWebsite, setExpandedWebsite] = useState<string | null>(null);
  const [wallets, setWallets] = useState<KeyringPair[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  const loadPermissions = async () => {
    try {
      const keyringWallets = await KeyringService.getWallets();
      setWallets(keyringWallets);
      const permissionsPerWebsite: PermissionsPerWebsite = {};

      for (const wallet of keyringWallets) {
        const permissions =
          (wallet.meta.websitePermissions as Permissions) || {};

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
            username: (wallet.meta.username as string) || "Unnamed Wallet",
            hasAccess: hasAccess as boolean,
          });
        });
      }

      setWebsitePermissions(permissionsPerWebsite);
    } catch {
      showNotification({
        type: NotificationType.Error,
        message: "Failed to Load Permissions",
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
        message: "Failed to Update Permissions",
      });
    }
  };

  const handleRemoveWebsite = async (
    website: string,
    event: React.MouseEvent
  ) => {
    event.stopPropagation();
    if (!window.confirm(`Remove access for ${website}?`)) return;
    try {
      for (const wallet of wallets) {
        await KeyringService.updatePermissions(
          website,
          wallet.address,
          false,
          true
        );
      }
      loadPermissions();
    } catch {
      showNotification({
        type: NotificationType.Error,
        message: "Failed to Remove Website",
      });
    }
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
    <div className="flex flex-col items-center h-screen">
      <div className="relative flex justify-center items-center w-76 mt-12">
        <ArrowLeftToLine
          className="absolute left-3 w-6 h-6 text-mf-milk-500"
          onClick={onClose}
        />
        <img src={taoxyz} alt="Taoxyz Logo" className="w-16 h-16" />
      </div>

      <div className="flex flex-col items-center w-76 [&>*]:w-full mt-4">
        <div className="text-center text-lg text-mf-milk-300 mb-4">
          <h1>Connected Sites</h1>
        </div>

        <div className="overflow-y-auto h-88 space-y-2 px-2 rounded-sm">
          {Object.entries(websitePermissions).map(
            ([website, { walletCount, wallets }]) => (
              <div
                key={website}
                className={`bg-mf-ash-500 relative border-2 ${
                  expandedWebsite === website
                    ? "border-mf-sybil-500"
                    : "border-mf-ash-500"
                }`}
              >
                <div
                  className="flex items-center justify-between cursor-pointer p-2"
                  onClick={() =>
                    setExpandedWebsite(
                      expandedWebsite === website ? null : website
                    )
                  }
                >
                  <div className="flex items-center justify-between w-full space-x-2">
                    <div className="flex items-center text-xs text-mf-milk-300 bg-mf-ash-300 rounded-xs p-1 flex-1 min-w-0">
                      <span className="truncate">{website}</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="bg-mf-sybil-500 text-mf-night-500 text-xs w-6 h-6 flex items-center justify-center border-2 border-mf-sybil-500 rounded-full">
                        {walletCount}
                      </span>
                      <button
                        onClick={(event) => handleRemoveWebsite(website, event)}
                        className="text-mf-night-500 bg-mf-safety-500 rounded-sm hover:bg-mf-night-500 hover:text-mf-safety-500 border-2 border-mf-safety-500 transition-colors w-6 h-6 flex items-center justify-center"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {expandedWebsite === website && (
                  <div className="border-t border-mf-ash-300">
                    <div className="space-y-2 p-2">
                      {wallets.map((wallet) => (
                        <div
                          key={wallet.address}
                          className="flex items-center justify-between hover:bg-mf-night-500 transition-colors"
                        >
                          <div className="flex items-center justify-between w-full space-x-2">
                            <div className="flex items-center text-xs text-mf-milk-300 bg-mf-ash-300 rounded-xs p-1 space-x-2 flex-1 min-w-0">
                              <span className="truncate">
                                {wallet.username}
                              </span>
                              <span>
                                ({wallet.address.slice(0, 6)}...
                                {wallet.address.slice(-6)})
                              </span>
                            </div>
                            <div
                              className="relative inline-flex items-center cursor-pointer shrink-0"
                              onClick={(event) => {
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
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default ConnectedSites;
