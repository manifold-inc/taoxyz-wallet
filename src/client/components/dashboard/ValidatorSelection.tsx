import { motion } from 'framer-motion';

import { useState } from 'react';

import type { Validator } from '../../../types/client';

interface ValidatorSelectionProps {
  validators: Validator[];
  onCancel: () => void;
  onConfirm: (validator: Validator) => void;
}

const ValidatorSelection = ({ validators, onCancel, onConfirm }: ValidatorSelectionProps) => {
  const [selectedValidator, setSelectedValidator] = useState<Validator | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredValidators = validators.filter(validator => {
    const query = searchQuery.toLowerCase();
    const validatorName = (validator.name || '').toLowerCase();
    const validatorHotkey = validator.hotkey.toLowerCase();
    return validatorName.includes(query) || validatorHotkey.includes(query);
  });

  const handleValidatorSelect = (validator: Validator) => {
    if (validator.hotkey === selectedValidator?.hotkey) return;
    setSelectedValidator(validator);
    console.log('Validator Selected', validator);
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
        <motion.button
          onClick={() => setSearchQuery('')}
          className="text-mf-sybil-500 text-sm w-1/5 bg-mf-ash-500 rounded-md border border-mf-ash-500 p-2 cursor-pointer"
          whileHover={{ opacity: 0.5 }}
        >
          Clear
        </motion.button>
      </div>

      {/* Validators */}
      <div className="flex flex-col gap-3">
        {filteredValidators.map(validator => (
          <div className="flex flex-col gap-3" key={validator.hotkey}>
            {/* Validator */}
            <motion.button
              onClick={() => handleValidatorSelect(validator)}
              className={`w-full text-left rounded-md cursor-pointer p-3 transition-colors gap-1 ${
                selectedValidator?.hotkey === validator.hotkey ? 'bg-mf-ash-300' : 'bg-mf-ash-500'
              }`}
              whileHover={{ backgroundColor: '#3a3c46' }}
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
            </motion.button>

            {/* Action Buttons */}
            {selectedValidator?.hotkey === validator.hotkey && (
              <div className="flex gap-2">
                <motion.button
                  onClick={onCancel}
                  className="w-full rounded-md text-center cursor-pointer w-1/2 py-1.5 bg-mf-red-opacity border border-mf-red-opacity hover:border-mf-red-500 hover:text-mf-edge-500 transition-colors text-mf-red-500 gap-1"
                  whileHover={{ opacity: 0.5 }}
                >
                  Cancel
                </motion.button>

                <motion.button
                  onClick={() => onConfirm(validator)}
                  className="w-full rounded-md text-center cursor-pointer w-1/2 py-1.5 bg-mf-sybil-opacity border border-mf-sybil-opacity hover:border-mf-sybil-500 hover:text-mf-edge-500 transition-colors text-mf-sybil-500 gap-1"
                  whileHover={{ opacity: 0.5 }}
                >
                  Confirm
                </motion.button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ValidatorSelection;
