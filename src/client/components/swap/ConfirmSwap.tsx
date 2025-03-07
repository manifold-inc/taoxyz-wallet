import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { usePolkadotApi } from "../../contexts/PolkadotApiContext";
import type { Subnet, Validator } from "../../../types/client";

interface ConfirmSwapProps {
  subnet: Subnet;
  validator: Validator;
  onBack: () => void;
  balance: string;
  address: string;
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

  const calculateSlippage = (taoAmount: number) => {
    if (!subnet.alphaIn || !subnet.taoIn) return null;

    // Convert TAO amount to RAO (1 TAO = 1e9 RAO)
    const taoAmountInRao = taoAmount * 1e9;

    // Calculate expected alpha tokens without slippage (simple division)
    const expectedAlpha = (taoAmountInRao * subnet.alphaIn) / subnet.taoIn;

    // Calculate actual alpha tokens using constant product formula from docs
    // Stake = αin - (τin * αin) / (τin + cost)
    const actualAlpha =
      subnet.alphaIn -
      (subnet.taoIn * subnet.alphaIn) / (subnet.taoIn + taoAmountInRao);

    // Convert to human readable numbers
    const expectedAlphaHuman = expectedAlpha / 1e9;
    const actualAlphaHuman = actualAlpha / 1e9;

    // Calculate slippage
    const slippageAmount = expectedAlphaHuman - actualAlphaHuman;
    const slippagePercentage = (slippageAmount / expectedAlphaHuman) * 100;

    // Calculate fee in TAO
    const feeInTao = (taoAmount * slippagePercentage) / 100;

    return {
      expectedAlpha: expectedAlphaHuman,
      actualAlpha: actualAlphaHuman,
      slippageAmount,
      slippagePercentage,
      feeInTao,
    };
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
      navigate("/dashboard", { state: { address } });
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to stake");
    } finally {
      setIsSubmitting(false);
    }
  };

  const taoAmount = parseFloat(amount) || 0;
  const slippageCalculation =
    subnet.alphaIn && subnet.taoIn ? calculateSlippage(taoAmount) : null;
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
              onChange={(e) => setAmount(e.target.value)}
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
                <span className="text-[10px] text-gray-600">From:</span>
                <span className="text-[10px] font-medium text-gray-900">
                  {taoAmount.toFixed(4)} τ
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-gray-600">To:</span>
                <span className="text-[10px] font-medium text-gray-900">
                  {slippageCalculation.actualAlpha.toFixed(6)} α
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-gray-600">Slippage:</span>
                <span className="text-[10px] text-gray-600">
                  {(
                    Math.round(slippageCalculation.slippagePercentage * 100) /
                    100
                  ).toFixed(2)}
                  %
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-gray-600">Fee:</span>
                <span className="text-[10px] text-gray-600">
                  {slippageCalculation.feeInTao.toFixed(4)} τ
                </span>
              </div>
              {slippageCalculation.slippagePercentage > 1 && (
                <div className="p-2 bg-red-50 text-red-500 text-[10px] rounded-lg border border-red-100">
                  ⚠️ High Slippage ⚠️
                </div>
              )}
              <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                <span className="text-[10px] font-medium text-gray-900">
                  Total Cost:
                </span>
                <span className="text-[10px] font-medium text-gray-900">
                  {totalCost.toFixed(4)} τ
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
