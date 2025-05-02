import taoxyz from '@public/assets/taoxyz.svg';
import { AnimatePresence, motion } from 'framer-motion';

import { useState } from 'react';

import { stg } from './skip';

interface InitialProps {
  onGetStarted: () => void;
}

const Initial = ({ onGetStarted }: InitialProps) => {
  const [skip, setSkip] = useState(false);
  const st = stg(skip);
  return (
    <div
      onClick={() => {
        setSkip(true);
      }}
      className="flex w-full h-full bg-mf-night-500 justify-center items-center relative"
    >
      <AnimatePresence>
        {!skip && (
          <motion.div
            className="absolute inset-0 bg-mf-safety-500 z-10 pointer-events-none"
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
          />
        )}
      </AnimatePresence>

      {/* Logo Animation */}
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
        initial={{ x: 0 }}
        animate={{ x: -80 }}
        {...st({ duration: 0.5, ease: 'easeInOut', delay: 0.75 })}
      >
        <img src={taoxyz} alt="Taoxyz Logo" className="h-8 w-8" />
      </motion.div>

      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pl-4"
        initial={{ y: -2, opacity: 0 }}
        animate={{ opacity: 1 }}
        {...st({ duration: 0.75, ease: 'easeInOut', delay: 1 })}
      >
        <p className="text-mf-edge-500 text-4xl font-bold blinker-font">
          TAO.
          <motion.span
            className="inline-block"
            initial={{ y: 3 }}
            animate={{ y: 0, rotateX: [180, 360] }}
            transition={{ duration: 0.2, delay: 1.4 }}
          >
            X
          </motion.span>
          <motion.span
            className="inline-block"
            initial={{ y: 3 }}
            animate={{ y: 0, rotateX: [180, 360] }}
            transition={{ duration: 0.2, delay: 1.6 }}
          >
            Y
          </motion.span>
          <motion.span
            className="inline-block"
            initial={{ y: 3 }}
            animate={{ y: 0, rotateX: [180, 360] }}
            transition={{ duration: 0.2, delay: 1.8 }}
          >
            Z
          </motion.span>
        </p>
      </motion.div>

      {/* Button Animation */}
      <motion.div
        className="absolute bottom-16 z-0"
        initial={{ y: 0, opacity: 0 }}
        animate={{ y: -24, opacity: 1 }}
        {...st({ duration: 1, ease: 'easeInOut', delay: 2 })}
      >
        <button
          className="rounded-full px-6 py-1.5 bg-mf-sybil-opacity text-sm text-center text-mf-sybil-500 cursor-pointer hover:opacity-50"
          onClick={onGetStarted}
        >
          Get Started
        </button>
      </motion.div>
    </div>
  );
};

export default Initial;
