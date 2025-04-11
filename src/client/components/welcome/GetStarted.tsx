import taoxyz from '@public/icons/taoxyz.svg';
import { AnimatePresence, motion } from 'framer-motion';
import { Info, Plus, WalletCards } from 'lucide-react';

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Disclaimer from '@/client/components/common/Disclaimer';

enum Mode {
  CREATE_WALLET = 'CREATE_WALLET',
  IMPORT_MNEMONIC = 'IMPORT_MNEMONIC',
}

const GetStarted = () => {
  const navigate = useNavigate();
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [showWalletText, setShowWalletText] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const handleNavigation = (path: string, mode: Mode) => {
    setIsExiting(true);
    setTimeout(() => {
      navigate(path, { state: { mode } });
    }, 1000);
  };

  return (
    <div className="flex h-full w-full bg-mf-night-500 justify-center items-center relative overflow-hidden">
      <AnimatePresence>
        {!isExiting && (
          <motion.div
            className="flex h-full w-full justify-center items-center relative overflow-hidden"
            initial={{ y: 0, opacity: 1 }}
            exit={{ y: -1000, opacity: 0 }}
            transition={{ duration: 1, ease: 'easeInOut' }}
          >
            {/* Main Content */}
            <motion.div
              className="flex h-full w-full justify-center items-center relative overflow-hidden"
              animate={{ opacity: showDisclaimer ? 0.5 : 1 }}
              transition={{ duration: 0.3 }}
            >
              {/* Logo */}
              <motion.div
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
                initial={{ y: 0, x: -80, scale: 1 }}
                animate={{ y: -50, x: -120, scale: 0.9 }}
                transition={{ duration: 1, ease: 'easeInOut' }}
              >
                <img src={taoxyz} alt="Taoxyz Logo" className="h-8 w-8" />
              </motion.div>

              {/* Text */}
              <motion.div
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
                initial={{ y: -2, x: 8, scale: 1 }}
                animate={{ y: -52, x: -40, scale: 0.9 }}
                transition={{
                  duration: 1,
                  ease: 'easeInOut',
                  onComplete: () => setShowWalletText(true),
                }}
              >
                <div className="relative">
                  <span className="text-mf-edge-500 text-4xl font-bold blinker-font">TAO.XYZ</span>
                  <motion.span
                    className="absolute left-full ml-2 text-mf-edge-500 text-4xl font-bold blinker-font"
                    initial={{ opacity: 0 }}
                    animate={{
                      opacity: showWalletText ? 1 : 0,
                    }}
                    transition={{ duration: 1 }}
                  >
                    WALLET
                  </motion.span>
                </div>
              </motion.div>

              {/* Subtitle */}
              <motion.p
                className="text-mf-sybil-500 text-base font-light text-center px-12"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 5 }}
                transition={{ delay: 0.5, duration: 1 }}
              >
                To get started, create a new wallet or import an existing one.
              </motion.p>

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
                  onClick={() => handleNavigation('/add-wallet', Mode.CREATE_WALLET)}
                >
                  <WalletCards className="w-4 h-4" />
                  <span>Create Wallet</span>
                </motion.button>
                <motion.button
                  className="rounded-full cursor-pointer flex items-center gap-1.5 px-6 py-1 bg-mf-safety-opacity rounded-full text-sm text-mf-safety-500 cursor-pointer border border-mf-safety-opacity hover:border-mf-safety-500 transition-colors hover:text-mf-edge-500"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleNavigation('/add-wallet', Mode.IMPORT_MNEMONIC)}
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GetStarted;
