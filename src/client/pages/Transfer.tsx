import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { usePolkadotApi } from "../contexts/PolkadotApiContext";
import KeyringService from "../services/KeyringService";
import MessageService from "../services/MessageService";
import Notification from "../components/Notification";
import { NotificationType } from "../../types/client";
import { useWallet } from "../contexts/WalletContext";
import { useNotification } from "../contexts/NotificationContext";

const Transfer = () => {
  const { currentAddress } = useWallet();
  const { api } = usePolkadotApi();
  const { showNotification } = useNotification();
  const navigate = useNavigate();
  const [fromAddress, setFromAddress] = useState("");
  const [toAddress, setToAddress] = useState("");
  const [balance, setBalance] = useState<string>("0");
  const [amount, setAmount] = useState("");
  const [amountError, setAmountError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [txStatus, setTxStatus] = useState<{
    type: "pending" | "success" | "error";
    message: string;
    hash?: string;
  } | null>(null);

  useEffect(() => {
    const init = async () => {
      if (!api || !currentAddress) return;
      try {
        setFromAddress(currentAddress);
        getBalance(currentAddress);
      } catch (error) {
        console.error("[Transfer] Error initializing:", error);
      }
    };
    init();
  }, [api, currentAddress]);

  const getBalance = async (address: string) => {
    if (!api) return;
    const balance = await api.getBalance(address);
    setBalance(balance ?? "0");
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAmountError(null);

    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      const numValue = parseFloat(value);
      if (value === "" || (!isNaN(numValue) && numValue >= 0)) {
        setAmount(value);

        if (numValue > parseFloat(balance)) {
          setAmountError("Insufficient balance");
        } else if (numValue === 0) {
          setAmountError("Amount must be greater than 0");
        }
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
      await chrome.storage.local.set({ walletLocked: true });
      MessageService.sendWalletsLocked();
      setIsSubmitting(false);
      return;
    }
  };

  const handleSubmit = async () => {
    if (!api || !fromAddress || !toAddress || !amount || isSubmitting) return;
    setIsSubmitting(true);
    setError(null);
    setTxStatus({
      type: "pending",
      message: "Transaction pending...",
    });

    try {
      await handleAuth();
      const result = await api.transfer({
        fromAddress,
        toAddress,
        amount: parseFloat(amount),
      });

      setTxStatus({
        type: "success",
        message: "Transaction successful!",
        hash: result,
      });

      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to transfer";
      setError(errorMessage);
      setTxStatus({
        type: "error",
        message: errorMessage,
      });
      showNotification({
        type: NotificationType.Error,
        message: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen">
      <div className="h-10" />
      <div className="w-80 rounded-lg bg-mf-ash-500 p-4">
        {/* Balance */}
        <div className="flex flex-col justify-between">
          <div className="flex items-center text-xl font-semibold">
            <span className="text-mf-safety-300">τ</span>
            <span className="text-mf-milk-300">
              {Number(balance).toFixed(4)}
            </span>
          </div>
          <p className="text-xs text-mf-milk-300 mt-1">
            {fromAddress.slice(0, 8)}...{fromAddress.slice(-8)}
          </p>
          <p className="text-xs text-mf-sybil-300 mt-1">Available Balance</p>
        </div>

        {/* Transfer Form */}
        <div className="mt-10 space-y-2">
          <div>
            <p className="text-xs text-mf-silver-300 mb-1">Recipient Address</p>
            <input
              type="text"
              value={toAddress}
              onChange={(e) => setToAddress(e.target.value)}
              placeholder="Enter recipient's address"
              className="w-full px-3 py-2 text-xs rounded-lg bg-mf-ash-300 text-mf-milk-300 border-none focus:outline-none focus:ring-2 focus:ring-mf-safety-300"
            />
          </div>

          <div className="h-15">
            <p className="text-xs text-mf-silver-300 mb-1">Amount (τ)</p>
            <input
              type="text"
              inputMode="decimal"
              value={amount}
              onChange={handleAmountChange}
              placeholder="Enter amount to transfer"
              className={`w-full px-3 py-2 text-xs rounded-lg bg-mf-ash-300 text-mf-milk-300 border-none focus:outline-none focus:ring-2 ${
                amountError
                  ? "ring-2 ring-mf-safety-300"
                  : "focus:ring-mf-safety-300"
              }`}
            />
            {amountError && (
              <p className="mt-1 text-xs text-mf-safety-300">{amountError}</p>
            )}
          </div>

          {error && (
            <div className="p-3 bg-mf-ash-300 text-mf-safety-300 text-xs rounded-lg">
              {error}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={
              !toAddress ||
              !amount ||
              isSubmitting ||
              !!amountError ||
              parseFloat(amount) > parseFloat(balance)
            }
            className={`w-full text-xs flex items-center justify-center rounded-lg transition-colors px-4 py-3 mt-5 text-semibold text-mf-ash-300 ${
              !toAddress ||
              !amount ||
              isSubmitting ||
              !!amountError ||
              parseFloat(amount) > parseFloat(balance)
                ? "bg-mf-ash-400 text-mf-milk-300 cursor-not-allowed"
                : "bg-mf-sybil-700 hover:bg-mf-sybil-500 active:bg-mf-sybil-700"
            }`}
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-mf-milk-300" />
                <span>Transferring...</span>
              </div>
            ) : (
              "Confirm"
            )}
          </button>
        </div>
      </div>
      {txStatus && (
        <Notification
          type={
            txStatus.type === "pending"
              ? NotificationType.Pending
              : txStatus.type === "success"
              ? NotificationType.Success
              : NotificationType.Error
          }
          message={txStatus.message}
          hash={txStatus.hash}
        />
      )}
    </div>
  );
};

export default Transfer;
