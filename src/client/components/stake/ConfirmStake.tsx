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
      navigate("/dashboard");
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
    <div>
      <div className="flex items-center mb-6">
        <button
          onClick={onBack}
          className="mr-4 text-gray-600 hover:text-gray-900"
        >
          ← Back
        </button>
        <h2 className="text-xl font-semibold">Confirm Restaking</h2>
      </div>

      <div className="bg-white rounded-lg p-6 shadow-sm border">
        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-gray-700">Current Stake</h3>
            <p className="mt-1">
              Validator: {stake.validatorHotkey.slice(0, 8)}...
              {stake.validatorHotkey.slice(-8)}
            </p>
            <p className="mt-1">Available: {currentTokens.toFixed(4)} α</p>
          </div>

          <div>
            <h3 className="font-medium text-gray-700">New Validator</h3>
            <p className="mt-1">
              Hotkey: {validator.hotkey.slice(0, 8)}...
              {validator.hotkey.slice(-8)}
            </p>
          </div>

          <div>
            <label htmlFor="amount" className="block font-medium text-gray-700">
              Amount to Move (α)
            </label>
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount to move"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              min="0"
              max={currentTokens}
              step="0.0001"
            />
            <p className="mt-1 text-sm text-gray-500">
              Available to move: {currentTokens.toFixed(4)} α
            </p>
          </div>

          {newTokens > 0 && slippageCalculation && (
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <h3 className="font-medium text-gray-700">Transaction Summary</h3>
              <div className="flex justify-between items-center whitespace-nowrap">
                <span className="text-gray-600">Moving:</span>
                <span className="font-medium">{newTokens.toFixed(4)} α</span>
              </div>
              <div className="flex justify-between items-center whitespace-nowrap">
                <span className="text-gray-600">You will receive:</span>
                <span className="font-medium">
                  {slippageCalculation.finalAmount.toFixed(4)} α
                </span>
              </div>
              <div className="flex justify-between items-center whitespace-nowrap text-gray-600">
                <span>Slippage:</span>
                <span>
                  {(
                    Math.round(slippageCalculation.slippagePercentage * 100) /
                    100
                  ).toFixed(2)}
                  %
                </span>
              </div>
              <div className="flex justify-between items-center whitespace-nowrap text-gray-600">
                <span>Fee:</span>
                <span>{slippageCalculation.slippageAmount.toFixed(4)} α</span>
              </div>
              {slippageCalculation.slippagePercentage > 1 && (
                <div className="text-red-600 text-sm mt-2">
                  ⚠️ High slippage warning: Moving this amount of tokens will
                  result in significant slippage
                </div>
              )}
              <div className="flex justify-between items-center whitespace-nowrap">
                <span className="text-gray-600">Remaining:</span>
                <span className="font-medium">
                  {(currentTokens - newTokens).toFixed(4)} α
                </span>
              </div>
            </div>
          )}

          {error && <div className="text-red-600 text-sm">{error}</div>}

          <button
            onClick={handleSubmit}
            disabled={
              !amount ||
              isSubmitting ||
              !api ||
              newTokens > currentTokens ||
              newTokens <= 0
            }
            className={`w-full py-2 px-4 rounded text-white transition-colors ${
              !amount ||
              isSubmitting ||
              !api ||
              newTokens > currentTokens ||
              newTokens <= 0
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600"
            }`}
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Moving Stake...
              </div>
            ) : (
              "Confirm Move"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmStake;
