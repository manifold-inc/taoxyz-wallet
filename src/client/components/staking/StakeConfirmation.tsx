import React, { useState } from "react";
import type { SubnetInfo, ValidatorInfo } from "../../../types/subnets";

interface StakeConfirmationProps {
  subnet: SubnetInfo;
  validator: ValidatorInfo;
  onBack: () => void;
}

export const StakeConfirmation = ({
  subnet,
  validator,
  onBack,
}: StakeConfirmationProps) => {
  const [amount, setAmount] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!amount || isSubmitting) return;

    try {
      setIsSubmitting(true);
      const response = await chrome.runtime.sendMessage({
        type: "ext(stake)",
        payload: {
          amount: parseFloat(amount),
          subnetId: subnet.netuid,
          validatorHotkey: validator.hotkey,
        },
      });

      if (response.success) {
        // TODO: Show success message and redirect
        console.log("Staking successful");
      } else {
        console.error("Staking failed:", response.error);
      }
    } catch (error) {
      console.error("Error while staking:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

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

          <button
            onClick={handleSubmit}
            disabled={!amount || isSubmitting}
            className={`w-full py-2 px-4 rounded text-white transition-colors ${
              !amount || isSubmitting
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
