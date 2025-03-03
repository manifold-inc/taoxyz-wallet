import { useState } from "react";
import { useLocation } from "react-router-dom";

import { useRpcApi } from "../../contexts/RpcApiContext";
import type { Subnet, Validator } from "../../../types/subnets";

interface StakeConfirmationProps {
  subnet: Subnet;
  validator: Validator;
  onBack: () => void;
}

export const StakeConfirmation = ({
  subnet,
  validator,
  onBack,
}: StakeConfirmationProps) => {
  const { api, isLoading } = useRpcApi();
  const location = useLocation();
  const address = location.state?.address;
  const [amount, setAmount] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!api || !amount || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await api.createStake({
        address,
        subnetId: subnet.subnetId,
        validatorHotkey: validator.hotkey,
        amount: parseFloat(amount),
      });
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
    <div>
      <div className="flex items-center mb-6">
        <button
          onClick={onBack}
          className="mr-4 text-gray-600 hover:text-gray-900"
        >
          ← Back
        </button>
        <h2 className="text-xl font-semibold">Confirm Staking</h2>
      </div>

      <div className="bg-white rounded-lg p-6 shadow-sm border">
        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-gray-700">Selected Subnet</h3>
            <p className="mt-1">{subnet.name}</p>
          </div>

          <div>
            <h3 className="font-medium text-gray-700">Token Price</h3>
            <p className="mt-1">{subnet.price} TAO</p>
          </div>

          <div>
            <h3 className="font-medium text-gray-700">Selected Validator</h3>
            <p className="mt-1">
              Hotkey: {validator.hotkey.slice(0, 8)}...
              {validator.hotkey.slice(-8)}
            </p>
          </div>

          <div>
            <label htmlFor="amount" className="block font-medium text-gray-700">
              Stake Amount (TAO)
            </label>
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount to stake"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              min="0"
              step="0.0001"
            />
          </div>

          {error && <div className="text-red-600 text-sm">{error}</div>}

          <button
            onClick={handleSubmit}
            disabled={!amount || isSubmitting || !api}
            className={`w-full py-2 px-4 rounded text-white transition-colors ${
              !amount || isSubmitting || !api
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600"
            }`}
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Staking...
              </div>
            ) : (
              "Confirm Stake"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StakeConfirmation;
