import taoxyz from '@public/icons/taoxyz.svg';
import { Info, Plus, WalletCards } from 'lucide-react';

import { useState } from 'react';

import Disclaimer from '@/client/components/common/Disclaimer';

const GetStarted = () => {
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  if (showDisclaimer) {
    return <Disclaimer onClose={() => setShowDisclaimer(false)} />;
  }

  return (
    <div className="flex h-full w-full bg-mf-night-500 justify-center items-center relative overflow-hidden">
      {/* Logo and Text */}
      <div className="absolute left-[calc(50%-5rem)] top-1/2 -translate-x-1/2 -translate-y-1/2">
        <img src={taoxyz} alt="Taoxyz Logo" className="h-8 w-8" />
      </div>
      <div className="absolute left-[calc(50%+1.5rem)] top-1/2 -translate-x-1/2 -translate-y-1/2">
        <p className="text-mf-edge-500 text-4xl font-bold font-blinker">TAO.XYZ</p>
      </div>

      {/* Buttons */}
      <div className="absolute bottom-16 flex flex-col items-center gap-4">
        <div className="px-6 py-1.5 bg-mf-sybil-opacity rounded-full cursor-pointer text-base text-mf-sybil-500 border border-mf-sybil-opacity hover:border-mf-sybil-500 transition-colors hover:text-mf-edge-500">
          <button className="rounded-full cursor-pointer flex items-center gap-1.5">
            <WalletCards className="w-4 h-4" />
            <span>Create Wallet</span>
          </button>
        </div>
        <div className="px-6 py-1.5 bg-mf-safety-opacity rounded-full cursor-pointer text-base text-mf-safety-500 border border-mf-safety-opacity hover:border-mf-safety-500 transition-colors hover:text-mf-edge-500">
          <button className="rounded-full cursor-pointer flex items-center gap-1.5">
            <Plus className="w-4 h-4" />
            <span>Existing Wallet</span>
          </button>
        </div>
        <div className="px-2 py-1.5 rounded-full cursor-pointer">
          <button
            className="rounded-full cursor-pointer flex items-center gap-1.5 text-mf-ash-300 text-sm hover:text-mf-edge-500 transition-colors"
            onClick={() => setShowDisclaimer(true)}
          >
            <Info className="w-4 h-4" />
            <span>Disclaimer</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default GetStarted;
