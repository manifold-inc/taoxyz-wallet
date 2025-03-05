import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useRpcApi } from "../../contexts/RpcApiContext";
import type { Subnet, Validator } from "../../../types/subnets";

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
  const { api, isLoading } = useRpcApi();
  const navigate = useNavigate();
  const [amount, setAmount] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [subnetData, setSubnetData] = useState<any>(null);
  const [isLoadingSubnetData, setIsLoadingSubnetData] = useState(true);

  useEffect(() => {
    const fetchSubnetData = async () => {
      if (!api) return;

      setIsLoadingSubnetData(true);
      try {
        const data = await api.getSubnetInfo(subnet.id);
        setSubnetData(data);
      } catch (error) {
        console.error("Error fetching subnet data:", error);
        setError("Failed to load subnet data. Please try again.");
      } finally {
        setIsLoadingSubnetData(false);
      }
    };

    fetchSubnetData();
  }, [api, subnet.id]);

  const calculateSlippage = (
    taoAmount: number,
    subnetData: {
      taoIn: number;
      alphaIn: number;
      alphaOut: number;
    }
  ) => {
    if (!subnetData) return null;

    // Convert TAO amount to RAO (1 TAO = 1e9 RAO)
    const taoAmountInRao = taoAmount * 1e9;

    // Calculate expected alpha tokens without slippage (simple division)
    const expectedAlpha =
      (taoAmountInRao * subnetData.alphaIn) / subnetData.taoIn;

    // Calculate actual alpha tokens using constant product formula from docs
    // Stake = αin - (τin * αin) / (τin + cost)
    const actualAlpha =
      subnetData.alphaIn -
      (subnetData.taoIn * subnetData.alphaIn) /
        (subnetData.taoIn + taoAmountInRao);

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
      navigate("/dashboard");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to stake");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate token conversion and slippage
  const taoAmount = parseFloat(amount) || 0;
  const slippageCalculation = subnetData
    ? calculateSlippage(taoAmount, subnetData)
    : null;
  const totalCost = taoAmount;

  if (isLoading || isLoadingSubnetData) {
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
            <p className="mt-1 text-sm text-gray-500">
              Available balance: {balance} TAO
            </p>
          </div>

          {taoAmount > 0 && slippageCalculation && (
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <h3 className="font-medium text-gray-700">Transaction Summary</h3>
              <div className="flex justify-between items-center whitespace-nowrap">
                <span className="text-gray-600">From:</span>
                <span className="font-medium">{taoAmount.toFixed(4)} τ</span>
              </div>
              <div className="flex justify-between items-center whitespace-nowrap">
                <span className="text-gray-600">To:</span>
                <span className="font-medium">
                  {slippageCalculation.actualAlpha.toFixed(6)} α
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
                <span>{slippageCalculation.feeInTao.toFixed(4)} τ</span>
              </div>
              {slippageCalculation.slippagePercentage > 1 && (
                <div className="text-red-600 text-sm mt-2">
                  ⚠️ High slippage warning: The price impact of this trade is
                  high
                </div>
              )}
              <div className="flex justify-between items-center whitespace-nowrap font-semibold border-t pt-2">
                <span>Total Cost:</span>
                <span>{totalCost.toFixed(4)} τ</span>
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
              totalCost > parseFloat(balance) ||
              !subnetData
            }
            className={`w-full py-2 px-4 rounded text-white transition-colors ${
              !amount ||
              isSubmitting ||
              !api ||
              totalCost > parseFloat(balance) ||
              !subnetData
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
              "Confirm Swap"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmSwap;
