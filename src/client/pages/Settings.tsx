import { useState } from "react";

import { useLock } from "../contexts/LockContext";
import KeyringService from "../services/KeyringService";
import MessageService from "../services/MessageService";
import Disclaimer from "../components/Disclaimer";
import WalletSelection from "../components/WalletSelection";
import ConnectedSites from "../components/settings/ConnectedSites";
import taoxyzLogo from "../../../public/icons/taoxyz.svg";

const Settings = () => {
  const { setIsLocked } = useLock();
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [showConnectedSites, setShowConnectedSites] = useState(false);

  const handleLock = async () => {
    KeyringService.lockAll();
    await MessageService.sendWalletsLocked();
    await setIsLocked(true);
  };

  return (
    <>
      {showConnectedSites ? (
        <ConnectedSites onClose={() => setShowConnectedSites(false)} />
      ) : (
        <>
          {showDisclaimer ? (
            <Disclaimer onClose={() => setShowDisclaimer(false)} />
          ) : (
            <div className="flex flex-col items-center w-76 [&>*]:w-full">
              <div className="flex items-center justify-center">
                <img
                  src={taoxyzLogo}
                  alt="Taoxyz Logo"
                  className="w-16 h-16 mt-12"
                />
              </div>

              <div className="flex flex-col mt-4">
                <div className="text-center space-y-1">
                  <h2 className="text-lg text-mf-milk-300">Settings</h2>
                  <button onClick={() => setShowDisclaimer(true)}>
                    <span className="text-xs text-mf-safety-500 hover:text-mf-safety-300 transition-colors underline underline-offset-2 decoration-mf-safety-500 hover:decoration-mf-safety-300">
                      Disclaimer
                    </span>
                  </button>
                </div>
              </div>

              <div className="mt-6">
                <p className="flex justify-center text-sm text-mf-milk-300">
                  Change Wallets
                </p>
                <WalletSelection />
              </div>

              <div className="mt-4">
                <p className="flex justify-center text-sm text-mf-milk-300">
                  Connected Sites
                </p>
                <div className="flex justify-center space-x-4 mt-4">
                  <button
                    onClick={handleLock}
                    className="w-44 p-1 bg-mf-safety-500 hover:bg-mf-night-500 hover:text-mf-safety-500 border-2 border-mf-safety-500 hover:border-mf-safety-500 border-sm transition-colors"
                  >
                    <span>Lock Wallet</span>
                  </button>

                  <button
                    onClick={() => setShowConnectedSites(true)}
                    className="w-44 p-1 bg-mf-sybil-500 hover:bg-mf-night-500 hover:text-mf-sybil-500 border-2 border-mf-sybil-500 hover:border-mf-sybil-500 border-sm transition-colors"
                  >
                    <span>View Sites</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
};

export default Settings;
