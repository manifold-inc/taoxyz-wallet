import type { StakeTransaction } from "../../../types/client";

interface StakeSelectionProps {
  stakes: StakeTransaction[];
  onSelect: (stake: StakeTransaction) => void;
  isLoading: boolean;
  selectedStake: StakeTransaction | null;
}

const StakeSelection = ({
  stakes,
  onSelect,
  isLoading,
  selectedStake,
}: StakeSelectionProps) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-16">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-mf-milk-300" />
      </div>
    );
  }

  return (
    <div className="space-y-2 p-4">
      {stakes.map((stake) => {
        const isSelected =
          selectedStake?.validatorHotkey === stake.validatorHotkey &&
          selectedStake?.subnetId === stake.subnetId;
        return (
          <div
            key={`${stake.subnetId}-${stake.validatorHotkey}`}
            className={`w-full rounded-lg ${
              isSelected
                ? "bg-mf-ash-400 ring-1 ring-mf-safety-300"
                : "bg-mf-ash-300 hover:bg-mf-ash-400"
            } transition-colors px-3 py-2 cursor-pointer`}
            onClick={() => onSelect(stake)}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-xs font-semibold text-mf-milk-300">
                  Subnet {stake.subnetId}
                </h3>
                <p className="text-xs text-mf-silver-300">
                  {stake.validatorHotkey.slice(0, 8)}...
                  {stake.validatorHotkey.slice(-8)}
                </p>
                <p className="text-xs text-mf-silver-300">
                  Stake: {(stake.tokens / 1e9).toFixed(4)} τ
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StakeSelection;
