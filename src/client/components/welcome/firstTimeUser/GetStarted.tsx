import taoxyz from '@public/icons/taoxyz.svg';
import { Info, Plus, WalletCards } from 'lucide-react';

const GetStarted = () => {
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
        <div className="px-6 py-1.5 bg-mf-sybil-opacity rounded-full cursor-pointer">
          <button className="rounded-full cursor-pointer flex items-center gap-1.5">
            <WalletCards className="w-4 h-4 text-mf-sybil-500" />
            <span className="text-mf-sybil-500 text-base">Create Wallet</span>
          </button>
        </div>
        <div className="px-6 py-1.5 bg-mf-safety-opacity rounded-full cursor-pointer">
          <button className="rounded-full cursor-pointer flex items-center gap-1.5">
            <Plus className="w-4 h-4 text-mf-safety-500" />
            <span className="text-mf-safety-500 text-base">Existing Wallet</span>
          </button>
        </div>
        <div className="px-2 py-1.5 rounded-full cursor-pointer">
          <button className="rounded-full cursor-pointer flex items-center gap-1.5">
            <Info className="w-4 h-4 text-mf-ash-300" />
            <span className="text-mf-ash-300 text-sm">Disclaimer</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default GetStarted;
