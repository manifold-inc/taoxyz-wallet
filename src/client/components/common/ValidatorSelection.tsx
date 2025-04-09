import { useState } from 'react';

import type { Subnet, Validator } from '../../../types/client';

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
  const [searchQuery, setSearchQuery] = useState('');

  const filteredValidators = validators.filter(validator => {
    const searchLower = searchQuery.toLowerCase();
    return validator.hotkey.toLowerCase().includes(searchLower);
  });

  if (isLoading) {
    return (
      <div className="p-2">
        <div className="w-full flex items-center justify-center rounded-sm bg-mf-ash-500 p-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-mf-milk-300" />
        </div>
      </div>
    );
  }

  if (validators.length === 0 && !isLoading) {
    return (
      <div className="p-2">
        <div className="w-full border-sm bg-mf-ash-500 p-2 space-y-1 border-2 border-mf-ash-300">
          <div className="flex items-center justify-between text-sm text-mf-edge-300 font-semibold">
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
    <div>
      <div className="p-2">
        <input
          type="text"
          placeholder="Search Hotkey"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full p-2 text-sm bg-mf-ash-500 border-2 border-mf-ash-300 border-sm text-mf-edge-300 placeholder-mf-milk-300 focus:outline-none focus:border-mf-safety-500"
        />
      </div>
      <div className="p-2 max-h-[calc(100vh-320px)] overflow-y-auto">
        <div className="space-y-2">
          {filteredValidators.map(validator => {
            const isSelected = selectedValidator?.hotkey === validator.hotkey;
            return (
              <button
                key={validator.hotkey}
                className={`w-full text-left border-sm p-2 border-2 border-mf-ash-500 cursor-pointer ${
                  isSelected
                    ? 'bg-mf-ash-300 border-mf-safety-500'
                    : 'bg-mf-ash-500 hover:bg-mf-ash-300'
                } transition-colors space-y-1`}
                onClick={() => onSelect(validator)}
              >
                <div className="flex items-center justify-between text-sm text-mf-edge-300 font-semibold">
                  <h3>{validator.name || `Validator ${validator.index}`}</h3>
                </div>
                <div className="flex items-center justify-between text-xs text-mf-milk-300">
                  <p>
                    {validator.hotkey.slice(0, 6)}...
                    {validator.hotkey.slice(-6)}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ValidatorSelection;
