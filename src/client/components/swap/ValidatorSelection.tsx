import type { Subnet, Validator } from "../../../types/types";

interface ValidatorSelectionProps {
  subnet: Subnet;
  validators: Validator[];
  isLoading: boolean;
  onSelect: (validator: Validator) => void;
  onBack: () => void;
}

const ValidatorSelection = ({
  subnet,
  validators,
  isLoading,
  onSelect,
  onBack,
}: ValidatorSelectionProps) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex items-center mb-4">
        <button
          onClick={onBack}
          className="mr-3 text-[10px] text-gray-400 hover:text-gray-300"
        >
          ← Back
        </button>
        <h2 className="text-[11px] font-medium">
          Select a Validator in {subnet.name}
        </h2>
      </div>

      <div className="space-y-2">
        {validators.map((validator) => (
          <div
            key={validator.hotkey}
            className="bg-white/5 rounded-lg p-3 outline outline-1 outline-black/20"
            onClick={() => onSelect(validator)}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-[13px] font-semibold">
                  Validator {validator.index + 1}
                </h3>
                <p className="text-[10px] text-gray-400">
                  {validator.hotkey.slice(0, 8)}...{validator.hotkey.slice(-8)}
                </p>
              </div>
              <button
                className="text-[10px] text-blue-500 px-4 py-1 rounded hover:bg-blue-500/10 hover:outline hover:outline-1 hover:outline-blue-500/50"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(validator);
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

export default ValidatorSelection;
