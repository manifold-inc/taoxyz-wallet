import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { usePolkadotApi } from "../contexts/PolkadotApiContext";
import KeyringService from "../services/KeyringService";
import MessageService from "../services/MessageService";

const Transfer = () => {
  const { api } = usePolkadotApi();
  const navigate = useNavigate();
  const [fromAddress, setFromAddress] = useState("");
  const [toAddress, setToAddress] = useState("");
  const [balance, setBalance] = useState<string>("0");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const init = async () => {
      if (!api) return;
      try {
        const result = await chrome.storage.local.get("currentAddress");
        const currentAddress = result.currentAddress as string;
        setFromAddress(currentAddress);
        getBalance(currentAddress);
      } catch (error) {
        console.error("[Transfer] Error initializing:", error);
      }
    };
    init();
  }, [api]);

  const getBalance = async (address: string) => {
    if (!api) return;
    const balance = await api.getBalance(address);
    setBalance(balance ?? "0");
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
    if (KeyringService.isLocked(fromAddress)) {
      await chrome.storage.local.set({
        storeTransferTransaction: {
          toAddress,
          amount,
        },
      });
      await chrome.storage.local.set({ accountLocked: true });
      MessageService.sendAccountsLockedMessage();
      setIsSubmitting(false);
      return;
    }
  };

  const handleSubmit = async () => {
    if (!api || !fromAddress || !toAddress || !amount || isSubmitting) return;
    setIsSubmitting(true);
    setError(null);

    try {
      await handleAuth();
      await api.transfer({
        fromAddress,
        toAddress,
        amount: parseFloat(amount),
      });
      navigate("/dashboard");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to transfer");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen">
      <div className="h-20" />
      <div className="w-80">
        <div className="w-full rounded-lg bg-mf-ash-500 p-4 space-y-4">
          <div className="rounded-lg bg-mf-ash-500">
            <span className="text-xl font-semibold text-mf-safety-300">τ</span>
            <span className="text-xl font-semibold text-mf-milk-300">
              {Number(balance).toFixed(4)}
            </span>
            <p className="text-xs text-mf-silver-300">
              {fromAddress.slice(0, 8)}...{fromAddress.slice(-8)}
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <p className="text-xs text-mf-silver-300 mb-1">
                Recipient Address
              </p>
              <input
                type="text"
                value={toAddress}
                onChange={(e) => setToAddress(e.target.value)}
                placeholder="Enter recipient's address"
                className="w-full px-3 py-2 text-xs rounded-lg bg-mf-ash-300 text-mf-milk-300 border-none focus:outline-none focus:ring-2 focus:ring-mf-safety-300"
              />
            </div>

            <div>
              <p className="text-xs text-mf-silver-300 mb-1">Amount (τ)</p>
              <input
                type="text"
                inputMode="decimal"
                value={amount}
                onChange={handleAmountChange}
                placeholder="Enter amount to transfer"
                className="w-full px-3 py-2 text-xs rounded-lg bg-mf-ash-300 text-mf-milk-300 border-none focus:outline-none focus:ring-2 focus:ring-mf-safety-300"
              />
            </div>

            {error && (
              <div className="p-3 bg-mf-ash-300 text-mf-sybil-300 text-xs rounded-lg">
                {error}
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={
                !toAddress ||
                !amount ||
                isSubmitting ||
                parseFloat(amount) > parseFloat(balance)
              }
              className={`w-full text-xs flex items-center justify-center rounded-lg transition-colors px-4 py-3 mt-5 text-semibold text-mf-ash-300 ${
                !toAddress ||
                !amount ||
                isSubmitting ||
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
      </div>
    </div>
  );
};

export default Transfer;
