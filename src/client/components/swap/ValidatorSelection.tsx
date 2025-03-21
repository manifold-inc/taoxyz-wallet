import type { Subnet, Validator } from "../../../types/client";

interface ValidatorSelectionProps {
  subnet: Subnet;
  validators: Validator[];
  onSelect: (validator: Validator) => void;
  selectedValidator: Validator | null;
}

const ValidatorSelection = ({
  validators,
  onSelect,
  selectedValidator,
}: ValidatorSelectionProps) => {
  if (validators.length === 0) {
    return (
      <div className="p-2">
        <div className="w-full rounded-lg bg-mf-ash-500 px-3 py-4 ring-1 ring-mf-safety-300">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-xs text-mf-safety-300">No validators found</p>
            </div>
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
          <div
            key={validator.hotkey}
            className={`w-full rounded-lg ${
              isSelected
                ? "bg-mf-ash-400 ring-1 ring-mf-safety-300"
                : "bg-mf-ash-500 hover:bg-mf-ash-400"
            } transition-colors px-3 py-2 cursor-pointer`}
            onClick={() => onSelect(validator)}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-xs font-semibold text-mf-milk-300">
                  Validator {validator.index}
                </h3>
                <p className="text-xs text-mf-silver-300">
                  {validator.hotkey.slice(0, 8)}...{validator.hotkey.slice(-8)}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ValidatorSelection;
