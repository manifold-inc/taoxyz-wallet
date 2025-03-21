import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { usePolkadotApi } from "../../contexts/PolkadotApiContext";
import KeyringService from "../../services/KeyringService";
import MessageService from "../../services/MessageService";
import { calculateSlippage } from "../../../utils/utils";
import type { Subnet, Validator } from "../../../types/client";

interface ConfirmSwapProps {
  subnet: Subnet;
  validator: Validator;
  balance: string;
  address: string;
}

export const ConfirmSwap = ({
  subnet,
  validator,
  balance,
  address,
}: ConfirmSwapProps) => {
  const { api, isLoading } = usePolkadotApi();
  const navigate = useNavigate();
  const [amount, setAmount] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const taoAmount = parseFloat(amount) || 0;
  const totalCost = taoAmount;
  const slippageCalculation = useMemo(() => {
    if (!subnet.alphaIn || !subnet.taoIn || !taoAmount) return null;
    return calculateSlippage(subnet.alphaIn, subnet.taoIn, taoAmount, true);
  }, [subnet.alphaIn, subnet.taoIn, taoAmount]);

  useEffect(() => {
    const initAmount = async () => {
      const result = await chrome.storage.local.get("storeSwapTransaction");
      if (result.storeSwapTransaction) {
        const { amount } = result.storeSwapTransaction;
        await chrome.storage.local.remove("storeSwapTransaction");
        setAmount(amount);
      }
    };
    initAmount();
  }, []);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      const numValue = parseFloat(value);
      if (value === "" || (!isNaN(numValue) && numValue >= 0)) {
        setAmount(value);
      }
    }
  };

  const handleAuth = async () => {
    if (await KeyringService.isLocked(address)) {
      await chrome.storage.local.set({
        storeSwapTransaction: {
          subnet,
          validator,
          amount,
        },
      });
      await chrome.storage.local.set({ walletLocked: true });
      MessageService.sendWalletsLockedMessage();
      setIsSubmitting(false);
      return;
    }
  };

  const handleSubmit = async () => {
    if (!api || !amount || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await handleAuth();
      await api.createStake({
        address,
        subnetId: subnet.id,
        validatorHotkey: validator.hotkey,
        amount: parseFloat(amount),
      });
      navigate("/dashboard");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to stake");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div>Loading API...</div>;
  }

  if (!api) {
    return <div>API not initialized</div>;
  }

  return (
    <div className="space-y-3 p-2">
      <div className="rounded-lg bg-mf-ash-500 p-2 space-y-2">
        <div>
          <p className="text-xs text-mf-silver-300">Selected Subnet</p>
          <p className="text-xs font-semibold text-mf-milk-300">
            {subnet.name}
          </p>
        </div>

        <div>
          <p className="text-xs text-mf-silver-300">Token Price</p>
          <p className="text-xs font-semibold text-mf-milk-300">
            {subnet.price} τ
          </p>
        </div>

        <div>
          <p className="text-xs text-mf-silver-300">Selected Validator</p>
          <p className="text-xs text-mf-milk-300">
            {validator.hotkey.slice(0, 8)}...{validator.hotkey.slice(-8)}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <div>
          <p className="text-xs text-mf-silver-300 mb-1">Swap Amount (τ)</p>
          <input
            type="text"
            inputMode="decimal"
            value={amount}
            onChange={handleAmountChange}
            placeholder="Enter amount to swap"
            className="w-full px-3 py-2 text-xs rounded-lg bg-mf-ash-300 text-mf-milk-300 border-none focus:outline-none focus:ring-2 focus:ring-mf-safety-300"
          />
          <p className="mt-1 text-xs text-mf-silver-300">
            Available Balance: {balance} τ
          </p>
        </div>

        {taoAmount > 0 && slippageCalculation && (
          <div className="rounded-lg bg-mf-ash-300 p-3 space-y-2">
            <h3 className="text-xs font-medium text-mf-milk-300">
              Transaction Summary
            </h3>
            <div className="flex justify-between items-center">
              <span className="text-xs text-mf-silver-300">You pay:</span>
              <span className="text-xs font-medium text-mf-milk-300">
                {taoAmount.toFixed(4)} τ
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-mf-silver-300">You receive:</span>
              <span className="text-xs font-medium text-mf-milk-300">
                {slippageCalculation.tokens.toFixed(6)} α
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-mf-silver-300">Slippage:</span>
              <span
                className={`text-xs ${
                  slippageCalculation.slippagePercentage > 1
                    ? "text-mf-sybil-300"
                    : "text-mf-silver-300"
                }`}
              >
                {slippageCalculation.slippagePercentage.toFixed(2)}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-mf-silver-300">Fee:</span>
              <span className="text-xs text-mf-silver-300">
                {slippageCalculation.slippage.toFixed(4)} τ
              </span>
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 bg-mf-ash-300 text-mf-sybil-300 text-xs rounded-lg">
            {error}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={
            !amount || isSubmitting || !api || totalCost > parseFloat(balance)
          }
          className={`w-full text-xs flex items-center justify-center rounded-lg transition-colors px-4 py-3 mt-5 text-semibold text-mf-ash-300 ${
            !amount || isSubmitting || !api || totalCost > parseFloat(balance)
              ? "bg-mf-ash-400 text-mf-milk-300 cursor-not-allowed"
              : "bg-mf-sybil-700 hover:bg-mf-sybil-500 active:bg-mf-sybil-700"
          }`}
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-mf-milk-300" />
              <span>Pending...</span>
            </div>
          ) : (
            "Confirm"
          )}
        </button>
      </div>
    </div>
  );
};

export default ConfirmSwap;
