import { Minimize2, Copy } from "lucide-react";
import { useState } from "react";

import StakeChart from "./StakeChart";
import type { StakeTransaction } from "../../../types/client";

interface ExpandedStakeProps {
  stake: StakeTransaction;
  onClose: () => void;
  onSwap: (stake: StakeTransaction) => void;
}

const ExpandedStake = ({ stake, onClose, onSwap }: ExpandedStakeProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(stake.validatorHotkey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy address:", error);
    }
  };

  return (
    <div className="bg-mf-ash-500 rounded-lg p-3">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-mf-milk-300">
          Subnet {stake.subnetId}
        </h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-mf-ash-300 rounded transition-colors"
        >
          <Minimize2 className="w-3 h-3 text-mf-milk-300" />
        </button>
      </div>
      <div className="space-y-3">
        <div>
          <p className="text-xs text-mf-silver-300 mb-1">Validator</p>
          <div className="flex items-center space-x-2">
            <p className="text-xs text-mf-milk-300">
              {stake.validatorHotkey.slice(0, 8)}...
              {stake.validatorHotkey.slice(-8)}
            </p>
            <button onClick={handleCopy} className="transition-colors">
              <Copy
                className={`w-3 h-3 ${
                  copied ? "text-mf-sybil-300" : "text-mf-safety-300"
                }`}
              />
            </button>
          </div>
        </div>
        <div>
          <p className="text-xs text-mf-silver-300">Stake</p>
          <p className="text-xs text-mf-milk-300">
            {(stake.tokens / 1e9).toFixed(6)}{" "}
            <span className="text-mf-safety-300 text-sm">α</span>
          </p>
        </div>

        <div className="mt-3 -mx-3">
          <div className="h-40">
            <StakeChart subnetId={stake.subnetId} expanded={true} />
          </div>
        </div>

        <div className="flex space-x-2 mt-3">
          <button
            onClick={() => onSwap(stake)}
            className="flex-1 text-xs font-medium text-mf-sybil-300 px-3 py-2 rounded bg-mf-ash-400 hover:bg-mf-ash-300 transition-colors"
          >
            Swap
          </button>
          <button
            onClick={() => onSwap(stake)}
            className="flex-1 text-xs font-medium text-mf-milk-300 px-3 py-2 rounded bg-mf-ash-400 hover:bg-mf-ash-300 transition-colors"
          >
            Move Stake
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExpandedStake;
