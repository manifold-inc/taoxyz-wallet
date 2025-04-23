import { motion } from 'framer-motion';

import { useState } from 'react';

import { useDashboard } from '@/client/contexts/DashboardContext';
import { DashboardState } from '@/client/contexts/DashboardContext';

import type { Validator } from '../../../../types/client';

interface ValidatorSelectionProps {
  validators: Validator[];
  toValidator: Validator | null;
  setToValidator: (validator: Validator) => void;
  onCancel: () => void;
  onConfirm: (validator: Validator) => void;
}

const ValidatorSelection = ({
  validators,
  toValidator,
  setToValidator,
  onCancel,
  onConfirm,
}: ValidatorSelectionProps) => {
  const { dashboardStakes, dashboardSubnet, dashboardState, dashboardValidator } = useDashboard();
  const [selectedValidator, setSelectedValidator] = useState<Validator | null>(() => {
    if (dashboardState === DashboardState.MOVE_STAKE) {
      return toValidator;
    }
    return dashboardValidator;
  });
  const [searchQuery, setSearchQuery] = useState('');

  const filterBySearch = (validatorsToFilter: Validator[]) => {
    const query = searchQuery.toLowerCase();
    return validatorsToFilter.filter(validator => {
      const validatorName = (validator.name || '').toLowerCase();
      const validatorHotkey = validator.hotkey.toLowerCase();
      return validatorName.includes(query) || validatorHotkey.includes(query);
    });
  };

  // Gets validators users are not staked on for the selected subnet
  const uniqueValidators = () => {
    if (!dashboardStakes || !dashboardSubnet) {
      return validators;
    }
    const subnetStakes = dashboardStakes.filter(stake => stake.netuid === dashboardSubnet.id);
    const subnetValidators = subnetStakes.map(stake => stake.hotkey);
    return validators.filter(validator => !subnetValidators.includes(validator.hotkey));
  };

  const displayValidators =
    dashboardState === DashboardState.CREATE_STAKE
      ? filterBySearch(uniqueValidators())
      : filterBySearch(validators);

  const handleValidatorSelect = (validator: Validator) => {
    if (validator.hotkey === selectedValidator?.hotkey) return;
    setSelectedValidator(validator);
  };

  const handleConfirm = () => {
    if (!selectedValidator) return;
    if (dashboardState === DashboardState.MOVE_STAKE) {
      setToValidator(selectedValidator);
    }
    onConfirm(selectedValidator);
  };

  return (
    <div className="w-full h-full flex flex-col gap-3">
      {/* Search */}
      <div className="flex items-center gap-2">
        <motion.input
          type="text"
          placeholder="Search Validators"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-4/5 p-2 text-sm text-mf-edge-500 border border-mf-ash-500 placeholder:text-mf-edge-700 bg-mf-night-300 rounded-md focus:outline-none"
          whileFocus={{
            borderColor: '#57E8B4',
          }}
        />
        {searchQuery !== '' ? (
          <button
            onClick={() => setSearchQuery('')}
            className="text-mf-sybil-500 text-sm w-1/5 bg-mf-ash-500 rounded-md border border-mf-ash-500 p-2 cursor-pointer hover:opacity-50 transition-colors"
          >
            Clear
          </button>
        ) : (
          <button
            onClick={onCancel}
            className="text-mf-red-500 text-sm w-1/5 bg-mf-red-opacity rounded-md border border-mf-red-opacity p-2 cursor-pointer hover:opacity-50 transition-colors"
          >
            Back
          </button>
        )}
      </div>

      {/* Validators */}
      <div className="flex flex-col gap-3">
        {displayValidators.map(validator => (
          <div className="flex flex-col gap-3" key={validator.hotkey}>
            {/* Validator */}
            <button
              onClick={() => handleValidatorSelect(validator)}
              className={`w-full text-left rounded-md cursor-pointer p-2 transition-colors gap-1 bg-mf-ash-300 ${
                selectedValidator?.hotkey === validator.hotkey ? 'bg-mf-ash-300' : 'bg-mf-ash-500'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <p className="font-semibold text-mf-edge-500 text-sm truncate max-w-[16ch]">
                    {validator.name || 'Validator'}
                  </p>
                </div>
                <span className="text-mf-edge-700 text-sm">
                  {validator.hotkey.slice(0, 6) + '...' + validator.hotkey.slice(-6)}
                </span>
              </div>
            </button>

            {/* Action Buttons */}
            {selectedValidator?.hotkey === validator.hotkey && (
              <div className="flex gap-2">
                <button
                  onClick={onCancel}
                  className="rounded-md text-center cursor-pointer w-1/2 py-1.5 bg-mf-red-opacity border border-mf-red-opacity hover:opacity-50 transition-colors text-mf-red-500 gap-1"
                >
                  Cancel
                </button>

                <button
                  onClick={handleConfirm}
                  className="rounded-md text-center cursor-pointer w-1/2 py-1.5 bg-mf-sybil-opacity border border-mf-sybil-opacity hover:opacity-50 transition-colors text-mf-sybil-500 gap-1"
                >
                  Confirm
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ValidatorSelection;
