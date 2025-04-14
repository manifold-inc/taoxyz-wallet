import { motion } from 'framer-motion';

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { usePolkadotApi } from '@/client/contexts/PolkadotApiContext';
import type { Stake, Subnet, Validator } from '@/types/client';
import { taoToRao } from '@/utils/utils';

import ValidatorSelection from './ValidatorSelection';

interface TransactionParams {
  address?: string;
  amountInRao: bigint;
}

interface StakeParams extends TransactionParams {
  address: string;
  subnetId: number;
  validatorHotkey: string;
}

interface MoveStakeParams extends TransactionParams {
  address: string;
  fromSubnetId: number;
  fromHotkey: string;
  toSubnetId: number;
  toHotkey: string;
}

interface TransferTaoParams extends TransactionParams {
  fromAddress: string;
  toAddress: string;
  amountInRao: bigint;
}

export enum TransactionType {
  CREATE_STAKE = 'CREATE_STAKE',
  ADD_STAKE = 'ADD_STAKE',
  REMOVE_STAKE = 'REMOVE_STAKE',
  MOVE_STAKE = 'MOVE_STAKE',
  TRANSFER_TAO = 'TRANSFER_TAO',
}

interface TransactionProps {
  address: string;
  subnet: Subnet;
  validators: Validator[];
  balance: number;
  stake?: Stake;
  transactionType: TransactionType;
}

