import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRpcApi } from "../../contexts/RpcApiContext";
import type { Validator, Subnet, StakeTransaction } from "../../../types/types";

interface ConfirmStakeProps {
  stake: StakeTransaction;
  validator: Validator;
  subnet: Subnet;
  address: string;
  onBack: () => void;
}

const ConfirmStake = ({
  stake,
  validator,
  subnet,
  address,
  onBack,
}: ConfirmStakeProps) => {
  const { api, isLoading } = useRpcApi();
  const navigate = useNavigate();
  const [amount, setAmount] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculateSlippage = (alphaAmount: number) => {
    if (!subnet.alphaIn || !subnet.taoIn) return null;

    // Calculate the TAO cost for this amount of alpha
    const taoPrice = subnet.taoIn / subnet.alphaIn;
    const taoCost = alphaAmount * taoPrice;
    const raoCost = taoCost * 1e9;

    const actualAlpha =
      subnet.alphaIn -
      (subnet.taoIn * subnet.alphaIn) / (subnet.taoIn + raoCost);

    const actualAlphaHuman = actualAlpha / 1e9;
    const slippageAmount = alphaAmount - actualAlphaHuman;
    const slippagePercentage = (slippageAmount / alphaAmount) * 100;

    return {
      originalAmount: alphaAmount,
      finalAmount: actualAlphaHuman,
      slippageAmount,
      slippagePercentage,
      taoCost,
    };
  };

  const currentTokens = stake.tokens / 1e9;
  const newTokens = parseFloat(amount);
  const slippageCalculation =
    newTokens > 0 ? calculateSlippage(newTokens) : null;

  const handleSubmit = async () => {
    if (!api || !amount || isSubmitting || newTokens > currentTokens) return;
    setIsSubmitting(true);
    try {
      await api.moveStake({
        address,
        fromHotkey: stake.validatorHotkey,
        toHotkey: validator.hotkey,
        fromSubnetId: stake.subnetId,
        toSubnetId: stake.subnetId,
        amount: newTokens,
      });
      navigate("/dashboard", { state: { address } });
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to move stake");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div>Loading API...</div>;
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
              Current Stake
            </label>
            <p className="text-[10px] text-gray-600">
              Validator: {stake.validatorHotkey.slice(0, 8)}...
              {stake.validatorHotkey.slice(-8)}
            </p>
            <p className="text-[13px] font-semibold text-gray-900">
              Available: {currentTokens.toFixed(4)} α
            </p>
          </div>

          <div>
            <label className="block text-[10px] text-gray-600 mb-1">
              New Validator
            </label>
            <p className="text-[10px] text-gray-600">
              {validator.hotkey.slice(0, 8)}...{validator.hotkey.slice(-8)}
            </p>
          </div>

          <div>
            <label className="block text-[10px] text-gray-600 mb-1">
              Amount to Move (α)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount to move"
              className="w-full px-3 py-2 text-[10px] rounded-lg border border-gray-200 hover:border-blue-500 focus:outline-none focus:border-blue-500"
              min="0"
              max={currentTokens}
              step="0.0001"
            />
            <p className="mt-1 text-[10px] text-gray-600">
              Available to move: {currentTokens.toFixed(4)} α
            </p>
          </div>

          {newTokens > 0 && slippageCalculation && (
            <div className="rounded-lg border border-gray-200 p-3 space-y-2">
              <h3 className="text-[11px] font-medium text-gray-900">
                Transaction Summary
              </h3>
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-gray-600">Moving:</span>
                <span className="text-[10px] font-medium text-gray-900">
                  {newTokens.toFixed(4)} α
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-gray-600">
                  You will receive:
                </span>
                <span className="text-[10px] font-medium text-gray-900">
                  {slippageCalculation.finalAmount.toFixed(4)} α
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
                  {slippageCalculation.slippageAmount.toFixed(4)} α
                </span>
              </div>
              {slippageCalculation.slippagePercentage > 1 && (
                <div className="p-2 bg-red-50 text-red-500 text-[10px] rounded-lg border border-red-100">
                  ⚠️ High Slippage ⚠️
                </div>
              )}
              <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                <span className="text-[10px] text-gray-600">Remaining:</span>
                <span className="text-[10px] font-medium text-gray-900">
                  {(currentTokens - newTokens).toFixed(4)} α
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
              !amount ||
              isSubmitting ||
              !api ||
              newTokens > currentTokens ||
              newTokens <= 0
            }
            className="w-full text-[10px] px-4 py-3 rounded-lg border border-gray-200 hover:bg-blue-50 hover:text-blue-500 hover:border-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
                <span>Moving Stake...</span>
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

export default ConfirmStake;
