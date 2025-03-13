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
}

const ConfirmStake = ({
  stake,
  validator,
  subnet,
  address,
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
      // Validate amount
      const numValue = parseFloat(value);
      if (value === "" || (!isNaN(numValue) && numValue >= 0)) {
        setAmount(value);
      }
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
      navigate("/dashboard");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to move stake");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-16">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-mf-milk-300" />
      </div>
    );
  }

  return (
    <div className="space-y-3 p-2">
      <div className="rounded-lg bg-mf-ash-500 p-2 space-y-2">
        <div>
          <p className="text-xs text-mf-silver-300">Current Validator</p>
          <p className="text-xs text-mf-milk-300">
            {stake.validatorHotkey.slice(0, 8)}...
            {stake.validatorHotkey.slice(-8)}
          </p>
        </div>

        <div>
          <p className="text-xs text-mf-silver-300">New Validator</p>
          <p className="text-xs text-mf-milk-300">
            {validator.hotkey.slice(0, 8)}...{validator.hotkey.slice(-8)}
          </p>
        </div>

        <div>
          <p className="text-xs text-mf-silver-300">Available to Move</p>
          <p className="text-xs font-semibold text-mf-milk-300">
            {(stake.tokens / 1e9).toFixed(4)} τ
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <div>
          <p className="text-xs text-mf-silver-300 mb-1">Amount to Move (τ)</p>
          <input
            type="text"
            inputMode="decimal"
            value={amount}
            onChange={handleAmountChange}
            placeholder="Enter amount to move"
            className="w-full px-3 py-2 text-xs rounded-lg bg-mf-ash-300 text-mf-milk-300 border-none focus:outline-none focus:ring-2 focus:ring-mf-safety-300"
          />
        </div>

        {alphaAmount > 0 && slippageCalculation && (
          <div className="rounded-lg bg-mf-ash-300 p-3 space-y-2">
            <h3 className="text-xs font-medium text-mf-milk-300">
              Transaction Summary
            </h3>
            <div className="flex justify-between items-center">
              <span className="text-xs text-mf-silver-300">Moving:</span>
              <span className="text-xs font-medium text-mf-milk-300">
                {alphaAmount.toFixed(4)} τ
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-mf-silver-300">You receive:</span>
              <span className="text-xs font-medium text-mf-milk-300">
                {slippageCalculation.tokens.toFixed(4)} τ
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
          <div className="p-3 bg-mf-ash-300 text-mf-safety-500 text-xs rounded-lg">
            {error}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={isSubmitting || alphaAmount > stake.tokens / 1e9}
          className={`w-full text-xs flex items-center justify-center rounded-lg transition-colors px-4 py-3 mt-5 text-semibold text-mf-ash-300 ${
            isSubmitting || alphaAmount > stake.tokens / 1e9 || !amount || !api
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
            "Move Stake"
          )}
        </button>
      </div>
    </div>
  );
};

export default ConfirmStake;