const Transaction = ({
  address,
  subnet,
  validators,
  balance,
  stake,
  transactionType,
}: TransactionProps) => {
  const { api } = usePolkadotApi();
  const navigate = useNavigate();
  const [amount, setAmount] = useState<string>('');
  const [amountInRao, setAmountInRao] = useState<bigint | null>(null);
  const [selectedValidator, setSelectedValidator] = useState<Validator | null>(null);
  const [toAddress, setToAddress] = useState<string>('');

  const getSubtitle = () => {
    switch (transactionType) {
      case TransactionType.CREATE_STAKE:
        return 'CREATE STAKE';
      case TransactionType.ADD_STAKE:
        return 'ADD STAKE';
      case TransactionType.REMOVE_STAKE:
        return 'REMOVE STAKE';
      case TransactionType.MOVE_STAKE:
        return 'MOVE STAKE';
      case TransactionType.TRANSFER_TAO:
        return 'TRANSFER TAO';
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow empty string or valid decimal numbers
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setAmount(value);
      // Only convert to RAO if we have a valid number
      if (value !== '') {
        const numValue = parseFloat(value);
        if (!isNaN(numValue) && numValue >= 0) {
          setAmountInRao(taoToRao(numValue));
        }
      } else {
        setAmountInRao(null);
      }
    }
  };

  const amountValidation = (amountInRao: bigint) => {
    if (amountInRao <= 0) return false;
    if (amountInRao > BigInt(balance)) return false;
    return true;
  };

  const handleValidatorSelection = (validator: Validator) => {
    setSelectedValidator(validator);
  };

  /**
   * Create {address, subnetId, validatorHotkey, amountInRao}
   * Add {address, subnetId, validatorHotkey, amountInRao}
   *  Requires existing stake
   * Remove {address, subnetId, validatorHotkey, amountInRao}
   *  Requires existing stake
   * Move {address, fromHotkey, toHotkey, fromSubnetId, toSubnetId, amountInRao}
   *  Requires existing stake
   * Transfer {address, amountInRao}
   */
  const handleSetupTransaction = () => {
    if (!api) return;
    if (amountInRao === null) return;
    if (!amountValidation(amountInRao)) return;

    let params: TransactionParams;
    switch (transactionType) {
      case TransactionType.CREATE_STAKE:
        if (!selectedValidator) return;
        params = {
          address,
          subnetId: subnet.id,
          validatorHotkey: selectedValidator.hotkey,
          amountInRao,
        } as StakeParams;
        break;
      case TransactionType.ADD_STAKE:
      case TransactionType.REMOVE_STAKE:
        if (!stake) return;
        params = {
          address,
          subnetId: subnet.id,
          validatorHotkey: stake.hotkey,
          amountInRao,
        } as StakeParams;
        break;
      case TransactionType.MOVE_STAKE:
        if (!stake || !selectedValidator) return;
        params = {
          address,
          fromSubnetId: stake.netuid,
          fromHotkey: stake.hotkey,
          toSubnetId: subnet.id,
          toHotkey: selectedValidator.hotkey,
          amountInRao,
        } as MoveStakeParams;
        break;
      case TransactionType.TRANSFER_TAO:
        if (toAddress === '') return;
        params = {
          fromAddress: address,
          toAddress,
          amountInRao,
        } as TransferTaoParams;
        break;
    }
    submitTransaction(params);
  };

  const submitTransaction = async (params: TransactionParams) => {
    if (!api) return;
    switch (transactionType) {
      case TransactionType.CREATE_STAKE:
      case TransactionType.ADD_STAKE:
        api.createStake(params as StakeParams);
        break;
      case TransactionType.REMOVE_STAKE:
        api.removeStake(params as StakeParams);
        break;
      case TransactionType.MOVE_STAKE:
        api.moveStake(params as MoveStakeParams);
        break;
      case TransactionType.TRANSFER_TAO:
        api.transfer(params as TransferTaoParams);
        break;
    }
  };

  return (
    <div className="w-full h-full flex flex-col gap-3 px-5 py-3">
      {/* Header */}
      <div className="flex flex-col gap-2 items-center justify-center">
        <p className="text-mf-edge-500 blinker-font font-semibold text-2xl">TRANSACTION</p>
        <p className="text-mf-edge-500 blinker-font font-semibold text-lg">{getSubtitle()}</p>
      </div>

      {/* Transaction Modal */}
      <form
        className="flex flex-col gap-4 items-center justify-center"
        onSubmit={handleSetupTransaction}
      >
        {/* Amount and Validator */}
        <input
          type="text"
          value={amount}
          placeholder="Enter Amount"
          onChange={handleAmountChange}
          className="w-full px-3 py-2 text-sm text-mf-edge-500 placeholder-mf-edge-700 bg-mf-night-300 rounded-md"
        />
        {transactionType === TransactionType.TRANSFER_TAO ? (
          <input
            type="text"
            value={toAddress}
            placeholder="Enter Address"
            onChange={e => setToAddress(e.target.value)}
            className="w-full px-3 py-2 text-sm text-mf-edge-500 placeholder-mf-edge-700 bg-mf-night-300 rounded-md"
          />
        ) : (
          <div className="flex flex-col gap-4 items-center justify-center w-full">
            <div className="flex items-center gap-1 w-full bg-mf-night-300 rounded-md px-3 py-2">
              <p className="font-semibold text-mf-edge-500 text-sm truncate max-w-[10ch]">
                {subnet.name}
              </p>
              <span className="font-semibold text-mf-edge-700 text-sm">SN{subnet.id}</span>
            </div>

            <ValidatorSelection validators={validators} onSelect={handleValidatorSelection} />
          </div>
        )}

        {/* Action Buttons */}
        <div className="w-full flex gap-2 items-center justify-center">
          <motion.button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="w-full rounded-md text-center cursor-pointer w-1/2 py-1.5 bg-mf-red-opacity border border-mf-red-opacity hover:border-mf-red-500 hover:text-mf-edge-500 transition-colors text-mf-red-500 gap-1"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Cancel
          </motion.button>
          <motion.button
            type="submit"
            disabled={!amountInRao || !selectedValidator || !amountValidation(amountInRao)}
            className="w-full rounded-md text-center cursor-pointer w-1/2 py-1.5 bg-mf-sybil-opacity border border-mf-sybil-opacity hover:border-mf-sybil-500 hover:text-mf-edge-500 transition-colors text-mf-sybil-500 gap-1"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Submit
          </motion.button>
        </div>
      </form>
    </div>
  );
};

export default Transaction;
