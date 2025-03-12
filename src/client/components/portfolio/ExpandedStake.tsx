import { Maximize2 } from "lucide-react";
import type { StakeTransaction } from "../../../types/client";

interface ExpandedStakeProps {
  stake: StakeTransaction;
  onClick: () => void;
}

export const ExpandedStake = ({ stake, onClick }: ExpandedStakeProps) => {
  return (
    <button
      onClick={onClick}
      className="w-full bg-mf-ash-500 rounded-lg p-2.5 hover:bg-mf-ash-400 transition-colors text-left"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-medium text-mf-milk-300">
              Subnet {stake.subnetId}
            </h3>
            <Maximize2 className="w-2.5 h-2.5 text-mf-silver-300" />
          </div>
          <div className="flex items-center justify-between mt-1">
            <p className="text-xs text-mf-silver-300 truncate pr-2">
              {stake.validatorHotkey.slice(0, 8)}...
              {stake.validatorHotkey.slice(-8)}
            </p>
            <p className="text-xs text-mf-silver-300">
              {(stake.tokens / 1e9).toFixed(4)}{" "}
              <span className="text-mf-safety-300 text-xs">α</span>
            </p>
          </div>
        </div>
      </div>
    </button>
  );
};
