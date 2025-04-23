import taoxyz from '@public/assets/taoxyz.svg';
import { ChevronRight } from 'lucide-react';

import { useState } from 'react';

import Disclaimer from '@/client/components/common/Disclaimer';
import WalletSelection from '@/client/components/common/WalletSelection';
import ConnectedSites from '@/client/components/settings/ConnectedSites';
import { useLock } from '@/client/contexts/LockContext';
import KeyringService from '@/client/services/KeyringService';
import MessageService from '@/client/services/MessageService';

const Settings = () => {
  const { setIsLocked } = useLock();
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [showConnectedSites, setShowConnectedSites] = useState(false);

  const handleLock = async () => {
    KeyringService.lockWallets();
    await MessageService.sendWalletsLocked();
    await setIsLocked(true);
  };

  const renderMainSettings = () => (
    <div className="flex flex-col items-center w-full gap-4">
      {/* Header */}
      <div className="w-full flex items-center justify-start pt-4 px-5">
        <div className="flex items-center gap-2">
          <img src={taoxyz} alt="Taoxyz Logo" className="w-8 h-8" />
          <p className="text-mf-edge-500 text-3xl font-semibold blinker-font mb-1">SETTINGS</p>
        </div>
      </div>

      {/* Wallet Selection */}
      <WalletSelection />

      {/* Settings */}
      <div className="w-full px-5 py-3 flex flex-col items-center justify-start gap-3">
        <button
          onClick={() => setShowConnectedSites(true)}
          className="w-full bg-mf-ash-500 rounded-md p-3 flex items-center justify-between cursor-pointer hover:bg-mf-ash-300"
        >
          <div className="flex flex-col items-start justify-center">
            <p className="text-mf-edge-700 text-sm">Connected Sites</p>
            <p className="text-mf-sybil-500 text-xs">Control External Connections</p>
          </div>
          <div className="border border-mf-sybil-500 text-mf-ash-500 bg-mf-sybil-500 rounded-md p-1 hover:bg-mf-ash-500 hover:text-mf-sybil-500">
            <ChevronRight className="w-6 h-6" />
          </div>
        </button>

        <button
          onClick={handleLock}
          className="w-full bg-mf-ash-500 rounded-md p-3 flex items-center justify-between cursor-pointer hover:bg-mf-ash-300"
        >
          <div className="flex flex-col items-start justify-center">
            <p className="text-mf-edge-700 text-sm">Lock Wallet</p>
            <p className="text-mf-sybil-500 text-xs">Secure Your Wallet</p>
          </div>
          <div className="border border-mf-sybil-500 text-mf-ash-500 bg-mf-sybil-500 rounded-md p-1 hover:bg-mf-ash-500 hover:text-mf-sybil-500">
            <ChevronRight className="w-6 h-6" />
          </div>
        </button>

        <button
          onClick={() => setShowDisclaimer(true)}
          className="w-full bg-mf-ash-500 rounded-md p-3 flex items-center justify-between cursor-pointer hover:bg-mf-ash-300"
        >
          <div className="flex flex-col items-start justify-center">
            <p className="text-mf-edge-700 text-sm">Disclaimer</p>
            <p className="text-mf-sybil-500 text-xs">View Privacy Policy</p>
          </div>
          <div className="border border-mf-sybil-500 text-mf-ash-500 bg-mf-sybil-500 rounded-md p-1 hover:bg-mf-ash-500 hover:text-mf-sybil-500">
            <ChevronRight className="w-6 h-6" />
          </div>
        </button>
      </div>
    </div>
  );

  if (showConnectedSites) {
    return <ConnectedSites onClose={() => setShowConnectedSites(false)} />;
  }

  if (showDisclaimer) {
    return <Disclaimer onClose={() => setShowDisclaimer(false)} />;
  }

  return renderMainSettings();
};

export default Settings;
