import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";

import { usePolkadotApi } from "../../contexts/PolkadotApiContext";
import { calculateSlippage } from "../../../utils/utils";
import type { Subnet, Validator } from "../../../types/client";

interface ConfirmSwapProps {
  subnet: Subnet;
  validator: Validator;
  balance: string;
  address: string;
  onBack: () => void;
}

export const ConfirmSwap = ({
  subnet,
  validator,
  onBack,
  balance,
  address,
}: ConfirmSwapProps) => {
  const { api, isLoading } = usePolkadotApi();
  const navigate = useNavigate();
  const [amount, setAmount] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const taoAmount = parseFloat(amount) || 0;
  const slippageCalculation = useMemo(() => {
    if (!subnet.alphaIn || !subnet.taoIn || !taoAmount) return null;
    return calculateSlippage(subnet.alphaIn, subnet.taoIn, taoAmount, true);
  }, [subnet.alphaIn, subnet.taoIn, taoAmount]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setAmount(value);
    }
  };

  const handleSubmit = async () => {
    if (!api || !amount || isSubmitting) return;
    setIsSubmitting(true);
    try {
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

  const totalCost = taoAmount;

  if (isLoading) {
    return <div>Loading API...</div>;
  }

  if (!api) {
    return <div>API not initialized</div>;
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
        <h2 className="text-[11px] font-medium">Confirm Staking</h2>
      </div>

      <div className="bg-white rounded-lg p-4">
        <div className="space-y-2">
          <div>
            <label className="block text-[10px] text-gray-600 mb-1">
              Selected Subnet
            </label>
            <p className="text-[13px] font-semibold text-gray-900">
              {subnet.name}
            </p>
          </div>

          <div>
            <label className="block text-[10px] text-gray-600 mb-1">
              Token Price
            </label>
            <p className="text-[13px] font-semibold text-gray-900">
              {subnet.price} τ
            </p>
          </div>

          <div>
            <label className="block text-[10px] text-gray-600 mb-1">
              Selected Validator
            </label>
            <p className="text-[10px] text-gray-600">
              {validator.hotkey.slice(0, 8)}...{validator.hotkey.slice(-8)}
            </p>
          </div>

          <div>
            <label className="block text-[10px] text-gray-600 mb-1">
              Swap Amount (τ)
            </label>
            <input
              type="number"
              value={amount}
              onChange={handleAmountChange}
              placeholder="Enter amount to swap"
              className="w-full px-3 py-2 text-[10px] rounded-lg border border-gray-200 hover:border-blue-500 focus:outline-none focus:border-blue-500"
              min="0"
              step="0.0001"
            />
            <p className="mt-1 text-[10px] text-gray-600">
              Available Balance: {balance} τ
            </p>
          </div>

          {taoAmount > 0 && slippageCalculation && (
            <div className="rounded-lg border border-gray-200 p-3 space-y-2">
              <h3 className="text-[11px] font-medium text-gray-900">
                Transaction Summary
              </h3>
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-gray-600">You pay:</span>
                <span className="text-[10px] font-medium text-gray-900">
                  {taoAmount.toFixed(4)} τ
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-gray-600">You receive:</span>
                <span className="text-[10px] font-medium text-gray-900">
                  {slippageCalculation.tokens.toFixed(6)} α
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-gray-600">Slippage:</span>
                <span
                  className={`text-[10px] ${
                    slippageCalculation.slippagePercentage > 1
                      ? "text-red-500"
                      : "text-gray-600"
                  }`}
                >
                  {slippageCalculation.slippagePercentage.toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-gray-600">Fee:</span>
                <span className="text-[10px] text-gray-600">
                  {slippageCalculation.slippage.toFixed(4)} τ
                </span>
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 text-red-500 text-[10px] rounded-lg border border-red-100">
              {error}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={
              !amount || isSubmitting || !api || totalCost > parseFloat(balance)
            }
            className="w-full text-[10px] px-4 py-3 rounded-lg border border-gray-200 hover:bg-blue-50 hover:text-blue-500 hover:border-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
                <span>Swapping...</span>
              </div>
            ) : (
              "Confirm"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmSwap;
