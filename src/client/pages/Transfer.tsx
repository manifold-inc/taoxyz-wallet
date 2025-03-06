import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useRpcApi } from "../contexts/RpcApiContext";

const Transfer = () => {
  const { api } = useRpcApi();
  const location = useLocation();
  const navigate = useNavigate();
  const { address } = location.state || {};
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
    return <div>Unauthorized access</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate("/dashboard")}
          className="mr-4 text-gray-600 hover:text-gray-900"
        >
          ← Back
        </button>
        <h1 className="text-2xl font-bold">Transfer TAO</h1>
      </div>

      <div className="bg-white rounded-lg p-6 shadow-sm border max-w-md mx-auto">
        <div className="space-y-4">
          <div>
            <label
              htmlFor="balance"
              className="block font-medium text-gray-700"
            >
              Available Balance
            </label>
            <p className="mt-1 text-gray-600">{balance} τ</p>
          </div>

          <div>
            <label
              htmlFor="toAddress"
              className="block font-medium text-gray-700"
            >
              Recipient Address
            </label>
            <input
              type="text"
              id="toAddress"
              value={toAddress}
              onChange={(e) => setToAddress(e.target.value)}
              placeholder="Enter recipient's address"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="amount" className="block font-medium text-gray-700">
              Amount (τ)
            </label>
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount to transfer"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              min="0"
              max={parseFloat(balance)}
              step="0.0001"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block font-medium text-gray-700"
            >
              Wallet Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your wallet password"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {error && <div className="text-red-600 text-sm">{error}</div>}

          <button
            onClick={handleSubmit}
            disabled={
              !toAddress ||
              !amount ||
              !password ||
              isSubmitting ||
              parseFloat(amount) > parseFloat(balance)
            }
            className={`w-full py-2 px-4 rounded text-white transition-colors ${
              !toAddress ||
              !amount ||
              !password ||
              isSubmitting ||
              parseFloat(amount) > parseFloat(balance)
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600"
            }`}
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Transferring...
              </div>
            ) : (
              "Confirm Transfer"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Transfer;
