import taoxyz from '@public/assets/taoxyz.svg';
import { AnimatePresence, motion } from 'framer-motion';
import { Info, Plus, WalletCards } from 'lucide-react';

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Disclaimer from '@/client/components/common/Disclaimer';
import { Mode, useWalletCreation } from '@/client/contexts/WalletCreationContext';

const GetStarted = () => {
  const navigate = useNavigate();
  const { actions } = useWalletCreation();
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const handleNavigation = (path: string, mode: Mode) => {
    setIsExiting(true);
    setTimeout(() => {
      actions.setMode(mode);
      navigate(path);
    }, 1000);
  };

  return (
    <div className="flex h-full w-full bg-mf-night-500 justify-center items-center relative overflow-hidden">
      <AnimatePresence mode="wait">
        {!isExiting && (
          <motion.div
            key="get-started"
            className="flex h-full w-full justify-center items-center relative overflow-hidden"
            initial={{ y: '100vh', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '-100vh', opacity: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            {/* Main Content */}
            <motion.div
              className="flex h-full w-full justify-center items-center relative overflow-hidden"
              animate={{ opacity: showDisclaimer ? 0.5 : 1 }}
              transition={{ duration: 0.3 }}
            >
              {/* Logo + Text Combined */}
              <motion.div
                className="absolute left-[45%] top-[41%] -translate-x-1/2 -translate-y-1/2 z-10 flex items-center gap-3"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}
              >
                <motion.div
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
                  initial={{ y: 500, x: -120, opacity: 0 }}
                  animate={{ y: -50, x: -120, opacity: 1 }}
                  transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}
                />
                <img src={taoxyz} alt="Taoxyz Logo" className="h-8 w-8" />
                <span className="text-mf-edge-500 text-3xl font-bold blinker-font whitespace-nowrap">
                  TAO.XYZ WALLET
                </span>
              </motion.div>

              {/* Subtitle */}
              <motion.p
                className="text-mf-sybil-500 text-base font-light text-center mt-10 px-8 max-w-xs w-full mx-auto"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.6 }}
              >
                <p>To get started, create a</p>
                <p>new wallet or import</p>
                <p>an existing one.</p>
              </motion.p>

              {/* Buttons */}
              <motion.div
                className="absolute bottom-16 flex flex-col items-center gap-4"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.6 }}
              >
                <button
                  className="w-full rounded-full cursor-pointer flex items-center gap-1.5 px-6 py-1.5 bg-mf-sybil-opacity text-sm text-mf-sybil-500 hover:opacity-50"
                  onClick={() => handleNavigation('/add-wallet', Mode.CREATE_WALLET)}
                >
                  <WalletCards className="w-4 h-4" />
                  <span>Create Wallet</span>
                </button>
                <button
                  className="w-full rounded-full cursor-pointer flex items-center gap-1.5 px-6 py-1.5 bg-mf-safety-opacity text-sm text-mf-safety-500 hover:opacity-50"
                  onClick={() => handleNavigation('/add-wallet', Mode.IMPORT_MNEMONIC)}
                >
                  <Plus className="w-4 h-4" />
                  <span>Existing Wallet</span>
                </button>
                <button
                  className="rounded-full cursor-pointer flex items-center gap-1.5 text-mf-edge-700 text-xs hover:text-mf-edge-500"
                  onClick={() => setShowDisclaimer(true)}
                >
                  <Info className="w-4 h-4" />
                  <span>Disclaimer</span>
                </button>
              </motion.div>
            </motion.div>

            {/* Disclaimer Slide-up */}
            <motion.div
              className="absolute inset-0 z-10"
              initial={{ y: '100%' }}
              animate={{ y: showDisclaimer ? 0 : '100%' }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
            >
              <Disclaimer onClose={() => setShowDisclaimer(false)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GetStarted;
