import taoxyz from '@public/icons/taoxyz.svg';
import { Info, Send, X } from 'lucide-react';

interface DisclaimerProps {
  onClose: () => void;
}

const Disclaimer = ({ onClose }: DisclaimerProps) => {
  return (
    <div className="flex w-full flex-col h-full items-center bg-mf-night-500 gap-4">
      {/* Header */}
      <div className="flex justify-between items-center w-full px-6 pt-10">
        <img src={taoxyz} alt="Taoxyz Logo" className="w-7 h-7" />

        <button
          onClick={onClose}
          className="cursor-pointer bg-mf-sybil-500 p-0.5 rounded-xs border border-mf-sybil-500 hover:bg-mf-ash-500 transition-colors text-mf-ash-500 hover:text-mf-sybil-500"
        >
          <X className="w-5 h-5" strokeWidth={3} />
        </button>
      </div>

      {/* Disclaimer */}
      <div className="flex flex-col gap-4 flex flex-col items-center px-10">
        <p className="text-mf-edge-500 text-lg blinker-font font-bold">DISCLAIMER</p>
        <p className="text-mf-safety-300 text-xs bg-mf-ash-500 rounded-xs font-light p-5">
          You can use this wallet to securely store and transfer TAO. Please securely store all
          mnemonics and passwords created.
        </p>
      </div>

      {/* Data Privacy */}
      <div className="flex flex-col gap-4 flex flex-col items-center px-10">
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
      </div>

      {/* Contact Us Buttons */}
      <div className="flex flex-col gap-4 flex flex-col items-center px-10">
        <button className="rounded-full px-8 py-1.5 bg-mf-sybil-opacity text-base text-mf-sybil-500 cursor-pointer border border-mf-sybil-opacity hover:border-mf-sybil-500 transition-colors hover:text-mf-edge-500">
          <Send className="w-4 h-4" />
          <span>Email Us</span>
        </button>
        <button className="rounded-full px-8 py-1.5 bg-mf-safety-opacity text-base text-mf-safety-500 cursor-pointer border border-mf-safety-opacity hover:border-mf-safety-500 transition-colors hover:text-mf-edge-500">
          <Info className="w-4 h-4" />
          <span>Report Issue</span>
        </button>
      </div>
    </div>
  );
};

export default Disclaimer;
