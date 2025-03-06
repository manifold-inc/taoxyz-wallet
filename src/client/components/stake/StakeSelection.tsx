import type { StakeTransaction } from "../../../types/types";

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
    <div>
      <h2 className="text-xl font-semibold mb-6">Select Stake to Move</h2>
      <div className="grid grid-cols-1 gap-4">
        {stakes.map((stake) => (
          <div
            key={`${stake.subnetId}-${stake.validatorHotkey}`}
            className="border rounded-lg p-4 hover:border-blue-500 cursor-pointer transition-colors"
            onClick={() => onSelect(stake)}
          >
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium mb-1">
                  Subnet {stake.subnetId}
                </h3>
                <p className="text-sm text-gray-600">
                  Validator: {stake.validatorHotkey.slice(0, 8)}...
                  {stake.validatorHotkey.slice(-8)}
                </p>
                <p className="text-sm text-gray-600">
                  Stake: {(stake.tokens / 1e9).toFixed(4)} α
                </p>
              </div>
              <button
                className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(stake);
                }}
              >
                Select Stake
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StakeSelection;
