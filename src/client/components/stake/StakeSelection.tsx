import type { StakeTransaction } from "../../../types/client";
import type { Validator } from "../../../types/client";

interface StakeSelectionProps {
  stakes: StakeTransaction[];
  selectedStake: StakeTransaction | null;
  validators: Validator[];
  isLoading: boolean;
  isLoadingSubnet: boolean;
  isLoadingValidators: boolean;
  onSelect: (stake: StakeTransaction) => void;
}

const StakeSelection = ({
  stakes,
  selectedStake,
  validators,
  isLoading,
  isLoadingSubnet,
  isLoadingValidators,
  onSelect,
}: StakeSelectionProps) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-16">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-mf-milk-300" />
      </div>
    );
  }

  return (
    <div className="space-y-2 p-2">
      {stakes.map((stake) => {
        const isSelected =
          selectedStake?.validatorHotkey === stake.validatorHotkey &&
          selectedStake?.subnetId === stake.subnetId;
        return (
          <button
            key={`${stake.subnetId}-${stake.validatorHotkey}`}
            onClick={() => onSelect(stake)}
            className={`w-full text-left rounded-sm p-2 ${
              isSelected
                ? "bg-mf-ash-300 border-2 border-mf-safety-500"
                : "bg-mf-ash-500 hover:bg-mf-ash-300"
            } transition-colors space-y-1`}
          >
            <div className="flex items-center justify-between text-sm">
              <h3 className="font-semibold text-mf-silver-300 flex items-center">
                <span className="truncate w-16">{stake.subnetName}</span>
                {isSelected && (
                  <span
                    className={`ml-2 text-xs ${
                      !isLoadingValidators && validators.length > 0
                        ? "text-mf-sybil-500"
                        : "text-mf-safety-500"
                    }`}
                  >
                    {isLoadingValidators || isLoadingSubnet
                      ? "Loading..."
                      : validators.length === 0
                      ? "No Validators"
                      : `${validators.length} Validators`}
                  </span>
                )}
              </h3>
              <span className="text-mf-safety-500">α</span>
            </div>
            <div className="flex items-center justify-between text-sm text-mf-milk-300">
              <p>
                {stake.validatorHotkey.slice(0, 8)}...
                {stake.validatorHotkey.slice(-8)}
              </p>
              <p>{(stake.tokens / 1e9).toFixed(4)}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default StakeSelection;
