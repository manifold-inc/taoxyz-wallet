import taoxyz from '@public/icons/taoxyz.svg';
import { motion } from 'framer-motion';

interface InitialProps {
  onGetStarted: () => void;
}

const Initial = ({ onGetStarted }: InitialProps) => {
  return (
    <div className="flex h-full w-full bg-mf-night-500 justify-center items-center relative overflow-hidden">
      {/* Background Animation */}
      <motion.div
        className="absolute inset-0 bg-mf-safety-500 z-10"
        initial={{ clipPath: 'circle(100% at 50% 50%)' }}
        animate={{ clipPath: 'circle(0% at 50% 50%)' }}
        transition={{ duration: 1.75, ease: 'easeInOut' }}
      />

      {/* Logo Animation */}
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
        initial={{ x: 0 }}
        animate={{ x: -80 }}
        transition={{ duration: 1, ease: 'easeInOut', delay: 2 }}
      >
        <img src={taoxyz} alt="Taoxyz Logo" className="h-8 w-8" />
      </motion.div>

      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
        initial={{ x: 0, opacity: 0 }}
        animate={{ x: 8, opacity: 1 }}
        transition={{ duration: 1, ease: 'easeInOut', delay: 3.25 }}
      >
        <p className="text-mf-edge-500 text-4xl font-bold blinker-font">TAO.XYZ</p>
      </motion.div>

      {/* Button Animation */}
      <motion.div
        className="absolute bottom-16 z-0"
        initial={{ y: 0, opacity: 0 }}
        animate={{ y: -24, opacity: 1 }}
        transition={{ duration: 1, ease: 'easeInOut', delay: 4.5 }}
      >
        <button
          className="rounded-full px-8 py-1.5 bg-mf-sybil-opacity text-base text-mf-sybil-500 cursor-pointer border border-mf-sybil-opacity hover:border-mf-sybil-500 transition-colors hover:text-mf-edge-500"
          onClick={onGetStarted}
        >
          <span>Get Started</span>
        </button>
      </motion.div>
    </div>
  );
};

export default Initial;
