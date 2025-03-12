import { Maximize2 } from "lucide-react";
import type { StakeTransaction } from "../../../types/client";

interface SelectedStakeProps {
  stake: StakeTransaction;
  onClose: () => void;
  onSwap: (stake: StakeTransaction) => void;
}

export const SelectedStake = ({
  stake,
  onClose,
  onSwap,
}: SelectedStakeProps) => {
  return (
    <div className="bg-mf-ash-500 rounded-lg p-3">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-medium text-mf-milk-300">
          Subnet {stake.subnetId}
        </h3>
        <button onClick={onClose}>
          <Maximize2 className="w-2.5 h-2.5 text-mf-silver-300" />
        </button>
      </div>
      <div className="space-y-2">
        <div>
          <p className="text-xs text-mf-silver-300 mb-1">Validator Hotkey</p>
          <p className="text-xs text-mf-milk-300 font-medium break-all">
            {stake.validatorHotkey}
          </p>
        </div>
        <div>
          <p className="text-xs text-mf-silver-300 mb-1">Stake Amount</p>
          <p className="text-xs text-mf-milk-300 font-medium">
            {(stake.tokens / 1e9).toFixed(6)}{" "}
            <span className="text-mf-safety-300 text-sm">α</span>
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => onSwap(stake)}
            className="flex-1 text-[10px] text-mf-sybil-300 px-3 py-1.5 rounded bg-mf-ash-500 hover:bg-mf-ash-400 transition-colors"
          >
            Swap
          </button>
          <button
            onClick={() => onSwap(stake)}
            className="flex-1 text-[10px] text-mf-milk-300 px-3 py-1.5 rounded bg-mf-ash-500 hover:bg-mf-ash-400 transition-colors"
          >
            Move Stake
          </button>
        </div>
      </div>
    </div>
  );
};
