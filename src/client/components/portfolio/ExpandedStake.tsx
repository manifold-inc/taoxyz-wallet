import { Minimize2, Copy } from "lucide-react";
import { useState } from "react";
import StakeChart from "./StakeChart";
import type { StakeTransaction, Subnet } from "../../../types/client";

interface ExpandedStakeProps {
  stake: StakeTransaction;
  subnet: Subnet | null;
  onClose: () => void;
  onSwap: (stake: StakeTransaction) => void;
}

const ExpandedStake = ({
  stake,
  subnet,
  onClose,
  onSwap,
}: ExpandedStakeProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(stake.validatorHotkey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-mf-ash-500 rounded-lg p-3">
      <div className="flex items-start justify-between mb-3">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold text-mf-milk-300">
            Subnet {stake.subnetId}
          </h3>
          {subnet?.price && (
            <p className="text-xs text-mf-silver-300">
              <span className="text-mf-safety-300">τ</span> ={" "}
              {(1 / subnet.price).toFixed(4)}
              <span className="text-mf-safety-300"> α</span>
            </p>
          )}
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-mf-ash-300 rounded transition-colors"
        >
          <Minimize2 className="w-4 h-4 text-mf-milk-300" />
        </button>
      </div>
      <div className="space-y-3">
        <div className="flex items-center space-x-6">
          <div className="flex-1">
            <p className="text-xs font-medium text-mf-milk-300">Validator</p>
            <div className="flex items-center space-x-2">
              <p className="text-xs text-mf-silver-300">
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
            <p className="text-xs font-medium text-mf-milk-300">Stake</p>
            <p className="text-xs text-mf-silver-300">
              {(stake.tokens / 1e9).toFixed(6)}{" "}
              <span className="text-mf-safety-300">α</span>
            </p>
          </div>
        </div>

        <div className="mt-3 -mx-3">
          <div className="h-40">
            <StakeChart subnetId={stake.subnetId} />
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
