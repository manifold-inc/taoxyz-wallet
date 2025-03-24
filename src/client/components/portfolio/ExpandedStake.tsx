import { useState } from "react";
import { ChevronUp, Copy } from "lucide-react";

import type { StakeTransaction, Subnet } from "../../../types/client";
import taoxyz from "../../../../public/icons/taoxyz.png";
import StakeChart from "./StakeChart";

interface ExpandedStakeProps {
  stake: StakeTransaction;
  subnet: Subnet | null;
  onClose: () => void;
  onSwap: () => void;
  onMoveStake: () => void;
  onRefresh: () => Promise<void>;
}

const ExpandedStake = ({
  stake,
  subnet,
  onClose,
  onSwap,
  onMoveStake,
  onRefresh,
}: ExpandedStakeProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(stake.validatorHotkey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSwap = () => {
    onSwap();
    setTimeout(() => {
      onRefresh();
    }, 2000);
  };

  // TODO: Remove chart if subnet price is not available show notification
  return (
    <div className="mt-2">
      <div className="rounded-sm p-3 border border-mf-safety-500 bg-mf-ash-500">
        <div className="flex justify-between">
          <div>
            <h3 className="text-sm font-semibold text-mf-milk-300">
              Subnet {stake.subnetId}
            </h3>
          </div>
          <div className="flex flex-col text-mf-sybil-500 text-xs">
            <div className="flex items-center gap-1">
              <span className="text-mf-milk-300">Stake</span>
              <span>{(stake.tokens / 1e9).toFixed(4)}</span>
              <span className="text-mf-safety-500">α</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-mf-milk-300">Price</span>
              <span className="flex items-center gap-1">
                {subnet?.price ? subnet.price.toFixed(4) : "-"}
                <img src={taoxyz} alt="taoxyz" className="w-3 h-3" />
              </span>
            </div>
          </div>
        </div>

        <div className="h-38">
          <StakeChart subnetId={stake.subnetId} />
        </div>

        <div className="text-mf-milk-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-mf-milk-300">Validator</span>
            <p>
              {stake.validatorHotkey.slice(0, 6)}...
              {stake.validatorHotkey.slice(-6)}
            </p>
            <button onClick={handleCopy} className="transition-colors">
              <Copy
                className={`w-3 h-3 ${
                  copied ? "text-mf-sybil-500" : "text-mf-milk-300"
                }`}
              />
            </button>
          </div>
          <button onClick={onClose} className="p-1">
            <ChevronUp className="w-5 h-5 text-mf-milk-300" />
          </button>
        </div>
      </div>

      <div className="flex mt-4 space-x-4">
        <button
          onClick={handleSwap}
          className="flex-1 p-2 bg-mf-safety-500 hover:bg-mf-night-500 hover:text-mf-safety-500 border-2 border-mf-safety-500 hover:border-mf-safety-500 transition-colors
          "
        >
          Swap
        </button>
        <button
          onClick={onMoveStake}
          className="flex-1 p-2 bg-mf-sybil-500 hover:bg-mf-night-500 hover:text-mf-sybil-500 border-2 border-mf-sybil-500 hover:border-mf-sybil-500 transition-colors"
        >
          Move
        </button>
      </div>
    </div>
  );
};

export default ExpandedStake;
