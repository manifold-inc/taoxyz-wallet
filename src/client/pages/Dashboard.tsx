import React from "react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export const Dashboard: React.FC = () => {
  const location = useLocation();
  const address = location.state?.address;
  const [balance, setBalance] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

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
        console.log(`Result: ${JSON.stringify(result)}`);
        setBalance(result.data);
      } catch (error) {
        setError("Failed to fetch balance");
      } finally {
        setIsLoading(false);
      }
    };
    fetchBalance();
  }, [address]);

  const handleStakeClick = () => {
    navigate("/stake", { state: { address } });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <button
          onClick={handleStakeClick}
          className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors"
        >
          Stake TAO
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
