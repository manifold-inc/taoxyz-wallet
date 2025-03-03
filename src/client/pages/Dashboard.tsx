import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const address = location.state?.address;
  const [balance, setBalance] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBalance = async () => {
      setIsLoading(true);
      try {
        const result = await chrome.runtime.sendMessage({
          type: "ext(getBalance)",
          payload: {
            address,
          },
        });
        setBalance(result.data);
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "Failed to fetch balance"
        );
      } finally {
        setIsLoading(false);
      }
    };
    fetchBalance();
  }, [address]);

  const handleStakeNavigate = () => {
    if (address) {
      navigate("/stake", { state: { address } });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <button
          onClick={handleStakeNavigate}
          className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors"
        >
          Stake
        </button>
      </div>
      <div>
        <h1>{address}</h1>
        <div>
          <p>{balance}</p>
        </div>
        {isLoading && <p>Loading...</p>}
        {error && <p>{error}</p>}
      </div>
    </div>
  );
};

export default Dashboard;
