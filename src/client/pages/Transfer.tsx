import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { usePolkadotApi } from "../contexts/PolkadotApiContext";
import { useNotification } from "../contexts/NotificationContext";
import { useLock } from "../contexts/LockContext";
import { useWallet } from "../contexts/WalletContext";
import KeyringService from "../services/KeyringService";
import MessageService from "../services/MessageService";
import { taoToRao } from "../../utils/utils";
import { NotificationType } from "../../types/client";
import taoxyzLogo from "../../../public/icons/taoxyz.svg";

// TODO: Error handling for invalid address
const Transfer = () => {
  const navigate = useNavigate();
  const { setIsLocked } = useLock();
  const { showNotification } = useNotification();
  const { api } = usePolkadotApi();
  const { currentAddress } = useWallet();
  const [fromAddress, setFromAddress] = useState("");
  const [toAddress, setToAddress] = useState("");
  const [balance, setBalance] = useState<string>("0");
  const [amount, setAmount] = useState("");
  const [amountError, setAmountError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const amountInRao = taoToRao(parseFloat(amount) || 0);
  const balanceInRao = taoToRao(parseFloat(balance));
  const getBalance = async (address: string) => {
    if (!api) return;
    const balance = await api.getBalance(address);
    setBalance(balance);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAmountError(null);

    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      const numValue = parseFloat(value);
      if (value === "" || (!isNaN(numValue) && numValue >= 0)) {
        const amountInRao = value ? taoToRao(numValue) : 0n;
        if (amountInRao > balanceInRao) {
          setAmountError("Insufficient Balance");
        } else if (amountInRao === 0n) {
          setAmountError("Amount Must Be Greater Than 0");
        }
        setAmount(value);
      }
    }
  };

  const handleAuth = async () => {
    if (await KeyringService.isLocked(fromAddress)) {
      await chrome.storage.local.set({
        storeTransferTransaction: {
          toAddress,
          amount,
        },
      });
      await setIsLocked(true);
      await MessageService.sendWalletsLocked();
      setIsSubmitting(false);
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!api || !fromAddress || !toAddress || !amount || isSubmitting) return;
    setIsSubmitting(true);
    const isAuthorized = await handleAuth();
    if (!isAuthorized) return;

    try {
      showNotification({
        message: "Submitting Transaction...",
        type: NotificationType.Pending,
      });

      const result = await api.transfer({
        fromAddress,
        toAddress,
        amountInRao,
      });

      showNotification({
        message: "Transaction Submitted!",
        type: NotificationType.Success,
        hash: result,
      });

      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    } catch {
      showNotification({
        type: NotificationType.Error,
        message: "Failed to Transfer",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const init = async () => {
    if (!api || !currentAddress) return;
    setIsInitialized(true);
    await Promise.all([
      setFromAddress(currentAddress),
      getBalance(currentAddress),
    ]);
  };

  if (!isInitialized) {
    void init();
  }

  return (
    <div className="flex flex-col items-center w-72 [&>*]:w-full">
      <div className="flex flex-col items-center justify-center mt-12">
        <img src={taoxyzLogo} alt="Taoxyz Logo" className="w-16 h-16" />
        <div className="flex flex-col items-center justify-center mt-8">
          <h1 className="text-lg text-mf-milk-300">Transfer Tao</h1>
          <p className="text-xs text-mf-sybil-500 mt-1">Enter Details</p>
        </div>
      </div>

      <div className="rounded-sm mt-4">
        <div className="bg-mf-ash-500 rounded-sm p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img src={taoxyzLogo} alt="Taoxyz Logo" className="w-4 h-4" />
              <span className="text-xl text-mf-milk-300 font-semibold">
                {!api ? "Loading" : Number(balance).toFixed(4)}
              </span>
            </div>
            <p className="text-sm text-mf-milk-300">
              {!currentAddress
                ? ""
                : `${currentAddress.slice(0, 6)}...${currentAddress.slice(-6)}`}
            </p>
          </div>
          <p className="text-xs font-semibold text-mf-sybil-500">
            Available Balance
          </p>
        </div>

        <div className="space-y-4 mt-4">
          <input
            type="text"
            value={toAddress}
            onChange={(e) => setToAddress(e.target.value)}
            placeholder="Enter Recipient Address"
            className={`w-full px-3 py-2 text-xs rounded-sm bg-mf-ash-300 text-mf-milk-300 border-2 ${
              !toAddress
                ? "border-transparent focus:border-mf-safety-500"
                : "border-mf-sybil-500"
            }`}
          />

          <div className="h-12">
            <input
              type="text"
              inputMode="decimal"
              value={amount}
              onChange={handleAmountChange}
              placeholder="Enter Amount (τ)"
              className={`w-full px-3 py-2 rounded-sm bg-mf-ash-300 text-mf-milk-300 border-2 text-xs ${
                !amount
                  ? "border-transparent focus:border-mf-safety-500"
                  : amountInRao > balanceInRao
                  ? "border-mf-safety-500"
                  : "border-mf-sybil-500"
              }`}
            />
            <div className="h-4">
              {amountError && (
                <p className="ml-2 mt-2 text-xs text-mf-safety-500">
                  {amountError}
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-center mt-8">
            <button
              onClick={handleSubmit}
              disabled={
                !toAddress ||
                !amount ||
                isSubmitting ||
                !!amountError ||
                amountInRao > balanceInRao
              }
              className={`w-44 text-xs flex items-center justify-center rounded-sm transition-colors p-2 text-semibold border-2 border-mf-sybil-500 ${
                !toAddress ||
                !amount ||
                isSubmitting ||
                !!amountError ||
                amountInRao > balanceInRao
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
    </div>
  );
};

export default Transfer;
