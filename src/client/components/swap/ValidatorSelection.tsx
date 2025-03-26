import type { Subnet, Validator } from "../../../types/client";

interface ValidatorSelectionProps {
  subnet: Subnet;
  validators: Validator[];
  selectedValidator: Validator | null;
  isLoading?: boolean;
  onSelect: (validator: Validator) => void;
}

const ValidatorSelection = ({
  validators,
  selectedValidator,
  isLoading = true,
  onSelect,
}: ValidatorSelectionProps) => {
  if (isLoading) {
    return (
      <div className="p-2">
        <div className="w-full flex items-center justify-center rounded-sm bg-mf-ash-500 p-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-mf-silver-300" />
        </div>
      </div>
    );
  }

  if (validators.length === 0 && !isLoading) {
    return (
      <div className="p-2">
        <div className="w-full rounded-sm bg-mf-ash-500 p-2 space-y-1">
          <div className="flex items-center justify-between text-sm text-mf-silver-300 font-semibold">
            <h3>No Validators Found</h3>
          </div>
          <div className="flex items-center justify-between text-xs text-mf-milk-300">
            <p>Please try again later</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2 p-2">
      {validators.map((validator) => {
        const isSelected = selectedValidator?.hotkey === validator.hotkey;
        return (
          <button
            key={validator.hotkey}
            className={`w-full text-left rounded-sm p-2 cursor-pointer ${
              isSelected
                ? "bg-mf-ash-300 border-2 border-mf-safety-500"
                : "bg-mf-ash-500 hover:bg-mf-ash-300"
            } transition-colors space-y-1`}
            onClick={() => onSelect(validator)}
          >
            <div className="flex items-center justify-between text-sm text-mf-silver-300 font-semibold">
              <h3>Validator {validator.index}</h3>
            </div>
            <div className="flex items-center justify-between text-xs text-mf-milk-300">
              <p>
                {validator.hotkey.slice(0, 6)}...{validator.hotkey.slice(-6)}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default ValidatorSelection;
