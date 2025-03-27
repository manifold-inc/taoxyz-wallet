import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";

import { usePolkadotApi } from "../../contexts/PolkadotApiContext";
import { useNotification } from "../../contexts/NotificationContext";
import { useLock } from "../../contexts/LockContext";
import KeyringService from "../../services/KeyringService";
import MessageService from "../../services/MessageService";
import SlippageDisplay from "../common/SlippageDisplay";
import ConfirmAction from "../common/ConfirmAction";
import { taoToRao, slippageMoveStakeCalculation } from "../../../utils/utils";
import { NotificationType } from "../../../types/client";
import type {
  Subnet,
  Validator,
  StakeTransaction,
  Slippage,
} from "../../../types/client";

interface ConfirmMoveStakeProps {
  stake: StakeTransaction;
  subnet: Subnet;
  validator: Validator;
  address: string;
  balance: string;
}

const ConfirmMoveStake = ({
  stake,
  subnet,
  validator,
  address,
  balance,
}: ConfirmMoveStakeProps) => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const { setIsLocked } = useLock();
  const { api } = usePolkadotApi();
  const [amount, setAmount] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const alphaAmountInRao: bigint = taoToRao(parseFloat(amount) || 0);
  const balanceInRao: bigint = taoToRao(parseFloat(balance));

  const slippage: Slippage | undefined = useMemo(() => {
    if (!alphaAmountInRao || !subnet.taoIn || !subnet.alphaIn) return undefined;
    return slippageMoveStakeCalculation(
      BigInt(subnet.alphaIn),
      BigInt(subnet.taoIn),
      alphaAmountInRao
    );
  }, [alphaAmountInRao, subnet.taoIn, subnet.alphaIn]);

  const restoreTransaction = async () => {
    const result = await chrome.storage.local.get("storeStakeTransaction");
    if (result.storeStakeTransaction) {
      const { amount } = result.storeStakeTransaction;
      await chrome.storage.local.remove("storeStakeTransaction");
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
        storeStakeTransaction: {
          stake,
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
    if (slippage && slippage.slippagePercentage >= 1) {
      setShowConfirm(true);
    } else {
      await confirmSubmit();
      setShowConfirm(false);
    }
  };

  const confirmSubmit = async () => {
    if (!api || !amount || isSubmitting || alphaAmountInRao > balanceInRao)
      return;
    setIsSubmitting(true);
    const isAuthorized = await handleAuth();
    if (!isAuthorized) return;

    try {
      showNotification({
        message: "Submitting Transaction...",
        type: NotificationType.Pending,
      });

      const result = await api.moveStake({
        address,
        fromHotkey: stake.validatorHotkey,
        toHotkey: validator.hotkey,
        fromSubnetId: stake.subnetId,
        toSubnetId: subnet.id,
        amountInRao: alphaAmountInRao,
      });

      showNotification({
        message: "Transaction Successful!",
        type: NotificationType.Success,
        hash: result,
      });

      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);

      setIsSubmitting(false);
    } catch {
      showNotification({
        message: "Failed to Stake",
        type: NotificationType.Error,
      });
      setIsSubmitting(false);
    }
  };

  const init = async () => {
    if (!api) return;
    await restoreTransaction();
  };

  void init();

  return (
    <>
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
            <p className="font-semibold text-mf-silver-300">
              Selected Validator
            </p>
            <p className="text-mf-sybil-500">
              {validator.hotkey.slice(0, 6)}...{validator.hotkey.slice(-6)}
            </p>
          </div>
        </div>

        <div className="space-y-4 mt-4">
          <SlippageDisplay
            amount={amount}
            balance={balance}
            balanceInRao={balanceInRao}
            amountInRao={alphaAmountInRao}
            slippage={slippage ?? undefined}
            isRoot={subnet.id === 0}
            moveStake={true}
            handleAmountChange={handleAmountChange}
          />

          <div className="flex justify-center">
            <button
              onClick={handleSubmit}
              disabled={
                !amount ||
                isSubmitting ||
                !api ||
                alphaAmountInRao > balanceInRao
              }
              className={`w-44 text-xs flex items-center justify-center border-sm transition-colors p-2 mt-4 text-semibold border-2 border-mf-sybil-500 ${
                !amount ||
                isSubmitting ||
                !api ||
                alphaAmountInRao > balanceInRao
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
      <ConfirmAction
        isOpen={showConfirm}
        title="Confirm Transaction"
        message={`The slippage for this transaction is ${slippage?.slippagePercentage.toFixed(
          2
        )}%. Are you sure you want to proceed?`}
        onConfirm={confirmSubmit}
        onCancel={() => setShowConfirm(false)}
      />
    </>
  );
};

export default ConfirmMoveStake;
