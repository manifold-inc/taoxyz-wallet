import { ArrowLeftToLine } from "lucide-react";
import taoxyz from "../../../public/icons/taoxyz.svg";

interface DisclaimerProps {
  onClose: () => void;
}

const Disclaimer = ({ onClose }: DisclaimerProps) => {
  return (
    <div className="flex flex-col items-center min-h-screen">
      <div className="relative flex justify-center items-center w-72 mt-12">
        <ArrowLeftToLine
          className="absolute left-3 w-6 h-6 text-mf-milk-500"
          onClick={onClose}
        />
        <img src={taoxyz} alt="Taoxyz Logo" className="w-16 h-16" />
      </div>

      <div className="flex flex-col items-center w-72 [&>*]:w-full mt-4 space-y-4">
        <div className="text-center text-lg text-mf-milk-500">
          <h1>Disclaimer</h1>
        </div>

        <p className="text-mf-safety-500 text-xs bg-mf-ash-500 p-3 rounded-sm">
          You can use this wallet to securely store and transfer TAO. Please
          securely store all mnemonics and passwords created.
        </p>

        <div className="text-center text-xs text-mf-milk-300">
          <p>Data Privacy</p>
        </div>

        <ul className="rounded-sm bg-mf-ash-500 text-mf-sybil-500 text-xs space-y-4 p-3">
          <li>
            We refrain from transmitting any clicks, page views, or events to a
            central server.
          </li>
          <li>We abstain from utilizing any trackers or analytics.</li>
          <li>
            We do not gather addresses, keys, or other personal information.
          </li>
          <p>For support or questions, please contact devs@manifoldlabs.inc</p>
        </ul>
      </div>
    </div>
  );
};

export default Disclaimer;
