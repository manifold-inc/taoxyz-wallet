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
    <div>
      <div className="flex items-center mb-6">
        <button
          onClick={onBack}
          className="mr-4 text-gray-600 hover:text-gray-900"
        >
          ← Back
        </button>
        <h2 className="text-xl font-semibold">
          Select a Validator in {subnet.name}
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {validators.map((validator) => (
          <div
            key={validator.hotkey}
            className="border rounded-lg p-4 hover:border-blue-500 cursor-pointer transition-colors"
            onClick={() => onSelect(validator)}
          >
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium mb-1">
                  Validator {validator.index + 1}
                </h3>
                <p className="text-sm text-gray-600">
                  Hotkey: {validator.hotkey.slice(0, 8)}...
                  {validator.hotkey.slice(-8)}
                </p>
                <p className="text-sm text-gray-600">
                  Coldkey: {validator.coldkey.slice(0, 8)}...
                  {validator.coldkey.slice(-8)}
                </p>
              </div>
              <button
                className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(validator);
                }}
              >
                Select Validator
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ValidatorSelection;
