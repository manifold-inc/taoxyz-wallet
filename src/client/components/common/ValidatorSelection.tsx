import { ChevronsUpDown } from 'lucide-react';

import { useState } from 'react';

import type { Validator } from '../../../types/client';

interface ValidatorSelectionProps {
  validators: Validator[];
  onSelect: (validator: Validator) => void;
}

const ValidatorSelection = ({ validators, onSelect }: ValidatorSelectionProps) => {
  const [selectedValidator, setSelectedValidator] = useState<Validator | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleValidatorSelect = (validator: Validator) => {
    setSelectedValidator(validator);
    setIsOpen(false);
    onSelect(validator);
  };

  const dropdownMenu = (
    <div className="absolute top-full left-0 w-full bg-mf-night-300 rounded-md divide-y divide-mf-ash-300">
      {validators.map(validator => (
        <button
          type="button"
          key={validator.hotkey}
          onClick={e => {
            e.preventDefault();
            e.stopPropagation();
            handleValidatorSelect(validator);
          }}
          className="w-full flex justify-start px-3 py-2 hover:bg-mf-ash-300 transition-colors cursor-pointer"
        >
          <div className="flex justify-between w-full">
            <p className="text-mf-edge-500 font-semibold text-sm truncate max-w-[16ch]">
              {validator.name || 'Validator'}
            </p>
            <span className="text-mf-edge-700 text-sm">
              {validator.hotkey.slice(0, 6) + '...' + validator.hotkey.slice(-6)}
            </span>
          </div>
        </button>
      ))}
    </div>
  );

  return (
    <div className="relative w-full">
      <button
        type="button"
        onClick={e => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="w-full flex justify-between items-center bg-mf-night-300 rounded-md px-3 py-2 cursor-pointer"
      >
        <div className="flex justify-between w-full">
          {selectedValidator ? (
            <>
              <p className="text-mf-edge-500 font-semibold text-sm truncate max-w-[16ch]">
                {selectedValidator.name || 'Validator'}
              </p>
              <span className="text-mf-edge-700 text-sm">
                {selectedValidator.hotkey.slice(0, 6) + '...' + selectedValidator.hotkey.slice(-6)}
              </span>
            </>
          ) : (
            <p className="text-mf-edge-500 font-semibold text-sm">Validator</p>
          )}
        </div>
        <ChevronsUpDown className="w-4 h-4 text-mf-edge-500" />
      </button>
      {isOpen && dropdownMenu}
    </div>
  );
};

export default ValidatorSelection;
