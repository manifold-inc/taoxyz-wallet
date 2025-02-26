import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const Dashboard = () => {
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

  return (
    <div>
      <h1>{address}</h1>
      <div>
        <p>{balance}</p>
      </div>
      {isLoading && <p>Loading...</p>}
      {error && <p>{error}</p>}
    </div>
  );
};

export default Dashboard;
