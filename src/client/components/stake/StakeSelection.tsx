import type { StakeTransaction } from "../../../types/client";

interface StakeSelectionProps {
  stakes: StakeTransaction[];
  onSelect: (stake: StakeTransaction) => void;
  isLoading: boolean;
}

const StakeSelection = ({
  stakes,
  onSelect,
  isLoading,
}: StakeSelectionProps) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-[11px] font-medium mb-4">Select Stake to Move</h2>
      <div className="space-y-2">
        {stakes.map((stake) => (
          <div
            key={`${stake.subnetId}-${stake.validatorHotkey}`}
            className="bg-white/5 rounded-lg p-3 outline outline-1 outline-black/20"
            onClick={() => onSelect(stake)}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-[13px] font-semibold">
                  Subnet {stake.subnetId}
                </h3>
                <p className="text-[10px] text-gray-400">
                  {stake.validatorHotkey.slice(0, 8)}...
                  {stake.validatorHotkey.slice(-8)}
                </p>
                <p className="text-[10px] text-gray-400">
                  Stake: {(stake.tokens / 1e9).toFixed(4)} α
                </p>
              </div>
              <button
                className="text-[10px] text-blue-500 px-4 py-1 rounded hover:bg-blue-500/10 hover:outline hover:outline-1 hover:outline-blue-500/50"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(stake);
                }}
              >
                Select
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StakeSelection;
