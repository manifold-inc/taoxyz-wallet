import taoxyz from '@public/icons/taoxyz.svg';
import { motion } from 'framer-motion';
import { Info, Plus, WalletCards } from 'lucide-react';

import { useState } from 'react';

import Disclaimer from '@/client/components/common/Disclaimer';

const GetStarted = () => {
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  return (
    <div className="flex h-full w-full bg-mf-night-500 justify-center items-center relative overflow-hidden">
      {/* Main Content */}
      <motion.div
        className="flex h-full w-full justify-center items-center relative overflow-hidden"
        animate={{ opacity: showDisclaimer ? 0.5 : 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* Logo and Text */}
        <div className="absolute left-[calc(50%-5rem)] top-1/2 -translate-x-1/2 -translate-y-1/2">
          <img src={taoxyz} alt="Taoxyz Logo" className="h-8 w-8" />
        </div>
        <div className="absolute left-[calc(50%+0.5rem)] top-1/2 -translate-x-1/2 -translate-y-1/2">
          <p className="text-mf-edge-500 text-4xl font-bold blinker-font">TAO.XYZ</p>
        </div>

        {/* Buttons */}
        <motion.div
          className="absolute bottom-16 flex flex-col items-center gap-4"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <motion.button
            className="rounded-full cursor-pointer flex items-center gap-1.5 px-6 py-1 bg-mf-sybil-opacity rounded-full text-sm text-mf-sybil-500 cursor-pointer border border-mf-sybil-opacity hover:border-mf-sybil-500 transition-colors hover:text-mf-edge-500"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <WalletCards className="w-4 h-4" />
            <span>Create Wallet</span>
          </motion.button>
          <motion.button
            className="rounded-full cursor-pointer flex items-center gap-1.5 px-6 py-1 bg-mf-safety-opacity rounded-full text-sm text-mf-safety-500 cursor-pointer border border-mf-safety-opacity hover:border-mf-safety-500 transition-colors hover:text-mf-edge-500"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Plus className="w-4 h-4" />
            <span>Existing Wallet</span>
          </motion.button>
          <motion.button
            className="rounded-full cursor-pointer flex items-center gap-1.5 text-mf-ash-300 text-xs hover:text-mf-edge-500 transition-colors"
            onClick={() => setShowDisclaimer(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Info className="w-4 h-4" />
            <span>Disclaimer</span>
          </motion.button>
        </motion.div>
      </motion.div>

      {/* Disclaimer - Always present but positioned off-screen */}
      <motion.div
        className="absolute inset-0 z-10"
        initial={{ y: '100%' }}
        animate={{ y: showDisclaimer ? 0 : '100%' }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
      >
        <Disclaimer onClose={() => setShowDisclaimer(false)} />
      </motion.div>
    </div>
  );
};

export default GetStarted;
