import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { usePolkadotApi } from "../../contexts/PolkadotApiContext";
import type {
  Validator,
  Subnet,
  StakeTransaction,
} from "../../../types/client";
import { calculateSlippage } from "../../../utils/utils";

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
  const { api, isLoading } = usePolkadotApi();
  const navigate = useNavigate();
  const [amount, setAmount] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const alphaAmount = parseFloat(amount) || 0;
  const slippageCalculation = useMemo(() => {
    if (!subnet.alphaIn || !subnet.taoIn || !alphaAmount) return null;
    return calculateSlippage(subnet.alphaIn, subnet.taoIn, alphaAmount, false);
  }, [subnet.alphaIn, subnet.taoIn, alphaAmount]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setAmount(value);
    }
  };

  const handleSubmit = async () => {
    if (!api || !amount || isSubmitting || alphaAmount > stake.tokens / 1e9)
      return;
    setIsSubmitting(true);
    try {
      await api.moveStake({
        address,
        fromHotkey: stake.validatorHotkey,
        toHotkey: validator.hotkey,
        fromSubnetId: stake.subnetId,
        toSubnetId: stake.subnetId,
        amount: alphaAmount,
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

  if (error) {
    return <div>Error: {error}</div>;
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
              Available: {(stake.tokens / 1e9).toFixed(4)} α
            </p>
          </div>

          <div>
            <label className="block text-[10px] text-gray-600 mb-1">
              Amount to Move (α)
            </label>
            <input
              type="number"
              value={amount}
              onChange={handleAmountChange}
              placeholder="Enter amount to move"
              className="w-full px-3 py-2 text-[10px] rounded-lg border border-gray-200 hover:border-blue-500 focus:outline-none focus:border-blue-500"
              min="0"
              max={stake.tokens / 1e9}
              step="0.0001"
            />
            <p className="mt-1 text-[10px] text-gray-600">
              Available to move: {(stake.tokens / 1e9).toFixed(4)} α
            </p>
          </div>

          {alphaAmount > 0 && slippageCalculation && (
            <div className="rounded-lg border border-gray-200 p-3 space-y-2">
              <h3 className="text-[11px] font-medium text-gray-900">
                Transaction Summary
              </h3>
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-gray-600">Moving:</span>
                <span className="text-[10px] font-medium text-gray-900">
                  {alphaAmount.toFixed(4)} α
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-gray-600">You receive:</span>
                <span className="text-[10px] font-medium text-gray-900">
                  {slippageCalculation.tokens.toFixed(4)} α
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
                  {slippageCalculation.slippage.toFixed(4)} α
                </span>
              </div>
            </div>
          )}

          <div className="flex justify-end mt-4">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || alphaAmount > stake.tokens / 1e9}
              className="px-4 py-2 text-[10px] font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:outline-none focus:bg-blue-600"
            >
              {isSubmitting ? "Moving..." : "Move Stake"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmStake;
