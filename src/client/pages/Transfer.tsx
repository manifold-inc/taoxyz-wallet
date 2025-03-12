import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { usePolkadotApi } from "../contexts/PolkadotApiContext";

const Transfer = () => {
  const { api } = usePolkadotApi();
  const navigate = useNavigate();
  const address = localStorage.getItem("currentAddress") as string;
  const [toAddress, setToAddress] = useState("");
  const [balance, setBalance] = useState<string>("0");
  const [amount, setAmount] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const getBalance = async () => {
      if (!api || !address) return;
      try {
        const balance = await api.getBalance(address);
        setBalance(balance);
      } catch (error) {
        console.error("[Client] Error fetching balance:", error);
      }
    };
    getBalance();
  }, [api, address]);

  const handleSubmit = async () => {
    if (!api || !address || !toAddress || !amount || !password || isSubmitting)
      return;
    setIsSubmitting(true);
    setError(null);

    try {
      await api.transfer({
        fromAddress: address,
        toAddress,
        amount: parseFloat(amount),
        password,
      });
      navigate("/dashboard");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to transfer");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!address) {
    return (
      <div className="p-4">
        <div className="bg-white/5 rounded-lg p-3 outline outline-1 outline-black/20">
          <p className="text-[10px] text-gray-400">Unauthorized Access</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="bg-white rounded-lg p-4">
        <div className="space-y-2">
          <div>
            <label className="block text-[10px] text-gray-600 mb-1">
              Available Balance
            </label>
            <div className="flex items-baseline space-x-1">
              <span className="text-[13px] font-semibold text-gray-900">
                {balance}
              </span>
              <span className="text-[10px] text-gray-600">τ</span>
            </div>
          </div>

          <div>
            <label className="block text-[10px] text-gray-600 mb-1">
              Recipient Address
            </label>
            <input
              type="text"
              value={toAddress}
              onChange={(e) => setToAddress(e.target.value)}
              placeholder="Enter recipient's address"
              className="w-full px-3 py-2 text-[10px] rounded-lg border border-gray-200 hover:border-blue-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-[10px] text-gray-600 mb-1">
              Amount (τ)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount to transfer"
              className="w-full px-3 py-2 text-[10px] rounded-lg border border-gray-200 hover:border-blue-500 focus:outline-none focus:border-blue-500"
              min="0"
              max={parseFloat(balance)}
              step="0.0001"
            />
          </div>

          <div>
            <label className="block text-[10px] text-gray-600 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your wallet password"
              className="w-full px-3 py-2 text-[10px] rounded-lg border border-gray-200 hover:border-blue-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-500 text-[10px] rounded-lg border border-red-100">
              {error}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={
              !toAddress ||
              !amount ||
              !password ||
              isSubmitting ||
              parseFloat(amount) > parseFloat(balance)
            }
            className={`w-full text-[10px] px-4 py-3 rounded-lg border border-gray-200 ${
              !toAddress ||
              !amount ||
              !password ||
              isSubmitting ||
              parseFloat(amount) > parseFloat(balance)
                ? "text-gray-400 cursor-not-allowed"
                : "hover:bg-blue-50 hover:text-blue-500 hover:border-blue-500 transition-colors"
            }`}
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
                <span>Transferring...</span>
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

export default Transfer;
