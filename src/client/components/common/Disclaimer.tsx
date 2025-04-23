import taoxyz from '@public/assets/taoxyz.svg';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

interface DisclaimerProps {
  onClose: () => void;
}

const Disclaimer = ({ onClose }: DisclaimerProps) => {
  return (
    <motion.div
      className="flex w-full flex-col h-full items-center bg-mf-night-500 gap-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="flex justify-between items-center w-full px-6 pt-10">
        <img src={taoxyz} alt="Taoxyz Logo" className="w-7 h-7" />

        <button
          onClick={onClose}
          className="cursor-pointer bg-mf-sybil-500 p-0.5 rounded-xs border border-mf-sybil-500 hover:bg-mf-ash-500 hover:text-mf-sybil-500"
        >
          <X className="w-5 h-5" strokeWidth={3} />
        </button>
      </div>

      {/* Disclaimer */}
      <motion.div
        className="flex flex-col gap-4 items-center px-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <p className="text-mf-edge-500 text-lg blinker-font font-bold">DISCLAIMER</p>
        <p className="text-mf-safety-300 text-xs bg-mf-ash-500 rounded-xs font-light p-5">
          You can use this wallet to securely store and transfer TAO. Please securely store all
          mnemonics and passwords created.
        </p>
      </motion.div>

      {/* Data Privacy */}
      <motion.div
        className="flex flex-col gap-4 items-center px-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <p className="text-mf-edge-500 text-lg blinker-font font-bold">DATA PRIVACY</p>
        <ul className="rounded-xs bg-mf-ash-500 text-mf-sybil-500 text-xs font-light space-y-4 p-5">
          <li>
            We refrain from transmitting any clicks, page views, or events to a central server.
          </li>
          <li>We abstain from utilizing any trackers or analytics.</li>
          <li>We do not gather addresses, keys, or other personal information.</li>
          <li>
            For support or questions, please contact{' '}
            <span className="underline">devs@manifoldlabs.inc</span>
          </li>
        </ul>
      </motion.div>
    </motion.div>
  );
};

export default Disclaimer;
