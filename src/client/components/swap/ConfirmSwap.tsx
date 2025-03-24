import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";

import { usePolkadotApi } from "../../contexts/PolkadotApiContext";
import { useNotification } from "../../contexts/NotificationContext";
import { useLock } from "../../contexts/LockContext";
import KeyringService from "../../services/KeyringService";
import MessageService from "../../services/MessageService";
import { calculateSlippage } from "../../../utils/utils";
import type { Subnet, Validator } from "../../../types/client";
import { NotificationType } from "../../../types/client";

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
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const { setIsLocked } = useLock();
  const { api } = usePolkadotApi();
  const [amount, setAmount] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const taoAmount = parseFloat(amount) || 0;
  const totalCost = taoAmount;
  const slippageCalculation = useMemo(() => {
    if (!subnet.alphaIn || !subnet.taoIn || !taoAmount) return null;
    return calculateSlippage(subnet.alphaIn, subnet.taoIn, taoAmount, true);
  }, [subnet.alphaIn, subnet.taoIn, taoAmount]);

  const restoreTransaction = async () => {
    const result = await chrome.storage.local.get("storeSwapTransaction");
    if (result.storeSwapTransaction) {
      const { amount } = result.storeSwapTransaction;
      await chrome.storage.local.remove("storeSwapTransaction");
      setAmount(amount);
    }
  };

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
      setIsLocked(true);
      await MessageService.sendWalletsLocked();
      setIsSubmitting(false);
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!api || !amount || isSubmitting || taoAmount > parseFloat(balance))
      return;
    setIsSubmitting(true);
    const isAuthorized = await handleAuth();
    if (!isAuthorized) return;

    try {
      showNotification({
        message: "Submitting Transaction...",
        type: NotificationType.Pending,
      });

      const result = await api.createStake({
        address,
        subnetId: subnet.id,
        validatorHotkey: validator.hotkey,
        amount: taoAmount,
      });

      showNotification({
        message: "Transaction Successful!",
        type: NotificationType.Success,
        hash: result,
      });

      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    } catch {
      showNotification({
        message: "Failed to Swap",
        type: NotificationType.Error,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const init = async () => {
    if (!api) return;
    await restoreTransaction();
  };

  void init();

  return (
    <div className="p-2">
      <div className="rounded-sm bg-mf-ash-500 p-4 space-y-4 text-xs">
        <div>
          <p className="font-semibold text-mf-silver-300">Selected Subnet</p>
          <p className="text-mf-sybil-500">{subnet.name}</p>
        </div>

        <div>
          <p className="font-semibold text-mf-silver-300">Token Price</p>
          <p className="text-mf-sybil-500">{subnet.price} τ</p>
        </div>

        <div>
          <p className="font-semibold text-mf-silver-300">Selected Validator</p>
          <p className="text-mf-sybil-500">
            {validator.hotkey.slice(0, 6)}...{validator.hotkey.slice(-6)}
          </p>
        </div>
      </div>

      <div className="space-y-4 mt-4">
        <div className="text-xs">
          <input
            type="text"
            inputMode="decimal"
            value={amount}
            onChange={handleAmountChange}
            placeholder="Enter Amount (τ)"
            className={`w-full px-3 py-2 rounded-sm bg-mf-ash-300 text-mf-milk-300 border-2 ${
              !amount
                ? "border-transparent focus:border-mf-safety-500"
                : parseFloat(amount) > parseFloat(balance)
                ? "border-mf-safety-500"
                : "border-mf-sybil-500"
            }`}
          />
          <p className="ml-4 mt-2 text-mf-sybil-500">Balance: {balance}τ</p>
        </div>

        {taoAmount > 0 && slippageCalculation && (
          <div className="rounded-sm bg-mf-ash-500 p-4 space-y-4 text-xs mt-2">
            <div className="flex justify-between items-center">
              <span className="text-mf-silver-300">Your Price:</span>
              <span className="text-mf-sybil-500">
                {taoAmount.toFixed(4)} τ
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-mf-silver-300">You Receive:</span>
              <span className="text-mf-sybil-500">
                {slippageCalculation.tokens.toFixed(6)} α
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-mf-silver-300">Slippage:</span>
              <span
                className={`${
                  slippageCalculation.slippagePercentage > 5
                    ? "text-mf-safety-500"
                    : "text-mf-silver-300"
                }`}
              >
                {slippageCalculation.slippagePercentage.toFixed(2)}%
              </span>
            </div>
          </div>
        )}

        <div className="flex justify-center">
          <button
            onClick={handleSubmit}
            disabled={
              !amount || isSubmitting || !api || totalCost > parseFloat(balance)
            }
            className={`w-44 text-xs flex items-center justify-center rounded-sm transition-colors p-2 mt-4 text-semibold border-2 border-mf-sybil-500 ${
              !amount || isSubmitting || !api || totalCost > parseFloat(balance)
                ? "bg-mf-night-500 text-mf-milk-300 cursor-not-allowed"
                : "bg-mf-sybil-500 text-mf-night-500"
            }`}
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-mf-milk-300" />
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
